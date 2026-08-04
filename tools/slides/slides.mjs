#!/usr/bin/env node
/**
 * Generador de placas para carruseles (Instagram) y posts documento (LinkedIn).
 *
 *   node tools/slides/slides.mjs --slug ocho-habitos-para-gastar-menos-tokens-en-claude
 *
 * Lee  content/slides/{slug}.json
 * Escribe:
 *   public/images/posts/{slug}/slides/01.png … NN.png   (1080x1350, para Instagram)
 *   public/images/posts/{slug}/slides.pdf               (1 página por placa, para LinkedIn)
 *
 * Por qué así y no con un modelo de imagen: las placas llevan mucho texto y los
 * modelos de imagen deforman las letras. Esto se renderiza con las tipografías
 * de marca reales, así que el texto sale exacto siempre.
 *
 * Usa playwright-core contra el Chrome del sistema: no descarga navegador ni
 * toca las dependencias del sitio (viven en tools/slides/package.json aparte).
 */
import { chromium } from 'playwright-core';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = 1080;
const H = 1350;

const PALETA = {
  amarillo: '#fcba28',
  naranja: '#fc7428',
  verde: '#0ba95b',
  rosa: '#f38ba3',
  violeta: '#7b5ea7',
  celeste: '#12b5e5',
};
const CREMA = '#f9f4da';
const CHARCOAL = '#231f20';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--slug') args.slug = argv[++i];
    else if (argv[i] === '--only-pdf') args.onlyPdf = true;
  }
  return args;
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Las tipografías van embebidas en base64: sin red y sin rutas relativas que fallen. */
async function fontFaces() {
  const dir = path.join(ROOT, 'public/fonts');
  const load = async (f) => (await readFile(path.join(dir, f))).toString('base64');
  const [outfit, outfitExt, paytone, paytoneExt] = await Promise.all([
    load('outfit-latin.woff2'),
    load('outfit-latin-ext.woff2'),
    load('paytone-latin.woff2'),
    load('paytone-latin-ext.woff2'),
  ]);
  const face = (family, b64, weight = '400') => `
    @font-face {
      font-family: '${family}';
      src: url(data:font/woff2;base64,${b64}) format('woff2');
      font-weight: ${weight};
      font-display: block;
    }`;
  return [
    face('Outfit', outfitExt, '100 900'),
    face('Outfit', outfit, '100 900'),
    face('Paytone One', paytoneExt),
    face('Paytone One', paytone),
  ].join('\n');
}

function slideHtml(s, i, total) {
  const accent = PALETA[s.accent] ?? PALETA.amarillo;
  const num = String(i + 1).padStart(2, '0');

  if (s.type === 'cover') {
    return `
    <section class="slide cover" style="--accent:${accent}">
      <div class="chip">${esc(s.kicker)}</div>
      <h1 class="t-cover">${esc(s.title)}</h1>
      <p class="b-cover">${esc(s.body)}</p>
      <div class="arrow">→</div>
      <footer><span class="brand">cluna.ar</span></footer>
    </section>`;
  }

  if (s.type === 'closing') {
    return `
    <section class="slide closing" style="--accent:${accent}">
      <div class="chip chip-alert">${esc(s.kicker)}</div>
      <h2 class="t-closing">${esc(s.title)}</h2>
      <p class="b">${esc(s.body)}</p>
      <div class="remate">${esc(s.footer ?? '')}</div>
      <footer><span class="brand">cluna.ar</span><span class="count">${num}/${total}</span></footer>
    </section>`;
  }

  return `
    <section class="slide tip" style="--accent:${accent}">
      <div class="chip">${esc(s.kicker)}</div>
      <div class="n">${s.n}</div>
      <h2 class="t">${esc(s.title)}</h2>
      <p class="b">${esc(s.body)}</p>
      <footer><span class="brand">cluna.ar</span><span class="count">${num}/${total}</span></footer>
    </section>`;
}

function pageHtml(slides, faces) {
  const total = slides.length;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
  ${faces}
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { background:${CREMA}; }
  .slide {
    width:${W}px; height:${H}px; background:${CREMA}; color:${CHARCOAL};
    padding:96px 88px; display:flex; flex-direction:column;
    font-family:'Outfit', sans-serif; position:relative; overflow:hidden;
    page-break-after:always; break-after:page;
  }
  .slide:last-child { page-break-after:auto; break-after:auto; }

  /* barra de acento al borde superior */
  .slide::before {
    content:''; position:absolute; top:0; left:0; right:0; height:14px; background:var(--accent);
  }

  .chip {
    align-self:flex-start; font-size:26px; font-weight:600; letter-spacing:.02em;
    padding:12px 26px; border:3px solid ${CHARCOAL}; border-radius:999px;
    background:var(--accent); color:${CHARCOAL};
    box-shadow:5px 5px 0 ${CHARCOAL};
  }
  .chip-alert { background:${CREMA}; }

  /* margin-top:auto acá + margin-bottom:auto en .b centran el bloque
     verticalmente entre el chip y el pie, en vez de dejarlo cargado arriba. */
  .n {
    font-family:'Paytone One', sans-serif; font-size:150px; line-height:1;
    color:var(--accent); -webkit-text-stroke:6px ${CHARCOAL};
    margin-top:auto;
  }
  .t {
    font-family:'Paytone One', sans-serif; font-size:74px; line-height:1.1;
    margin-top:28px; text-wrap:balance;
  }
  .b {
    font-size:37px; line-height:1.5; margin-top:34px; max-width:19ch;
    max-width:none; color:#3b3532;
  }

  .t-cover {
    font-family:'Paytone One', sans-serif; font-size:92px; line-height:1.06;
    margin-top:auto; text-wrap:balance;
  }
  .b-cover { font-size:40px; line-height:1.45; margin-top:36px; color:#3b3532; }
  .arrow { font-size:78px; margin-top:44px; margin-bottom:auto; color:var(--accent);
           -webkit-text-stroke:3px ${CHARCOAL}; }

  .t-closing {
    font-family:'Paytone One', sans-serif; font-size:66px; line-height:1.12;
    margin-top:auto; text-wrap:balance;
  }
  .remate {
    font-size:34px; font-weight:600; line-height:1.4;
    border-top:4px solid ${CHARCOAL}; padding-top:28px; margin-bottom:104px;
  }

  .tip .b, .closing .b { margin-bottom:auto; }

  footer {
    position:absolute; left:88px; right:88px; bottom:56px;
    display:flex; justify-content:space-between; align-items:center;
    font-size:26px; font-weight:600; color:#6b615c;
  }
  .brand { color:${CHARCOAL}; font-weight:700; }
  .count { font-variant-numeric:tabular-nums; }
  @page { size:${W}px ${H}px; margin:0; }
  </style></head><body>
  ${slides.map((s, i) => slideHtml(s, i, slides.length)).join('\n')}
  </body></html>`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.slug) {
    console.error('Uso: node tools/slides/slides.mjs --slug <slug> [--only-pdf]');
    process.exit(1);
  }

  const spec = JSON.parse(
    await readFile(path.join(ROOT, 'content/slides', `${args.slug}.json`), 'utf8'),
  );
  const outDir = path.join(ROOT, 'public/images/posts', args.slug, 'slides');
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const html = pageHtml(spec.slides, await fontFaces());
  // Se deja el HTML al lado de las placas: sirve para revisar el render sin regenerar.
  const htmlPath = path.join(outDir, '_placas.html');
  await writeFile(htmlPath, html, 'utf8');

  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);

    if (!args.onlyPdf) {
      // JPEG y no PNG: la API de Instagram rechaza PNG.
      const nodes = await page.locator('.slide').all();
      for (let i = 0; i < nodes.length; i++) {
        const file = path.join(outDir, `${String(i + 1).padStart(2, '0')}.jpg`);
        await nodes[i].screenshot({ path: file, type: 'jpeg', quality: 92 });
        console.log(`✓ ${path.relative(ROOT, file)}`);
      }
    }

    const pdfPath = path.join(ROOT, 'public/images/posts', args.slug, 'slides.pdf');
    await page.pdf({
      path: pdfPath,
      width: `${W}px`,
      height: `${H}px`,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    console.log(`✓ ${path.relative(ROOT, pdfPath)} (${spec.slides.length} páginas)`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('✗', err.message);
  process.exit(1);
});
