# Auditoría de tipografía

Estado final del sistema tipográfico al 18 de octubre de 2026, rama `tipografias`, HEAD `49647dc`.
Este documento reemplaza la auditoría inicial (commit `ca179f2`), que describía el estado anterior
a la sistematización. Para verla: `git show ca179f2:TYPOGRAPHY-AUDIT.md`.

**Alcance:** los 13 `.astro` (incluido el componente nuevo `PageHeader.astro`), las 21 `.scss` y los
23 `.ts` de `src/`, más `tools/` y `astro.config.mjs`. **Excluidos:** `node_modules/` y `dist/`.

**Método:** la misma extracción automática de la auditoría inicial (cada declaración de familia,
tamaño, peso, estilo, interlineado, tracking y mayúsculas, en CSS y en JS). A eso se suma una
verificación en Chrome headless (protocolo DevTools) de las 8 páginas, más 3 vistas internas, a
1440px y a 390px (emulación móvil). En cada una se midió el estilo calculado de todo el texto visible.

---

## Resumen

|                                                | Antes                                             | Ahora                                                       |
| ---------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| Familias cargadas                              | 4                                                 | **3**: IM Fell English, Crimson Pro, Source Code Pro        |
| Tokens de familia                              | 5 (incluidos un alias y una monoespaciada aparte) | **3**: `--font-display`, `--font-body`, `--font-ui`         |
| Tamaños distintos                              | 15 (11 tokens, 4 hardcodeados)                    | **13 tokens, 0 hardcodeados**                               |
| Pesos distintos                                | 5 (`400`, `normal`, `600`, `700`, `800`)          | **3 tokens** (`--fw-regular`, `--fw-semibold`, `--fw-bold`) |
| Espaciado entre letras                         | 30 declaraciones, 13 valores                      | **0**                                                       |
| Interlineados hardcodeados                     | 5                                                 | **0**                                                       |
| Encabezados de página                          | 6 estructuras distintas                           | **1 componente** (`PageHeader.astro`) en 7 páginas          |
| Familias genéricas sin serifa en pilas o en JS | 4 pilas + atributo de d3                          | **0**                                                       |

---

## 1. Familias tipográficas

| Token            | Pila                                         | Uso                                                                                                            |
| ---------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `--font-display` | `'IM Fell English', Georgia, serif`          | h1–h6, títulos de tarjeta, nav y título del proyecto en el nav                                                 |
| `--font-body`    | `'Crimson Pro', Georgia, serif`              | cuerpo, párrafos, notas, prosa de la ficha de caso, definiciones, estados vacíos                               |
| `--font-ui`      | `'Source Code Pro', ui-monospace, monospace` | gráficas, ejes, tooltips, leyendas, controles, filtros, pestañas, botones, tabla, ficha de caso, cejas, cifras |

**Carga:** un único `<link>` en `src/layouts/BaseLayout.astro:49`:

```
Crimson Pro:ital,wght@0,400;0,700;1,400;1,700
IM Fell English:ital@0;1
Source Code Pro:ital,wght@0,400;0,600;0,700;1,400
```

- Sin `@font-face`, sin `@import` y sin archivos de fuente locales.
- **Ningún respaldo genérico sin serifa** en las pilas. El de `--font-ui` es `ui-monospace` (SF Mono
  en Apple, Cascadia o Consolas en Windows), que es monoespaciado.
- **Reglas globales que garantizan la familia** (`base/_reset.scss`, `base/_typography.scss`):
  - `button, input, select, textarea, option { font: inherit }` y, después,
    `button, input, select, textarea { font-family: var(--font-ui) }`. Ningún control queda con la
    fuente del navegador.
  - `svg { font-family: var(--font-ui) }`. Ningún `<text>` SVG queda con la fuente por defecto.
  - `svg g:has(> .tick), svg .tick text { font-family: var(--font-ui) }`. Sobrescribe la
    familia genérica sin serifa que d3-axis escribe en el grupo de cada eje, en las 4 gráficas con
    ejes. _(El atributo lo genera d3 en tiempo de ejecución; no está en el repo.)_
- **Observable Plot:** el repo no lo usa (`package.json` no lo incluye).
- **JS:** ningún `.ts` fija una familia con `.attr`/`.style`, salvo el banner del donut de
  Crímenes por tipo (`CrimenesPorTipo.ts:309`, `cssText`), que usa `var(--font-ui)`. Los tooltips y
  las leyendas creados desde JS reciben su familia por clase (`.tooltip-grafico`, `.cs-leyenda-*`,
  etc.).

**Familias que se ven, medidas en Chrome** (caras distintas con texto visible, a 1440px):

| Página        | Caras                                                                                 |
| ------------- | ------------------------------------------------------------------------------------- |
| home          | Fell 400 itálica, Crimson 400                                                         |
| about         | Fell 400 / 400 itálica, Crimson 400 / 700, Code 400 / 600 / 700                       |
| tiempo        | Fell 400 / 400 itálica, Crimson 400 / 700, Code 400 / 600 / 700                       |
| base de datos | Fell 400 itálica, Crimson 400, Code 400 / 600 / 700                                   |
| personas      | Fell 400 / 400 itálica, Crimson 400, Code 400 / 600 / 700                             |
| caso          | Fell 400 / 400 itálica, Crimson 400 / 400 itálica / 700 itálica, Code 400 / 600 / 700 |

No aparece ninguna otra familia.

---

## 2. Qué familia usa cada elemento

| Elemento                                                                                                                                                  | Familia                                              | Tamaño                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------- |
| h1 de página (`PageHeader`)                                                                                                                               | Fell, itálica, mayúsculas                            | `--fs-title` 22→28px                  |
| h1 de caso                                                                                                                                                | Fell, itálica, **sin mayúsculas** (excepción pedida) | `--fs-title`                          |
| h1 del home                                                                                                                                               | Fell, itálica, mayúsculas, dos líneas con `<br>`     | `--fs-title-home` 16→28px             |
| h2 (`section h2`, `.section-title`, `.cs-seccion-titulo`)                                                                                                 | Fell                                                 | `--fs-h2` 24px                        |
| h3 (`.cs-panel-titulo`, `.linaje-panel-titulo`, `.lugar-ficha-titulo`, `.cs-rol-titulo`)                                                                  | Fell                                                 | `--fs-h3` 20px                        |
| h4 y títulos de tarjeta (`.mapa-tarjeta-titulo`, `.panel-filtros-titulo`, `.crime-name`, `.lugar-ficha-subtitulo`, `h4` de caso, `.cs-rol-delito-nombre`) | Fell 400                                             | `--fs-h4` 19px                        |
| Nav (`.logo`, `.nav-links a`)                                                                                                                             | Fell itálica, mayúsculas                             | `--fs-sm` 16px                        |
| Ceja de `PageHeader`                                                                                                                                      | Code, mayúsculas                                     | `--fs-ui-xs` 11px                     |
| Subtítulo de `PageHeader`                                                                                                                                 | Code                                                 | `--fs-ui-sm` 13px                     |
| Cuerpo y `p`                                                                                                                                              | Crimson                                              | `--fs-base` 19px (`p` = `body`)       |
| Lead del home                                                                                                                                             | Crimson                                              | `--fs-lead` 19→22px                   |
| Notas, estados vacíos, prosa de la ficha, definiciones                                                                                                    | Crimson                                              | `--fs-sm` 16px como mínimo            |
| Botones, pestañas, chips, filtros, selects                                                                                                                | Code                                                 | `--fs-ui-sm` / `--fs-ui-md`           |
| Tabla (`th` y `td`)                                                                                                                                       | Code                                                 | `--fs-ui-sm` / `--fs-ui-md`           |
| Ejes, etiquetas SVG, leyendas, tooltips                                                                                                                   | Code                                                 | `--fs-ui-xs` / `--fs-ui-sm`           |
| Cápsulas del mapa, etiqueta del donut                                                                                                                     | Code                                                 | `--fs-ui-xs` / `--fs-ui-sm`           |
| Cifras (tarjetas, medidores, contador, total del donut, ficha de lugar)                                                                                   | Code                                                 | `--fs-ui-lg` 20px / `--fs-ui-xl` 28px |
| `.linaje-nivel-titulo` ("Nivel 1/2")                                                                                                                      | Code, como `<p>` (antes era `h4`)                    | `--fs-ui-sm`                          |

**Bloques que mezclan serif y monoespaciada:** quedan solo por diseño, con roles fijos. La ceja y el
subtítulo de `PageHeader` van en Code; el h1, en Fell. En las fichas, la etiqueta va en Code y el
título o la prosa en Fell o en Crimson. Ningún título usa ya una familia de interfaz.

---

## 3. Tamaños

| Token             | Valor                                                  | Usos |
| ----------------- | ------------------------------------------------------ | ---- |
| `--fs-sm`         | 1rem · 16px                                            | 18   |
| `--fs-base`       | 1.1875rem · 19px                                       | 8    |
| `--fs-lead`       | clamp 19 → 22px                                        | 1    |
| `--fs-title`      | clamp 22 → 28px                                        | 3    |
| `--fs-title-home` | clamp(1rem, (50vw − 5rem) / 33.2, 1.75rem) · 16 → 28px | 1    |
| `--fs-h2`         | 1.5rem · 24px                                          | 2    |
| `--fs-h3`         | 1.25rem · 20px                                         | 4    |
| `--fs-h4`         | 1.1875rem · 19px                                       | 6    |
| `--fs-ui-xs`      | 0.6875rem · 11px                                       | 40   |
| `--fs-ui-sm`      | 0.8125rem · 13px                                       | 63   |
| `--fs-ui-md`      | 0.875rem · 14px                                        | 25   |
| `--fs-ui-lg`      | 1.25rem · 20px                                         | 8    |
| `--fs-ui-xl`      | 1.75rem · 28px                                         | 1    |

**Valores hardcodeados: ninguno** en SCSS, Astro ni JS. Los antiguos `10px` (`f804311`),
`0.85rem` (`afcffb1`) y `0.85em` pasaron a `--fs-ui-xs`, `--fs-ui-sm` y `--fs-ui-xs`.

**Fuera del repo:** `ol/ol.css` fija `10px` y `12px` en los controles de OpenLayers, y d3-axis
escribe `font-size="10"` en el grupo de cada eje. Este último lo pisa la clase de cada `<text>`.

### Detalle por propiedad

Rutas relativas a `src/styles/` (`pages/` omitido), `src/components/` o `src/scripts/charts/`.

#### `font-family`

| Valor                 | Equivale a | Usos | Dónde                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------- | ---------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `var(--font-ui)`      |            | 105  | `PageHeader.astro` 88; `CrimenesPorTipo.ts` 309; `_reset.scss` 33; `_typography.scss` 51, 56; `global.scss` 300, 309, 332, 342, 370, 380, 422; `botones.scss` 18, 40, 52, 66, 83, 115; `caso.scss` 51, 71, 90, 126, 143, 223, 246, 257, 292, 333, 339, 369, 376, 411, 444, 493, 543, 562; `composicion.scss` 34, 83, 97, 127, 164, 250, 276, 311, 371, 377, 475, 482, 509, 557, 641, 713, 748; `crimenesPorTipo.scss` 33, 48, 70, 124, 146, 181, 214, 272, 300, 310; `graficos.scss` 23; `linaje.scss` 87, 220, 262, 347, 381; `lineaTiempoCasos.scss` 24, 81, 110, 147, 211, 244, 304, 344, 382, 492, 517; `mapa.scss` 18, 303, 388, 396, 428, 469, 519, 526, 545, 926; `paneles-filtro.scss` 22, 86, 144; `preguntasTarjetas.scss` 50, 121; `sunburst.scss` 10; `tablaGeneral.scss` 20, 75, 125, 182, 210, 332, 347, 354; `tooltips.scss` 20 |
| `var(--font-body)`    |            | 13   | `_reset.scss` 14; `caso.scss` 22, 473; `crimenesPorTipo.scss` 158, 244; `linaje.scss` 328; `lineaTiempoCasos.scss` 284, 418; `mapa.scss` 318, 405, 552, 790; `paneles-filtro.scss` 156                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `var(--font-display)` |            | 12   | `_typography.scss` 9, 19, 30; `global.scss` 198; `caso.scss` 237; `composicion.scss` 189, 517; `linaje.scss` 332; `mapa.scss` 296, 355, 421; `paneles-filtro.scss` 29                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

#### `font-size`

| Valor                  | Equivale a       | Usos | Dónde                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------- | ---------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `var(--fs-ui-sm)`      | 0.8125rem · 13px | 63   | `PageHeader.astro` 99; `CrimenesPorTipo.ts` 309; `global.scss` 371; `botones.scss` 12, 34, 46, 62, 79, 114; `caso.scss` 52, 72, 91, 131, 295, 372, 419, 445, 494, 563; `composicion.scss` 35, 128, 165, 277, 317, 381, 488, 532, 558, 611, 642, 690, 714, 749, 790; `linaje.scss` 88, 348, 380; `lineaTiempoCasos.scss` 25, 111, 212, 383, 407, 439, 469, 493, 518; `mapa.scss` 429, 527, 546, 657, 805, 816, 880; `paneles-filtro.scss` 84, 117, 143; `preguntasTarjetas.scss` 51, 122; `sunburst.scss` 24, 40; `tablaGeneral.scss` 364, 401; `tooltips.scss` 19 |
| `var(--fs-ui-xs)`      | 0.6875rem · 11px | 40   | `PageHeader.astro` 94; `global.scss` 409; `caso.scss` 141, 224, 258, 377, 544; `composicion.scss` 84, 251, 510, 700; `crimenesPorTipo.scss` 34, 49, 71, 125, 215, 273, 317; `linaje.scss` 263, 282; `lineaTiempoCasos.scss` 82, 148, 245, 303; `mapa.scss` 304, 389, 470, 811, 822, 832, 875, 885, 889, 902; `paneles-filtro.scss` 41, 126; `sunburst.scss` 29; `tablaGeneral.scss` 76, 333, 348                                                                                                                                                                  |
| `var(--fs-ui-md)`      | 0.875rem · 14px  | 25   | `global.scss` 310, 333, 343, 382; `caso.scss` 67, 248, 334, 342; `composicion.scss` 98, 607, 615, 685; `crimenesPorTipo.scss` 147; `linaje.scss` 162, 257; `lineaTiempoCasos.scss` 230, 399; `mapa.scss` 520, 869; `tablaGeneral.scss` 36, 126, 183, 211, 385; `tooltips.scss` 44                                                                                                                                                                                                                                                                                 |
| `var(--fs-sm)`         | 1rem · 16px      | 18   | `global.scss` 202; `caso.scss` 192, 474, 551, 569; `composicion.scss` 341, 356, 523, 592; `crimenesPorTipo.scss` 156, 245; `linaje.scss` 368; `lineaTiempoCasos.scss` 282, 419; `mapa.scss` 319, 406, 553; `paneles-filtro.scss` 157                                                                                                                                                                                                                                                                                                                              |
| `var(--fs-base)`       | 1.1875rem · 19px | 8    | `_reset.scss` 15; `_typography.scss` 41; `caso.scss` 23; `historiaMetodologia.scss` 89; `linaje.scss` 362; `mapa.scss` 792, 800; `preguntasTarjetas.scss` 134                                                                                                                                                                                                                                                                                                                                                                                                     |
| `var(--fs-ui-lg)`      | 1.25rem · 20px   | 8    | `caso.scss` 582; `composicion.scss` 483; `crimenesPorTipo.scss` 311; `historiaMetodologia.scss` 142; `lineaTiempoCasos.scss` 368; `mapa.scss` 190, 397; `tablaGeneral.scss` 30                                                                                                                                                                                                                                                                                                                                                                                    |
| `var(--fs-h4)`         | 1.1875rem · 19px | 6    | `caso.scss` 240, 280; `composicion.scss` 518; `mapa.scss` 297, 422; `paneles-filtro.scss` 30                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `var(--fs-h3)`         | 1.25rem · 20px   | 4    | `composicion.scss` 334, 448; `linaje.scss` 333; `mapa.scss` 356                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `var(--fs-title)`      | 22 → 28px        | 3    | `PageHeader.astro` 104; `_typography.scss` 20; `home.scss` 138                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `var(--fs-h2)`         | 1.5rem · 24px    | 2    | `_typography.scss` 31; `composicion.scss` 190                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `var(--fs-ui-xl)`      | 1.75rem · 28px   | 1    | `composicion.scss` 312                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `var(--fs-lead)`       | 19 → 22px        | 1    | `home.scss` 29                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `var(--fs-title-home)` | 16 → 28px        | 1    | `home.scss` 84                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

#### `font-weight`

| Valor                | Equivale a | Usos | Dónde                                                                                                                                                                                                                                                                                                                         |
| -------------------- | ---------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `var(--fw-bold)`     | 700        | 35   | `caso.scss` 296, 420; `composicion.scss` 149, 252, 278, 511, 695, 793, 798; `crimenesPorTipo.scss` 35, 61, 126, 142, 148, 312; `linaje.scss` 89, 264; `lineaTiempoCasos.scss` 26, 112, 149, 213, 246, 384, 400, 494, 519; `mapa.scss` 521, 658, 806, 828, 870; `preguntasTarjetas.scss` 123; `tablaGeneral.scss` 31, 184, 212 |
| `var(--fw-semibold)` | 600        | 22   | `botones.scss` 19, 41, 67, 84, 116; `caso.scss` 53, 92, 132, 335, 385, 564; `composicion.scss` 36, 750; `crimenesPorTipo.scss` 50, 274; `linaje.scss` 307, 382; `mapa.scss` 903; `preguntasTarjetas.scss` 52; `tablaGeneral.scss` 127, 365; `tooltips.scss` 45                                                                |
| `var(--fw-regular)`  | 400        | 11   | `_typography.scss` 10; `global.scss` 203; `caso.scss` 239; `composicion.scss` 484, 519; `lineaTiempoCasos.scss` 83; `mapa.scss` 298, 357, 423, 824; `paneles-filtro.scss` 31                                                                                                                                                  |

#### `font-style`

| Valor    | Equivale a | Usos | Dónde                                                                                                                                                                                                                                                                                              |
| -------- | ---------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `italic` |            | 20   | `_typography.scss` 14; `global.scss` 199, 423; `caso.scss` 191, 476, 570, 598; `composicion.scss` 349; `crimenesPorTipo.scss` 157; `graficos.scss` 28, 34; `linaje.scss` 369; `lineaTiempoCasos.scss` 283, 420; `mapa.scss` 407, 554, 791, 817; `paneles-filtro.scss` 127; `tablaGeneral.scss` 474 |

#### `line-height`

| Valor               | Equivale a | Usos | Dónde                                                                                                                                                                                              |
| ------------------- | ---------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `var(--lh-tight)`   | 1          | 12   | `caso.scss` 241, 249, 256, 583; `composicion.scss` 313; `crimenesPorTipo.scss` 62, 149; `historiaMetodologia.scss` 143; `lineaTiempoCasos.scss` 369; `mapa.scss` 191, 358; `tablaGeneral.scss` 386 |
| `var(--lh-normal)`  | 1.5        | 8    | `PageHeader.astro` 89; `caso.scss` 193, 552; `crimenesPorTipo.scss` 246; `home.scss` 30; `lineaTiempoCasos.scss` 422, 451; `mapa.scss` 320                                                         |
| `var(--lh-snug)`    | 1.25       | 8    | `PageHeader.astro` 105; `composicion.scss` 335, 479; `linaje.scss` 265, 283; `preguntasTarjetas.scss` 53, 124; `tablaGeneral.scss` 26                                                              |
| `var(--lh-relaxed)` | 1.7        | 6    | `_reset.scss` 16; `_typography.scss` 42; `caso.scss` 24; `historiaMetodologia.scss` 90; `linaje.scss` 363; `preguntasTarjetas.scss` 135                                                            |

#### `text-transform`

| Valor       | Equivale a | Usos | Dónde                                                                                                                                                                                                                                         |
| ----------- | ---------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uppercase` |            | 19   | `PageHeader.astro` 95; `_typography.scss` 15; `global.scss` 204, 372; `caso.scss` 54, 140, 225, 259, 298, 378, 545; `composicion.scss` 85, 253, 512; `linaje.scss` 90; `mapa.scss` 390; `paneles-filtro.scss` 43; `tablaGeneral.scss` 77, 349 |
| `none`      |            | 1    | `PageHeader.astro` 110                                                                                                                                                                                                                        |

#### `font`

| Valor     | Equivale a | Usos | Dónde            |
| --------- | ---------- | ---- | ---------------- |
| `inherit` |            | 1    | `_reset.scss` 26 |

---

## 4. Pesos, estilos, interlineado, tracking y mayúsculas

- **Pesos:** 3 tokens, sin valores numéricos sueltos. IM Fell va siempre en `--fw-regular`, porque
  solo tiene la cara 400.
- **Itálica:** 20 declaraciones, incluida `h1 { font-style: italic }`.
- **Interlineado:** 4 tokens (`--lh-tight` 1, `--lh-snug` 1.25, `--lh-normal` 1.5,
  `--lh-relaxed` 1.7), sin valores sueltos.
- **Tracking:** **0 declaraciones** de espaciado entre letras en SCSS, Astro y JS. Todo va con el
  espaciado natural de cada fuente. El token `$tracking: 0` / `--tracking` de los tokens de
  componentes UI (fase 0) existe pero no se aplica en ninguna regla.
- **Mayúsculas:** 19 `uppercase` (cejas, etiquetas de campo, encabezados de tabla, nav y h1).
  Un `text-transform: none` en el modificador de caso de `PageHeader`.

---

## 5. Variables

- **Todos los tokens tipográficos se usan.** Los eliminados en la fase 3 (`--font-mono`,
  `--mapa-font`, `--fs-3xs`, `-2xs`, `-xs`, `-md`, `-lg`, `-xl`, `-2xl`, `-3xl`, `-4xl`) no tienen
  referencias.
- **Layout:** `--ancho-pagina` 1240px, `--margen-pagina` clamp(1rem, 4vw, 3rem) y
  `--ancho-visualizacion` 1700px. Además está `--espacio-bloques`, un valor local en
  `tg-pagina` y `cs-pagina` para que el `gap` de esas páginas no sume espacio bajo el encabezado.
- **Sin redefiniciones en conflicto:** `.section-title` tiene una sola definición de tamaño;
  `caso.scss` ya no la pisa.

---

## 6. Encabezado de página

`src/components/PageHeader.astro` lleva ceja opcional, h1, subtítulo opcional y un slot `extra`
(a la derecha, alineado a la base del bloque; en pantallas angostas pasa debajo).

| Página                   | Ceja                     | Subtítulo                    | Slot `extra`                               |
| ------------------------ | ------------------------ | ---------------------------- | ------------------------------------------ |
| about                    | —                        | —                            | —                                          |
| estudios de caso         | —                        | —                            | —                                          |
| tiempo                   | —                        | —                            | —                                          |
| base de datos            | Archivo general          | período (lo actualiza el JS) | contador de registros                      |
| personas / otros agentes | Agentes registrados      | texto de ayuda               | —                                          |
| caso                     | Caso ID (lo llena el JS) | —                            | etiquetas de año y lugar (las llena el JS) |

**Medido en Chrome:** en las 7 páginas internas, el
encabezado empieza a **100px del borde y 48px bajo el nav a 1440px**, y a **16px y 48px a 390px**.
El ancho es de 1240px y 358px respectivamente. No hay línea divisoria bajo ningún encabezado, home
incluido. Las visualizaciones anchas (rueda del linaje en about; selector, filtros y mapa en
tiempo) usan hasta 1700px centradas, debajo del encabezado.

---

## 7. Comparación con el sistema previsto

| Regla                                                       | Estado                             |
| ----------------------------------------------------------- | ---------------------------------- |
| IM Fell en todos los títulos, h1–h6 y títulos de tarjeta    | ✓                                  |
| IM Fell en el nav y el título del proyecto                  | ✓                                  |
| h1 de página en itálica, incluido el home                   | ✓ (y en mayúsculas, salvo caso)    |
| Crimson Pro solo para contenido editorial                   | ✓                                  |
| Source Code Pro para datos e interfaz                       | ✓                                  |
| Sin la familia de interfaz anterior ni respaldos sin serifa | ✓                                  |
| Crimson Pro con base de 18–20px                             | ✓ 19px; piso de 16px               |
| Ningún título por encima del h1                             | ✓ (`--fs-h2` 24 < `--fs-title` 28) |
| Tamaños, pesos e interlineados solo con tokens              | ✓                                  |
| Sin espaciado entre letras                                  | ✓                                  |

### Excepciones

1. **Título del home más chico que el lead en escritorio.** Para que quede en dos líneas en la
   columna del hero (`50vw − 5rem`), el título mide 16,9px a 1280px, 19,3px a 1440px y 26,5px a
   1920px. El lead mide 22px. La jerarquía la sostienen las mayúsculas, la itálica y la familia,
   no el tamaño. Por debajo de unos 1220px el título queda en 3 líneas (mínimo de 16px), y en móvil
   en 5 (a `--fs-title`, 22px).
2. **h1 de caso sin mayúsculas**, por decisión. Es la descripción completa del caso.
3. **`--fs-h4` y `--fs-base` miden lo mismo (19px).** Los títulos de tarjeta se distinguen del
   cuerpo por la familia.
4. **La cifra de las tarjetas de personas (`--fs-ui-xl`, 28px) iguala al h1 en escritorio.** Es una
   cifra, no un título.
5. **Resuelto:** la negrilla dentro de `.crime-descripcion` (itálica) usaba una 700 itálica
   sintética. Ahora se carga Crimson Pro itálica 700.
6. **Resuelto:** Crimson Pro 600 no se usaba en ninguna página medida y se quitó del enlace.
7. **Ancho de tiempo:** además del mapa, el selector de vistas y el panel de filtros llegan a
   1700px. Forman parte del tablero.
8. **Resuelto:** se borraron las 11 reglas tipográficas muertas (`.about-tab`, `a.card h3`,
   `.btn-descarga`, `.vista-toggle-btn`, `.vista-historia-placeholder`, `.btn-descargar-datos`,
   `.grafico-eje-texto`, `.grafico-etiqueta-serie`, `.mapa-linea-nota`, `.filtro-label--chico`,
   `.filtro-select--compacto`), con sus variantes. `faq.scss` quedó vacío y se eliminó.
9. **Búsqueda de la familia eliminada y de las genéricas sin serifa en todo el repo:** cero
   coincidencias en código. Quedan coincidencias fuera del código: `MIGRATION.md` (3 líneas
   históricas, no se toca) y dos falsos positivos en los datos (`public/data/crimenes.csv` y
   `DescripcionesNegrilla.csv`: un apellido y una palabra común que contienen la cadena buscada).
   Propiedad de espaciado entre letras (CSS y JS): cero coincidencias en todo el repo.

### Pendientes que ya existían (para después)

1. **Scroll horizontal del mapa en móvil:** en tiempo a 390px el documento mide 417px de ancho
   (antes 616px). El de about se corrigió al hacer que el selector de vistas se reacomode en móvil.
2. **Título del proyecto en el nav en 4 líneas en móvil:** el `<br>` fuerza dos segmentos, y cada
   uno vuelve a partirse a 390px.
