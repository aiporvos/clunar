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
| `KEYSTATIC_GITHUB_CLIENT_ID` | solo admin | Panel `/keystatic` (editar contenido) |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | solo admin | idem |
| `KEYSTATIC_SECRET` | solo admin | `openssl rand -hex 32` |

> El sitio público funciona sin las variables de Keystatic; solo el panel de administración de contenido las necesita.

## Build local (opcional)

```bash
docker compose up --build      # levanta en http://localhost:4321
# o sin docker:
npm ci --legacy-peer-deps && npm run build && node ./dist/server/entry.mjs
```
