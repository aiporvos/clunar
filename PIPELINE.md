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

**Renovación de token:** el `LINKEDIN_ACCESS_TOKEN` (OAuth 2.0, scope
`w_member_social`) vence a los **60 días**. Renovarlo desde el
[LinkedIn Developer Portal](https://www.linkedin.com/developers/apps) → la
app registrada → generar token nuevo con el mismo scope, y actualizar
`.env`. No hay refresh-token automático en el flujo básico de member auth.

`LINKEDIN_PERSON_URN`: el URN del perfil (`urn:li:person:...`), se obtiene una
sola vez con `GET /v2/userinfo` (OpenID) o desde el token decodificado.

**Checkpoint: se muestra el borrador de LinkedIn antes de publicar.**

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
