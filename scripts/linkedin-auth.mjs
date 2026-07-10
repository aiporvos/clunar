#!/usr/bin/env node
/**
 * Flujo OAuth de LinkedIn en un solo comando: abre el navegador, captura el
 * código automáticamente con un servidor local, lo canjea por el token, y
 * saca el LINKEDIN_PERSON_URN — todo listo para copiar a .env.
 *
 * Uso:
 *   LINKEDIN_CLIENT_ID=xxx LINKEDIN_CLIENT_SECRET=yyy node scripts/linkedin-auth.mjs
 *
 * Requisito previo: en la app de LinkedIn Developer, pestaña "Auth", agregar
 * en "Authorized redirect URLs for your app":
 *   http://localhost:8734/callback
 */
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

const PORT = 8734;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Uso: LINKEDIN_CLIENT_ID=xxx LINKEDIN_CLIENT_SECRET=yyy node scripts/linkedin-auth.mjs');
  process.exit(1);
}

const state = randomBytes(8).toString('hex');
const scope = 'openid profile w_member_social';
const authorizeUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${encodeURIComponent(scope)}`;

console.log('\nAbrí esta URL, iniciá sesión y aprobá el acceso:\n');
console.log(authorizeUrl);
console.log(`\nEsperando el redirect en ${REDIRECT_URI} ...\n`);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== '/callback') { res.writeHead(404); res.end(); return; }

  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`LinkedIn devolvió un error: ${error} — ${url.searchParams.get('error_description') ?? ''}`);
    console.error('✗ Error:', error, url.searchParams.get('error_description'));
    server.close();
    process.exit(1);
  }

  if (returnedState !== state) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('state no coincide — posible ataque CSRF, abortando.');
    server.close();
    process.exit(1);
  }

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Listo — volvé a la terminal.');
  server.close();

  try {
    // Paso 1: canjear code por access_token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('✗ Error canjeando el token:', tokenData);
      process.exit(1);
    }

    // Paso 2: sacar el person URN
    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();
    if (!userRes.ok) {
      console.error('✗ Error obteniendo userinfo:', userData);
      process.exit(1);
    }

    const expiresDate = new Date(Date.now() + tokenData.expires_in * 1000);

    console.log('✓ Listo. Pegá esto en .env / Dokploy:\n');
    console.log(`LINKEDIN_ACCESS_TOKEN=${tokenData.access_token}`);
    console.log(`LINKEDIN_PERSON_URN=urn:li:person:${userData.sub}`);
    console.log(`\n(vence: ${expiresDate.toLocaleDateString('es-AR')} — el pipeline avisa cuando haya que renovarlo)`);
  } catch (err) {
    console.error('✗ Error inesperado:', err.message);
    process.exit(1);
  }
});

server.listen(PORT);
