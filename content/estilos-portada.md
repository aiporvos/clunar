# Catálogo de presets — portadas de blog

> El objetivo es evitar la estética genérica de IA (gradiente azul-violeta,
> robots humanoides brillantes, cerebros digitales, manos tipeando sobre
> teclados holográficos). Cada preset abajo tiene su prompt base + negativos
> obligatorios. `scripts/cover-image.mjs` lee este archivo, el agente
> propone **2 presets** según el tema del post y Claudio elige.
>
> `content/covers-log.json` registra qué preset se usó en cada post — **no
> repetir el mismo preset en 2 posts consecutivos.**

**Regla de marca (obligatoria, no se pide en cada preset):** toda portada se
renderiza en el **estilo canónico fijado por Claudio el 2026-07-16**, cuya
referencia visual es la portada del post "graphify"
(`public/images/posts/graphify-tu-carpeta-como-grafo-de-conocimiento/cover.png`):
fondo crema `#f9f4da`, ilustración de línea negra limpia y confiada (feel
cómic/riso, trazo medio parejo) con rellenos planos selectivos SOLO de la
paleta de marca (amarillo `#fcba28`, naranja `#fc7428`, verde `#0ba95b`,
rosa `#f38ba3`, violeta `#7b5ea7`, celeste `#12b5e5` — algunos elementos
pueden quedar en línea pura sin relleno, para balance). Si lleva título
(`--title`), va como lettering redondeado tipo burbuja, cada letra de un
color distinto de la paleta, con contorno crema grueso y sombra charcoal
suave. Aire generoso, composición editorial. Nunca fotorrealista, sin
gradientes, sin pasteles lavados, sin colores fuera de paleta.
`scripts/cover-image.mjs` inyecta este estilo automáticamente **al
principio** de cada prompt (el modelo prioriza lo primero que lee — con el
estilo al final, las portadas derivaban a isométrico pastel genérico). Los
presets de abajo describen composición y tema, no estilo ni paleta.

Negativos que van en **todos** los prompts (no repetir la lista completa en
cada preset abajo, ya están acá una sola vez):

```
No gradients (blue-to-purple or otherwise), no humanoid robots, no glowing
digital brains, no hands typing on holographic keyboards, no stock-photo
businesspeople shaking hands, no generic "AI" iconography (glowing chips,
binary rain), no watermarks, no text in the image unless the preset says so.
```

**Regla de idioma:** si el prompt pide cualquier texto visible dentro de la
imagen (carteles, papeles, etiquetas de UI, títulos de diario, etc.), ese
texto tiene que estar **en español (Argentina)**, nunca en inglés — el sitio
es en español y una portada con palabras en inglés rompe la coherencia de
marca. Esto aplica también a `--prompt` custom (no solo a los presets de
abajo). Por defecto, mejor evitar texto en la imagen directamente.

**Regla del nombre de herramienta (2026-07-14):** cuando el post es sobre
una herramienta concreta (vLLM, OpenWiki, draw.io, n8n...), la portada
**debe incluir el nombre de la herramienta** integrado en la ilustración —
pasarlo con `--title "NombreExacto"` a `cover-image.mjs`. El script se
encarga de pedirlo con la grafía exacta y de prohibir cualquier otro texto.
Los nombres propios conservan su grafía original (no se traducen ni
adaptan); la regla de español de arriba sigue valiendo para todo otro texto.

---

## 1. Editorial collage
Recortes de papel superpuestos, texturas, energía de tapa de revista. Ideal
para: posts de opinión, adopción de IA, liderazgo.
```
Editorial collage illustration, layered paper-cutout shapes with visible
torn edges, asymmetric magazine-cover composition. Horizontal 16:9.
```

## 2. Detalle técnico ilustrado
Detalle de hardware (cables, chips, placas, racks) en ilustración plana, no
fotografía. Ideal para: posts de infraestructura, self-hosted, integración
de sistemas.
```
Flat vector illustration showing an extreme close-up of technical hardware —
cables, connectors, circuit boards or server racks — as clean graphic shapes
with visible construction lines, not a photograph. Horizontal 16:9.
```

## 3. Diagrama brutalist
Esquemas técnicos tipo blueprint, sin fotorrealismo. Ideal para: posts de
arquitectura, RAG, orquestación de modelos.
```
Brutalist technical diagram, hand-drawn-style schematic lines and boxes
connected by arrows, blueprint composition. No readable words, only abstract
tick marks and geometric symbols suggesting annotation. Horizontal 16:9.
```

## 4. Ilustración isométrica oscura
Sistemas y flujos en 3D isométrico plano, fondo oscuro de marca. Ideal para:
posts de automatización, pipelines, sistemas multi-agente.
```
Isometric flat-vector illustration of interconnected systems and data
pipelines against the brand's near-black background, clean geometric shapes,
no characters, no realistic lighting or glow. Horizontal 16:9.
```

## 5. Escena de trabajo ilustrada
Escritorio real (laptop, mate, cuaderno) en ilustración plana, no foto. Ideal
para: posts en primera persona ("lo que probé"), casos reales.
```
Flat vector illustration of a real work desk — laptop with a terminal window,
a mate gourd, a notebook — simple graphic shapes, no photographic grain or
realistic lighting, no visible faces. Horizontal 16:9.
```

## 6. Abstracto geométrico
Formas que representan el concepto (nodos, flujos, capas) sin figuras humanas
ni robots. Ideal para: posts conceptuales, gobernanza de datos, seguridad.
```
Abstract geometric composition representing interconnected nodes and data
flow — circles, lines, layered shapes — flat design, no characters, no
robots. Horizontal 16:9.
```

## 7. Estética Mendoza / Andes
Paisaje andino estilizado con un elemento técnico integrado — guiño a la
marca Luna/montaña. Usar con moderación (no en todos los posts). Ideal para:
posts de marca personal, reflexiones de fondo.
```
Stylized flat-vector illustration of an Andes mountain landscape at dusk,
minimalist, a single subtle technical element integrated into the scene (a
small monitor glow, a server silhouette on a ridge), flat color banding
instead of a realistic sky gradient. Horizontal 16:9.
```

## 8. Retro computing
CRT, terminal verde de marca, estética 80s-90s en ilustración plana. Ideal
para: posts de fundamentos, "cómo empezar", nostalgia técnica.
```
Flat vector illustration of a retro computing scene, green-phosphor CRT
terminal (brand green #0ba95b), 1980s-1990s computer setting as clean
graphic shapes, no photographic grain. Horizontal 16:9.
```

## 9. Neo-brutal editorial de marca
El preset "por defecto": pipeline de automatización / sistemas conectados,
sin tema visual específico. Ideal para: posts técnicos generales, cuando se
quiere reforzar la identidad visual del sitio más que ilustrar el tema.
```
Abstract representation of an automation pipeline / connected systems — data
flowing between nodes. No people, no logos. Bold, confident, editorial.
Horizontal 16:9.
```

## 10. Mockup de producto/pantalla ilustrado
Interfaz real (n8n, dashboard, código) como ilustración plana con marco
editorial. Ideal para: posts que muestran un flujo o resultado concreto.
```
Flat vector illustration of a software interface (workflow builder, code
editor, or dashboard) as a stylized mockup with a subtle frame, no
photographic shadow or reflections, no visible brand logos, no readable
proprietary UI chrome. Horizontal 16:9.
```

---

## Cómo agregar un preset nuevo

Copiar el formato de arriba (nombre, "ideal para", prompt en inglés entre
backticks). El script arma el prompt final concatenando el preset elegido +
los negativos obligatorios del principio de este archivo — no hace falta
repetir los negativos en cada preset nuevo.
