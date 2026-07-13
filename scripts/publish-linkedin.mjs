#!/usr/bin/env node
/**
 * Publica un post en LinkedIn (imagen + texto) vía la API REST moderna
 * (/rest/posts — reemplaza al antiguo /v2/ugcPosts). Ver PIPELINE.md §4.
 *
 * Uso:
 *   node scripts/publish-linkedin.mjs --text-file content/drafts/linkedin-slug.txt --image "public/images/posts/slug/cover-og.png" --dry-run
 *   node scripts/publish-linkedin.mjs --text "..." [--image ... | --video ...] [--dry-run]
 *
 * --image y --video son excluyentes (un post lleva una imagen o un video, no ambos).
 *
 * Preferir --text-file (UTF-8): evita que el quoting de la shell rompa
 * emojis o saltos de línea. El texto se escapa automáticamente al formato
 * "little text" de LinkedIn (los caracteres ()[]{}@#*_~<>|\ son reservados
 * y sin escapar rompen el render del post).
 *
 * Checkpoint: este script asume que el borrador YA fue mostrado y aprobado
 * por Claudio — lo hace el skill /publicar antes de llamarlo.
 *
 * Renovación de LINKEDIN_ACCESS_TOKEN (vence a los ~60 días): ver PIPELINE.md §4.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { notifyError } from './notify-error.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const API_BASE = 'https://api.linkedin.com';
const LINKEDIN_VERSION = process.env.LINKEDIN_API_VERSION || '202506';

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--text') args.text = argv[++i];
    else if (a === '--text-file') args.textFile = argv[++i];
    else if (a === '--image') args.image = argv[++i];
    else if (a === '--video') args.video = argv[++i];
  }
  return args;
}

// El commentary usa el "little text format" de LinkedIn: estos caracteres
// son reservados y deben escaparse con \ para renderizarse literales.
// https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/little-text-format
function escapeLittleText(text) {
  return text.replace(/[\\|{}@[\]()<>#*_~]/g, c => '\\' + c);
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'LinkedIn-Version': LINKEDIN_VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
  };
}

async function initializeUpload(token, personUrn) {
  const res = await fetch(`${API_BASE}/rest/images?action=initializeUpload`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ initializeUploadRequest: { owner: personUrn } }),
  });
  if (!res.ok) throw new Error(`LinkedIn (initializeUpload) respondió ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.value; // { uploadUrl, image (URN) }
}

async function uploadImageBinary(uploadUrl, token, buffer) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: buffer,
  });
  if (!res.ok) throw new Error(`LinkedIn (upload binario) respondió ${res.status}: ${await res.text()}`);
}

// Subida de video: a diferencia de imagen (1 sola URL), LinkedIn devuelve N
// "partes" (rangos de bytes) a subir por separado; cada PUT devuelve un
// ETag que hay que juntar y mandar de vuelta en finalizeUpload.
async function initializeVideoUpload(token, personUrn, fileSizeBytes) {
  const res = await fetch(`${API_BASE}/rest/videos?action=initializeUpload`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      initializeUploadRequest: { owner: personUrn, fileSizeBytes, uploadCaptions: false, uploadThumbnail: false },
    }),
  });
  if (!res.ok) throw new Error(`LinkedIn (initializeUpload video) respondió ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.value; // { uploadInstructions: [{uploadUrl, firstByte, lastByte}], video, uploadToken }
}

async function uploadVideoParts(uploadInstructions, token, buffer) {
  const uploadedPartIds = [];
  for (const part of uploadInstructions) {
    const chunk = buffer.subarray(part.firstByte, part.lastByte + 1);
    const res = await fetch(part.uploadUrl, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: chunk });
    if (!res.ok) throw new Error(`LinkedIn (upload video, parte ${part.firstByte}-${part.lastByte}) respondió ${res.status}: ${await res.text()}`);
    const etag = res.headers.get('etag');
    if (!etag) throw new Error(`LinkedIn no devolvió ETag para la parte ${part.firstByte}-${part.lastByte}`);
    uploadedPartIds.push(etag);
  }
  return uploadedPartIds;
}

async function finalizeVideoUpload(token, videoUrn, uploadToken, uploadedPartIds) {
  const res = await fetch(`${API_BASE}/rest/videos?action=finalizeUpload`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ finalizeUploadRequest: { video: videoUrn, uploadToken: uploadToken || '', uploadedPartIds } }),
  });
  if (!res.ok) throw new Error(`LinkedIn (finalizeUpload video) respondió ${res.status}: ${await res.text()}`);
}

async function uploadVideo(token, personUrn, filePath) {
  const buffer = await readFile(filePath);
  const { uploadInstructions, video, uploadToken } = await initializeVideoUpload(token, personUrn, buffer.length);
  const uploadedPartIds = await uploadVideoParts(uploadInstructions, token, buffer);
  await finalizeVideoUpload(token, video, uploadToken, uploadedPartIds);
  return video;
}

async function createPost({ token, personUrn, text, imageUrn, videoUrn }) {
  const body = {
    author: personUrn,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
    ...(imageUrn ? { content: { media: { id: imageUrn } } } : {}),
    ...(videoUrn ? { content: { media: { id: videoUrn } } } : {}),
  };

  const res = await fetch(`${API_BASE}/rest/posts`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`LinkedIn (posts) respondió ${res.status}: ${await res.text()}`);
  return res.headers.get('x-restli-id');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  let text = args.text;
  if (args.textFile) {
    text = (await readFile(path.resolve(ROOT, args.textFile), 'utf-8')).trim();
  }
  if (!text) {
    console.error('Uso: node scripts/publish-linkedin.mjs --text-file ruta | --text "..." [--image ruta | --video ruta] [--dry-run]');
    process.exit(1);
  }
  if (args.image && args.video) {
    console.error('Usá --image o --video, no ambos.');
    process.exit(1);
  }

  const escaped = escapeLittleText(text);

  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const personUrn = process.env.LINKEDIN_PERSON_URN;

  if (args.dryRun) {
    console.log('--- DRY RUN ---');
    console.log('Texto original:\n' + text);
    console.log('\nTexto escapado (lo que se envía):\n' + escaped);
    console.log('\nImagen:', args.image ?? '(sin imagen)');
    console.log('Video:', args.video ?? '(sin video)');
    console.log(`LINKEDIN_ACCESS_TOKEN: ${token ? 'configurado' : 'FALTA'}`);
    console.log(`LINKEDIN_PERSON_URN: ${personUrn ? 'configurado' : 'FALTA'}`);
    console.log(`LinkedIn-Version usado: ${LINKEDIN_VERSION}`);
    return;
  }

  if (!token || !personUrn) {
    console.error('Faltan LINKEDIN_ACCESS_TOKEN / LINKEDIN_PERSON_URN en .env');
    process.exit(1);
  }

  try {
    let imageUrn, videoUrn;
    if (args.image) {
      const { uploadUrl, image } = await initializeUpload(token, personUrn);
      const buffer = await readFile(path.resolve(ROOT, args.image));
      await uploadImageBinary(uploadUrl, token, buffer);
      imageUrn = image;
    }
    if (args.video) {
      console.log('→ Subiendo video a LinkedIn (puede tardar según el tamaño)...');
      videoUrn = await uploadVideo(token, personUrn, path.resolve(ROOT, args.video));
      console.log('✓ Video subido:', videoUrn);
    }
    const postId = await createPost({ token, personUrn, text: escaped, imageUrn, videoUrn });
    console.log('✓ Publicado en LinkedIn:', postId);
  } catch (err) {
    await notifyError('Fase 4 · LinkedIn', err.message);
    console.error('✗ Error publicando en LinkedIn:', err.message);
    process.exit(1);
  }
}

main();
