import type { APIRoute } from 'astro';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import schema from '../../data/tiendanube-checklist-schema.json';

export const prerender = false;

const DATA_DIR = path.resolve(process.cwd(), 'data');
const JSON_PATH = path.join(DATA_DIR, 'tiendanube-checklist-respuestas.json');
const MD_PATH = path.join(DATA_DIR, 'tiendanube-checklist-respuestas.md');

async function loadAnswers(): Promise<Record<string, any>> {
  if (!existsSync(JSON_PATH)) return {};
  return JSON.parse(await readFile(JSON_PATH, 'utf-8'));
}

function renderMarkdown(answers: Record<string, any>): string {
  const lines: string[] = [];
  lines.push(`# ${schema.titulo}`);
  lines.push('');
  lines.push(`> Actualizado: ${new Date().toLocaleString('es-AR')}`);
  lines.push('');
  lines.push('## Datos generales');
  for (const c of schema.cabecera) {
    lines.push(`- **${c.label}:** ${answers[c.id] || '_(sin completar)_'}`);
  }
  lines.push('');
  lines.push('## Gobierno del proyecto');
  for (const r of schema.roles.filas) {
    const nombre = answers[`${r.id}_nombre`] || '_(sin completar)_';
    const canal = answers[`${r.id}_canal`] || '_(sin completar)_';
    lines.push(`- **${r.rol}** — ${r.responsabilidad} — Nombre: ${nombre} · Canal: ${canal}`);
  }
  lines.push('');

  for (const sec of schema.secciones) {
    lines.push(`## ${sec.titulo}`);
    if (sec.intro) lines.push(`_${sec.intro}_`);
    lines.push('');
    sec.items.forEach((item, idx) => {
      const id = `${sec.id}-${idx}`;
      const ok = answers[`${id}_ok`] ? '[x]' : '[ ]';
      const estado = answers[`${id}_estado`] || 'Pendiente';
      const fecha = answers[`${id}_fecha`] || '';
      const nota = answers[`${id}_nota`] || '';
      lines.push(`- ${ok} **${item.titulo}** (${item.responsable}) — ${item.detalle}`);
      lines.push(`  - Estado: ${estado}${fecha ? ` · Fecha: ${fecha}` : ''}${nota ? ` · Nota: ${nota}` : ''}`);
    });
    if (sec.salida) lines.push(`\n> **Salida de fase:** ${sec.salida}`);
    lines.push('');
  }

  lines.push('## Aprobación de lanzamiento');
  for (const c of schema.aprobacionFinal.campos) {
    lines.push(`- **${c.label}:** ${answers[c.id] || '_(sin completar)_'}`);
  }

  return lines.join('\n') + '\n';
}

export const GET: APIRoute = async () => {
  const answers = await loadAnswers();
  return new Response(JSON.stringify(answers), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const answers = await request.json();
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(JSON_PATH, JSON.stringify(answers, null, 2) + '\n');
    await writeFile(MD_PATH, renderMarkdown(answers));
    return new Response(JSON.stringify({ ok: true, savedAt: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
