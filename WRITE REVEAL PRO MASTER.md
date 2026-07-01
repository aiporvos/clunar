# WRITE REVEAL PRO — MASTER PROMPT

Crear una extensión profesional para Adobe After Effects 2025/2026 llamada:

WRITE REVEAL PRO

La extensión debe funcionar como una herramienta avanzada de:
- handwriting reveal
- ink reveal
- marker reveal
- calligraphy reveal

orientada a motion graphics premium, publicidad luxury y tipografía caligráfica.

NO debe ser un simple wipe.
NO debe depender de previews HTML falsos.
TODO debe ocurrir realmente dentro de After Effects.

────────────────────────────────────
OBJETIVO PRINCIPAL
────────────────────────────────────

Permitir que el usuario:

1. Seleccione una capa de texto real en AE.
2. Capture automáticamente:
   - tipografía
   - posición
   - escala
   - tracking
   - baseline
   - bounding box
3. Cree una guía editable REAL sobre el texto.
4. Dibuje manualmente el recorrido de escritura.
5. Controle grosor dinámico tipo pincel/pluma.
6. Genere automáticamente el reveal final.

El resultado debe parecer:
- tinta real
- rotulador
- pluma caligráfica
- marcador premium
- handwriting orgánico

NO un reveal técnico duro.

────────────────────────────────────
FILOSOFÍA UX
────────────────────────────────────

La UX debe sentirse:
- moderna
- premium
- minimal
- visual
- elegante

Inspiraciones:
- Figma
- Rive
- Cavalry
- DaVinci Resolve
- Blender modern UI

NO parecer un script viejo de After Effects.

────────────────────────────────────
WORKFLOW IDEAL
────────────────────────────────────

STEP 1 — CAPTURE TEXT

Botón:

CAPTURE TEXT

Debe:

- detectar UNA sola text layer seleccionada
- validar errores
- mostrar mensajes claros

Capturar:
- font
- font size
- leading
- tracking
- position
- scale
- anchor
- justification
- sourceRectAtTime

Renombrar layer:

WR_SOURCE

El preview del panel debe mostrar:
- tipografía real
- peso real
- proporciones reales
- posición aproximada

NO usar una tipografía fake.

────────────────────────────────────
STEP 2 — CREATE GUIDE
────────────────────────────────────

Botón:

CREATE GUIDE

Debe crear:

WR_GUIDE

como SHAPE LAYER REAL.

NO HTML.
NO canvas fake.

Debe crear:
- shape layer
- path editable
- stroke visible
- trim paths

El path:
- debe aparecer SOBRE el texto
- editable con Pen Tool
- editable con Bezier handles

El usuario debe poder:
- mover puntos
- agregar puntos
- borrar puntos
- editar tangentes

────────────────────────────────────
STEP 3 — DRAW MODE
────────────────────────────────────

Modo especial:

DRAW MODE

Cuando se activa:

- selecciona automáticamente Path 1
- activa Pen Tool
- centra viewport
- habilita edición inmediata

Debe sentirse como:
- dibujar sobre Illustrator
- editar splines en Cavalry
- bezier editing profesional

────────────────────────────────────
STEP 4 — VARIABLE WIDTH
────────────────────────────────────

La herramienta debe permitir:

GROSOR GLOBAL

Brush Width

y también:

GROSOR POR SECTOR

Cada nodo debe poder tener:
- pressure
- width multiplier

Ejemplo:
- entrada fina
- centro grueso
- salida fina

Inspirado en:
- caligrafía
- Procreate
- Illustrator Width Tool

────────────────────────────────────
STEP 5 — APPLY REVEAL
────────────────────────────────────

Botón:

APPLY REVEAL

Debe:

1. Duplicar texto real.
2. Crear matte procedural.
3. Copiar path real.
4. Aplicar stroke animado.
5. Aplicar trim paths.
6. Crear alpha matte.

Resultado:

WR_REVEAL
WR_MATTE

────────────────────────────────────
EL REVEAL DEBE:
────────────────────────────────────

- seguir exactamente el recorrido
- parecer escrito
- respetar curvas
- respetar velocidad
- respetar easing

NO lineal robótico.

────────────────────────────────────
SISTEMA DE VELOCIDAD
────────────────────────────────────

Agregar:

Speed Curve

Control visual:
- easing editor
- velocity graph

Permitir:
- acelerar
- desacelerar
- pauses

Como escritura humana real.

────────────────────────────────────
SISTEMA DE PRESSURE
────────────────────────────────────

Agregar:

Pressure Simulation

Opciones:
- marker
- brush
- fountain pen
- dry ink
- calligraphy nib

────────────────────────────────────
TIPOS DE PINCEL
────────────────────────────────────

Opciones:

- Marker
- Brush
- Ink
- Dry Brush
- Luxury Pen
- Chalk
- Paint

Cada uno modifica:
- opacity
- feather
- taper
- texture
- jitter

────────────────────────────────────
TEXTURAS
────────────────────────────────────

Permitir:
- textura procedural
- PNG brush tip
- rough edges
- paper bleed
- ink accumulation

────────────────────────────────────
PREVIEW PANEL
────────────────────────────────────

El panel HTML debe:
- mostrar preview REAL
- sincronizarse con AE
- NO usar líneas fake
- NO usar demos hardcoded

Debe reflejar:
- path real
- grosor real
- texto real

────────────────────────────────────
SMART ASSIST
────────────────────────────────────

Agregar opcional:

AUTO TRACE

Que:
- convierta texto a outlines
- detecte centros aproximados
- genere spline inicial

NO perfecto.
Solo punto de partida.

Especialmente útil para:
- cursivas
- scripts
- handwriting fonts

────────────────────────────────────
SISTEMA CURSIVA VS RECTA
────────────────────────────────────

Agregar:

Writing Mode

Opciones:

- Cursive
- Print
- Calligraphy
- Signature
- Marker

Esto modifica:
- suavidad
- cantidad de puntos
- tangentes
- taper
- continuidad

────────────────────────────────────
UI VISUAL
────────────────────────────────────

Paleta:
- negro grafito
- azul suave
- verde mint
- gris oscuro

Estética:
- premium
- minimal
- luxury software

────────────────────────────────────
VALIDACIONES IMPORTANTES
────────────────────────────────────

La extensión debe detectar:
- no comp abierta
- múltiples layers
- no text layer
- no guide
- no path
- valores inválidos

Mensajes claros:

- Select ONE text layer
- Capture text first
- Guide not found
- Open composition first

────────────────────────────────────
COMPATIBILIDAD
────────────────────────────────────

Compatible con:
- After Effects 2024
- After Effects 2025
- After Effects 2026

CEP compatible.

────────────────────────────────────
ARQUITECTURA
────────────────────────────────────

HTML PANEL
- UI
- preview
- controls

JSX
- lógica AE
- creación de layers
- shape layers
- matte
- trim paths
- automation

────────────────────────────────────
FUTURO
────────────────────────────────────

Preparar arquitectura para futuras versiones:

- pressure procedural
- AI auto-trace
- multiple strokes
- animated pressure
- real brush textures
- ink simulation
- tablet pressure support
- variable speed curves
- SVG import
- signature reveal mode
- logo reveal mode
