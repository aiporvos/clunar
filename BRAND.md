# CLUNA — Brand System

> **Fuente de verdad de la marca Claudio Luna / cluna.ar.**
> Si vas a reconstruir, modificar o escribir cualquier parte de este sitio — humano o agente —
> este documento manda. La versión web navegable vive en [`/brand`](/brand)
> (`src/pages/brand.astro`); si editás una, actualizá la otra.
>
> Este manual no es una norma. Es un criterio.
> Versión 1.0 — julio 2026.

---

## 01 · Filosofía

**Claudio Luna construye sistemas de automatización que trabajan de verdad.**

No chatbots de demo. No flujos de juguete que se rompen el primer lunes. Sistemas
multi-agente, RAG especializado y orquestación de procesos que operan en producción,
con métricas que se pueden auditar y un stack que el cliente controla.

Detrás hay más de 15 años de análisis funcional, e-commerce y desarrollo a medida
para PYMEs latinoamericanas. Eso define el ángulo: **la ingeniería es seria; el trato
es cercano.** Un cliente sin equipo técnico tiene que poder entender qué compra.
Un CTO tiene que poder auditar cómo está hecho.

La marca es una persona: Claudio Luna. El dominio es su handle: **cluna.ar**.

---

## 02 · Principios

1. **Producción sobre demo.** Todo lo que se muestra funciona en un negocio real o se
   declara prototipo. Nunca se presenta un mock como caso.
2. **Claridad sin jerga.** Cualquier dueño de PYME entiende la primera frase de cada
   sección. Los detalles técnicos existen, pero un nivel más abajo — nunca como barrera
   de entrada.
3. **Control del stack y de los datos.** Self-hosted por defecto (n8n, Docker, VPS
   propio). El cliente es dueño de sus datos, de su infraestructura y de su historial:
   adoptar IA nunca puede significar perder información ni quedar cautivo de un
   proveedor. Las dependencias de terceros se eligen, no se heredan.
4. **Resultados medibles.** Cada afirmación lleva un número o no se hace. "Mejorá tu
   negocio" no significa nada; "el 92% de las consultas se resuelven sin intervención
   humana" sí.
5. **Cercanía profesional.** Voseo sí, chamuyo no. Se habla como en una reunión de
   trabajo en Argentina: directo, concreto, sin ceremonia y sin humo.

---

## 03 · Personalidad y posicionamiento

**Territorio: Técnico + Cercano.**

- Nunca **corporativo frío** (párrafos de misión/visión, "soluciones sinérgicas").
- Nunca **informal descuidado** (memes, emojis en cascada, promesas de vago).
- Técnico sin ser hermético. Cercano sin perder autoridad.

Posicionamiento frente al mercado:

| | Agencias de chatbots genéricos | **Claudio Luna** |
|---|---|---|
| Producto | Plantilla que responde FAQs | Sistema diseñado sobre el proceso real del negocio |
| Stack | SaaS cerrado, datos de terceros | Self-hosted, el cliente es dueño de todo |
| Promesa | "IA mágica en 5 minutos" | Arquitectura + métricas + mantenimiento |
| Relación | Ticket de soporte | Un ingeniero con nombre y apellido |

---

## 04 · Voz y tono

Reglas de escritura, en orden de prioridad:

1. **Voseo argentino**, siempre ("tenés", "querés", "tu negocio").
2. **Datos concretos sobre adjetivos.** Un número por afirmación importante.
3. **Sin superlativos**: nada es "revolucionario", "increíble" ni "el mejor".
4. **Sin startup-speak**: prohibido "disruptivo", "sinergia", "llevá tu negocio al
   siguiente nivel", "game changer", "potenciá".
5. **Frases cortas.** Si una oración necesita dos comas y un guión, son dos oraciones.
   **Sin rayas largas (—) en el copy visible del sitio** (julio 2026): se resuelven con
   punto, coma, dos puntos o paréntesis. Esta regla es del copy que ve el visitante
   (componentes de `src/`, LinkedIn, blog) — no aplica a este manual ni a `/brand`,
   que son documentación interna.
6. **El lector decide con información, no con presión.** Sin urgencia falsa
   ("¡solo por hoy!"), sin miedo ("tu competencia ya lo usa").

### Correcto / Incorrecto

| ❌ Incorrecto | ✅ Correcto |
|---|---|
| "Tu negocio trabaja mientras dormís" | "Un sistema de agentes que responde, deriva y registra cada consulta — con métricas que podés auditar" |
| "IA revolucionaria que transforma tu empresa" | "Automatización de procesos concretos: cotizaciones, turnos, cobranzas, documentos" |
| "¡Chatbots inteligentes sin código en minutos!" | "Diseño el flujo sobre tu proceso real. El setup inicial toma entre una y tres semanas según la integración" |
| "Somos líderes en soluciones de IA" | "Más de 15 años en análisis funcional y e-commerce, aplicados a sistemas de IA en producción" |
| "Atiende, vende, cobra y lee papeles por vos" | "Atención por WhatsApp con API oficial de Meta, calificación de leads, seguimiento de cobranzas y extracción de datos de documentos" |
| "Contratá ya, cupos limitados" | "Escribime y vemos si tu caso se resuelve con automatización — a veces la respuesta es no" |

**El truco del "a veces la respuesta es no":** admitir límites es la señal de
profesionalismo más barata y más efectiva que existe. Usarla.

---

## 05 · Naming

- **La marca es la persona:** Claudio Luna. En texto corrido: "Claudio" (cercano) o
  "Claudio Luna" (primera mención / contextos formales). El handle/dominio: **cluna.ar**
  (siempre minúscula).
- "AIporvos" es la marca saliente. No usarla en contenido nuevo. La migración del sitio
  (Nav, Footer, metas) es trabajo pendiente regido por este manual.
- **Servicios** con nombre descriptivo en español, sin marcas fantasía:
  "Sistemas multi-agente", "RAG especializado", "Integración y orquestación",
  "Consultoría y formación".
- **Tecnologías**, citadas por su nombre real y solo cuando aportan: n8n, LangChain,
  Qdrant, Supabase, Redis, Docker, Dokploy, MCP, Claude, OpenRouter, Groq.

### 🚫 Regla dura — WhatsApp

**Nunca mencionar "Evolution API"** en ningún contenido público del sitio.
La conectividad de WhatsApp se comunica siempre como:

> **"API oficial de WhatsApp (Meta)"** o **"YCloud"**

Sin excepciones. Esto aplica a hero, servicios, casos, blog, formularios, metas y
cualquier texto futuro.

---

## 06 · Sistema visual — Identidad

**El sistema visual actual NO se cambia.** Este manual lo codifica para que cualquier
reconstrucción sea fiel. Nombre del lenguaje: **"neo-brutalismo cálido"** (base react.gg).

Fondo crema, texto charcoal, acentos planos y vibrantes, bordes oscuros de 2px y
sombras duras con offset (sin blur). Interacciones con desplazamiento físico
(los elementos se "levantan" al hover y se "hunden" al click).

**El avatar es la ilustración de Claudio** (gorra, campera con capucha) — assets
`/public/clunar-cut.png` + `/clunar-closed.png` (parpadeo). **Tratamiento canónico
(desde jul-2026): duotono de marca** — la ilustración en escala de grises multiplicada
sobre amarillo `--primary`, dentro de un **blob orgánico** (border-radius asimétrico
con morph lento de 14s, borde 3px foreground, sombra brutal). Es la adaptación de los
retratos duotono de zulik.co a esta marca. No reemplazar por fotos de stock, robots
genéricos ni ilustraciones de otro estilo.

---

## 07 · Sistema visual — Color

Fuente canónica: `src/styles/global.css` (líneas 13–72). Copiar de ahí, no de acá,
ante cualquier duda.

### Paleta cruda (hex, variables `--*` para sombras/bordes en `<style>` locales)

| Token | Hex | Uso |
|---|---|---|
| `--charcoal` | `#231f20` | Texto, bordes, sombras (light) |
| `--cream` | `#f9f4da` | Fondo (light) |
| `--coal` | `#0f0d0e` | Fondo (dark) |
| `--yellow` | `#fcba28` | **Primario.** Logo, CTAs, selección |
| `--orange` | `#fc7428` | Acento. Highlights, stats |
| `--green` | `#0ba95b` | Éxito, stats positivas |
| `--pink` | `#f38ba3` | Acento secundario (tags, tender) |
| `--purple` | `#7b5ea7` | Acento secundario (tags, tender) |
| `--blue` | `#12b5e5` | Acento secundario (tags, tender) |
| `--crimson` | `#bc0f31` | Alertas / usos puntuales |

### Tokens semánticos (HSL — usar con `hsl(var(--x))`)

Light: `--background 50 72% 92%` · `--foreground 345 6% 13%` · `--primary 41 97% 57%`
(fg charcoal) · `--accent 22 97% 57%` (fg blanco) · `--success 150 88% 35%` ·
`--card 50 63% 90%` · `--secondary 50 50% 87%` · `--muted 48 30% 84%` /
`--muted-foreground 40 6% 40%` · `--border`/`--input 345 6% 13%` · `--radius 0.5rem`.

Dark (clase `.dark` en `<html>`, persistida en `localStorage`): fondo `330 7% 7%`,
foreground crema, bordes claros `50 30% 88%`; primary/accent no cambian.

**Regla:** los colores se consumen vía tokens semánticos en clases Tailwind
(`bg-background`, `text-foreground`, `bg-primary`…). Los hex crudos solo en `<style>`
locales para efectos (sombras de tags del tender, etc.). Todo componente nuevo debe
verse bien en light **y** dark sin trabajo extra.

### Sombras firma

```
--shadow-brutal:    4px 4px 0 hsl(var(--foreground))
--shadow-brutal-sm: 3px 3px 0 hsl(var(--foreground))
--shadow-brutal-lg: 6px 6px 0 hsl(var(--foreground))
```

Siempre sólidas, sin blur, offset positivo (abajo-derecha). En dark usan `--border`.

---

## 08 · Sistema visual — Tipografía

| Rol | Fuente | Pesos | Regla |
|---|---|---|---|
| Display / headings | **Paytone One** | 400 (único) | Todos los `h1–h6` y `.font-display`. Nunca otra fuente para títulos |
| Body / UI | **Outfit** | 400 / 500 / 700 / 900 | Todo lo demás |

Carga: Google Fonts (`BaseLayout.astro` + `global.css` línea 1).

Escalas display (`tailwind.config.mjs`):

- `text-display-xl` → `clamp(2rem, 10vw, 10rem)` · lh 0.9 · ls −0.02em
- `text-display-lg` → `clamp(1.8rem, 8vw, 7rem)` · lh 0.95 · ls −0.02em
- `text-display-md` → `clamp(1.5rem, 4vw, 3.5rem)` · lh 1.1 · ls −0.01em

Tratamientos de título: `.glow-text` (relieve nítido `3px 3px 0` al 14%) en headlines
de sección; `.text-outline` (stroke 2px, relleno transparente) para palabras gigantes
decorativas; `[data-split]` para el efecto letra-por-letra (JS en `BaseLayout.astro`).

---

## 09 · Componentes canónicos

Antes de crear un componente nuevo, verificar que no exista uno de estos:

| Componente | Clase / ubicación | Descripción |
|---|---|---|
| Botón | `.btn-brutal` (+ `.btn-shine` opcional) | Píldora, borde 2px, sombra dura, uppercase; se levanta al hover, se hunde al click |
| Tarjeta | `.card-brutal` | Borde 2px + sombra offset, fondo `--card`, hover −2px |
| Chip | `.pill-brutal` | Píldora chica, borde 2px, sombra 2px 2px |
| Eyebrow | `.section-label` | Etiqueta uppercase tracking 0.18em sobre el headline |
| Reveal | `.reveal` / `.reveal-x` + clase `visible` | Entrada al scroll (IntersectionObserver) |
| Split text | `[data-split]` / `[data-split="load"]` | Título letra por letra |
| Imagen FX | `.img-fx` (+ `.img-glitch`) | Overlay dorado + glitch sutil al hover |
| Tender | `Tender.astro` (clases `.tender-*` scoped) | Riel con tarjetas-etiqueta colgantes, sway físico, auto-scroll infinito. **Es la sección de servicios canónica** |
| Carrusel casos | `CasesCarousel.astro` (`.cases-*` scoped) | Tarjetas de caso con contador y CTA |
| Avatar | `Hero.astro` + `avatar-breathe`/`avatar-blink` | Ilustración de Claudio con respiración y parpadeo |
| Scrollbar | global | 10px, thumb foreground, sin radius |

Layout: contenedor máx **1400px** (`container` de Tailwind o `.container-site`),
secciones `py-24 lg:py-32`, radius base `0.5rem`, smooth-scroll global (Lenis + CSS).

### Motion (lenguaje de animación — composición zulik.co · efectos daveholloway.uk)

**Regla madre 1: el movimiento responde al usuario.** Los loops perpetuos están
prohibidos — cansan y hacen sentir que "la página se actualiza sola". Las únicas
excepciones son micro-gestos orgánicos (parpadeo, respiración, morph lento del blob).
El terminal tipea **una sola vez**; las marquesinas se mueven **con el scroll**
(quietas si el usuario no scrollea); el pulso del pipeline corre 3 veces y para.

**Regla madre 2: las metáforas salen del dominio IA/automatización**
(flujos, agentes, logs, pipelines, datos viajando). Nunca metáforas ajenas al rubro.
Todo efecto respeta `prefers-reduced-motion` (estado final, sin animar), se desactiva
en `pointer: coarse` cuando corresponde, y funciona en light y dark.

| Patrón | Dónde | Qué hace |
|---|---|---|
| **Marquee scroll-driven** | `Marquee.astro` (entre secciones) | Banda de palabras del dominio en Paytone One outline que se desplaza SOLO al scrollear (factor 0.55, direcciones alternadas). Quieta en reposo |
| **Terminal de agente** | ComoTrabajo | Card coal que tipea UNA vez el log de un agente real al entrar al viewport y queda congelado (cursor ▌ solo mientras tipea) |
| **Pipeline draw** | ComoTrabajo | Cable SVG estilo n8n que se dibuja al entrar al viewport, nodos pop, pulso de datos ×3 y se detiene. Solo desktop |
| **Avatar** | Hero | Ilustración de Claudio a color, con máscara de desvanecido y respiración/parpadeo. **Nunca duotono ni blob** — se probó y se descartó por ilegible/feo (jul-2026) |
| **Botones magnéticos** | CTAs con `data-magnetic` | El botón se acerca sutilmente al cursor (máx 9px) y vuelve con resorte |
| **Barra de progreso** | Global (BaseLayout) | 4px primary arriba, escala con el avance de lectura |
| **Counters** | Stats del hero | Números que cuentan de 0 al valor con easing cúbico (~1.3s), una vez |
| **Tender sway** | Tender.astro | Balanceo físico de tarjetas colgantes al arrastrar. Auto-scroll solo en desktop; en táctil navega el usuario |
| **Scrollspy** | Nav.astro (desktop) | El link de la sección visible se subraya en accent (IntersectionObserver, `rootMargin` centrado) |
| **Parallax de tarjetas** | `.img-parallax-layer` / `data-parallax` (BlogPreview, BlogCard) | La imagen se desplaza ±22px según su posición en el viewport — responde 1:1 al scroll, sin transición ni loop. Capa separada del hover-zoom para no pisarlo |
| **Menú mobile** | Nav.astro | Overlay full-screen con fondo sólido (nunca transparente), links display grandes con stagger de entrada, lock de scroll del body, cierre con Escape/backdrop/click en link |

**Composición (aporte zulik):** una idea por pantalla, aire generoso, headline display
gigante en el hero. El espectáculo está en la respuesta al usuario, no en el ruido.

**Cursor: siempre el nativo del sistema.** Se probó un cursor custom (punto + aro) y
se descartó (jul-2026) — no aportaba y generaba artefactos visuales. No reintentar
sin pedido explícito.

**Tipografía mono**: permitida ÚNICAMENTE en superficies de datos (terminal, logs,
código). Stack: `ui-monospace, 'Cascadia Code', Menlo, monospace`. Nunca para copy.

---

## 10 · Arquitectura de contenido del sitio

Orden canónico de la home (`src/pages/index.astro`), reestructurado en julio 2026
para que la página funcione primero como **página personal** (quién es Claudio,
qué comparte) y recién después como oferta de servicios — nunca al revés:

| # | Sección | Anchor | Comunica |
|---|---|---|---|
| 1 | Hero | `#inicio` | Identidad: quién es Claudio, sus frentes de trabajo, CTA a leer el blog |
| 2 | Quién soy | `#que-es` | El recorrido: desarrollo de software → e-commerce/gestión de proyectos → IA |
| 3 | Blog & Comunidad | `#blog` | Lo que comparte — sube de posición porque es la puerta de entrada, no un anexo |
| 4 | Cómo trabajo | `#como-funciona` | Proceso: diagnóstico → diseño/implementación → operación medida |
| 5 | Servicios (Tender) | `#soluciones` | Los 6 servicios (ver §11) como tarjetas colgantes — recién acá aparece la oferta |
| 6 | Arquitecturas | `#casos` | Arquitecturas de referencia: stack, flujo de datos y qué resuelven (sin clientes ficticios ni porcentajes inventados) |
| 7 | Para quién | — | PYMEs latam que ya facturan y quieren escalar operación — CTA discreto a `#contacto`, no un botón de WhatsApp propio |
| 8 | Contacto | `#contacto` | WhatsApp (API oficial Meta / YCloud) + formulario. Sin presión — el único lugar donde está bien vender |

El copy de estas secciones está alineado a este manual (julio 2026). Cualquier
modificación futura debe seguir §04 (voz), §05 (naming) y §11 (mensajería).
La migración desde la marca anterior está **completa**: contenido, autor, CMS
(`keystatic.config.tsx`), metadata (`project.json`, `.hive`) y limpieza de archivos
muertos ya se hicieron.

---

## 11 · Mensajería y servicios

Los servicios protagonistas — automatizaciones complejas, no chatbots básicos:

### 1. Sistemas multi-agente
Arquitecturas de agentes orquestados sobre procesos reales: ventas conversacionales
con seguimiento, briefing automatizado, inteligencia competitiva, gestión de turnos
y pacientes. Un agente no; un **sistema** que deriva, registra y escala a humano
cuando corresponde.

### 2. RAG especializado
Conocimiento del negocio consultable con precisión: legal, clínico, técnico,
catálogos. Vector DB (Qdrant/Supabase) + pipelines de ingesta + citas verificables.
El diferencial se comunica así: "responde **con tus documentos**, no con lo que
inventa el modelo".

### 3. Integración y orquestación
n8n self-hosted, MCP, **WhatsApp con API oficial de Meta o YCloud**, ERP/CRM,
facturación (AFIP/ARCA), e-commerce (TiendaNube/MercadoLibre). Conectar sistemas
que ya existen para que dejen de necesitar copy-paste humano.

### 4. Seguridad y gobernanza de datos
**Mensaje central de la marca.** Las empresas quieren usar IA sin regalar sus datos:
infraestructura propia o dedicada (VPS, Docker, Dokploy), modelos y proveedores elegidos
por criterio y no por default, trazabilidad de qué dato ve cada agente, y continuidad —
si mañana cambia el proveedor de IA, el negocio no pierde nada porque todo
(flujos, conocimiento, historial) vive en su infraestructura. Se comunica así:
"adoptá IA **sin perder el control de tus datos**".

### 5. Consultoría y formación
Diagnóstico, arquitectura y roadmap de IA con costos reales. Capacitación de equipos
y líderes (perfil instructor: cursos de automatización e IA dictados en 2025–2026).

### Audiencia

PYMEs y estudios profesionales de LATAM **que ya facturan** y quieren escalar
operación sin escalar headcount. No se le habla a startups buscando hype ni a
curiosos de IA; se le habla al dueño/gerente con un proceso que le duele.

### Casos / Arquitecturas

- Mientras no haya clientes publicables, la sección muestra **arquitecturas de
  referencia**: stack real, flujo de datos y qué problema resuelve — sin clientes
  ficticios ni porcentajes inventados. Cero humo (§02.1).
- Cuando haya casos reales con permiso de publicación, entran con **métrica
  auditable** (% de consultas resueltas, horas/mes, tiempo de respuesta) y nombre real.

### Comunidad

El blog es también el canal de aporte a la comunidad: **artículos técnicos, flujos
de n8n listos para importar, sistemas y repositorios**. Todo recurso público se
publica vía blog (no hay repos externos por ahora). Esto es parte del posicionamiento:
autoridad que se demuestra regalando valor, no declamando.

---

## 12 · Anti-patrones y checklist para agentes

### Anti-patrones visuales

- ❌ Sombras con blur, gradientes suaves, glassmorphism → rompen el neo-brutal.
- ❌ Bordes de 1px o grises → los bordes son 2px foreground.
- ❌ Otra fuente display, otra paleta, esquinas muy redondeadas (>0.5rem base).
- ❌ Componentes que solo funcionan en light mode.
- ❌ Reemplazar el avatar ilustrado por fotos o robots genéricos.

### Anti-patrones de copy

- ❌ Superlativos, startup-speak, urgencia falsa (§04).
- ❌ "Evolution API" en cualquier texto público → "API oficial de WhatsApp (Meta)" o "YCloud" (§05).
- ❌ Prometer resultados sin número ni fuente.
- ❌ Tutear ("tienes") o neutro ("tú") → siempre voseo.
- ❌ Copy de la era AIporvos/VDG en contenido nuevo.

### Checklist para reconstruir cualquier sección

```
[ ] Leí BRAND.md completo antes de tocar código
[ ] Colores vía tokens semánticos (bg-background, text-foreground, hsl(var(--x)))
[ ] Headings en Paytone One (h1–h6 lo heredan solos); body en Outfit
[ ] Bordes 2px foreground + sombra brutal donde corresponda
[ ] Componentes existentes (§09) antes que inventar nuevos
[ ] Funciona en light Y dark (probar el toggle del Nav)
[ ] Entrada con .reveal / data-split coherente con las demás secciones
[ ] Copy: voseo, sin superlativos, con datos (§04)
[ ] WhatsApp = "API oficial de WhatsApp (Meta)" o "YCloud" — nunca Evolution
[ ] Sección dentro de container 1400px, py-24 lg:py-32, anchor correcto (§10)
[ ] Mobile primero: probado a 390px además de desktop
```

## 13 · Agentes y LLMs (contenido)

El blog está pensado para que un humano lo lea **y** para que un agente lo consuma
directo, sin parsear HTML. Tres piezas trabajan juntas:

| Pieza | Ubicación | Qué hace |
|---|---|---|
| **Markdown crudo por post** | `src/pages/blog/[...slug].md.ts` | Cada post en `/blog/{slug}.md` — el `.body` de la content collection tal cual, con un pequeño encabezado (título, excerpt, autor, fecha, fuente) |
| **Widget "ver en LLM"** | `src/components/blog/PageActions.astro` | Al pie de cada post: **Copiar página** (copia el `.md` al portapapeles), **Abrir en ChatGPT**, **Abrir en Claude** (ambos con un prompt pre-armado apuntando a la URL canónica), **Ver como Markdown** |
| **`llms.txt`** | `src/pages/llms.txt.ts` | Índice del sitio en `/llms.txt` (convención [llmstxt.org](https://llmstxt.org)): páginas clave + cada post linkeando a su `.md`. Se regenera solo con la content collection |

Reglas al tocar esto:

- Todo post nuevo hereda el `.md` y entra a `llms.txt` automáticamente (ambos leen
  `getCollection('posts')`) — **no requiere trabajo manual por post**.
- Si un post alguna vez necesita componentes MDX custom (hoy ninguno los usa),
  revisar que `post.body` siga sirviendo como markdown legible antes de publicar.
- El widget usa `.card-brutal` + tokens semánticos — funciona en light/dark sin
  ajuste. No copiar el estilo oscuro fijo de referencias externas (ver anti-patrón).
- El botón "Copiar página" hace `fetch` al propio endpoint `.md` (una sola fuente
  de verdad); nunca duplicar el contenido inline en el HTML.

---

*cluna.ar — construimos sistemas que trabajan. Este manual también.*
