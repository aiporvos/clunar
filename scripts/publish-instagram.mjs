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
    // Carrusel: de 2 a 10 URLs separadas por coma, en el orden de las placas.
    else if (a === '--image-urls') {
      args.imageUrls = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
    }
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
 * Carrusel, paso 1a: un contenedor hijo por placa.
 *
 * Los hijos NO llevan caption (va en el contenedor padre) y sí llevan
 * is_carousel_item, que es lo que los marca como parte de un carrusel.
 */
async function createCarouselItem({ token, userId, imageUrl }) {
  const res = await fetch(api(`${userId}/media`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      image_url: imageUrl,
      is_carousel_item: 'true',
      access_token: token,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(`Instagram (item de carrusel) respondió ${res.status}: ${JSON.stringify(data)}`);
  }
  return data.id;
}

/**
 * Carrusel, paso 1b: el contenedor padre que agrupa a los hijos.
 * El orden de `children` es el orden en que se ven las placas.
 */
async function createCarouselContainer({ token, userId, childIds, caption }) {
  const res = await fetch(api(`${userId}/media`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption,
      access_token: token,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(`Instagram (contenedor de carrusel) respondió ${res.status}: ${JSON.stringify(data)}`);
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
  const modos = [args.imageUrl, args.videoUrl, args.imageUrls].filter(Boolean).length;
  if (!caption || modos === 0) {
    console.error('Uso: node scripts/publish-instagram.mjs --caption-file ruta (--image-url | --image-urls | --video-url) "https://..." [--dry-run]');
    process.exit(1);
  }
  if (modos > 1) {
    console.error('Usá solo uno de --image-url, --image-urls o --video-url.');
    process.exit(1);
  }
  // El carrusel de Instagram admite entre 2 y 10 elementos.
  if (args.imageUrls && (args.imageUrls.length < 2 || args.imageUrls.length > 10)) {
    console.error(`Un carrusel lleva de 2 a 10 imágenes, y pasaste ${args.imageUrls.length}.`);
    process.exit(1);
  }

  const isCarousel = !!args.imageUrls;
  const isVideo = !!args.videoUrl;
  const mediaUrls = args.imageUrls ?? [args.videoUrl ?? args.imageUrl];
  const mediaUrl = mediaUrls[0];

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  const tooLong = caption.length > CAPTION_MAX;

  if (args.dryRun) {
    console.log('--- DRY RUN ---');
    console.log('Caption:\n' + caption);
    console.log(`\nLargo del caption: ${caption.length}/${CAPTION_MAX}${tooLong ? '  ⚠️  SE PASA' : ''}`);
    const tipo = isCarousel
      ? `CARRUSEL (${mediaUrls.length} placas)`
      : isVideo ? 'VIDEO (se publica como Reel)' : 'IMAGEN';
    console.log(`Tipo: ${tipo}`);
    mediaUrls.forEach((u, i) => {
      console.log(`  ${isCarousel ? String(i + 1).padStart(2, '0') + '.' : 'URL:'} ${u}`);
    });
    for (const u of mediaUrls) {
      if (!/^https:\/\//.test(u)) {
        console.log(`⚠️  ${u} tiene que ser https pública — Instagram la descarga desde ahí.`);
      }
      if (isVideo && !/\.(mp4|mov)($|\?)/i.test(u)) {
        console.log('⚠️  El video tiene que ser MP4 o MOV (H.264 + AAC).');
      }
      if (!isVideo && !/\.jpe?g($|\?)/i.test(u)) {
        console.log(`⚠️  ${u}: la API solo acepta JPEG, no PNG.`);
      }
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
    let containerId;

    if (isCarousel) {
      // Un contenedor hijo por placa, en orden, y después el padre que los agrupa.
      const childIds = [];
      for (const [i, url] of mediaUrls.entries()) {
        console.log(`→ Placa ${i + 1}/${mediaUrls.length}...`);
        const childId = await createCarouselItem({ token, userId, imageUrl: url });
        await waitUntilReady({ token, containerId: childId });
        childIds.push(childId);
      }
      console.log('→ Agrupando las placas en el carrusel...');
      containerId = await createCarouselContainer({ token, userId, childIds, caption });
    } else {
      console.log(`→ Creando el contenedor (${isVideo ? 'video/Reel' : 'imagen'})...`);
      containerId = await createContainer({
        token, userId, imageUrl: args.imageUrl, videoUrl: args.videoUrl, caption,
      });
    }

    console.log(`→ Esperando que Instagram procese el contenedor ${containerId}...`);
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
