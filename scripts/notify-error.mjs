#!/usr/bin/env node
/**
 * Avisa por Telegram cuando una fase del pipeline falla. Sin checkpoint:
 * los errores se notifican, no se aprueban. Ver PIPELINE.md §6.
 *
 * Uso: node scripts/notify-error.mjs --phase "Fase 3 · Deploy" --message "el error concreto"
 * Uso como módulo: import { notifyError } from './notify-error.mjs'
 */
const API_BASE = 'https://api.telegram.org';

export async function notifyError(phase, message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error(`[sin notificar — falta TELEGRAM_BOT_TOKEN/CHAT_ID] ${phase}: ${message}`);
    return false;
  }
  const text = `⚠️ Pipeline de publicación — error\n\n*Fase:* ${phase}\n*Detalle:* ${message}`;
  const res = await fetch(`${API_BASE}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
  if (!res.ok) {
    console.error('No se pudo notificar el error por Telegram:', await res.text());
    return false;
  }
  return true;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--phase') args.phase = argv[++i];
    if (argv[i] === '--message') args.message = argv[++i];
  }
  return args;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const { phase, message } = parseArgs(process.argv.slice(2));
  if (!phase || !message) {
    console.error('Uso: node scripts/notify-error.mjs --phase "..." --message "..."');
    process.exit(1);
  }
  const ok = await notifyError(phase, message);
  process.exit(ok ? 0 : 1);
}
