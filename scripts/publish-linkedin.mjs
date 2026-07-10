#!/usr/bin/env node
/**
 * Publica un post en LinkedIn (imagen + texto) vía la API REST moderna
 * (/rest/posts — reemplaza al antiguo /v2/ugcPosts). Ver PIPELINE.md §4.
 *
 * Uso:
 *   node scripts/publish-linkedin.mjs --text-file content/drafts/linkedin-slug.txt --image "public/images/posts/slug/cover-og.png" --dry-run
 *   node scripts/publish-linkedin.mjs --text "..." [--image ...] [--dry-run]
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

async function createPost({ token, personUrn, text, imageUrn }) {
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
    console.error('Uso: node scripts/publish-linkedin.mjs --text-file ruta | --text "..." [--image ruta] [--dry-run]');
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
    let imageUrn;
    if (args.image) {
      const { uploadUrl, image } = await initializeUpload(token, personUrn);
      const buffer = await readFile(path.resolve(ROOT, args.image));
      await uploadImageBinary(uploadUrl, token, buffer);
      imageUrn = image;
    }
    const postId = await createPost({ token, personUrn, text: escaped, imageUrn });
    console.log('✓ Publicado en LinkedIn:', postId);
  } catch (err) {
    await notifyError('Fase 4 · LinkedIn', err.message);
    console.error('✗ Error publicando en LinkedIn:', err.message);
    process.exit(1);
  }
}

main();
