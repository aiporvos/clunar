# Deploy en Dokploy

Sitio Astro (SSR, adapter Node standalone) + Keystatic. Se despliega como app Docker.

## Pasos en Dokploy

1. **Crear aplicación** → tipo **Docker (Dockerfile)**.
2. **Source:** este repositorio (`git@github.com:aiporvos/clunar.git`), rama `master`.
3. **Build:** usa el `Dockerfile` de la raíz (no requiere configuración extra).
4. **Puerto interno:** `4321` (ya expuesto en el Dockerfile).
5. **Dominio:** asignar `cluna.ar` (y `www.cluna.ar`) con SSL.

## Variables de entorno

Copiá de `.env.example` y completá en el panel de Dokploy:

| Variable | Obligatoria | Para qué |
|---|---|---|
| `SITE_URL` | ✅ | URL pública (ej: `https://cluna.ar`). Se usa en el sitemap. |
| `NODE_ENV` | recomendado | `production` |
| `KEYSTATIC_GITHUB_CLIENT_ID` | solo admin | Panel `/keystatic` (editar contenido) — ver nota abajo |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | solo admin | idem |
| `KEYSTATIC_SECRET` | solo admin | `openssl rand -hex 32` (o `-base64 32`) |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | solo admin | el slug de la GitHub App — ver nota abajo |

> El sitio público funciona sin las variables de Keystatic; solo el panel de administración de contenido las necesita.

### ⚠️ Importante: tiene que ser una **GitHub App**, no una OAuth App clásica

Es un error fácil de cometer (y nos pasó): el nombre de las variables
(`KEYSTATIC_GITHUB_CLIENT_ID`) sugiere una OAuth App clásica de
`github.com/settings/developers` → "OAuth Apps". **Eso no funciona.**
Keystatic exige que la respuesta del intercambio de token incluya
`refresh_token` y `expires_in` — campos que **solo las GitHub Apps** pueden
emitir (con el opt-in de "tokens con expiración"). Una OAuth App clásica
devuelve `{access_token, token_type, scope}` sin esos campos, y Keystatic
falla con el mensaje genérico **"Authorization failed"** en
`/api/keystatic/github/oauth/callback` — sin loguear el motivo real, porque
técnicamente no es una excepción: es una validación de schema que rechaza
la forma de la respuesta.

**Setup correcto, paso a paso:**

1. Crear la app en **[github.com/settings/apps/new](https://github.com/settings/apps/new)**
   (sección **GitHub Apps**, no OAuth Apps):
   - Homepage URL: `https://cluna.ar`
   - Callback URL: `https://cluna.ar/api/keystatic/github/oauth/callback`
   - Webhook: se puede desmarcar "Active" (no hace falta)
   - **Repository permissions**: Contents → **Read & write** · Metadata →
     **Read-only** · Pull requests → **Read & write**
2. Generar el **Client Secret**, anotar el **Client ID**, y anotar el
   **slug** de la app (aparece en la URL: `github.com/settings/apps/<slug>`).
3. **Instalar la app** en el repo (`aiporvos/clunar`) — botón "Install App".
   Este paso no existe en OAuth Apps clásicas; sin instalar, la app no tiene
   acceso al repo aunque el login funcione.
4. **Optional features → "User-to-server token expiration" → Opt-in.**
   Esto es lo que hace que la respuesta incluya `refresh_token`/`expires_in`.
5. Cargar las 4 variables de la tabla de arriba en Dokploy → **Environment**
   → **Redeploy**.

Si en algún momento `/keystatic` vuelve a fallar con "Authorization failed",
diagnosticar así (sin exponer secrets):
- Confirmar que el Client ID/Secret son los de la **GitHub App instalada**,
  no de una OAuth App vieja.
- Confirmar que la app está **instalada** en el repo correcto.
- Confirmar que "User-to-server token expiration" está en **Opt-in**.
- El intercambio de código por token se puede probar a mano con `curl` a
  `https://github.com/login/oauth/access_token` (client_id + client_secret +
  code + redirect_uri) — la respuesta de GitHub muestra el error real
  (`bad_verification_code`, `incorrect_client_credentials`, etc.), cosa que
  el navegador no muestra.

## Build local (opcional)

```bash
docker compose up --build      # levanta en http://localhost:4321
# o sin docker:
npm ci --legacy-peer-deps && npm run build && node ./dist/server/entry.mjs
```
