# Plan de construcción — cluna.ar

> Sitio de **AIporvos** construido por **HIVE**, clonando la estructura/colores/fuentes de
> **vdgmentorias.com**, con el hero animado en **Rive** y dos secciones rediseñadas al
> estilo **daveholloway.uk** (el "tender" de servicios y el carrusel de casos).

---

## 1. Decisiones confirmadas

| Decisión | Elección |
|---|---|
| Base de código | Clon de `vdg-mentorias` (Astro 5 SSR + Tailwind + Keystatic + MDX) |
| Contenido | AIporvos (flujos de IA para negocios) — ver `CONTENIDO.md` |
| Fuentes | **Syne** (display) + **Inter** (body) — igual a VDG |
| Paleta | **VDG cremita**: fondo crema, naranja primario `hsl(24 95% 53%)`, coral `hsl(5 75% 65%)` + modo oscuro con toggle |
| Animación hero | **Rive** (runtime `@rive-app/canvas`) — personaje/robot AIporvos que sigue el mouse |
| Secciones estilo Dave | **Servicios** = tender de tags colgando; **Casos** = carrusel horizontal con parallax |
| Carpeta destino | `/home/cluna/projects/cluna.ar/` |
| Dominio | cluna.ar |

---

## 2. Stack y dependencias

Se parte del `package.json` de VDG y se agregan:

```jsonc
"@rive-app/canvas": "^2.x",   // animación del hero (idéntico a Dave)
"lenis": "^1.x"               // smooth-scroll (el "feel" de daveholloway)
```

Todo lo demás (Astro 5, React, MDX, Tailwind, Keystatic, sitemap, node adapter,
`@tailwindcss/typography`, sharp) se mantiene igual que VDG.

`astro.config.mjs`: igual a VDG pero con `allowedDomains` → `cluna.ar` / `www.cluna.ar`.

---

## 3. Sistema de diseño (idéntico a VDG)

- `tailwind.config.mjs`: se copia tal cual (mismas vars HSL, `text-display-xl/lg/md`, Syne/Inter).
- `src/styles/global.css`: se copia tal cual (paleta cremita + dark, `.reveal`, `.text-outline`,
  keyframes `fadeUp`/`bounce`/`pulse`, scrollbar).
- Se **agregan** utilidades nuevas para las secciones estilo Dave:
  - `.tender-rail` (la barra/cable horizontal del que cuelgan los tags)
  - `.tender-tag` (la pestaña colgante con balanceo sutil en hover)
  - `.case-carousel` / `.case-card` (carrusel horizontal con scroll-snap)
  - `@keyframes swing` (balanceo del tag, como ropa en un tender)

---

## 4. Estructura de secciones (mapeo VDG → cluna.ar)

| # | VDG (original) | cluna.ar (AIporvos) | Tratamiento |
|---|---|---|---|
| 1 | `layout/Nav.astro` | **Nav** | Igual a VDG. Logo AIporvos, links: Inicio · Soluciones · Cómo funciona · Casos · Blog · Contacto. Toggle de tema. (Opcional: easter-egg "GOLD mode" como Dave) |
| 2 | `sections/Hero.astro` | **Hero animado (Rive)** | Tipografía gigante VDG: `AUTOMATIZÁ / TU NEGOCIO / CON IA` (espejo de MENTORA/COACHING/LIDERAZGO) + canvas Rive a la derecha que reacciona al mouse. Stats: +1000 hs · 95% · 24/7. 2 CTAs. |
| 3 | `sections/QuienSoy.astro` | **Qué es AIporvos** | Mismo layout. Copy sobre el estudio de automatización con IA. |
| 4 | `sections/Servicios.astro` | **Soluciones = TENDER** (Image #2) | Rediseño Dave: 6 flujos como **tags colgando de un riel**. Cada tag: código 3 letras (ATC/VTA/COB/LEG/INM/DOC) + fecha + nombre del servicio + sub-features + label de transición `X → Y`. Recoloreado a la paleta VDG. |
| 5 | *(nueva)* | **Casos = CARRUSEL** (Image #3) | Carrusel horizontal estilo Dave: tarjetas de caso (cliente, tags, "VER CASO", contador 7/12), con parallax de fondo y efecto pixel-distortion en las imágenes (WebGL, opcional). Paleta VDG. |
| 6 | `sections/ComoTrabajo.astro` | **Cómo funciona** | Igual a VDG. Pasos: conectás tus canales → entrenamos el agente → trabaja solo 24/7. |
| 7 | `sections/ParaQuien.astro` | **Para quién es** | Igual a VDG. Pymes, e-commerce, estudios, inmobiliarias, etc. |
| 8 | `sections/BlogPreview.astro` | **Blog** | Igual a VDG. Posts en Keystatic/MDX (se migran/crean nuevos de AIporvos). |
| 9 | `sections/Contacto.astro` | **Contacto** | Igual a VDG + botón WhatsApp `+54 260 484 4952`. |
| 10 | `layout/Footer.astro` | **Footer** | Igual a VDG, marca AIporvos. |

> Secciones 4 y 5 son las únicas que cambian de **forma** (estilo Dave). El resto es VDG con
> contenido AIporvos.

---

## 5. El hero en Rive (idéntico al efecto de Dave)

1. Runtime: `@rive-app/canvas` cargado con `client:visible` / script en isla.
2. Asset `.riv`: un personaje/robot AIporvos con **state machine** que expone inputs
   `mouseX` / `mouseY` (mirada que sigue el cursor) + estado `idle`/`blink`.
   - Como el `.riv` de Dave es propietario y no se puede extraer, HIVE **genera uno propio**
     (robot/mascota AIporvos) o usa uno libre de la comunidad Rive como base.
   - Fallback: si el `.riv` no carga, se muestra un SVG estático del robot (sin romper el layout).
3. Se respeta la composición VDG (texto centrado/gigante); el canvas Rive ocupa la columna
   visual sin tapar la tipografía.

Archivo de referencia técnica: `assets-needed/hero-rive.md`.

---

## 6. Sección "Tender" de servicios (Image #2) — detalle

- Riel horizontal (`.tender-rail`) fijo en la parte superior de la sección.
- 6 `.tender-tag` colgando, scroll horizontal con snap. Cada tag:
  - Cabezal con código (ej. **ATC**) + fecha tipo `12-20-04`.
  - Bloque de color (paleta VDG: variaciones naranja/coral/teal/éxito) con `SERVICE` + nombre.
  - Grilla de sub-features (4–8 items) con marcadores ▾.
  - Banda inferior con transición tipográfica gigante `CPT → ACT`.
- Micro-interacción: balanceo `swing` sutil al hover (como una etiqueta colgada).

Mapa de los 6 tags (ver `CONTENIDO.md` para textos completos):

| Código | Servicio | Transición |
|---|---|---|
| ATC | Atención al Cliente 24/7 | `MSG → SOL` |
| VTA | Vendedor Digital | `LEAD → SALE` |
| COB | Cobrador Amable | `DEUDA → PAGO` |
| LEG | Consultor Legal | `DUDA → DOC` |
| INM | Bienes Raíces | `LEAD → VISITA` |
| DOC | Lector de Documentos | `PDF → DATA` |

---

## 7. Carrusel de casos (Image #3) — detalle

- Carrusel horizontal con scroll-snap + botones prev/next (estilo Dave).
- Cada `.case-card`: nombre de cliente (tipografía gigante), bloque `CLIENT`, tags
  (canales/servicios usados), botón `VER CASO →`, contador `n/total`.
- Fondo con parallax suave (paleta VDG).
- Imágenes con efecto **pixel-distortion** (WebGL, shader propio) — opcional/iterable.
- Contenido inicial: casos genéricos de AIporvos (e-commerce, estudio jurídico, inmobiliaria…)
  hasta tener casos reales.

---

## 8. Keystatic (CMS)

Se copia `keystatic.config.tsx` de VDG y se adapta:
- Colección `posts` (blog) — igual.
- Singletons/colecciones nuevas para que el cliente edite sin tocar código:
  - `flujos` (los 6 tags del tender: código, nombre, features, transición, color).
  - `casos` (carrusel: cliente, tags, imagen, link).
  - `siteConfig` (hero, stats, contacto, WhatsApp).

---

## 9. Assets necesarios (ver carpeta `assets-needed/`)

- [ ] Logo AIporvos (SVG/PNG) — `assets-needed/logo.md`
- [ ] Archivo Rive del hero `.riv` — `assets-needed/hero-rive.md`
- [ ] Imágenes de casos (o placeholders) — `assets-needed/casos.md`
- [ ] Favicon

Si no están, HIVE genera placeholders coherentes (logo tipográfico, robot SVG, imágenes mock)
para no bloquear el build.

---

## 10. Pasos de ejecución (cuando apruebes)

1. **Project Sub-agent (Website)** — copiar base VDG a `cluna.ar/`, ajustar `project.json`,
   `astro.config.mjs` (dominio), registrar en `registry.json`.
2. **Components Sub-agent** — copiar sistema de diseño VDG (tailwind + global.css) intacto.
3. **Astro Dev Sub-agent** — `index.astro` con el nuevo orden de secciones.
4. **Components Sub-agent** — Hero (Rive), Tender de servicios, Carrusel de casos (nuevos);
   QuiénSoy/ComoTrabajo/ParaQuien/Contacto/Footer (VDG con contenido AIporvos).
5. **Content Agent** — volcar `CONTENIDO.md` en cada sección + crear 2–3 posts de blog.
6. **Keystatic Sub-agent** — colecciones `flujos`, `casos`, `siteConfig`.
7. **Preview Sub-agent** — `npm run dev`, screenshots desktop + mobile, comparar vs VDG/Dave.
8. **Iteración** — ajustar Rive, tender y carrusel hasta que matcheen las imágenes.

Estimado: el grueso queda andando en una corrida; Rive + pixel-distortion se pulen iterando.

---

## 11. Lo único que NO es 100% clonable

- El **personaje exacto** de daveholloway.uk (su `.riv` es un binario propietario suyo).
  → Se reemplaza por un Rive propio de AIporvos (robot/mascota), con el mismo *tipo* de efecto.
- Fuentes de **Adobe Typekit** que usa Dave → no aplican: usamos las de VDG (Syne/Inter).

Todo el resto (layout, tender, carrusel, parallax, smooth-scroll, distorsión de imágenes,
GOLD mode, transiciones) es replicable.
