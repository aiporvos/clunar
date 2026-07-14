# cluna.ar — sitio de Claudio Luna

> ⚠️ **Antes de tocar contenido, secciones o estilos: leé `BRAND.md` completo.**
> Es la fuente de verdad de la marca (voz, naming, sistema visual, servicios,
> anti-patrones y checklist). La versión web vive en `/brand` (`src/pages/brand.astro`);
> si cambiás una, actualizá la otra.

## Reglas duras (resumen — el detalle está en BRAND.md)

- **Marca:** Claudio Luna (persona) · cluna.ar (handle, minúscula). "AIporvos" es marca saliente.
- **Visual:** neo-brutalismo cálido — NO se cambia. Tokens en `src/styles/global.css`.
- **WhatsApp:** siempre "API oficial de WhatsApp (Meta)" o "YCloud". **Nunca "Evolution API".**
- **Copy:** voseo argentino, sin superlativos, con datos concretos. Mensaje central:
  adoptar IA sin perder el control de los datos (seguridad + gobernanza + self-hosted).
- Todo componente debe funcionar en light **y** dark (toggle en el Nav).

## Stack

Astro 5 (SSR, adapter node) + Tailwind + Keystatic (CMS) + MDX + Lenis. Deploy: Docker/Dokploy.

```bash
npm run dev      # dev server en 127.0.0.1:4321
npm run build    # build de producción
```

## Publicar contenido

Para escribir y publicar un post (blog + portada + LinkedIn + Telegram) usar
el skill `/publicar`. Spec completa del pipeline: `PIPELINE.md`.

```bash
node --env-file=.env scripts/cover-image.mjs --slug {slug} --preset "{preset}" --dry-run
node --env-file=.env scripts/publish-linkedin.mjs --text "..." --image "..." --dry-run
node --env-file=.env scripts/publish-telegram.mjs --caption "..." --photo-path "..." --dry-run
```

Remote de git: **`clunar`** (no `origin`), rama **`master`** (no `main`).

## Generar video (HyperFrames)

Instalado (2026-07-14): 20 skills de [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
en `.claude/skills/` (symlink a `.agents/skills/`). Router: `/hyperframes` —
leerlo primero para cualquier pedido de video/animación/motion graphic.

**Uso previsto:** generar el video corto de cada post para el pipeline de
LinkedIn (`/faceless-explainer` o `/product-launch-video`), usando `BRAND.md`
como fuente del `frame.md`/`design.md` de HyperFrames — así el video sale con
la paleta y el estilo del sitio, no genérico.

⚠️ **Requiere Node 22+ para renderizar** (`npx hyperframes ...`). El sistema
tiene Node v20.20.2 — instalar Node 22+ (nvm o similar) antes del primer uso
real; instalar los skills en sí no lo necesitó.

Regla de marca a respetar siempre que se use: **nunca loops perpetuos** — si
un video se usa como fondo (ej. hero), tiene que ser un reveal de una sola
vez, no un loop infinito (BRAND.md §Motion).
