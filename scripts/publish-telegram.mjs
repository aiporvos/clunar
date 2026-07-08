#!/usr/bin/env node
/**
 * Publica el mensaje corto en el canal/chat de Telegram de Claudio.
 * Ver PIPELINE.md §5 y content/estilo-redes.md §3.
 *
 * Uso:
 *   node scripts/publish-telegram.mjs --caption "..." --photo-url "https://..." --dry-run
 *   node scripts/publish-telegram.mjs --caption "..." --photo-path "public/images/posts/slug/cover.png"
 *
 * Checkpoint: este script asume que el borrador YA fue mostrado y aprobado
 * por Claudio — lo hace el skill /publicar antes de llamarlo.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { notifyError } from './notify-error.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const API_BASE = 'https://api.telegram.org';

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--caption') args.caption = argv[++i];
    else if (a === '--photo-url') args.photoUrl = argv[++i];
    else if (a === '--photo-path') args.photoPath = argv[++i];
  }
  return args;
}

async function sendPhoto({ token, chatId, caption, photoUrl, photoPath }) {
  const url = `${API_BASE}/bot${token}/sendPhoto`;

  if (photoUrl) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption }),
    });
    if (!res.ok) throw new Error(`Telegram respondió ${res.status}: ${await res.text()}`);
    return res.json();
  }

  // Subida directa del archivo (multipart)
  const buffer = await readFile(path.resolve(ROOT, photoPath));
  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('caption', caption);
  form.append('photo', new Blob([buffer]), path.basename(photoPath));

  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Telegram respondió ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.caption || (!args.photoUrl && !args.photoPath)) {
    console.error('Uso: node scripts/publish-telegram.mjs --caption "..." (--photo-url URL | --photo-path ruta) [--dry-run]');
    process.exit(1);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (args.dryRun) {
    console.log('--- DRY RUN ---');
    console.log('Caption:\n' + args.caption);
    console.log('Foto:', args.photoUrl ?? args.photoPath);
    console.log(`TELEGRAM_BOT_TOKEN: ${token ? 'configurado' : 'FALTA'}`);
    console.log(`TELEGRAM_CHAT_ID: ${chatId ? 'configurado' : 'FALTA'}`);
    return;
  }

  if (!token || !chatId) {
    console.error('Faltan TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID en .env');
    process.exit(1);
  }

  try {
    const result = await sendPhoto({ token, chatId, caption: args.caption, photoUrl: args.photoUrl, photoPath: args.photoPath });
    console.log('✓ Publicado en Telegram:', result.result?.message_id);
  } catch (err) {
    await notifyError('Fase 5 · Telegram', err.message);
    console.error('✗ Error publicando en Telegram:', err.message);
    process.exit(1);
  }
}

main();
