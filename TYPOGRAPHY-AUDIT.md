# Auditoría de tipografía

Diagnóstico de solo lectura del estado de la tipografía al 17 de octubre de 2026 (rama
`colores-visualizaciones`, HEAD `f804311`). **No se modificó código.**

> Este archivo reemplaza la auditoría anterior (`TYPOGRAPHY-AUDIT.md`, commit `da71fee`). En macOS
> los dos nombres son el mismo archivo. Esa versión describía el sistema **anterior** a `da71fee`,
> cuando `--font-body` era Source Sans 3 y existían `$font-mapa`, `$font-sistema` y `$font-sans`.
> Para recuperarla: `git show da71fee:TYPOGRAPHY-AUDIT.md`.

**Alcance:** los 12 `.astro`, las 22 `.scss`, los 23 `.ts` de `src/`, los `.mjs` de `tools/`,
`astro.config.mjs` y el CSS de terceros que se importa (`ol/ol.css`, `lenis/dist/lenis.css`).
**Excluidos:** `node_modules/` (salvo esos dos CSS) y `dist/`, que es salida de build obsoleta.

**Método:** extracción automática de cada declaración `font-family`, `font-size`, `font-weight`,
`font-style`, `line-height`, `letter-spacing`, `text-transform` y `font`, en CSS y en JS (`.attr`,
`.style`, `style.cssText`, opciones `fontFamily`/`fontSize`). Después se relacionó cada declaración
con su selector y se siguió la herencia a mano en los casos dudosos. En las tablas de las secciones 3
y 4 la línea es la de la declaración. En la sección 2 es la del selector.

**Totales:** 125 `font-family`, 192 `font-size`, 74 `font-weight`, 22 `font-style`, 34
`line-height`, 30 `letter-spacing`, 23 `text-transform`, 2 `font` abreviado. Todo está en SCSS
salvo una declaración en JS.

---

## Resumen

- **Familias cargadas:** cuatro. IM Fell English, Crimson Pro, Source Sans 3 y Source Code Pro. La
  cuarta (monoespaciada) no está en el sistema previsto.
- **Source Sans 3 no se usa solo en gráficas.** De sus 76 declaraciones, 20 están dentro de
  gráficas, 37 en controles y paneles junto a las gráficas y 19 en interfaz general (tabla,
  ficha de caso, encabezados de página).
- **Hay texto de gráficas en serif.** 18 declaraciones usan `--mapa-font` (alias de Crimson Pro).
  Siete de ellas son texto SVG dentro del mapa y del donut.
- **Dos gráficas tienen los ejes en una sans genérica.** En el mapa (línea temporal) y en el spike
  de Crímenes por tipo, las etiquetas de los ejes no salen en Source Sans 3. D3 pone
  `font-family="sans-serif"` en el `<g>` del eje y ninguna regla CSS lo corrige ahí.
- **Seis botones usan la fuente del navegador.** No hay `button { font: inherit }` global, y estos
  seis no declaran familia.
- **Todos los h1–h6 están en IM Fell**, pero varios títulos de tarjeta y de panel que no son
  encabezados (`.mapa-tarjeta-titulo`, `.panel-filtros-titulo`, `.crime-name`,
  `.linaje-nivel-titulo`) están en Crimson Pro o en Source Sans 3.
- **La escala de tamaños se respeta casi siempre** (188 de 192). Los problemas son de diseño de la
  escala: cuatro pasos de 1px entre 10 y 13px, y 15px contra 16px para el texto corrido.
- **No hay tokens para peso ni para tracking.** Hay 13 valores distintos de `letter-spacing`, todos
  hardcodeados.

---

## 1. Familias tipográficas

### Declaración

Todas las pilas se declaran en `src/styles/abstracts/_variables.scss` y se emiten como custom
properties en `src/styles/abstracts/_root.scss`.

| Token SCSS | Pila | Custom property | Usos directos |
|---|---|---|---|
| `$font-display` (`_variables.scss:43`) | `'IM Fell English', Georgia, serif` | `--font-display` (`_root.scss:47`) | 16 |
| `$font-body` (`_variables.scss:44`) | `'Crimson Pro', Georgia, serif` | `--font-body` (`_root.scss:48`) | 8 (+ herencia desde `body`) |
| `$font-ui` (`_variables.scss:45`) | `'Source Sans 3', system-ui, sans-serif` | `--font-ui` (`_root.scss:49`) | 76 |
| `$font-mono` (`_variables.scss:46`) | `'Source Code Pro', monospace` | `--font-mono` (`_root.scss:50`) | 7 |
| *(ninguno)* | `var(--font-body)` | `--mapa-font` (`_root.scss:51`) | 18 |

`--mapa-font` es un alias de `--font-body` que solo existe como custom property. No tiene variable
SCSS y su nombre no sigue el patrón `--font-*`.

### Carga

**Un solo punto de carga:** `src/layouts/BaseLayout.astro:46-52`, que llega a todas las páginas.

```
https://fonts.googleapis.com/css2
  ?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400
  &family=IM+Fell+English:ital@0;1
  &family=Source+Code+Pro:wght@400;600
  &family=Source+Sans+3:ital,wght@0,400;0,600;0,700;0,800;1,400
  &display=swap
```

Hay `preconnect` a `fonts.googleapis.com` y a `fonts.gstatic.com` (`BaseLayout.astro:46-47`).

| Familia | Caras cargadas | Caras que se piden en el CSS |
|---|---|---|
| IM Fell English | 400, 400 itálica | 400 (h1–h6, 16 reglas), 400 itálica (nav, `.case-title`) |
| Crimson Pro | 400, 600, 700, 400 itálica | 400, 600, 700, 400 itálica |
| Source Sans 3 | 400, 600, 700, 800, 400 itálica | 400, 600, 700, 800, 400 itálica (`.cargando`) |
| Source Code Pro | 400, 600 | 400, 600 y **700 implícito** (`th` es negrita por defecto, ver §6) |

- **`@font-face`:** ninguna en el repositorio.
- **`@import` de fuentes:** ninguno.
- **Archivos de fuente locales:** ninguno (no hay `.woff`, `.woff2`, `.ttf`, `.otf` ni `.eot`
  versionados).
- **Familias definidas desde JS:** ninguna. Ningún `.ts` llama `.attr('font-family')`,
  `.style('font-family')` ni usa `fontFamily`. El repo **no usa Observable Plot**: no está en
  `package.json`. El único `style: { fontFamily: 'var(--font-ui)' }` se eliminó en `758d0a9`.
- **Familias que vienen de librerías, sin cargar:**
  - `sans-serif` genérica: d3-axis la escribe como atributo SVG en cada `<g>` de eje
    (`ComposicionLinea.ts:68,81`, `LineaTiempoCasos.ts:554,565`, `TiempoCrimenesMapa.ts:1558,1568,1589`,
    `CrimenesPorTipo.ts:338,343`). Se ve en dos gráficas (ver §6).
  - La fuente de botones del navegador (en macOS, `system-ui` a 13.33px) aparece en los seis botones
    sin `font-family` (ver §6).
  - `ol/ol.css` (importado en `mapaBaseTopografico.ts:7`) no fija familia, así que la atribución del
    mapa hereda IM Fell de `#mapa-contenedor`. Además fija `font-size: 10px` y `12px`.

### Dónde se usa cada familia

Rutas relativas a `src/styles/` (`pages/` omitido).

| Valor | Usos | Dónde |
|---|---|---|
| `var(--font-ui)` | 76 | `global.scss` 320, 473, 504, 538; `botones.scss` 18, 40, 53, 67, 84, 116; `caso.scss` 52, 73, 92, 468, 516; `composicion.scss` 36, 60, 116, 161, 198, 287, 314, 409, 545, 595, 679, 751, 786; `crimenesPorTipo.scss` 33, 48, 70, 146, 181, 214, 272, 300, 310; `faq.scss` 16; `graficos.scss` 23; `linaje.scss` 83, 217, 259, 344, 378; `lineaTiempoCasos.scss` 24, 81, 110, 147, 211, 244, 304, 382, 491, 516; `mapa.scss` 18, 371, 412, 453, 503, 510, 529, 921; `paneles-filtro.scss` 90, 148; `preguntasTarjetas.scss` 50, 121; `sunburst.scss` 10; `tablaGeneral.scss` 43, 105, 156, 213, 362, 377; `tooltips.scss` 20, 32, 39 |
| `var(--mapa-font)` | 18 | `crimenesPorTipo.scss` 124, 158, 244, 317; `lineaTiempoCasos.scss` 284, 344; `mapa.scss` 278, 286, 301, 536, 774, 791, 797, 804, 810, 821; `paneles-filtro.scss` 22, 165 |
| `var(--font-display)` | 16 | `_typography.scss` 9, 14, 28; `global.scss` 200, 288, 351; `caso.scss` 133, 178; `composicion.scss` 223, 349, 518, 554; `linaje.scss` 329; `mapa.scss` 338, 380, 405 |
| `var(--font-body)` | 8 | `_reset.scss` 14; `global.scss` 360, 383, 393; `caso.scss` 22; `composicion.scss` 131; `linaje.scss` 325; `mapa.scss` 389 |
| `var(--font-mono)` | 7 | `global.scss` 421; `caso.scss` 125, 173, 256, 289, 400, 566 |

**Por herencia:**

- `body` usa `--font-body` (`base/_reset.scss:14`). `pages/caso.scss:22` lo repite. Todo el texto
  sin `font-family` propio sale en Crimson Pro, salvo controles de formulario (§6).
- `#mapa-contenedor` usa `--font-display` (`global.scss:351`). Todo lo que hay dentro del mapa y no
  declara familia sale en IM Fell, incluida la atribución de OpenLayers.
- Los SVG con clase `.grafico-svg`, `.sunburst-svg`, `.cs-svg`, `.crimenes-tipo-spike-svg`,
  `.crimenes-tipo-donut-svg` y `.mapa-linea-svg` usan `--font-ui`, y su texto lo hereda.
  `.mapa-svg` (el mapa) y `.linea-tiempo-casos-linea-svg` **no** fijan familia.

---

## 2. Qué familia usa cada tipo de elemento

Abreviaturas: **Fell** = IM Fell English, **Crimson** = Crimson Pro, **Sans** = Source Sans 3,
**Mono** = Source Code Pro. La línea es la del selector.

### Encabezados h1–h6

Regla base: `h1–h6 { font-family: var(--font-display); font-weight: 400 }`
(`base/_typography.scss:8`). **Todos los encabezados reales salen en Fell.**

| Elemento | Dónde aparece | Familia · tamaño | Regla |
|---|---|---|---|
| `h1.section-mainTitle` | home, about, estudios-de-caso, tiempo | Fell · 32px · 0.02em | `_typography.scss:13` |
| `h1.tg-titulo` | base-de-datos | Fell · 44px (32px en móvil) | `tablaGeneral.scss:33, 532` |
| `h1.cs-titulo` | personas | Fell · 44px | `composicion.scss:43` |
| `h1.case-title` | caso (`caso.ts:204`) | Fell **itálica** · clamp 24→32px | `caso.scss:132` |
| `h2` en `<section>` | about (6) | Fell · 24px | `_typography.scss:27` |
| `h2.section-title` | caso (`caso.ts:431`) | Fell · **18px** (`caso.scss` pisa los 24px globales) | `caso.scss:177` |
| `h2.cs-seccion-titulo` | personas (2) | Fell · **11px versalitas 0.2em** | `composicion.scss:216` |
| `h3.cs-panel-titulo` | personas (4) | Fell · 24px | `composicion.scss:370` |
| `h3.cs-rol-titulo` | personas (`ComposicionSocial.ts:242`) | Fell · 18px | `composicion.scss:480` |
| `h3.linaje-panel-titulo` | about (`Linaje.ts:58`) | Fell · 24px | `linaje.scss:328` |
| `h3.lugar-ficha-titulo` | tiempo (`TiempoCrimenesMapa.ts:395`) | Fell · 32px | `mapa.scss:334` |
| `h4` sin clase | caso (`caso.ts:248`) | Fell · tamaño del navegador | — |
| `h4.ficha-titulo` | caso (`caso.ts:302`) | Fell · tamaño del navegador (la clase no tiene regla) | — |
| `a.card h3` | **no existe en el markup** | Fell · 18px | `global.scss:287` (regla muerta) |

### Títulos que no son `<h*>`

Cumplen función de título, pero no usan Fell.

| Clase | Dónde | Familia · tamaño · peso | Regla |
|---|---|---|---|
| `.mapa-tarjeta-titulo` | tiempo, 6 tarjetas ("Instrucciones", "Top de crimenes", …) | **Crimson** · 15px · 700 | `mapa.scss:277` |
| `.mapa-tarjeta-subtitulo` | tiempo | Crimson · 11px | `mapa.scss:285` |
| `.panel-filtros-titulo` | tiempo | **Crimson** · 15px · 700 | `paneles-filtro.scss:28` |
| `.crime-name` | caso | **Crimson** · 24px · 700 | `caso.scss:270` |
| `.linaje-nivel-titulo` | about | **Sans** · 12px · 700 · versalitas | `linaje.scss:81` |
| `.cs-rol-delito-titulo` | personas | **Sans** · 11px · 700 · versalitas | `composicion.scss:544` |
| `.tg-activos-titulo` | base-de-datos | **Sans** · 11px · versalitas | `tablaGeneral.scss:375` |
| `.mapa-linea-titulo` (SVG) | tiempo, dentro de la gráfica | Sans · 15px · 700 | `mapa.scss:857` |
| `.mapa-capsula-titulo` (SVG) | tiempo, dentro del mapa | **Crimson** · 12px · 700 | `mapa.scss:788` |

### ⚠ Bloques de título que mezclan serif y sans

| Bloque | Composición |
|---|---|
| Cabecera de base-de-datos (`base-de-datos/index.astro:15-16`) | `p.tg-subtitulo` **Sans** 12px versalitas 0.2em + `h1.tg-titulo` **Fell** 44px + `.tg-conteo` **Crimson** 700 |
| Cabecera de personas (`_ComposicionSocial.astro:37-38`) | `p.cs-eyebrow` **Sans** 11px versalitas 0.22em + `h1.cs-titulo` **Fell** 44px |
| Cabecera de caso (`caso.ts:203-204`) | `p.case-eyebrow` **Mono** 11px versalitas 0.16em + `h1.case-title` **Fell** itálica |
| Tarjetas de personas (`.cs-tarjeta`) | `.cs-tarjeta-nombre` **Sans** versalitas + `.cs-tarjeta-valor` **Fell** 44px + `.cs-tarjeta-sub` **Crimson** (tres familias) |
| Rol en personas (`ComposicionSocial.ts:242-261`) | `h3.cs-rol-titulo` **Fell** + `.cs-rol-delito-titulo` **Sans** + `strong.cs-rol-delito-nombre` **Fell** |
| Ficha de lugar en el mapa (`.lugar-ficha-*`) | título **Fell** + `-dato-etiqueta` **Sans** + `-dato-valor` **Fell** + `-subtitulo` **Fell** + `-resumen` **Sans** + `-notas` **Crimson** itálica |
| Ficha de caso, campos (`caso.scss:285, 399`) | `.crime-field-label` / `.sf-label` **Mono** + valor **Crimson** |

Hay además un caso de **mismo estilo con distinta familia**. `h2.cs-seccion-titulo` (Fell, 11px,
versalitas, 0.2em) tiene el aspecto de una ceja (*eyebrow*), igual que `.cs-eyebrow`, `.tg-subtitulo`
y `.tg-etiqueta`, que están en Sans.

### Navegación

| Elemento | Familia | Regla |
|---|---|---|
| `.logo` (título del proyecto en el nav, ahora en 2 líneas) | Fell **itálica** · 15px · 400 · versalitas · 0.1em | `global.scss:199` |
| `.nav-links a` | Fell **itálica** · 15px · 400 · versalitas · 0.1em | `global.scss:199` |
| `.nav-toggle` | sin texto (icono) | — |
| Footer | sin texto | — |

### Cuerpo de texto

| Elemento | Familia · tamaño · interlineado | Regla |
|---|---|---|
| `body` | Crimson · **16px** · 1.7 | `_reset.scss:11` (repetido en `caso.scss:19`) |
| `p` (global) | hereda Crimson · **15px** · 1.7 | `_typography.scss:39` |
| `.historia-slide-texto`, `.preguntas-tarjetas-respuesta`, `.linaje-panel-definicion` | Crimson · 15px · 1.7 | `historiaMetodologia.scss:86`, `preguntasTarjetas.scss:127`, `linaje.scss:358` |
| `.mapa-tarjeta-parrafo` | Crimson · 13px · 1.5 | `mapa.scss:300` |
| `.tabla-datos td` | Crimson · 15px | `global.scss:431` |
| `.agent-meta`, `.crime-sub` | Crimson · 15px | `caso.scss:364, 278` |

### Captions, notas y estados vacíos

| Elemento | Familia | Regla |
|---|---|---|
| `.cs-medidor figcaption strong` / `span` | **Fell** 24px / Crimson 13px | `composicion.scss:517, 523` |
| `.cs-nota`, `.cs-pista`, `.cs-panel-subtitulo` | Crimson 13px | `composicion.scss:391, 82, 376` |
| `.crimenes-tipo-nota`, `.linea-tiempo-casos-nota` | Crimson 11px itálica | `crimenesPorTipo.scss:155`, `lineaTiempoCasos.scss:281` |
| `.crime-descripcion` | Crimson 13px itálica | `caso.scss:217` |
| `.mapa-aviso-vacio`, `.mapa-info-lugar-vacio`, `.filtro-aviso-sin-datos` | Crimson itálica 15 / 12 / 12px | `mapa.scss:768, 535`, `paneles-filtro.scss:156` |
| `.cs-vacio`, `.grafico-vacio`, `.agentes-vacio`, `.tg-vacio`, `.state-msg`, `.similares-vacio`, `.no-source` | Crimson itálica | varios |
| `.cargando` | **Sans** itálica | `global.scss:472` |

### Botones y controles

| Familia | Elementos | Reglas |
|---|---|---|
| **Sans** | `.btn-mapa-*` (5), `.btn-ver-casos-generico`, `.cs-pestaña`, `.cs-chip`, `.cs-restablecer`, `.cs-boton-mas`, `.cs-ver-casos`, `.cs-herramienta`, `.crimenes-tipo-donut-tab`, `.crimenes-tipo-fijados-*`, `.linaje-panel-boton`, `.linea-tiempo-casos-*__boton*`, `.linea-tiempo-casos-linea-reproducir`, `.back-link`, `.caso-nav-boton`, `.copiar-ref`, `.similares-tab`, `.tg-boton-buscar`, `.tg-check`, `.preguntas-tarjetas-pildora`, `.preguntas-tarjetas-chip` | `botones.scss`, `composicion.scss`, `crimenesPorTipo.scss`, `linaje.scss`, `lineaTiempoCasos.scss`, `caso.scss`, `tablaGeneral.scss`, `preguntasTarjetas.scss` |
| **Crimson** (`font: inherit`) | `.cs-tarjeta`, `.cs-enlace` | `composicion.scss:250, 564` |
| ⚠ **Fuente del navegador** | `.tg-limpiar`, `.tg-chip-quitar`, `.historia-flecha`, `.carrusel-flecha`, `.mapa-tarjeta-cerrar`, `.linea-tiempo-casos-panel-caso__cerrar` | `tablaGeneral.scss:426, 404`, `historiaMetodologia.scss:133`, `caso.scss:597`, `mapa.scss:166`, `lineaTiempoCasos.scss:362` |

### Formularios (select / input)

| Familia | Elementos | Reglas |
|---|---|---|
| **Crimson** | `.filtros-tabla select/input` (base-de-datos), `::picker(select)`, `option`, `.cs-select` | `global.scss:358, 380, 389`, `composicion.scss:123` |
| **Sans** | `.filtro-select`, `.filtro-combo-input` (tiempo), `.linaje-selector-crimen` (about) | `paneles-filtro.scss:141, 82`, `linaje.scss:338` |

Los selects salen en dos familias según la página.

### Tablas y ficha de caso

| Elemento | Familia | Regla |
|---|---|---|
| `.tabla-datos th` | **Mono** 12px versalitas 0.08em | `global.scss:418` |
| `.tabla-datos td` | Crimson 15px | `global.scss:431` |
| `.case-eyebrow`, `.meta-pill .label`, `[data-tooltip]::after`, `.crime-field-label`, `.sf-label`, `.similar-card-meta` | **Mono** 10–11px versalitas | `caso.scss:121, 168, 246, 285, 399, 563` |
| `.tg-etiqueta`, `.tg-subtitulo`, `.tg-marca` | Sans 11–12px | `tablaGeneral.scss:104, 40, 358` |

### Gráficas: etiquetas, ejes, leyendas y tooltips

| Gráfica | Ejes | Etiquetas / valores | Leyenda | Tooltip |
|---|---|---|---|---|
| Composición social: barras, línea, red (`ComposicionBarras/Linea/Red.ts`) | `.cs-eje-texto` **Sans** 12px ✓ | `.cs-barras-etiqueta`, `.cs-red-etiqueta` heredan Sans de `.cs-svg` ✓ | `.cs-leyenda-cuadros/-lineas` (HTML) **Crimson** 13px | Sans 12px ✓ |
| Sunburst (`DelitosSunburstGenero.ts`, `InstitucionesAtributo.ts`) | — | `.sunburst-etiqueta`, `-pct`, `-texto-central` heredan Sans ✓ | — | Sans ✓ |
| Crímenes por tipo, spike (`CrimenesPorTipo.ts:335`) | ⚠ **sans-serif genérica** (ver §6) | `.crimenes-tipo-nombre` **Crimson** 11px 700; `.crimenes-tipo-numero` Sans 16px 800 | `.crimenes-tipo-leyenda-chip` Sans ✓ | Sans ✓ |
| Crímenes por tipo, donut (`CrimenesPorTipo.ts:491`) | — | `-total-num` Sans 24px 800 ✓; `-total-label` **Crimson** 10px | — | Sans ✓ |
| Mapa (`TiempoCrimenesMapa.ts:942`, `.mapa-svg`) | — | `.mapa-capsula-*` (5 clases) **Crimson** 10–13px | — | Sans ✓ |
| Línea temporal del mapa (`.mapa-linea-svg`) | ⚠ **sans-serif genérica** | `.mapa-linea-titulo/-subtitulo/-etiqueta-serie` Sans ✓ | — | Sans ✓ |
| Línea de tiempo de casos (`LineaTiempoCasos.ts:549`) | Sans **10px hardcodeado** ✓ familia | `-anio-numero`, `-anio-conteo`, `-guia-fecha__etiqueta` Sans | `-leyenda-item` Sans ✓ | Sans ✓ |
| Linaje (`Linaje.ts`, nodos HTML) | — | `.linaje-nodo*` Sans ✓ | — | Sans 16px 600 (`--grande`) |
| Ficha de lugar junto al mapa | — | `.lugar-ficha-dato-valor` **Fell** 18px; `.lugar-ficha-crimen-nombre` Sans | — | — |
| Tarjetas y medidores de personas | — | `.cs-tarjeta-valor` **Fell** 44px; `.cs-medidor strong` **Fell** 24px | — | — |

---

## 3. Tamaños de fuente

**Escala** (`_variables.scss:49-59`, raíz de 16px):

| Token | rem | px | Usos |
|---|---|---|---|
| `--fs-3xs` | 0.625 | 10 | 15 |
| `--fs-2xs` | 0.6875 | 11 | 31 |
| `--fs-xs` | 0.75 | 12 | 40 |
| `--fs-sm` | 0.8125 | 13 | 42 |
| `--fs-md` | 0.9375 | 15 | 30 |
| `--fs-base` | 1 | 16 | 7 |
| `--fs-lg` | 1.125 | 18 | 8 |
| `--fs-xl` | 1.5 | 24 | 9 (+1 en `clamp`) |
| `--fs-2xl` | 2 | 32 | 3 (+1 en `clamp`) |
| `--fs-3xl` | 2.75 | 44 | 3 |
| `--fs-4xl` | 3.5 | 56 | **0** |

**Valores fuera de la escala:** 4 en el repo (`10px`, `0.85rem`, `0.85em` y un `clamp`). Hay otros
que vienen del navegador y de librerías:

| Origen | Valor | Dónde |
|---|---|---|
| d3-axis (atributo SVG) | `font-size="10"` | todos los ejes. En los cuatro casos lo pisa una clase en el `<text>` |
| `ol/ol.css` | `10px`, `12px` | atribución y controles de OpenLayers |
| Navegador | `1em` en `h4`; `13.33px` en `button` | los `h4` de `caso.ts:248, 302` |

### Detalle por valor

| Valor | Equivale a | Usos | Dónde |
|---|---|---|---|
| `var(--fs-sm)` | 0.8125rem · 13px | 42 | `global.scss` 321, 505; `botones.scss` 34; `caso.scss` 53, 74, 93, 225, 443, 469, 517, 575, 592; `composicion.scss` 61, 85, 162, 199, 355, 379, 394, 418, 524, 560, 570, 728, 752; `linaje.scss` 365, 377; `lineaTiempoCasos.scss` 212, 438, 492, 517; `mapa.scss` 302, 390, 641, 802; `paneles-filtro.scss` 88, 121, 147; `preguntasTarjetas.scss` 51; `sunburst.scss` 40; `tablaGeneral.scss` 394, 431 |
| `var(--fs-xs)` | 0.75rem · 12px | 40 | `global.scss` 422; `botones.scss` 12, 47, 63, 80, 115; `caso.scss` 159, 322, 396, 497, 586; `composicion.scss` 315, 596, 630, 649, 680, 787, 828; `crimenesPorTipo.scss` 245; `faq.scss` 15; `linaje.scss` 84, 345; `lineaTiempoCasos.scss` 25, 111, 383, 407, 418, 468; `mapa.scss` 413, 511, 530, 537, 789, 875; `paneles-filtro.scss` 153, 166; `preguntasTarjetas.scss` 122; `sunburst.scss` 24; `tablaGeneral.scss` 44; `tooltips.scss` 19 |
| `var(--fs-2xs)` | 0.6875rem · 11px | 31 | `caso.scss` 126, 567; `composicion.scss` 37, 117, 224, 288, 546, 738; `crimenesPorTipo.scss` 34, 49, 71, 125, 156, 215, 273; `graficos.scss` 40, 50; `lineaTiempoCasos.scss` 148, 245, 282, 303; `mapa.scss` 287, 809, 864, 884, 897; `paneles-filtro.scss` 40, 130; `tablaGeneral.scss` 106, 363, 378 |
| `var(--fs-md)` | 0.9375rem · 15px | 30 | `_typography.scss` 40; `global.scss` 204, 361, 384, 394, 433, 540; `caso.scss` 280, 367; `composicion.scss` 132, 645, 653, 723; `faq.scss` 46; `historiaMetodologia.scss` 89; `linaje.scss` 159, 254, 359; `mapa.scss` 279, 504, 776, 784, 858; `paneles-filtro.scss` 29; `preguntasTarjetas.scss` 134; `tablaGeneral.scss` 66, 157, 214, 241, 415 |
| `var(--fs-3xs)` | 0.625rem · 10px | 15 | `caso.scss` 170, 257, 290, 401; `crimenesPorTipo.scss` 318; `linaje.scss` 260, 279; `mapa.scss` 372, 454, 796, 820, 869, 880; `paneles-filtro.scss` 47; `sunburst.scss` 29 |
| `var(--fs-xl)` | 1.5rem · 24px | 9 | `_typography.scss` 29; `caso.scss` 273; `composicion.scss` 372, 519; `crimenesPorTipo.scss` 311; `linaje.scss` 330; `lineaTiempoCasos.scss` 368; `mapa.scss` 172; `tablaGeneral.scss` 60 |
| `var(--fs-lg)` | 1.125rem · 18px | 8 | `global.scss` 289; `caso.scss` 179, 605; `composicion.scss` 485, 555; `historiaMetodologia.scss` 142; `mapa.scss` 381, 406 |
| `var(--fs-base)` | 1rem · 16px | 7 | `_reset.scss` 15; `caso.scss` 23, 69; `crimenesPorTipo.scss` 147; `lineaTiempoCasos.scss` 230, 399; `tooltips.scss` 49 |
| `var(--fs-2xl)` | 2rem · 32px | 3 | `_typography.scss` 15; `mapa.scss` 339; `tablaGeneral.scss` 533 |
| `var(--fs-3xl)` | 2.75rem · 44px | 3 | `composicion.scss` 45, 350; `tablaGeneral.scss` 35 |
| `0.85rem` | 13.6px | 1 | `CrimenesPorTipo.ts` 309 |
| `0.85em` | relativo (≈10.2px en `th` de 12px) | 1 | `global.scss` 460 |
| `clamp(var(--fs-xl), 3vw, var(--fs-2xl))` | 24px → 32px | 1 | `caso.scss` 134 |
| `10px` | 10px (unidades del viewBox) | 1 | `lineaTiempoCasos.scss` 82 |

---

## 4. Pesos, estilos, interlineado, tracking y mayúsculas

No hay tokens de peso ni de `letter-spacing`. Hay tokens de interlineado (`--lh-*`), pero también
tres valores hardcodeados.

#### `font-weight`

| Valor | Usos | Dónde |
|---|---|---|
| `700` | 36 | `caso.scss` 272, 323, 444; `composicion.scss` 183, 289, 316, 547, 733, 831, 836; `crimenesPorTipo.scss` 35, 61, 126, 142; `linaje.scss` 85, 261; `lineaTiempoCasos.scss` 26, 112, 149, 213, 246, 384, 400, 493, 518; `mapa.scss` 280, 505, 642, 790, 816, 859; `paneles-filtro.scss` 30; `preguntasTarjetas.scss` 123; `tablaGeneral.scss` 61, 215, 242 |
| `600` | 27 | `global.scss` 322, 506, 539; `botones.scss` 19, 41, 68, 85, 117; `caso.scss` 54, 94, 160, 361, 410, 587; `composicion.scss` 62, 788; `crimenesPorTipo.scss` 50, 274; `faq.scss` 17; `graficos.scss` 51; `linaje.scss` 304, 379; `mapa.scss` 898; `preguntasTarjetas.scss` 52; `tablaGeneral.scss` 158, 395; `tooltips.scss` 50 |
| `400` | 8 | `_typography.scss` 10; `global.scss` 205; `composicion.scss` 520, 556; `lineaTiempoCasos.scss` 83; `mapa.scss` 340, 407, 812 |
| `800` | 2 | `crimenesPorTipo.scss` 148, 312 |
| `normal` | 1 | `caso.scss` 135 |

Además del CSS, hay pesos que vienen del navegador o del HTML:

- `th` es negrita por defecto (700). Pasa en `.tabla-datos th`, en Mono.
- `<strong>` y `<b>` en los HTML generados por JS: tooltips, `caso.ts`, `ComposicionSocial.ts`.
  En tooltips (Sans 700) y en la ficha de caso (Crimson 700) hay cara cargada.
- `normal` (`caso.scss:135`) es 400 escrito con palabra clave.

#### `font-style`

| Valor | Usos | Dónde |
|---|---|---|
| `italic` | 22 | `global.scss` 201, 474, 566; `caso.scss` 136, 224, 499, 593, 621; `composicion.scss` 387; `crimenesPorTipo.scss` 157; `graficos.scss` 28, 34; `linaje.scss` 366; `lineaTiempoCasos.scss` 283, 419; `mapa.scss` 391, 538, 775, 803, 870; `paneles-filtro.scss` 131; `tablaGeneral.scss` 504 |

Las 22 son `italic`. Ninguna regla pide itálica junto con un peso mayor que 400, y todas las
itálicas tienen cara cargada.

#### `line-height`

| Valor | Equivale a | Usos | Dónde |
|---|---|---|---|
| `var(--lh-tight)` | 1 | 10 | `caso.scss` 274, 281, 288, 606; `composicion.scss` 46; `crimenesPorTipo.scss` 149; `historiaMetodologia.scss` 143; `lineaTiempoCasos.scss` 369; `mapa.scss` 341; `tablaGeneral.scss` 36 |
| `var(--lh-snug)` | 1.25 | 7 | `caso.scss` 137; `composicion.scss` 373; `linaje.scss` 262, 280; `preguntasTarjetas.scss` 53, 124; `tablaGeneral.scss` 56 |
| `var(--lh-relaxed)` | 1.7 | 6 | `_reset.scss` 16; `_typography.scss` 41; `caso.scss` 24; `historiaMetodologia.scss` 90; `linaje.scss` 360; `preguntasTarjetas.scss` 135 |
| `var(--lh-normal)` | 1.5 | 6 | `caso.scss` 226, 576; `crimenesPorTipo.scss` 246; `lineaTiempoCasos.scss` 421, 450; `mapa.scss` 303 |
| `1` |  | 3 | `crimenesPorTipo.scss` 62; `mapa.scss` 173; `tablaGeneral.scss` 416 |
| `1.1` |  | 1 | `composicion.scss` 351 |
| `1.2` |  | 1 | `composicion.scss` 515 |

#### `letter-spacing`

| Valor | Usos | Dónde |
|---|---|---|
| `0.14em` | 6 | `composicion.scss` 118, 290, 548; `mapa.scss` 373; `tablaGeneral.scss` 107, 379 |
| `0.02em` | 5 | `_typography.scss` 20, 34; `global.scss` 541; `botones.scss` 42; `caso.scss` 184 |
| `0.08em` | 5 | `global.scss` 424, 508; `caso.scss` 56, 326; `linaje.scss` 86 |
| `0.1em` | 2 | `global.scss` 207; `caso.scss` 171 |
| `0.06em` | 2 | `global.scss` 324; `caso.scss` 259 |
| `0.09em` | 2 | `caso.scss` 292, 403 |
| `0.2em` | 2 | `composicion.scss` 225; `tablaGeneral.scss` 45 |
| `0.16em` | 1 | `caso.scss` 128 |
| `0.04em` | 1 | `caso.scss` 161 |
| `0.05em` | 1 | `caso.scss` 569 |
| `0.22em` | 1 | `composicion.scss` 38 |
| `0.01em` | 1 | `mapa.scss` 282 |
| `0.03em` | 1 | `paneles-filtro.scss` 42 |

13 valores para un rango de 0.01em a 0.22em. Casi todos acompañan a `uppercase`.

#### `text-transform`

| Valor | Usos | Dónde |
|---|---|---|
| `uppercase` | 23 | `global.scss` 206, 323, 423, 507; `caso.scss` 55, 127, 169, 258, 291, 325, 402, 568; `composicion.scss` 39, 119, 226, 291, 549; `linaje.scss` 87; `mapa.scss` 374; `paneles-filtro.scss` 43; `tablaGeneral.scss` 46, 108, 380 |

#### `font`

| Valor | Usos | Dónde |
|---|---|---|
| `inherit` | 2 | `composicion.scss` 262, 569 |

---

## 5. Variables CSS / SCSS de tipografía

### Qué se usa y qué no

| Grupo | Tokens definidos | Usados | Sin usar |
|---|---|---|---|
| Familias | `--font-display`, `--font-body`, `--font-ui`, `--font-mono`, `--mapa-font` | los 5 | — |
| Tamaños | 11 (`--fs-3xs` … `--fs-4xl`) | 10 | `--fs-4xl` |
| Interlineado | `--lh-tight`, `--lh-snug`, `--lh-normal`, `--lh-relaxed` | los 4 | — |
| Peso | *ninguno* | — | — |
| Tracking | *ninguno* | — | — |

- Las variables SCSS `$font-*`, `$fs-*` y `$lh-*` no se usan directamente fuera de `abstracts/`.
  Todo pasa por `var(--…)`.
- El JS no lee ninguna custom property tipográfica: ni `getComputedStyle` ni `var(--font…)` en
  `src/scripts/`. `verificarVariablesCss.ts` no cubre tipografía.

### Valores hardcodeados que se saltan un token existente

| Archivo:línea | Valor | Token que ya existe | Commit |
|---|---|---|---|
| `pages/lineaTiempoCasos.scss:82` | `font-size: 10px` | `--fs-3xs` (10px). El valor está en unidades del viewBox, así que puede ser intencional | `f804311` (9 oct) |
| `scripts/charts/CrimenesPorTipo.ts:309` | `font-size: 0.85rem` (en `cssText`) | entre `--fs-sm` (13px) y `--fs-md` (15px) | `afcffb1` (8 oct) |
| `global.scss:460` (`.orden-icono`) | `font-size: 0.85em` | relativo, sin token equivalente | `ae031c5` |
| `pages/crimenesPorTipo.scss:62` | `line-height: 1` | `--lh-tight` (1) | `13ef907` |
| `pages/mapa.scss:173` | `line-height: 1` | `--lh-tight` | `afcffb1` |
| `pages/tablaGeneral.scss:416` | `line-height: 1` | `--lh-tight` | `758d0a9` |
| `pages/composicion.scss:351` | `line-height: 1.1` | ninguno (entre `tight` y `snug`) | `758d0a9` |
| `pages/composicion.scss:515` | `line-height: 1.2` | casi `--lh-snug` (1.25) | `758d0a9` |
| `pages/caso.scss:135` | `font-weight: normal` | (no hay tokens de peso) | `e7f868f` |

### Redefiniciones del mismo selector

- `body`: `_reset.scss:11` y `pages/caso.scss:19` declaran los mismos tres valores. Como
  `caso.scss` también se importa en `base-de-datos/index.astro:7`, la repetición llega a dos
  páginas.
- `.section-title`: `_typography.scss:27` (24px) y `pages/caso.scss:177` (18px). En las páginas
  que cargan `caso.scss` (caso y base-de-datos) gana la de 18px.
- `.tooltip-grafico--sans` y `.tooltip-grafico--neutro` (`tooltips.scss:31, 37`) fijan
  `--font-ui`, que ya es la familia de `.tooltip-grafico` (`tooltips.scss:20`). Los modificadores
  no cambian nada.

### Cambios desde el último trabajo tipográfico (`da71fee`, 8 sep)

Los **tokens** no cambiaron: `_variables.scss` y `_root.scss` solo recibieron colores. La carga de
Google Fonts tampoco cambió. Lo que sí cambió es el uso. De las declaraciones actuales, **las
siguientes entraron después de `da71fee`**:

| Commit | Fecha | `font-family` añadidas | Otras | Valores nuevos fuera de la escala |
|---|---|---|---|---|
| `ae031c5` linea y tablas | 11 sep | 5 (4 Sans, **1 Mono**) | 10 tamaños, 5 pesos | `0.85em` |
| `13ef907` crimenes y tarjetas | 12 sep | 3 Sans | 3 tamaños | `line-height: 1` |
| `758d0a9` cambios generales | 18 sep | **38** (28 Sans, 7 Fell, 2 Crimson, **1 Mono**) | 64 tamaños, 21 pesos, 10 tracking | `line-height: 1`, `1.1`, `1.2`; `font: inherit` ×2 |
| `afcffb1` cambios para coloquio | 8 oct | 0 | 2 tamaños | `0.85rem` en JS; `line-height: 1` |
| `f804311` cambios para coloquio parte 2 | 9 oct | 2 Sans | 3 tamaños | `10px` |

En total entraron **48 `font-family` nuevas**, 34 de ellas en Sans. Casi todas están en dos archivos
nuevos, `composicion.scss` (882 líneas) y `tablaGeneral.scss` (553), y en la reescritura de
`caso.scss`, `mapa.scss` y `lineaTiempoCasos.scss`. Ninguna introduce una familia nueva. Lo que
crece es el uso de Sans fuera de las gráficas, y Mono entró en dos sitios más (`.case-eyebrow`,
`.similar-card-meta`).

---

## 6. Inconsistencias

### Tamaños casi duplicados

- **10 / 11 / 12 / 13px** (`--fs-3xs`, `-2xs`, `-xs`, `-sm`) son cuatro pasos de 1px que suman 128
  usos. A esos tamaños, 1px no se distingue. Además, `10px` hardcodeado y el `font-size="10"` de
  d3 repiten `--fs-3xs`.
- **15px contra 16px** (`--fs-md` y `--fs-base`): `body` es 16px, pero `p` es 15px
  (`_typography.scss:40`). El texto corrido queda en 15px y el texto suelto sin `<p>`, en 16px.
- **13px contra 13.6px**: `--fs-sm` y el `0.85rem` de `CrimenesPorTipo.ts:309`.
- **Interlineado 1.2 contra 1.25**: `composicion.scss:515` y `--lh-snug`. También `1.1` contra `1`
  y `1.25`.
- **Tracking:** 0.08 / 0.09 / 0.1em; 0.14 / 0.16em; 0.2 / 0.22em; y 0.01 / 0.02 / 0.03 / 0.04 /
  0.05 / 0.06em. Son 13 valores, y 7 se usan una sola vez.

### Fuentes cargadas pero sin usar

- **No hay ninguna cara cargada sin uso.** Cada peso y estilo pedido a Google Fonts aparece en el
  CSS.
- **Source Code Pro** se descarga (2 caras) para 7 reglas, casi todas en la ficha de caso, y no
  forma parte del sistema previsto.
- `--fs-4xl` está definido y no se usa.

### Fuentes usadas pero no cargadas

| Qué | Dónde | Efecto |
|---|---|---|
| **`sans-serif` genérica en ejes** | Línea temporal del mapa (`TiempoCrimenesMapa.ts:1558-1590`) y spike de crímenes por tipo (`CrimenesPorTipo.ts:338-343`) | d3-axis pone `font-family="sans-serif"` en el `<g>` del eje. Las clases `.mapa-linea-eje-x-texto` y `-y-texto` solo fijan tamaño (`mapa.scss:874, 883`), así que el texto hereda del `<g>` y sale en Helvetica/Arial, no en Source Sans 3. En la línea de tiempo de casos no pasa porque `lineaTiempoCasos.scss:79` fija `--font-ui` en esas mismas clases, y en Composición tampoco, gracias a `.cs-eje-texto`. |
| **Fuente del navegador en 6 botones** | `.tg-limpiar`, `.tg-chip-quitar`, `.historia-flecha`, `.carrusel-flecha`, `.mapa-tarjeta-cerrar`, `.linea-tiempo-casos-panel-caso__cerrar` | `<button>` no hereda familia y no hay `button { font: inherit }` en `_reset.scss`. Salen en la fuente de sistema. Cuatro de ellos son glifos (×, ‹, ›), pero `.tg-limpiar` es texto. |
| **Source Code Pro 700** | `.tabla-datos th` (`global.scss:418`) | `th` pide negrita (700). Solo hay 400 y 600 cargados, así que se ve en 600. |
| **IM Fell en la atribución del mapa** | OpenLayers dentro de `#mapa-contenedor` | La atribución hereda Fell a 12px (tamaño de `ol.css`). Las cifras y nombres de fuente cartográfica salen en la tipografía de títulos. |
| Respaldos `Georgia`, `system-ui`, `monospace` | pilas de `_variables.scss` | Son del sistema y solo se ven si falla Google Fonts. No son un problema. |

### Reglas tipográficas muertas

Son selectores con propiedades de fuente cuya clase ya no aparece en ningún `.astro` ni `.ts`. No
afectan lo que se ve, pero inflan los conteos de arriba.

`global.scss`: `.about-tab` (314), `a.card h3` (287), `.tabla-metadatos th/td` (418, 431, la mitad
del selector), `.btn-descarga` (501), `.vista-toggle-btn` (532), `.vista-historia-placeholder` (564).
`faq.scss`: `.btn-descargar-datos` (5), `--grande` (42). `graficos.scss`: `.grafico-eje-texto` (39),
`.grafico-etiqueta-serie` (49). `mapa.scss`: `.mapa-linea-nota` (868). `paneles-filtro.scss`:
`.filtro-label--chico` (46), `.filtro-select--compacto` (151).

---

## 7. Comparación con el sistema previsto

**Sistema previsto:**

- **IM Fell English** para títulos, nav y título de página en el nav.
- **Crimson Pro** como serif de cuerpo.
- **Una sans ya existente (Source Sans 3)**, solo para las gráficas D3.

### Lo que cumple ✓

- Todos los `h1`–`h6` están en IM Fell, peso 400, sin negrita falsa.
- El nav (`.logo` y `.nav-links a`) está en IM Fell itálica.
- `body` y el texto corrido están en Crimson Pro.
- La mayoría del texto **dentro** de las gráficas (SVG de Composición, sunburst, spike, donut,
  línea temporal, linaje y todos los tooltips) está en Source Sans 3. Son 20 declaraciones.
- La sans es una familia que ya existía (Source Sans 3). No hay otra sans cargada.

### Desviaciones

**A. Source Sans 3 fuera de las gráficas.** Son 56 de sus 76 declaraciones.

| Grupo | Declaraciones | Ejemplos |
|---|---|---|
| Controles y paneles junto a las gráficas (filtros, pestañas, botones de "ver casos", chips, fichas). **Zona gris**: hay que decidir si cuentan como "gráfica" | 37 | `botones.scss` (6 `.btn-mapa-*`), `.cs-pestaña`, `.cs-chip`, `.cs-tarjeta-nombre`, `.cs-rol-delito-titulo`, `.crimenes-tipo-donut-tab`, `.crimenes-tipo-fijados-*`, `.linaje-nivel-titulo`, `.linaje-selector-crimen`, `.linaje-panel-boton`, `.linea-tiempo-casos-*__boton*`, `.lugar-ficha-dato-etiqueta`, `.lugar-ficha-resumen`, `.lugar-ficha-crimen-*`, `.mapa-selector-vista`, `.filtro-select`, `.filtro-combo-input` |
| Interfaz general sin relación con gráficas. **Desviación clara** | 19 (4 en reglas muertas) | `caso.scss`: `.back-link`, `.caso-posicion`, `.caso-nav-boton`, `.copiar-ref`, `.similares-tab`; `tablaGeneral.scss`: `.tg-subtitulo`, `.tg-etiqueta`, `.tg-check`, `.tg-boton-buscar`, `.tg-marca`, `.tg-activos-titulo`; `composicion.scss`: `.cs-eyebrow`; `preguntasTarjetas.scss`: `.preguntas-tarjetas-pildora`, `-chip`; `global.scss`: `.cargando` |

**B. Una cuarta familia fuera del sistema: Source Code Pro.** Son 7 declaraciones: `global.scss:421`
(`.tabla-datos th`) y `caso.scss:125, 173, 256, 289, 400, 566` (ceja, etiquetas de campo, pill,
tooltip, tarjetas similares).

**C. Texto de gráficas en serif, cuando debería ser sans.**

| Familia | Elemento | Regla |
|---|---|---|
| Crimson | `.mapa-capsula-titulo`, `-subtitulo`, `-sin-casos`, `-fila-texto`, `-fila-conteo` (SVG del mapa) | `mapa.scss:788-821` |
| Crimson | `.crimenes-tipo-donut-total-label` (SVG del donut) | `crimenesPorTipo.scss:316` |
| Crimson | `.crimenes-tipo-nombre` (etiquetas de la lista de barras) | `crimenesPorTipo.scss:123` |
| Crimson | `.cs-leyenda-cuadros`, `.cs-leyenda-lineas` (leyendas HTML de Composición) | `composicion.scss:414` |
| Fell | `.cs-tarjeta-valor` (cifra de 44px), `.cs-medidor strong` (cifra de 24px) | `composicion.scss:348, 517` |
| Fell | `.lugar-ficha-dato-valor` | `mapa.scss:378` |
| Fell | Todo lo que hay dentro de `#mapa-contenedor` sin familia propia (atribución de OpenLayers) | `global.scss:350` |

**D. Ejes en sans genérica, no en Source Sans 3.** Afecta a la línea temporal del mapa y al spike
de crímenes por tipo (ver §6).

**E. Títulos que no son `<h*>` y no están en IM Fell.**

| Familia | Elementos |
|---|---|
| Crimson | `.mapa-tarjeta-titulo` (6 títulos de tarjeta en tiempo), `.panel-filtros-titulo`, `.crime-name` |
| Sans | `.linaje-nivel-titulo`, `.cs-rol-delito-titulo`, `.tg-activos-titulo`, cejas `.tg-subtitulo`, `.cs-eyebrow` |
| Mono | ceja `.case-eyebrow` |

**F. Seis botones en la fuente del navegador** (ver §6). No están en ninguna de las tres familias.

**G. Formularios en dos familias.** Los selects de base-de-datos y personas están en Crimson. Los de
tiempo y about, en Sans.

**H. Detalles menores**

- `--mapa-font` es un nombre ajeno al sistema para lo que es `--font-body`.
- `h2.cs-seccion-titulo` usa IM Fell a 11px en versalitas. Cumple la regla, pero a ese tamaño la
  textura de IM Fell se pierde, y comparte estilo con cejas que están en Sans.
- `h4` en `caso.ts` no tiene tamaño asignado (usa el del navegador).
