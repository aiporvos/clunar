#!/usr/bin/env node
/**
 * Flujo OAuth de Instagram en un solo comando: abre el navegador, captura el
 * código con un servidor local, lo canjea por un token de larga duración
 * (60 días) y saca el INSTAGRAM_USER_ID — todo listo para copiar a .env.
 *
 * Usa la "Instagram API with Instagram Login" (host graph.instagram.com):
 * NO requiere página de Facebook, solo una cuenta Instagram profesional
 * (Creator o Business).
 *
 * Uso:
 *   INSTAGRAM_CLIENT_ID=xxx INSTAGRAM_CLIENT_SECRET=yyy node scripts/instagram-auth.mjs
 *
 * Renovar el token vigente sin abrir el navegador (hacerlo antes de los 60
 * días; un token vencido obliga a repetir el OAuth completo):
 *   INSTAGRAM_ACCESS_TOKEN=xxx node scripts/instagram-auth.mjs --refresh
 *
 * Requisito previo: en la app de Meta (developers.facebook.com), producto
 * Instagram → "API setup with Instagram business login", agregar en
 * "OAuth redirect URIs":
 *   http://localhost:8735/callback
 */
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

const PORT = 8735;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const GRAPH = 'https://graph.instagram.com';

// Permisos mínimos para leer el perfil y publicar en el feed.
const SCOPE = 'instagram_business_basic,instagram_business_content_publish';

function daysFrom(seconds) {
  return Math.round(seconds / 86400);
}

/** Renueva un token de larga duración vigente, sin browser. */
async function refresh() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    console.error('Falta INSTAGRAM_ACCESS_TOKEN. Uso:');
    console.error('  INSTAGRAM_ACCESS_TOKEN=xxx node scripts/instagram-auth.mjs --refresh');
    process.exit(1);
  }

  const url = `${GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    console.error('✗ Error renovando el token:', JSON.stringify(data));
    console.error('\nSi el token ya venció, no hay renovación posible: corré el OAuth completo');
    console.error('(sin --refresh) para sacar uno nuevo.');
    process.exit(1);
  }

  const vence = new Date(Date.now() + data.expires_in * 1000);
  console.log('✓ Token renovado. Actualizá esto en .env / Dokploy:\n');
  console.log(`INSTAGRAM_ACCESS_TOKEN=${data.access_token}`);
  console.log(`\n(vence: ${vence.toLocaleDateString('es-AR')}, en ~${daysFrom(data.expires_in)} días)`);
}

/** OAuth completo: browser → code → token corto → token largo → user id. */
async function authorize() {
  const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
  const CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Uso: INSTAGRAM_CLIENT_ID=xxx INSTAGRAM_CLIENT_SECRET=yyy node scripts/instagram-auth.mjs');
    process.exit(1);
  }

  const state = randomBytes(8).toString('hex');
  const authorizeUrl = `https://www.instagram.com/oauth/authorize`
    + `?client_id=${encodeURIComponent(CLIENT_ID)}`
    + `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    + `&scope=${encodeURIComponent(SCOPE)}`
    + `&response_type=code`
    + `&state=${state}`;

  console.log('\nAbrí esta URL, iniciá sesión con tu cuenta profesional y aprobá el acceso:\n');
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
      res.end(`Instagram devolvió un error: ${error} — ${url.searchParams.get('error_description') ?? ''}`);
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
      // Paso 1: code → token corto (1 hora). Este endpoint va por api.instagram.com.
      const shortRes = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
          code,
        }),
      });
      const shortData = await shortRes.json();
      if (!shortRes.ok || !shortData.access_token) {
        console.error('✗ Error canjeando el code:', JSON.stringify(shortData));
        process.exit(1);
      }

      // Paso 2: token corto → token largo (60 días, renovable sin browser).
      const longUrl = `${GRAPH}/access_token`
        + `?grant_type=ig_exchange_token`
        + `&client_secret=${encodeURIComponent(CLIENT_SECRET)}`
        + `&access_token=${encodeURIComponent(shortData.access_token)}`;
      const longRes = await fetch(longUrl);
      const longData = await longRes.json();
      if (!longRes.ok || !longData.access_token) {
        console.error('✗ Error obteniendo el token de larga duración:', JSON.stringify(longData));
        process.exit(1);
      }

      // Paso 3: el user id que se usa para publicar.
      const meRes = await fetch(`${GRAPH}/me?fields=user_id,username&access_token=${encodeURIComponent(longData.access_token)}`);
      const meData = await meRes.json();
      if (!meRes.ok) {
        console.error('✗ Error obteniendo el perfil:', JSON.stringify(meData));
        process.exit(1);
      }

      const userId = meData.user_id ?? shortData.user_id;
      const vence = new Date(Date.now() + longData.expires_in * 1000);

      console.log(`✓ Listo (cuenta: @${meData.username}). Pegá esto en .env / Dokploy:\n`);
      console.log(`INSTAGRAM_ACCESS_TOKEN=${longData.access_token}`);
      console.log(`INSTAGRAM_USER_ID=${userId}`);
      console.log(`\n(vence: ${vence.toLocaleDateString('es-AR')}, en ~${daysFrom(longData.expires_in)} días)`);
      console.log('Renovalo antes de esa fecha con:  node scripts/instagram-auth.mjs --refresh');
    } catch (err) {
      console.error('✗ Error inesperado:', err.message);
      process.exit(1);
    }
  });

  server.listen(PORT);
}

if (process.argv.includes('--refresh')) {
  refresh();
} else {
  authorize();
}
