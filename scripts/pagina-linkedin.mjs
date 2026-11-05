#!/usr/bin/env node
// Página de LinkedIn "Claudio Luna": un post por día, reciclando lo que ya salió en el perfil.
//
// LinkedIn no deja publicar en páginas por API sin Community Management API (solo para empresas
// registradas). Así que esto manda cada día un mail a Claudio con el texto y la portada del post que
// toca, listo para pegar desde la página. Se corre por cron cada hora: si hoy ya se mandó, no hace nada.
//
//   node scripts/pagina-linkedin.mjs            # manda el de hoy (si no se mandó)
//   node scripts/pagina-linkedin.mjs --cola     # muestra la cola y qué ya salió
//   node scripts/pagina-linkedin.mjs --prueba   # muestra el próximo sin mandar nada
//
// Estado en data/pagina-linkedin-estado.json (fuera de git). Usa el token de .gmail-token.json.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PARA = 'claudiotico@gmail.com';
const ESTADO = path.join(RAIZ, 'data', 'pagina-linkedin-estado.json');
// Anuncios con fecha que ya pasó: no se reciclan.
const EXCLUIR = new Set(['liderazgo-en-la-era-de-la-ia-fcai', 'liderazgo-recordatorio-fcai']);

const args = process.argv.slice(2);
const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());

// ---------- Cola: posts del blog que tienen texto de LinkedIn, del más viejo al más nuevo ----------
function cola() {
  const dir = path.join(RAIZ, 'content', 'drafts');
  return fs.readdirSync(dir)
    .filter((f) => f.startsWith('linkedin-') && f.endsWith('.txt'))
    .map((f) => f.slice('linkedin-'.length, -'.txt'.length))
    .filter((slug) => !EXCLUIR.has(slug))
    .map((slug) => {
      const post = ['mdx', 'md'].map((e) => path.join(RAIZ, 'src', 'content', 'posts', `${slug}.${e}`)).find(fs.existsSync);
      if (!post) return null;
      const fm = fs.readFileSync(post, 'utf8').split('---')[1] ?? '';
      const campo = (k) => fm.match(new RegExp(`^${k}:\\s*["']?(.+?)["']?\\s*$`, 'm'))?.[1];
      const portada = campo('coverImage');
      const img = portada ? path.join(RAIZ, 'public', portada.replace(/^\//, '')) : null;
      return {
        slug,
        titulo: campo('title') ?? slug,
        fecha: campo('publishedAt') ?? '',
        texto: fs.readFileSync(path.join(dir, `linkedin-${slug}.txt`), 'utf8').trim(),
        img: img && fs.existsSync(img) ? img : null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

const leerEstado = () => (fs.existsSync(ESTADO) ? JSON.parse(fs.readFileSync(ESTADO, 'utf8')) : { enviados: [] });
const guardarEstado = (e) => { fs.mkdirSync(path.dirname(ESTADO), { recursive: true }); fs.writeFileSync(ESTADO, JSON.stringify(e, null, 2)); };

const todos = cola();
const estado = leerEstado();
const hechos = new Set(estado.enviados.map((x) => x.slug));

if (args.includes('--cola')) {
  todos.forEach((p, i) => {
    const e = estado.enviados.find((x) => x.slug === p.slug);
    console.log(`${String(i + 1).padStart(2)} ${e ? `✓ ${e.fecha}` : '·           '} ${p.fecha}  ${p.titulo}${p.img ? '' : '  (sin portada)'}`);
  });
  process.exit(0);
}

if (estado.enviados.some((x) => x.fecha === hoy) && !args.includes('--prueba')) {
  console.log(`Hoy (${hoy}) ya se mandó. Nada que hacer.`);
  process.exit(0);
}

const idx = todos.findIndex((p) => !hechos.has(p.slug));
if (idx === -1) { console.log('La cola está vacía: ya salieron todos.'); process.exit(0); }
const p = todos[idx];
const link = `https://cluna.ar/blog/${p.slug}`;
const texto = p.texto.includes('cluna.ar/blog') ? p.texto : `${p.texto}\n\nLeelo completo: ${link}`;

if (args.includes('--prueba')) {
  console.log(`Próximo (${idx + 1}/${todos.length}): ${p.titulo}\nPortada: ${p.img ?? '—'}\n\n${texto}`);
  process.exit(0);
}

// ---------- Mail ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = `<div style="font-family:Arial,sans-serif;max-width:640px">
<p><b>Post ${idx + 1} de ${todos.length} para la página de LinkedIn.</b> Ya salió en tu perfil el ${p.fecha}.</p>
<ol>
  <li>Abrí la página "Claudio Luna" en LinkedIn (perfil → Páginas que administrás).</li>
  <li><b>Crear publicación</b> y pegá el texto de abajo.</li>
  <li>Adjuntá la imagen de este mail y publicá.</li>
</ol>
<div style="white-space:pre-wrap;border:2px solid #231f20;border-radius:8px;padding:14px;background:#f9f4da;font-size:15px;line-height:1.5">${esc(texto)}</div>
<p style="color:#666;font-size:13px">Blog: <a href="${link}">${link}</a></p>
</div>`;

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const frontera = `cluna-${Date.now()}`;
const asunto = `Página LinkedIn · post ${idx + 1}/${todos.length}: ${p.titulo}`;
const partes = [
  `From: Claudio Luna <contacto@cluna.ar>`,
  `To: ${PARA}`,
  `Subject: =?UTF-8?B?${b64(asunto)}?=`,
  'MIME-Version: 1.0',
  `Content-Type: multipart/mixed; boundary="${frontera}"`,
  '',
  `--${frontera}`,
  'Content-Type: text/html; charset="UTF-8"',
  'Content-Transfer-Encoding: base64',
  '',
  b64(html),
];
if (p.img) {
  const ext = path.extname(p.img).slice(1).replace('jpg', 'jpeg');
  partes.push(
    `--${frontera}`,
    `Content-Type: image/${ext}; name="${p.slug}.${ext === 'jpeg' ? 'jpg' : ext}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${p.slug}.${ext === 'jpeg' ? 'jpg' : ext}"`,
    '',
    fs.readFileSync(p.img).toString('base64').replace(/.{76}/g, '$&\r\n'),
  );
}
partes.push(`--${frontera}--`, '');
const raw = Buffer.from(partes.join('\r\n')).toString('base64url');

const tok = JSON.parse(fs.readFileSync(path.join(RAIZ, '.gmail-token.json'), 'utf8'));
const r = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ client_id: tok.client_id, client_secret: tok.client_secret, refresh_token: tok.refresh_token, grant_type: 'refresh_token' }),
});
const t = await r.json();
if (!r.ok) { console.error('✗ No pude refrescar el token de Gmail:', t.error); process.exit(1); }

const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
  method: 'POST',
  headers: { Authorization: `Bearer ${t.access_token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ raw }),
});
if (!res.ok) { console.error('✗ Gmail no aceptó el mail:', res.status, (await res.text()).slice(0, 300)); process.exit(1); }

estado.enviados.push({ slug: p.slug, fecha: hoy });
guardarEstado(estado);
console.log(`✓ Mandado post ${idx + 1}/${todos.length}: ${p.titulo}`);
