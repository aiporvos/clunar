---
name: publicar
description: Orquesta el pipeline completo de publicación de cluna.ar — de una idea o texto crudo a post + portada + sitio live + LinkedIn + Telegram, con checkpoint de aprobación humana en cada paso. Usar cuando Claudio diga "/publicar", "publicá esto", "armá un post con esto" o pase contenido para convertir en publicación.
---

# /publicar — Pipeline de publicación de cluna.ar

Spec completa: `PIPELINE.md` (raíz del repo). Este skill la orquesta.

**Al arrancar, cargar siempre:**
- `BRAND.md` (voz base, naming, anti-patrones — §04, §05, §12)
- `content/estilo-redes.md` (estructura de blog + formato LinkedIn/Telegram)
- `content/estilos-portada.md` (catálogo de presets de portada)
- `content/covers-log.json` (para no repetir preset ni frase de cierre del post anterior)

**Modos:**
- `/publicar "idea o texto crudo"` → pipeline completo (6 fases).
- `/publicar --solo-blog "idea o texto crudo"` → corta después de la Fase 3 (post live en el sitio, sin tocar redes).

**Regla de oro: ningún paso avanza sin aprobación explícita de Claudio.** Si
corrige algo, se reescribe ese paso y se vuelve a mostrar — no se sigue a la
fase siguiente hasta el OK.

---

## Fase 1 — Redacción del post

1. Tomar la idea/texto crudo que pasó Claudio.
2. Redactar el post completo siguiendo `BRAND.md` §04 + la estructura de
   `content/estilo-redes.md` §1 (gancho → contraste → desarrollo → cierre).
3. Elegir la categoría más apropiada de las 6 disponibles en
   `keystatic.config.tsx` (Automatización, Arquitectura IA, Adopción de IA,
   Liderazgo & IA, RAG & Datos, Ecommerce).
4. Generar el slug (kebab-case, del título).
5. Crear `src/content/posts/{slug}.mdx` con **el frontmatter exacto** del
   schema (`title`, `excerpt` ≤160 chars, `publishedAt`, `author: Claudio Luna`,
   `category`, `readTime`, `tags`, `draft: true`, `seoTitle`, `seoDescription`).
   `coverImage` se completa recién en la Fase 2.
6. Mostrar el post completo a Claudio.

**Checkpoint:** esperar aprobación o correcciones antes de seguir.

---

## Fase 2 — Portada

1. Según el tema del post, proponer **2 presets** de `content/estilos-portada.md`
   — evitar el último preset usado según `covers-log.json`.
2. Mostrar los 2 presets (nombre + para qué sirve) y esperar que Claudio elija
   (o pida un prompt custom).
3. **Si el post es sobre una herramienta concreta** (vLLM, OpenWiki,
   draw.io, n8n...), agregar SIEMPRE `--title "NombreExacto"` para que el
   nombre aparezca integrado en la ilustración (regla de 2026-07-14, ver
   `estilos-portada.md`). Ejecutar:
   ```bash
   node --env-file=.env scripts/cover-image.mjs --slug {slug} --preset "{preset elegido}" [--title "{herramienta}"]
   ```
   Si no hay `GEMINI_API_KEY` ni `KIE_API_KEY` configuradas, avisar a Claudio
   que faltan las keys y ofrecer seguir con un placeholder o pausar acá.
   ⚠️ Al mostrar la portada para el checkpoint, **verificar que el nombre
   esté bien escrito letra por letra** — los modelos de imagen a veces
   deforman texto; si salió mal, regenerar.
4. Mostrar la imagen generada (ruta: `public/images/posts/{slug}/cover.png`).
5. Actualizar el frontmatter del post con `coverImage: /images/posts/{slug}/cover.png`.

**Checkpoint:** Claudio aprueba la portada o pide regenerar/cambiar preset.

---

## Fase 3 — Publicación en el sitio

1. Pasar `draft: false` en el frontmatter.
2. `git add src/content/posts/{slug}.mdx public/images/posts/{slug}/`
3. `git commit -m "post: {título}"`
4. `git push clunar master` (¡el remote se llama `clunar`, la rama `master`
   — no `origin`/`main`!).
5. Poll a `{SITE_URL}/blog/{slug}` cada 30s, máx. 10 minutos:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" {SITE_URL}/blog/{slug}
   ```
   Si no da `200` dentro de los 10 minutos:
   ```bash
   node --env-file=.env scripts/notify-error.mjs --phase "Fase 3 · Deploy" --message "..."
   ```
   y **frenar el pipeline acá** — no seguir a redes con el link roto.
6. Confirmar a Claudio: post live en `{SITE_URL}/blog/{slug}` (y ya disponible
   en `{SITE_URL}/blog/{slug}.md` + `{SITE_URL}/llms.txt`, automático).

⚠️ **El poll del paso 5 es bloqueante, no se corre en background.** Fase 4
(LinkedIn) linkea a `{SITE_URL}/blog/{slug}` — si se publica ahí antes de
que el poll confirme `200`, el link da "not found" en el momento en que
más gente lo clickea. No arrancar Fase 4 hasta tener la confirmación
explícita del 200 en pantalla.

**Si el modo es `--solo-blog`, terminar acá y mostrar el resumen.**

---

## Fase 4 — LinkedIn

1. Redactar el post siguiendo `content/estilo-redes.md` §2 (gancho → contraste
   → promesa → lista con emojis → cierre de valor → link al post → **nivel**
   → frase de marca, **rotando** — no repetir la última usada según
   `covers-log.json` o el historial de esta sesión). **Sin rayas/em-dashes**
   (ver prohibiciones de estilo-redes §2). **Nivel (obligatorio si el post
   tiene `aiLevel`):** línea `Nivel N · Nombre` tomada del frontmatter del
   post + `src/lib/niveles.ts`, después del link, antes de la frase de marca.
   Si el post no tiene `aiLevel` (post sin blog asociado), se omite.
2. Guardar el borrador en `content/drafts/linkedin-{slug}.txt` (UTF-8). La API
   de LinkedIn **no soporta borradores nativos** — este archivo ES el borrador:
   Claudio puede editarlo directamente antes de aprobar.
3. Mostrar el borrador completo a Claudio (y correr el dry-run para ver el
   texto escapado exactamente como se va a enviar):
   ```bash
   node --env-file=.env scripts/publish-linkedin.mjs --text-file "content/drafts/linkedin-{slug}.txt" --image "public/images/posts/{slug}/cover-og.png" --dry-run
   ```
4. **Checkpoint:** aprobación explícita. Si Claudio editó el archivo, releerlo.
5. Ejecutar (siempre con `--text-file`, nunca con `--text` inline — el quoting
   de la shell rompe emojis y saltos de línea):
   ```bash
   node --env-file=.env scripts/publish-linkedin.mjs --text-file "content/drafts/linkedin-{slug}.txt" --image "public/images/posts/{slug}/cover-og.png"
   ```
   Si faltan `LINKEDIN_ACCESS_TOKEN`/`LINKEDIN_PERSON_URN`, avisar y ofrecer
   saltar esta fase (el post del blog ya quedó publicado igual).

**Post de LinkedIn sin post de blog asociado** (ej.: recomendar un repo o
recurso de terceros): mismo flujo, pero la imagen se genera ad-hoc con un
prompt adaptado al tema (el script agrega los negativos anti-genérico solo):
```bash
node --env-file=.env scripts/cover-image.mjs --slug {slug} --prompt "{prompt adaptado al tema, estilo de marca}" [--title "{herramienta}"]
```
y se publica con `--image "public/images/posts/{slug}/cover-og.png"`.
**Si el prompt pide texto visible en la imagen, ese texto va en español
(Argentina), nunca en inglés** — ver regla en `content/estilos-portada.md`.

---

## Fase 4b — Instagram (@cluna.ar)

**Estado: configurado y probado en real** (primer post: 03/08/2026, Reel del
curso FCAI). Credenciales en `.env`, cuenta `@cluna.ar`, tipo MEDIA_CREATOR.

1. Redactar el caption siguiendo `content/estilo-redes.md` §3.5. **No es el
   texto de LinkedIn recortado**: en Instagram los links no son clickeables,
   así que el caption se sostiene solo y cierra mandando a `cluna.ar` como
   texto o al link del perfil. Gancho en la primera línea (es lo único que se
   ve sin tocar "… más"), 3-6 líneas, y 3-6 hashtags en español.
2. Guardar el borrador en `content/drafts/instagram-{slug}.txt` (UTF-8).
3. Mostrar el borrador y correr el dry-run:
   ```bash
   node --env-file=.env scripts/publish-instagram.mjs --caption-file "content/drafts/instagram-{slug}.txt" --image-url "{SITE_URL}/images/posts/{slug}/cover-ig.jpg" --dry-run
   ```
   El dry-run avisa si el caption se pasa de 2200, si la URL no es https, o
   si se pasó un PNG en vez del JPEG.
4. **Checkpoint:** aprobación explícita.
5. Ejecutar sin `--dry-run`.
   Si faltan `INSTAGRAM_ACCESS_TOKEN`/`INSTAGRAM_USER_ID`, avisar y saltar la
   fase (el blog y LinkedIn ya quedaron publicados igual).

### Video (Reels)

```bash
node --env-file=.env scripts/publish-instagram.mjs \
  --caption-file "content/drafts/instagram-{slug}.txt" \
  --video-url "{SITE_URL}/videos/{nombre}.mp4"
```

- Los videos van a `public/videos/` del repo y **hay que commitear, pushear y
  esperar el deploy antes de publicar**. Pasó en el primer intento: la API dio
  404 porque el mp4 todavía no estaba live.
- Se publican como **REELS** (Meta eliminó el tipo VIDEO de feed suelto).
- Requisitos: MP4 o MOV, H.264 + AAC. El procesamiento tarda más que una foto,
  por eso el timeout es de 300s contra 90s.
- **Aspecto: los Reels son 9:16.** Un video 4:5 (como el del curso FCAI, que
  era 720x904) se muestra con bandas o recortado. Si hay versión vertical,
  usar esa.

⚠️ **El medio tiene que estar deployado antes.** Instagram no recibe el
archivo: lo descarga desde la URL. Como la Fase 3 es bloqueante hasta el
HTTP 200, cuando se llega acá ya está garantizado — pero si se corre esta
fase suelta (post sin blog, video), verificar el 200 a mano primero.

⚠️ **Token de 60 días, vence alrededor del 02/10/2026.** Renovarlo con
`node scripts/instagram-auth.mjs --refresh` (no hace falta browser). Un token
vencido del todo obliga a rehacer el OAuth completo desde el panel de Meta.

**Post de Instagram sin post de blog asociado:** mismo flujo, pero la imagen
se genera ad-hoc con `cover-image.mjs` (que ya produce `cover-ig.jpg` junto
con las otras variantes) y hay que subirla al sitio antes de publicar.

### Republicar posts viejos en Instagram (backfill)

Medido el 03/08/2026: **generar las 17 portadas `cover-ig.jpg` desde los
`cover.png` existentes toma 2 segundos** y no cuesta nada (es un resize con
sharp, no se regenera con IA). Ojo que 5 carpetas usan otro nombre de archivo
(`coverImage.png`, `cover.jpg`), hay que contemplarlo al iterar.

Lo caro no son las imágenes ni los captions: **es la estrategia.**

- **No volcar todo junto.** Publicar 15+ posts de una en una cuenta nueva es
  señal de spam para Instagram y ruido para quien sigue. Espaciar 1-2 por
  semana.
- **Curar, no migrar.** La mitad de los posts del blog son muy técnicos para
  Instagram (vLLM, Kokoro, LocalAI, DeepAgents, Pocket TTS): rinden en
  LinkedIn, no ahí. Los que sí funcionan son los de beneficio visible sin
  saber de arquitectura: liderazgo y cursos, correo con dominio propio,
  facturación, tienda online, el sistema que busca trabajo.
- Los captions **se reescriben, no se adaptan**: el de LinkedIn es ~3 veces
  más largo, termina en link (que no sirve) y lleva la línea "Nivel N".

---

## Fase 5 — Telegram

1. Redactar la versión corta siguiendo `content/estilo-redes.md` §3 (3-6
   líneas, título + valor + link, máx. 1 emoji).
2. Mostrar el mensaje a Claudio.
3. **Checkpoint:** aprobación explícita.
4. Ejecutar:
   ```bash
   node --env-file=.env scripts/publish-telegram.mjs --caption "{texto}" --photo-path "public/images/posts/{slug}/cover.png"
   ```

---

## Fase 6 — Resumen final

Mostrar:
- URL del post: `{SITE_URL}/blog/{slug}`
- URL LinkedIn (si se publicó)
- ID del post de Instagram (si se publicó)
- Confirmación de envío a Telegram (si se publicó)
- Preset de portada usado + provider (Gemini/Kie)
- Frase de cierre de LinkedIn usada (para no repetirla la próxima vez)

Cualquier error en cualquier fase: notificar con
`node --env-file=.env scripts/notify-error.mjs --phase "..." --message "..."` y frenar esa
rama del pipeline sin tocar las fases siguientes que dependan de ella.
