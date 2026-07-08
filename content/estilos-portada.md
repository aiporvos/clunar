# Catálogo de presets — portadas de blog

> El objetivo es evitar la estética genérica de IA (gradiente azul-violeta,
> robots humanoides brillantes, cerebros digitales, manos tipeando sobre
> teclados holográficos). Cada preset abajo tiene su prompt base + negativos
> obligatorios. `scripts/cover-image.mjs` lee este archivo, el agente
> propone **2 presets** según el tema del post y Claudio elige.
>
> `content/covers-log.json` registra qué preset se usó en cada post — **no
> repetir el mismo preset en 2 posts consecutivos.**

Negativos que van en **todos** los prompts (no repetir la lista completa en
cada preset abajo, ya están acá una sola vez):

```
No gradients (blue-to-purple or otherwise), no humanoid robots, no glowing
digital brains, no hands typing on holographic keyboards, no stock-photo
businesspeople shaking hands, no generic "AI" iconography (glowing chips,
binary rain), no watermarks, no text in the image unless the preset says so.
```

---

## 1. Editorial collage
Mixed media, recortes de papel, texturas, estética de revista tipo
Wired / MIT Technology Review. Ideal para: posts de opinión, adopción de IA,
liderazgo.
```
Editorial collage illustration, mixed media with visible paper textures and
torn-edge cutouts, muted color blocking, asymmetric composition, magazine
cover energy (Wired / MIT Technology Review style). Horizontal 16:9.
```

## 2. Fotografía técnica macro
Detalle extremo de hardware, cables, circuitos, luz dramática. Ideal para:
posts de infraestructura, self-hosted, integración de sistemas.
```
Extreme macro photography of technical hardware — cables, connectors, circuit
boards or server racks — dramatic directional lighting, shallow depth of
field, high contrast, documentary tech-photography feel. Horizontal 16:9.
```

## 3. Diagrama brutalist
Esquemas técnicos sobre fondo crudo, tipografía monoespaciada, estética de
blueprint. Ideal para: posts de arquitectura, RAG, orquestación de modelos.
```
Brutalist technical diagram on raw kraft-paper or blueprint background,
hand-drawn-style schematic lines, monospace annotations, high contrast ink
on paper aesthetic. Horizontal 16:9.
```

## 4. Ilustración isométrica oscura
Sistemas y flujos en 3D isométrico, paleta oscura con un acento de color.
Ideal para: posts de automatización, pipelines, sistemas multi-agente.
```
Dark isometric 3D illustration of interconnected systems and data pipelines,
single accent color glow against a near-black background, clean geometric
shapes, no characters. Horizontal 16:9.
```

## 5. Fotografía documental
Escena real de laburo — escritorio, terminal, mate — luz natural, grano.
Ideal para: posts en primera persona ("lo que probé"), casos reales.
```
Documentary-style photograph of a real work desk — laptop with terminal
open, a mate gourd, notebook — natural window light, film grain, candid and
unstaged feel, no visible faces. Horizontal 16:9.
```

## 6. Abstracto geométrico
Formas que representan el concepto (nodos, flujos, capas) sin figuras humanas
ni robots. Ideal para: posts conceptuales, gobernanza de datos, seguridad.
```
Abstract geometric composition representing interconnected nodes and data
flow — circles, lines, layered shapes — flat design, confident color
blocking, no characters, no robots. Horizontal 16:9.
```

## 7. Estética Mendoza / Andes
Paisaje andino con un elemento técnico integrado — guiño a la marca
Luna/montaña. Usar con moderación (no en todos los posts). Ideal para: posts
de marca personal, reflexiones de fondo.
```
Andes mountain landscape at dusk, minimalist and editorial, a single subtle
technical element integrated into the scene (a small monitor glow, a server
silhouette on a ridge), warm-to-cool gradient sky, cinematic wide shot.
Horizontal 16:9.
```

## 8. Retro computing
CRT, terminal verde, estética 80s-90s. Ideal para: posts de fundamentos,
"cómo empezar", nostalgia técnica.
```
Retro computing aesthetic, green-phosphor CRT terminal display, 1980s-1990s
computer lab setting, warm nostalgic film grain, no modern devices visible.
Horizontal 16:9.
```

## 9. Neo-brutal editorial de marca
El sistema visual propio de cluna.ar (ver `BRAND.md` §07-08) llevado a
ilustración de portada. Ideal para: posts técnicos generales, cuando se
quiere reforzar la identidad visual del sitio más que ilustrar el tema.
```
Editorial tech illustration in a warm neo-brutalist style: cream background
(#f9f4da), thick charcoal outlines (#231f20), flat vibrant accents (yellow
#fcba28, orange #fc7428, green #0ba95b). Abstract representation of an
automation pipeline / connected systems — data flowing between nodes. No
people, no logos. Bold, confident, editorial. Hard offset shadows, high
contrast. Horizontal 16:9.
```

## 10. Fotografía de producto/pantalla
Screenshot o mockup estilizado de una interfaz real (n8n, dashboard, código)
con tratamiento editorial (marco, sombra, ángulo sutil). Ideal para: posts
que muestran un flujo o resultado concreto.
```
Stylized editorial mockup of a software interface (workflow builder, code
editor, or dashboard) on a clean surface, subtle perspective tilt, soft
studio shadow, no visible brand logos, no readable proprietary UI chrome.
Horizontal 16:9.
```

---

## Cómo agregar un preset nuevo

Copiar el formato de arriba (nombre, "ideal para", prompt en inglés entre
backticks). El script arma el prompt final concatenando el preset elegido +
los negativos obligatorios del principio de este archivo — no hace falta
repetir los negativos en cada preset nuevo.
