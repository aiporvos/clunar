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
node scripts/cover-image.mjs --slug {slug} --preset "{preset}" --dry-run
node scripts/publish-linkedin.mjs --text "..." --image "..." --dry-run
node scripts/publish-telegram.mjs --caption "..." --photo-path "..." --dry-run
```

Remote de git: **`clunar`** (no `origin`), rama **`master`** (no `main`).
