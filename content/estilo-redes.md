# Estilo de redacción — Blog, LinkedIn, Telegram

> Fuente de estilo para el pipeline de publicación (`PIPELINE.md`). La voz base
> del sitio (voseo, sin superlativos, datos concretos) vive en **`BRAND.md` §04
> — no se duplica acá, se hereda**. Este documento agrega la estructura de post
> de blog y el formato específico de LinkedIn/Telegram.

---

## 1. Blog (post de `src/content/posts/`)

Voz: `BRAND.md` §04 completo (voseo argentino, sin superlativos, sin startup-speak,
frases cortas, datos concretos, "a veces la respuesta es no").

**Estructura del post:**

1. **Gancho** — una escena o afirmación concreta que desafía una creencia común
   sobre el tema. Nunca "en la era de la IA...". Arrancar en la acción o el dato.
2. **Contraste** — el enfoque ingenuo/manual vs. el enfoque con criterio, en 1-2
   líneas. Marca la diferencia sin sermonear.
3. **Desarrollo con ejemplos concretos** — código, flujos, números reales, "lo
   que probé", "lo que hice". Nada de teoría sin aterrizar.
4. **Paso a paso de puesta en marcha (obligatorio en todo post que trate sobre
   una herramienta, flujo o recurso)** — lista numerada simple de cómo dejarlo
   andando, con el tono de alguien que ya lo probó y te cuenta cómo hacerlo, no
   un manual técnico exhaustivo. Alcanza con los pasos esenciales para arrancar
   (instalar/conseguir acceso, configurar lo mínimo, primer resultado). Regla
   fijada 2026-07-17 tras el post del bot de Telegram con n8n.
5. **Cierre de valor** — qué cambia cuando se aplica bien. Si hay un recurso para
   compartir (repo, flujo de n8n, plantilla), se linkea directo, sin condicionarlo.

**Categorías disponibles** (Keystatic, `keystatic.config.tsx`): Automatización,
Arquitectura IA, Adopción de IA, Liderazgo & IA, RAG & Datos, Ecommerce.

**Excerpt**: máx. 160 caracteres — se reusa tal cual como base del copy de
LinkedIn y Telegram (no reescribir desde cero, adaptar).

---

## 2. LinkedIn

Formato de post (bloques en este orden, sin encabezados visibles — fluye como
un solo texto con saltos de línea entre bloques):

```
[GANCHO]          → señala una creencia/comportamiento común y lo desafía
[CONTRASTE]       → enfoque ingenuo vs. experto, en una línea
[PROMESA]         → "el secreto está en N partes:" (o equivalente)
[LISTA]           → un emoji-ancla por categoría, una idea por línea
[CIERRE DE VALOR] → qué cambia cuando se aplica bien
[ENTREGA]         → link directo al post del blog — "Guardalo 👇" o similar
[NIVEL]           → "Nivel N · Nombre" del post (ver más abajo)
[FRASE DE MARCA]  → una del banco de abajo, rotando (ver covers-log.json/histórico)
```

**[NIVEL] (obligatorio si el post de blog asociado tiene `aiLevel` en el
frontmatter, regla fijada 2026-07-20):** una línea sola, formato exacto
`Nivel N · Nombre` (los 4 nombres viven en `src/lib/niveles.ts`: 1 Chat,
2 Herramientas, 3 Agentes, 4 Orquestación) — el mismo texto que el badge del
sitio, para que se lea igual en LinkedIn que en el blog. Va después del link
al post, antes de la frase de marca. Si el post no tiene `aiLevel` (por
ejemplo, un post sin blog asociado que solo recomienda un repo de terceros),
se omite el bloque entero, no se inventa un nivel.

### Banco de frases de cierre (rotar, no repetir la última usada)

1. "Sin comentar. Sin suscribirte. Sin pedirte nada. Tomalo."
2. "Acá no hay funnel. Hay laburo compartido."
3. "Comparto a cielo abierto. Sin peajes."
4. "Conocimiento sin barreras, como la luna: le llega a todos igual."
5. "Otros venden acceso. Yo comparto criterio."
6. "Sin embudos. Sin condiciones. Solo valor real."

### Prohibido siempre

- **Rayas / em-dashes ("—") en el texto de LinkedIn**: usar punto, coma o dos
  puntos en su lugar. Máximo una raya en todo el post, y solo si de verdad no
  hay alternativa (feedback directo de Claudio: los guiones quedan feos en el
  render de LinkedIn).
- "Comentá [palabra] y te mando por DM" o cualquier variante de esa mecánica.
- CTAs de engagement puro: "dejá tu opinión", "etiquetá a alguien", "compartí si..."
- Emojis decorativos sin función de categoría (cada emoji de la lista marca un
  tipo de idea, no decora).
- Cierres genéricos de marketing ("no te lo pierdas", "última oportunidad").
- Cualquier cosa de la lista de anti-patrones de copy en `BRAND.md` §12.

---

## 3. Telegram

- 3 a 6 líneas máximo. Nada de bloques largos.
- Estructura: **título** + **una línea que resume el valor** + **link al post**.
- Tono más informal que LinkedIn — es el canal de gente que ya sigue a Claudio,
  no hace falta "vender" la idea, alcanza con avisar que está.
- Máximo 1 emoji, y opcional (no obligatorio).

---

## Reglas de rotación

- `content/covers-log.json` registra, además del preset de portada, la última
  frase de cierre de LinkedIn usada — el skill `/publicar` no debe repetir la
  misma dos veces seguidas.
