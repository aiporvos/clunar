#!/usr/bin/env node
/**
 * Genera la imagen de portada de un post: Gemini (primario) con fallback a
 * Kie.ai (secundario). Ver PIPELINE.md §2 y content/estilos-portada.md.
 *
 * Uso:
 *   node scripts/cover-image.mjs --slug mi-post --preset "Editorial collage" --dry-run
 *   node scripts/cover-image.mjs --slug mi-post --prompt "prompt completo ya armado"
 *
 * Con --dry-run: valida config/args y muestra qué haría, sin llamar a ninguna API.
 */
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const COVERS_LOG = path.join(ROOT, 'content', 'covers-log.json');
const PRESETS_FILE = path.join(ROOT, 'content', 'estilos-portada.md');

const NEGATIVES =
  'No gradients (blue-to-purple or otherwise), no humanoid robots, no glowing ' +
  'digital brains, no hands typing on holographic keyboards, no stock-photo ' +
  'businesspeople shaking hands, no generic "AI" iconography (glowing chips, ' +
  'binary rain), no watermarks, no text in the image unless the preset says so.';

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--slug') args.slug = argv[++i];
    else if (a === '--preset') args.preset = argv[++i];
    else if (a === '--prompt') args.prompt = argv[++i];
  }
  return args;
}

async function loadPresetPrompt(presetName) {
  const md = await readFile(PRESETS_FILE, 'utf-8');
  // Cada preset: "## N. Nombre" ... seguido de un bloque ``` ... ```
  const blocks = md.split(/^## /m).slice(1);
  const norm = s => s.toLowerCase().replace(/^\d+\.\s*/, '').trim();
  const target = norm(presetName);
  const block = blocks.find(b => {
    const heading = b.split('\n', 1)[0];
    return norm(heading) === target;
  });
  if (!block) throw new Error(`Preset "${presetName}" no encontrado en estilos-portada.md`);
  const match = block.match(/```\n([\s\S]+?)\n```/);
  if (!match) throw new Error(`Preset "${presetName}" no tiene bloque de prompt`);
  return match[1].trim();
}

async function generateWithGemini(prompt, apiKey) {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gemini-3.1-flash-image',
      input: prompt,
      response_format: { type: 'image', mime_type: 'image/png', aspect_ratio: '16:9' },
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini respondió ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const b64 = data.output_image?.data
    ?? data.steps?.flatMap(s => s.content ?? []).find(c => c.type === 'image')?.data;
  if (!b64) throw new Error('Gemini no devolvió imagen en la respuesta');
  return Buffer.from(b64, 'base64');
}

async function generateWithKie(prompt, apiKey) {
  // ⚠️ Endpoint sin confirmar contra documentación pública — docs.kie.ai
  // bloqueó el acceso automatizado al escribir este script (jul-2026).
  // Verificar en https://docs.kie.ai antes del primer uso real y ajustar
  // KIE_API_BASE / las rutas de abajo si hace falta. Patrón confirmado:
  // auth Bearer + creación de tarea async + polling por task_id.
  const base = process.env.KIE_API_BASE || 'https://api.kie.ai';

  const createRes = await fetch(`${base}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nano-banana', input: { prompt, aspect_ratio: '16:9' } }),
  });
  if (!createRes.ok) throw new Error(`Kie.ai (create) respondió ${createRes.status}: ${await createRes.text()}`);
  const { task_id } = await createRes.json();
  if (!task_id) throw new Error('Kie.ai no devolvió task_id');

  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 4000));
    const pollRes = await fetch(`${base}/api/v1/jobs/recordInfo?task_id=${task_id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!pollRes.ok) continue;
    const job = await pollRes.json();
    if (job.status === 'completed' && job.result_url) {
      const imgRes = await fetch(job.result_url);
      return Buffer.from(await imgRes.arrayBuffer());
    }
    if (job.status === 'failed') throw new Error(`Kie.ai: tarea falló — ${job.error ?? 'sin detalle'}`);
  }
  throw new Error('Kie.ai: timeout esperando el resultado (90s)');
}

async function generateCover(prompt) {
  const primary = process.env.IMAGE_PROVIDER_PRIMARY || 'gemini';
  const fallback = process.env.IMAGE_PROVIDER_FALLBACK || 'kie';
  const providers = { gemini: generateWithGemini, kie: generateWithKie };
  const keys = { gemini: process.env.GEMINI_API_KEY, kie: process.env.KIE_API_KEY };

  const order = [primary, fallback].filter((v, i, a) => a.indexOf(v) === i);

  let lastErr;
  for (const name of order) {
    const fn = providers[name];
    const key = keys[name];
    if (!fn) continue;
    if (!key) { lastErr = new Error(`Falta la API key de ${name}`); continue; }
    try {
      console.log(`→ Generando portada con ${name}...`);
      const buffer = await fn(prompt, key);
      console.log(`✓ Portada generada con ${name}`);
      return { buffer, provider: name };
    } catch (err) {
      console.warn(`✗ ${name} falló: ${err.message}`);
      lastErr = err;
    }
  }
  throw lastErr ?? new Error('Ningún provider de imagen disponible');
}

async function logCover({ slug, preset, provider }) {
  let log = [];
  if (existsSync(COVERS_LOG)) {
    log = JSON.parse(await readFile(COVERS_LOG, 'utf-8'));
  }
  log.push({ slug, preset, provider, date: new Date().toISOString() });
  await writeFile(COVERS_LOG, JSON.stringify(log, null, 2) + '\n');
}

function lastPreset(log) {
  return log.length ? log[log.length - 1].preset : null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.slug) {
    console.error('Uso: node scripts/cover-image.mjs --slug <slug> [--preset "Nombre"] [--prompt "..."] [--dry-run]');
    process.exit(1);
  }

  const log = existsSync(COVERS_LOG) ? JSON.parse(await readFile(COVERS_LOG, 'utf-8')) : [];
  const avoid = lastPreset(log);
  if (args.preset && avoid && args.preset.toLowerCase() === avoid.toLowerCase()) {
    console.warn(`⚠️  "${args.preset}" fue el preset del post anterior — se recomienda variar.`);
  }

  let prompt = args.prompt;
  if (!prompt && args.preset) {
    const base = await loadPresetPrompt(args.preset);
    prompt = `${base}\n\n${NEGATIVES}`;
  }
  if (!prompt) {
    console.error('Falta --prompt o --preset');
    process.exit(1);
  }

  const outDir = path.join(ROOT, 'public', 'images', 'posts', args.slug);
  const outFile = path.join(outDir, 'cover.png');
  const ogFile = path.join(outDir, 'cover-og.png');

  if (args.dryRun) {
    console.log('--- DRY RUN ---');
    console.log('Slug:', args.slug);
    console.log('Preset:', args.preset ?? '(prompt directo)');
    console.log('Prompt final:\n' + prompt);
    console.log('Se guardaría en:', outFile, 'y', ogFile);
    console.log('Provider primario:', process.env.IMAGE_PROVIDER_PRIMARY || 'gemini (default)');
    console.log('Provider fallback:', process.env.IMAGE_PROVIDER_FALLBACK || 'kie (default)');
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const hasKie = !!process.env.KIE_API_KEY;
    console.log(`GEMINI_API_KEY: ${hasGemini ? 'configurada' : 'FALTA'}`);
    console.log(`KIE_API_KEY: ${hasKie ? 'configurada' : 'FALTA'}`);
    return;
  }

  const { buffer, provider } = await generateCover(prompt);

  await mkdir(outDir, { recursive: true });
  await sharp(buffer).resize(1920, 1080, { fit: 'cover' }).png().toFile(outFile);
  await sharp(buffer).resize(1200, 627, { fit: 'cover' }).png().toFile(ogFile);

  await logCover({ slug: args.slug, preset: args.preset ?? '(prompt directo)', provider });

  console.log(`✓ Portada lista: ${path.relative(ROOT, outFile)}`);
  console.log(`✓ Variante OG: ${path.relative(ROOT, ogFile)}`);
}

main().catch(err => {
  console.error('✗ Error generando portada:', err.message);
  process.exit(1);
});
