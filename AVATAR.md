# Avatar animado tipo daveholloway.uk — rig en Rive

El avatar de referencia (daveholloway.uk) es una **ilustración vectorial riggeada en Rive**:
se le mueve el ojo entero (iris + brillo), parpadea y la cabeza hace un leve *parallax*
hacia el cursor. Eso NO se puede imitar con CSS sobre un PNG (queda pegoteado). Hay que
riggearlo en Rive.

El sitio ya está listo: si existe `public/avatar.riv`, el Hero muestra la animación y le
pasa la posición del mouse; si no, queda el PNG estático (`public/clunar-cut.png`) como
fallback. **No hay que tocar código.**

---

## Datos del avatar (para ubicar el rig)

- Imagen base: `public/clunar-cut.png` — **1024 × 1024**, fondo transparente.
- Centros de los ojos (medidos), en px sobre el lienzo 1024:
  - Ojo izquierdo (del espectador): **x ≈ 359, y ≈ 414**  (35,1 % / 40,4 %)
  - Ojo derecho: **x ≈ 513, y ≈ 406**  (50,1 % / 39,6 %)

---

## Opción A (recomendada para máxima calidad): versión vectorial por capas

Rive rinde mucho mejor con vectores que con una foto. Conseguí el avatar como **SVG con los
ojos en capas separadas**:
- Regeneralo como SVG en un generador que exporte vector, **o**
- Encargalo a un diseñador (Fiverr "custom vector / notion avatar") pidiendo **entrega en
  SVG por capas** con **ojo, iris, pupila y párpado separados**.

Con eso, en Rive ya tenés los ojos aislados y el rig es directo.

## Opción B (con el PNG actual): dibujar los ojos en Rive encima

Sirve igual, solo que los ojos los redibujás vos en Rive sobre la foto.

---

## Paso a paso en Rive

1. **rive.app** → *New File*. Artboard **1024 × 1024**, fondo **transparente**.
2. **Importá** `public/clunar-cut.png` y encajalo al artboard (queda de base).
3. **Rig de cada ojo** (repetir para izq y der, en las coords de arriba):
   - Creá un **Group** por ojo.
   - Dibujá con la **Pen** el **blanco del ojo** calcando la forma del dibujo (esto tapa el
     ojo pintado de la foto). Sampleá el color con el cuentagotas.
   - Adentro: **iris** (elipse marrón), **pupila** (elipse oscura) y **brillo** (punto
     blanco). Agrupá iris+pupila+brillo como `pupila`.
   - Poné un **Clip** con la forma del blanco para que la pupila no se salga.
   - Un **párpado** color piel encima (para el parpadeo).
4. **State Machine** → renombrala **exactamente** `State Machine 1`.
   - **Inputs** (Number): `mouseX` y `mouseY` (rango 0–100). El sitio ya los alimenta.
5. **Seguimiento del cursor** (mover `pupila` según los inputs):
   - Modo fácil: **Blend State 1D** con `mouseX` (0→mira izq, 50→centro, 100→mira der) y
     otro aditivo con `mouseY` (arriba/centro/abajo). Movimiento chico: 4–8 px.
6. **Parallax de cabeza** (el toque daveholloway): agrupá TODO el avatar y agregale una
   traslación/rotación mínima (2–4 px / 1–2°) manejada por `mouseX`/`mouseY` en capa
   aditiva. Es lo que da la sensación de "vivo".
7. **Parpadeo**: timeline `blink` que cierra los párpados (scaleY 0→1→0, ~150 ms) en loop
   cada 4–6 s.
8. **Exportá**: *Export → Runtime* → guardá como **`public/avatar.riv`**.

Al recargar el sitio, el Hero detecta `avatar.riv`, tapa el PNG con la animación y le pasa
`mouseX`/`mouseY` al mover el mouse.

---

## Notas
- Mantené el **fondo del artboard transparente** para que se funda con el crema del sitio.
- El runtime (`@rive-app/canvas`) y el loader ya están en
  `src/components/sections/Hero.astro` (`loadAvatarRive`).
- Si preferís no meterte en Rive, un diseñador de Rive en Fiverr te entrega el `.riv`
  riggeado desde tu ilustración por ~USD 30–80; lo dejás en `public/avatar.riv` y listo.
