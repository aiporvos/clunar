# Pipeline de publicación — cluna.ar

> Adaptación al proyecto real de un mega-prompt genérico de pipeline de
> publicación (idea → post + portada → sitio → LinkedIn → Telegram, con
> checkpoints humanos en cada paso). Fuente de verdad operativa: este
> documento + `BRAND.md` (voz/visual) + `content/estilo-redes.md` (redes)
> + `content/estilos-portada.md` (portadas).
>
> Se dispara con el skill `/publicar` (`.claude/skills/publicar/SKILL.md`).

---

## 0 · Auditoría — qué ya existía antes de este pipeline

| Pieza | Estado |
|---|---|
| Collection de posts Keystatic | ✅ `keystatic.config.tsx`: `title` (slug), `excerpt`, `coverImage`, `publishedAt`, `author` (default *Claudio Luna*), `category` (6 opciones fijas), `readTime`, `tags`, `draft`, `seoTitle`, `seoDescription`, `content` (MDX) |
| Storage Keystatic en prod | GitHub (`aiporvos/clunar`, ver `project.json`) |
| Voz de marca | ✅ `BRAND.md` §04 |
| Consumo por agentes/LLMs | ✅ `/blog/{slug}.md` (`src/pages/blog/[...slug].md.ts`) + `/llms.txt` — automáticos, un post nuevo entra solo, no requieren trabajo extra |
| Git / deploy | ✅ remote **`clunar`** → `git@github-aiporvos:aiporvos/clunar.git`, rama **`master`** (¡no `origin`/`main`!) — Dokploy deploya desde GitHub al pushear |
| Voz LinkedIn/Telegram | Se agrega en `content/estilo-redes.md` |
| Generador de portada | Se agrega en `scripts/cover-image.mjs` + `content/estilos-portada.md` |
| Publicación en redes | Scripts directos — **sin n8n** (decisión explícita: Telegram es un POST simple, LinkedIn requiere el mismo mantenimiento de token con o sin n8n; menos piezas móviles publicando desde acá) |

**No se reescribe nada de lo que ya funciona.** Este pipeline es aditivo.

---

## 1 · Redacción

Ver `content/estilo-redes.md` para la voz completa. Resumen del flujo:

1. Claudio pasa una idea, borrador o texto crudo.
2. El agente redacta el post completo en `src/content/posts/{slug}.mdx`, con
   frontmatter respetando **exactamente** el schema de `keystatic.config.tsx`
   (no inventar campos nuevos). `draft: true` hasta el paso 3.
3. Se muestra el post completo. **Checkpoint: Claudio aprueba o corrige.**

---

## 2 · Imagen de portada

Script: `scripts/cover-image.mjs`. Detalle de providers y presets en
`content/estilos-portada.md`.

- **Provider primario:** Gemini (`gemini-3.1-flash-image` — el modelo antes
  conocido como "Nano Banana"; nombre de modelo confirmado contra la
  documentación oficial de Google en jul-2026, **no asumir de memoria si
  cambia**). Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/interactions`.
- **Provider fallback:** Kie.ai (`KIE_API_KEY`, auth `Bearer`, patrón async
  con `task_id` + polling). ⚠️ El endpoint exacto de creación de tarea **no
  pudo confirmarse contra la documentación pública** al escribir este pipeline
  (docs.kie.ai bloqueó el acceso automatizado) — **verificar en
  docs.kie.ai antes del primer uso real** y ajustar `KIE_API_BASE` en `.env`
  si hace falta.
- Orden invertible: `IMAGE_PROVIDER_PRIMARY` / `IMAGE_PROVIDER_FALLBACK` en `.env`.
- Reintenta 1 vez en el primario; si vuelve a fallar, pasa al fallback y lo
  loguea por consola (qué provider se usó, en qué intento).
- Output: 1920×1080 (portada) + variante 1200×627 recortada con `sharp` (ya
  es dependencia del proyecto) para OG/LinkedIn si el post lo amerita.
- Se guarda en `public/images/posts/{slug}/cover.png` (misma carpeta que usa
  Keystatic — ver `directory` en el schema).
- El agente propone **2 presets** de `estilos-portada.md` según el tema del
  post. **Checkpoint: Claudio elige (o pide variante/regenerar).**
- `content/covers-log.json` registra `{slug, preset, provider, date}` de cada
  post — el agente no repite el mismo preset en 2 posts consecutivos.

---

## 3 · Publicación en el sitio

1. Cover ya guardada y referenciada en el frontmatter → `draft: false`.
2. `git add` → `git commit -m "post: {título}"` → `git push clunar master`.
3. **Verificación de deploy:** poll a `{SITE_URL}/blog/{slug}` cada 30s,
   máximo 10 minutos, hasta HTTP 200. Si no responde 200 en ese lapso: avisar
   a Claudio (por Telegram, ver `scripts/notify-error.mjs`) y **frenar el
   pipeline** — nunca publicar en redes con el link roto.
4. `{SITE_URL}/blog/{slug}.md` y la entrada en `/llms.txt` quedan disponibles
   solos, sin pasos extra (ya son automáticos).

Modo `--solo-blog` del skill: el pipeline corta acá.

---

## 4 · LinkedIn

Script: `scripts/publish-linkedin.mjs`. API REST moderna de LinkedIn
(`/rest/posts`, reemplaza al antiguo `/v2/ugcPosts`), confirmada contra
documentación oficial:

1. `POST https://api.linkedin.com/rest/images?action=initializeUpload` →
   devuelve `uploadUrl` + `image` (URN).
2. `PUT` binario de la imagen a `uploadUrl`.
3. `POST https://api.linkedin.com/rest/posts` con `author`, `commentary`,
   `visibility: PUBLIC`, `distribution.feedDistribution: MAIN_FEED`,
   `content.media.id` (el URN del paso 1), `lifecycleState: PUBLISHED`.
4. Headers obligatorios en todas las requests: `Authorization: Bearer
   {LINKEDIN_ACCESS_TOKEN}`, `LinkedIn-Version: {YYYYMM}`,
   `X-Restli-Protocol-Version: 2.0.0`.

**La versión YYYYMM vence (~1 año):** si la API responde
`426 NONEXISTENT_VERSION`, subir `LINKEDIN_API_VERSION` en `.env` a un mes
vigente. Pasó el 2026-07-16 con `202506` (se saltó a `202606`).

**Formato del texto ("little text format"):** en `commentary`, los caracteres
`( ) { } [ ] @ # * _ ~ < > | \` son **reservados** — sin escapar con `\`,
LinkedIn renderiza el post roto (se pierden emojis, aparecen guiones sueltos,
se corta texto). El script escapa automáticamente con `escapeLittleText()`.
Lección aprendida del primer post real (2026-07-10), que salió ilegible.

**Borradores:** la API **no permite crear borradores** (`lifecycleState:
PUBLISHED` es el único valor aceptado al crear). El equivalente del pipeline:
el texto se guarda en `content/drafts/linkedin-{slug}.txt`, Claudio lo revisa
o edita directamente, y recién con su OK se publica con `--text-file` (nunca
`--text` inline: el quoting de la shell rompe emojis y saltos de línea).

**Renovación de token:** el `LINKEDIN_ACCESS_TOKEN` (OAuth 2.0, scope
`w_member_social`) vence a los **60 días**. Renovarlo desde el
[LinkedIn Developer Portal](https://www.linkedin.com/developers/apps) → la
app registrada → generar token nuevo con el mismo scope, y actualizar
`.env`. No hay refresh-token automático en el flujo básico de member auth.

`LINKEDIN_PERSON_URN`: el URN del perfil (`urn:li:person:...`), se obtiene una
sola vez con `GET /v2/userinfo` (OpenID) o desde el token decodificado.

**Checkpoint: se muestra el borrador de LinkedIn antes de publicar.**

---

## 4b · Instagram (@cluna.ar)

Script: `scripts/publish-instagram.mjs`. Usa la **"Instagram API with
Instagram Login"** (host `graph.instagram.com`): no requiere página de
Facebook, solo cuenta Instagram profesional (Creator o Business).

```bash
node --env-file=.env scripts/publish-instagram.mjs \
  --caption-file "content/drafts/instagram-{slug}.txt" \
  --image-url "https://cluna.ar/images/posts/{slug}/cover-ig.jpg" [--dry-run]
```

**Estado:** configurado y probado en real el 03/08/2026 con un Reel del curso
FCAI. Cuenta `@cluna.ar` (MEDIA_CREATOR), `INSTAGRAM_USER_ID=17841443690401159`.

**Video (Reels):** `--video-url` en vez de `--image-url`. Los mp4 van a
`public/videos/` y hay que deployarlos antes. Se publican como `REELS`
(Meta eliminó el tipo VIDEO de feed). Timeout de procesamiento 300s.
Los Reels son 9:16: un 4:5 sale con bandas.

**Flujo de la API, en 2 pasos obligatorios:**
1. `POST /{ig-user-id}/media` con `image_url` + `caption` → devuelve un
   contenedor.
2. Poll de `?fields=status_code` hasta `FINISHED` (el script espera hasta 90s).
3. `POST /{ig-user-id}/media_publish` con el `creation_id`.

### Las tres restricciones que condicionan todo

**La imagen se descarga desde una URL pública.** La API no acepta upload
binario para fotos de feed. Por eso esta fase va después de la Fase 3, que
ya garantiza con su poll bloqueante que la imagen está live.

**Solo JPEG**, máx 8 MB, ancho 320-1440 px, aspecto entre 4:5 y 1.91:1. Las
portadas del sitio son PNG, así que `cover-image.mjs` genera además
`cover-ig.jpg` (1080x1350, 4:5) con la 16:9 centrada y bandas del color real
del borde de la imagen, no del crema de marca: los modelos generan un crema
apenas distinto a `#f9f4da` y usar el de marca deja una línea visible.

**Los links del caption no son clickeables.** El copy no puede depender de un
link: se cierra mencionando `cluna.ar` como texto o mandando al link del
perfil. Ver `content/estilo-redes.md` §3.5 — **no es el texto de LinkedIn
recortado, se escribe distinto.**

### Token

`INSTAGRAM_ACCESS_TOKEN` dura 60 días pero, a diferencia de LinkedIn, **se
renueva sin browser**:

```bash
INSTAGRAM_ACCESS_TOKEN=xxx node scripts/instagram-auth.mjs --refresh
```

Si se deja vencer del todo, hay que rehacer el OAuth completo
(`node scripts/instagram-auth.mjs` con `INSTAGRAM_CLIENT_ID`/`SECRET`).

`INSTAGRAM_USER_ID` sale del mismo OAuth y no cambia.

**Checkpoint: se muestra el borrador de Instagram antes de publicar.**

---

## 5 · Telegram

Script: `scripts/publish-telegram.mjs`. Telegram Bot API, `sendPhoto`:

```
POST https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto
  chat_id: TELEGRAM_CHAT_ID
  photo: <cover, multipart o URL pública>
  caption: <versión corta, ver estilo-redes.md §3>
```

**Checkpoint: se muestra el mensaje antes de enviar.**

---

## 6 · Notificación de errores

`scripts/notify-error.mjs` — usa el mismo bot de Telegram para avisar
cualquier falla del pipeline (`sendMessage` simple, sin checkpoint: los
errores se notifican, no se aprueban). Formato: qué fase falló + el error
concreto.

---

## Comando único

`.claude/skills/publicar/SKILL.md` define `/publicar "idea o texto"` que
orquesta las 6 fases de arriba con sus checkpoints, y `/publicar --solo-blog`
que corta después de la fase 3.

---

## Variables de entorno (`.env.example`)

Ver sección correspondiente en `.env.example`. Resumen: `GEMINI_API_KEY`,
`KIE_API_KEY` (+ `KIE_API_BASE` a confirmar), `IMAGE_PROVIDER_PRIMARY/FALLBACK`,
`LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_PERSON_URN`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`, `BLOG_PATH`.

---

## Reglas no negociables

1. **Checkpoint humano en todo lo que se publica.** Nada sale sin aprobación
   explícita de Claudio — ni el post, ni la portada, ni LinkedIn, ni Telegram.
2. **Errores del pipeline avisan por Telegram** con contexto (qué fase, qué
   pasó).
3. **No reescribir lo que funciona** — collection, endpoints `.md`, `llms.txt`,
   `BRAND.md` se usan tal cual están.
4. **Verificar documentación oficial actual** antes de tocar cualquiera de
   estas 4 integraciones — las APIs cambian (ver nota sobre Gemini arriba:
   el endpoint documentado hoy ya no es el que existía cuando se escribió el
   prompt original).
5. **Probar en modo `draft: true` primero** — un post de prueba completo
   (redacción + portada) antes de conectar cualquier producción real.

## Agregar un preset de portada nuevo

Editar `content/estilos-portada.md`, agregar la entrada con: nombre, prompt
base, negativos obligatorios, y para qué tipo de tema conviene. No hace falta
tocar el script — lee el catálogo en tiempo de ejecución.
