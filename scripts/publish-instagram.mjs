#!/usr/bin/env node
/**
 * Publica una foto en el feed de Instagram (imagen + caption). Ver PIPELINE.md §4b.
 *
 * Uso:
 *   node scripts/publish-instagram.mjs --caption-file content/drafts/instagram-slug.txt --image-url "https://cluna.ar/images/posts/slug/cover-ig.jpg" --dry-run
 *
 * Flujo de la API (2 pasos, obligatorio):
 *   1. POST /{ig-user-id}/media          → crea un contenedor, devuelve creation_id
 *   2. POST /{ig-user-id}/media_publish  → publica ese contenedor
 * Entre medio se consulta ?fields=status_code hasta que da FINISHED.
 *
 * IMPORTANTE — la imagen NO se sube como binario: Instagram la descarga desde
 * --image-url, así que ese archivo TIENE que estar ya deployado y público
 * antes de correr esto. La Fase 3 del pipeline (poll bloqueante hasta HTTP 200)
 * ya lo garantiza.
 *
 * Requisitos de la imagen: JPEG (no PNG), máx 8 MB, ancho 320-1440 px,
 * relación de aspecto entre 4:5 y 1.91:1. La variante `cover-ig.jpg` que
 * genera cover-image.mjs ya cumple todo (1080x1350, 4:5).
 *
 * Checkpoint: este script asume que el borrador YA fue mostrado y aprobado
 * por Claudio — lo hace el skill /publicar antes de llamarlo.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { notifyError } from './notify-error.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const GRAPH = 'https://graph.instagram.com';
const API_VERSION = process.env.INSTAGRAM_API_VERSION || 'v23.0';

const CAPTION_MAX = 2200;
// El video tarda bastante más que una foto en procesarse del lado de Meta.
const POLL_TIMEOUT_MS_IMAGE = 90_000;
const POLL_TIMEOUT_MS_VIDEO = 300_000;
const POLL_INTERVAL_MS = 5_000;

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--caption') args.caption = argv[++i];
    else if (a === '--caption-file') args.captionFile = argv[++i];
    else if (a === '--image-url') args.imageUrl = argv[++i];
    else if (a === '--video-url') args.videoUrl = argv[++i];
  }
  return args;
}

function api(pathname) {
  return `${GRAPH}/${API_VERSION}/${pathname}`;
}

/**
 * Paso 1: crear el contenedor con el medio y el caption.
 *
 * Los videos van como REELS: Instagram convirtió todos los videos de feed a
 * ese formato, ya no existe el tipo VIDEO suelto.
 */
async function createContainer({ token, userId, imageUrl, videoUrl, caption }) {
  const params = videoUrl
    ? { media_type: 'REELS', video_url: videoUrl, caption, access_token: token }
    : { image_url: imageUrl, caption, access_token: token };

  const res = await fetch(api(`${userId}/media`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(`Instagram (crear contenedor) respondió ${res.status}: ${JSON.stringify(data)}`);
  }
  return data.id;
}

/**
 * Paso 2: esperar a que Instagram termine de bajar y procesar la imagen.
 * Si se publica antes de FINISHED, la API rechaza el media_publish.
 */
async function waitUntilReady({ token, containerId, timeoutMs = POLL_TIMEOUT_MS_IMAGE }) {
  const deadline = Date.now() + timeoutMs;
  let last = 'IN_PROGRESS';

  while (Date.now() < deadline) {
    const res = await fetch(api(`${containerId}?fields=status_code,status&access_token=${encodeURIComponent(token)}`));
    const data = await res.json();
    if (!res.ok) throw new Error(`Instagram (status) respondió ${res.status}: ${JSON.stringify(data)}`);

    last = data.status_code;
    if (last === 'FINISHED') return;
    if (last === 'ERROR' || last === 'EXPIRED') {
      throw new Error(`El contenedor quedó en ${last}: ${data.status ?? 'sin detalle'}`);
    }
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(`Timeout esperando el procesamiento (${timeoutMs / 1000}s, último estado: ${last})`);
}

/** Paso 3: publicar el contenedor ya procesado. */
async function publishContainer({ token, userId, containerId }) {
  const res = await fetch(api(`${userId}/media_publish`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ creation_id: containerId, access_token: token }),
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(`Instagram (media_publish) respondió ${res.status}: ${JSON.stringify(data)}`);
  }
  return data.id;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  let caption = args.caption;
  if (args.captionFile) {
    caption = (await readFile(path.resolve(ROOT, args.captionFile), 'utf-8')).trim();
  }
  if (!caption || (!args.imageUrl && !args.videoUrl)) {
    console.error('Uso: node scripts/publish-instagram.mjs --caption-file ruta (--image-url | --video-url) "https://..." [--dry-run]');
    process.exit(1);
  }
  if (args.imageUrl && args.videoUrl) {
    console.error('Usá --image-url o --video-url, no ambos.');
    process.exit(1);
  }

  const isVideo = !!args.videoUrl;
  const mediaUrl = args.videoUrl ?? args.imageUrl;

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  const tooLong = caption.length > CAPTION_MAX;

  if (args.dryRun) {
    console.log('--- DRY RUN ---');
    console.log('Caption:\n' + caption);
    console.log(`\nLargo del caption: ${caption.length}/${CAPTION_MAX}${tooLong ? '  ⚠️  SE PASA' : ''}`);
    console.log(`Tipo: ${isVideo ? 'VIDEO (se publica como Reel)' : 'IMAGEN'}`);
    console.log(`URL del ${isVideo ? 'video' : 'la imagen'}:`, mediaUrl);
    if (!/^https:\/\//.test(mediaUrl)) {
      console.log('⚠️  La URL tiene que ser https pública — Instagram la descarga desde ahí.');
    }
    if (isVideo && !/\.(mp4|mov)($|\?)/i.test(mediaUrl)) {
      console.log('⚠️  El video tiene que ser MP4 o MOV (H.264 + AAC).');
    }
    if (!isVideo && !/\.jpe?g($|\?)/i.test(mediaUrl)) {
      console.log('⚠️  La API solo acepta JPEG. Usá la variante cover-ig.jpg, no el PNG.');
    }
    console.log('   (el archivo tiene que estar deployado antes: la API lo descarga)');
    console.log(`INSTAGRAM_ACCESS_TOKEN: ${token ? 'configurado' : 'FALTA'}`);
    console.log(`INSTAGRAM_USER_ID: ${userId ? 'configurado' : 'FALTA'}`);
    console.log(`Versión de API usada: ${API_VERSION}`);
    return;
  }

  if (tooLong) {
    console.error(`El caption tiene ${caption.length} caracteres y el máximo es ${CAPTION_MAX}.`);
    process.exit(1);
  }
  if (!token || !userId) {
    console.error('Faltan INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_USER_ID en .env');
    process.exit(1);
  }

  try {
    console.log(`→ Creando el contenedor (${isVideo ? 'video/Reel' : 'imagen'})...`);
    const containerId = await createContainer({
      token, userId, imageUrl: args.imageUrl, videoUrl: args.videoUrl, caption,
    });

    console.log(`→ Esperando que Instagram procese el ${isVideo ? 'video' : 'la imagen'} (contenedor ${containerId})...`);
    await waitUntilReady({
      token,
      containerId,
      timeoutMs: isVideo ? POLL_TIMEOUT_MS_VIDEO : POLL_TIMEOUT_MS_IMAGE,
    });

    console.log('→ Publicando...');
    const mediaId = await publishContainer({ token, userId, containerId });

    console.log('✓ Publicado en Instagram:', mediaId);
  } catch (err) {
    await notifyError('Fase 4b · Instagram', err.message);
    console.error('✗ Error publicando en Instagram:', err.message);
    process.exit(1);
  }
}

main();
