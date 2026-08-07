#!/usr/bin/env node
// Genera un logo/isotipo con Kie.ai. Prompt libre, sin el estilo de portadas de blog.
// Uso: node --env-file=.env scripts/logo.mjs --nombre archivo --prompt "..." [--size 1:1]

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const o = {};
for (let i = 0; i < args.length; i++) {
  if (!args[i].startsWith('--')) continue;
  o[args[i].slice(2)] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
}

const apiKey = process.env.KIE_API_KEY;
if (!apiKey) { console.error('✗ Falta KIE_API_KEY'); process.exit(1); }
if (!o.prompt || !o.nombre) { console.error('✗ Faltan --prompt y --nombre'); process.exit(1); }

const base = process.env.KIE_API_BASE || 'https://api.kie.ai';

const createRes = await fetch(`${base}/api/v1/jobs/createTask`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'google/nano-banana',
    input: { prompt: o.prompt, output_format: 'png', image_size: o.size || '1:1' },
  }),
});
if (!createRes.ok) { console.error(`✗ Kie create ${createRes.status}: ${await createRes.text()}`); process.exit(1); }
const taskId = (await createRes.json()).data?.taskId;
if (!taskId) { console.error('✗ Sin taskId'); process.exit(1); }

const limite = Date.now() + 240000;
while (Date.now() < limite) {
  await new Promise(r => setTimeout(r, 4000));
  const p = await fetch(`${base}/api/v1/jobs/recordInfo?taskId=${taskId}`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!p.ok) continue;
  const { data: job } = await p.json();
  if (job.state === 'success') {
    const { resultUrls } = JSON.parse(job.resultJson ?? '{}');
    const img = await (await fetch(resultUrls[0])).arrayBuffer();
    const dir = path.join(process.cwd(), 'public/images/marca');
    fs.mkdirSync(dir, { recursive: true });
    const destino = path.join(dir, `${o.nombre}.png`);
    fs.writeFileSync(destino, Buffer.from(img));
    console.log('✓', destino);
    process.exit(0);
  }
  if (job.state === 'fail') { console.error('✗ Falló:', job.failMsg); process.exit(1); }
}
console.error('✗ Timeout');
process.exit(1);
