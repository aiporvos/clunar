#!/usr/bin/env node
// Operaciones sobre Google Docs con la API oficial. Sin dependencias.
// Requiere haber corrido antes: node scripts/gdocs-auth.mjs
//
// Uso:
//   node scripts/gdocs.mjs crear --titulo "T" --html archivo.html [--carpeta ID]
//   node scripts/gdocs.mjs reemplazar --id ID --de "{{X}}" --por "valor" [...]
//   node scripts/gdocs.mjs formato --id ID [--cuerpo "Outfit"] [--titulos "Paytone One"]
//                                 [--umbral 15] [--fondo f9f4da]
//   node scripts/gdocs.mjs leer --id ID

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN_FILE = path.join(RAIZ, '.google-token.json');

// ---------- auth ----------

async function accessToken() {
  if (!fs.existsSync(TOKEN_FILE)) {
    console.error('✗ Falta .google-token.json. Corré primero: node scripts/gdocs-auth.mjs');
    process.exit(1);
  }
  const t = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: t.client_id,
      client_secret: t.client_secret,
      refresh_token: t.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  const d = await r.json();
  if (!r.ok) {
    console.error('✗ No pude refrescar el token:', JSON.stringify(d, null, 2));
    console.error('  Si dice invalid_grant, volvé a correr scripts/gdocs-auth.mjs');
    process.exit(1);
  }
  return d.access_token;
}

async function api(token, url, opciones = {}) {
  const r = await fetch(url, {
    ...opciones,
    headers: { Authorization: `Bearer ${token}`, ...(opciones.headers || {}) },
  });
  const texto = await r.text();
  let datos;
  try { datos = texto ? JSON.parse(texto) : {}; } catch { datos = { raw: texto }; }
  if (!r.ok) {
    console.error(`✗ ${r.status} en ${url}`);
    console.error(JSON.stringify(datos, null, 2));
    process.exit(1);
  }
  return datos;
}

// ---------- helpers ----------

function args() {
  const a = process.argv.slice(3);
  const o = { _pares: [] };
  for (let i = 0; i < a.length; i++) {
    if (!a[i].startsWith('--')) continue;
    const clave = a[i].slice(2);
    const valor = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true;
    if (clave === 'de' || clave === 'por') o._pares.push([clave, valor]);
    else o[clave] = valor;
  }
  return o;
}

function hexARgb(hex) {
  const h = hex.replace('#', '');
  return {
    red: parseInt(h.slice(0, 2), 16) / 255,
    green: parseInt(h.slice(2, 4), 16) / 255,
    blue: parseInt(h.slice(4, 6), 16) / 255,
  };
}

// Recorre el documento (incluidas las tablas) y junta los textRun con su tamaño.
function recolectarRuns(contenido, acc = []) {
  for (const el of contenido || []) {
    if (el.paragraph) {
      for (const pe of el.paragraph.elements || []) {
        if (pe.textRun && pe.endIndex > pe.startIndex) {
          const txt = pe.textRun.content || '';
          if (txt.trim() === '') continue;
          acc.push({
            inicio: pe.startIndex,
            fin: pe.endIndex,
            tam: pe.textRun.textStyle?.fontSize?.magnitude ?? null,
          });
        }
      }
    }
    if (el.table) {
      for (const fila of el.table.tableRows || [])
        for (const celda of fila.tableCells || [])
          recolectarRuns(celda.content, acc);
    }
  }
  return acc;
}

async function batchUpdate(token, id, requests) {
  if (!requests.length) { console.log('· nada para actualizar'); return; }
  const trozos = [];
  for (let i = 0; i < requests.length; i += 400) trozos.push(requests.slice(i, i + 400));
  for (const t of trozos) {
    await api(token, `https://docs.googleapis.com/v1/documents/${id}:batchUpdate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: t }),
    });
  }
}

// ---------- comandos ----------

async function crear(token, o) {
  if (!o.titulo || !o.html) {
    console.error('✗ Faltan --titulo y --html');
    process.exit(1);
  }
  const html = fs.readFileSync(path.resolve(o.html), 'utf8');
  const meta = {
    name: o.titulo,
    mimeType: 'application/vnd.google-apps.document',
    ...(o.carpeta ? { parents: [o.carpeta] } : {}),
  };
  const limite = '-------cluna' + Date.now();
  const cuerpo =
    `--${limite}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(meta) +
    `\r\n--${limite}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n` +
    html +
    `\r\n--${limite}--`;

  const d = await api(token,
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${limite}` },
      body: cuerpo,
    });
  console.log('✓ Documento creado');
  console.log('  id:', d.id);
  console.log('  url:', d.webViewLink);
  return d.id;
}

async function reemplazar(token, o) {
  if (!o.id) { console.error('✗ Falta --id'); process.exit(1); }
  const requests = [];
  for (let i = 0; i < o._pares.length; i += 2) {
    const de = o._pares[i], por = o._pares[i + 1];
    if (!de || de[0] !== 'de' || !por || por[0] !== 'por') {
      console.error('✗ Los --de tienen que venir seguidos de un --por');
      process.exit(1);
    }
    requests.push({
      replaceAllText: {
        containsText: { text: de[1], matchCase: true },
        replaceText: por[1] === true ? '' : por[1],
      },
    });
  }
  await batchUpdate(token, o.id, requests);
  console.log(`✓ ${requests.length} reemplazo(s) aplicados`);
}

async function formato(token, o) {
  if (!o.id) { console.error('✗ Falta --id'); process.exit(1); }
  const doc = await api(token, `https://docs.googleapis.com/v1/documents/${o.id}`);
  const runs = recolectarRuns(doc.body.content);
  const umbral = parseFloat(o.umbral ?? 15);
  const requests = [];

  if (o.fondo) {
    requests.push({
      updateDocumentStyle: {
        documentStyle: { background: { color: { color: { rgbColor: hexARgb(o.fondo) } } } },
        fields: 'background',
      },
    });
  }

  for (const r of runs) {
    const esTitulo = o.titulos && r.tam !== null && r.tam >= umbral;
    const fuente = esTitulo ? o.titulos : o.cuerpo;
    if (!fuente || fuente === true) continue;
    requests.push({
      updateTextStyle: {
        range: { startIndex: r.inicio, endIndex: r.fin },
        textStyle: { weightedFontFamily: { fontFamily: fuente } },
        fields: 'weightedFontFamily',
      },
    });
  }

  await batchUpdate(token, o.id, requests);
  const titulos = o.titulos ? runs.filter(r => r.tam !== null && r.tam >= umbral).length : 0;
  console.log(`✓ Formato aplicado: ${runs.length} fragmentos (${titulos} como título)`);
  if (o.fondo) console.log(`✓ Fondo de página: #${o.fondo.replace('#', '')}`);
}

async function leer(token, o) {
  if (!o.id) { console.error('✗ Falta --id'); process.exit(1); }
  const doc = await api(token, `https://docs.googleapis.com/v1/documents/${o.id}`);
  const runs = recolectarRuns(doc.body.content);
  console.log('Título:', doc.title);
  console.log('Fragmentos de texto:', runs.length);
  const tam = [...new Set(runs.map(r => r.tam).filter(Boolean))].sort((a, b) => b - a);
  console.log('Tamaños de fuente presentes:', tam.join(', '));
}


// Devuelve el texto plano del documento junto al mapa offset -> índice real.
function textoConIndices(contenido, acc = { texto: '', mapa: [] }) {
  for (const el of contenido || []) {
    if (el.paragraph) {
      for (const pe of el.paragraph.elements || []) {
        const t = pe.textRun?.content;
        if (!t) continue;
        for (let i = 0; i < t.length; i++) acc.mapa.push(pe.startIndex + i);
        acc.texto += t;
      }
    }
    if (el.table) {
      for (const fila of el.table.tableRows || [])
        for (const celda of fila.tableCells || [])
          textoConIndices(celda.content, acc);
    }
  }
  return acc;
}

async function borrar(token, o) {
  if (!o.id || !o.texto) {
    console.error('✗ Faltan --id y --texto');
    process.exit(1);
  }
  const doc = await api(token, `https://docs.googleapis.com/v1/documents/${o.id}`);
  const { texto, mapa } = textoConIndices(doc.body.content);
  const pos = texto.indexOf(o.texto);
  if (pos === -1) {
    console.error('✗ No encontré ese texto en el documento.');
    process.exit(1);
  }
  let fin = pos + o.texto.length;
  // se lleva también el salto de línea que queda huérfano
  if (texto[fin] === '\n' || texto[fin] === '\v') fin++;
  const inicio = mapa[pos];
  const finReal = mapa[fin - 1] + 1;
  await batchUpdate(token, o.id, [{
    deleteContentRange: { range: { startIndex: inicio, endIndex: finReal } },
  }]);
  console.log(`✓ Borrado (${finReal - inicio} caracteres)`);
}

// ---------- main ----------

const comando = process.argv[2];
const o = args();
const token = await accessToken();

switch (comando) {
  case 'crear': await crear(token, o); break;
  case 'reemplazar': await reemplazar(token, o); break;
  case 'formato': await formato(token, o); break;
  case 'leer': await leer(token, o); break;
  case 'borrar': await borrar(token, o); break;
  default:
    console.log('Comandos: crear | reemplazar | formato | leer | borrar');
    console.log('Ver el encabezado del archivo para los parámetros.');
}
