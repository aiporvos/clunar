#!/usr/bin/env node
// Autorización OAuth para la API de Google Docs/Drive.
// Se corre una sola vez: guarda el refresh token en .google-token.json
// Sin dependencias: usa fetch y http nativos de Node.

import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUERTO = 53682;
const REDIRECT = `http://localhost:${PUERTO}`;
// Solo drive.file: alcanza únicamente a los archivos que crea esta app.
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

function leerCredenciales() {
  const archivo = fs.readdirSync(RAIZ).find(f => f.startsWith('client_secret') && f.endsWith('.json'));
  if (!archivo) {
    console.error('✗ No encontré ningún client_secret*.json en la raíz del repo.');
    process.exit(1);
  }
  const json = JSON.parse(fs.readFileSync(path.join(RAIZ, archivo), 'utf8'));
  const cred = json.installed || json.web;
  if (!cred) {
    console.error('✗ El JSON no tiene la forma esperada (installed/web).');
    process.exit(1);
  }
  return { client_id: cred.client_id, client_secret: cred.client_secret };
}

const { client_id, client_secret } = leerCredenciales();

const verifier = crypto.randomBytes(48).toString('base64url');
const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
const estado = crypto.randomBytes(16).toString('hex');

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id,
  redirect_uri: REDIRECT,
  response_type: 'code',
  scope: SCOPE,
  code_challenge: challenge,
  code_challenge_method: 'S256',
  access_type: 'offline',
  prompt: 'consent',
  state: estado,
});

console.log('\n🔗 Abrí este link en el navegador y autorizá:\n');
console.log(authUrl);
console.log('\n(Si dice "Google no verificó esta aplicación": Configuración avanzada → Ir a ... (no seguro))\n');
console.log('Esperando la autorización...\n');

const servidor = http.createServer(async (req, res) => {
  const u = new URL(req.url, REDIRECT);
  if (u.pathname !== '/') { res.writeHead(404).end(); return; }

  const code = u.searchParams.get('code');
  const err = u.searchParams.get('error');

  if (err || !code) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Falló la autorización</h1><p>' + (err || 'sin código') + '</p>');
    console.error('✗ Autorización rechazada:', err || 'sin código');
    servidor.close();
    process.exit(1);
  }

  if (u.searchParams.get('state') !== estado) {
    res.writeHead(400).end('state inválido');
    console.error('✗ El state no coincide. Abortado por seguridad.');
    servidor.close();
    process.exit(1);
  }

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id, client_secret, code,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT,
    }),
  });

  const datos = await resp.json();

  if (!resp.ok || !datos.refresh_token) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Error al canjear el código</h1>');
    console.error('✗ Error:', JSON.stringify(datos, null, 2));
    servidor.close();
    process.exit(1);
  }

  const destino = path.join(RAIZ, '.google-token.json');
  fs.writeFileSync(destino, JSON.stringify({
    client_id, client_secret,
    refresh_token: datos.refresh_token,
    scope: datos.scope,
    creado: new Date().toISOString(),
  }, null, 2));
  fs.chmodSync(destino, 0o600);

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<body style="font-family:sans-serif;background:#f9f4da;padding:40px"><h1>Listo</h1><p>Ya podés cerrar esta pestaña y volver a la terminal.</p></body>');

  console.log('✓ Token guardado en .google-token.json (permisos 600)');
  console.log('✓ Scope otorgado:', datos.scope);
  servidor.close();
  process.exit(0);
});

servidor.listen(PUERTO);
setTimeout(() => { console.error('✗ Se agotó el tiempo de espera (15 min).'); process.exit(1); }, 900000);
