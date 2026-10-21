import * as d3 from 'd3';
import { leerResultados } from './resultadosGuardados.js';
type Fila = d3.DSVRowString<string>;
const CSV_CRIMENES = `${import.meta.env.BASE_URL}data/crimenes.csv`;
const CSV_FUENTES = `${import.meta.env.BASE_URL}data/Source.csv`;
const CSV_Personas = `${import.meta.env.BASE_URL}data/ConteoAgentes.csv`;
const CSV_LINAJE = `${import.meta.env.BASE_URL}data/Linaje.csv`;
const CSV_CASOS = `${import.meta.env.BASE_URL}data/Casos.csv`;
const CSV_NEGRILLA = `${import.meta.env.BASE_URL}data/DescripcionesNegrilla.csv`;
function escaparHtml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function formatearDescripcion(texto: string, conNegrilla: boolean): string {
  const escapado = escaparHtml((texto || '').trim());
  return conNegrilla
    ? escapado.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    : escapado.replace(/\*\*(.+?)\*\*/g, '$1');
}
const fmt = (n: number) => n.toLocaleString('de-DE');
function variableColorAgente(p: Fila): string {
  if (p.Agente === 'Persona') {
    if (p.Género === 'Mujer') return '--genero-mujer';
    if (p.Género === 'Hombre') return '--genero-hombre';
    return '--genero-sin-info';
  }
  if (p.Agente === 'Institución') return '--tipo-institucion';
  if (p.Agente === 'Población Indígena Completa') return '--tipo-poblacion-indigena';
  return '--tipo-poblacion-completa';
}
function referenciaArchivistica(fuente: Fila | null): string {
  if (!fuente) return '';
  const partes = [fuente.Archivo, fuente['Sección'], fuente.Fondo].filter(Boolean) as string[];
  if (fuente.Legajo) partes.push(`leg. ${fuente.Legajo}`);
  if (fuente.Documento) partes.push(`doc. ${fuente.Documento}`);
  if (fuente.Folios) partes.push(`ff. ${fuente.Folios}`);
  return partes.length ? `${partes.join(', ')}.` : '';
}
async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const campo = document.createElement('textarea');
    campo.value = texto;
    campo.style.position = 'fixed';
    campo.style.opacity = '0';
    document.body.appendChild(campo);
    campo.select();
    const copiado = document.execCommand('copy');
    campo.remove();
    return copiado;
  }
}
function idsDeTodosLosCasos(casesMap: Map<string, any>): string[] {
  const anio = (caso: any) => {
    const n = parseInt(caso.año, 10);
    return Number.isNaN(n) || n <= 0 ? Infinity : n;
  };
  return [...casesMap.values()].sort((a, b) => anio(a) - anio(b)).map((caso) => caso.id);
}
function renderNavegacion(id: string, casesMap: Map<string, any>) {
  const base = import.meta.env.BASE_URL;
  const volver = document.getElementById('casoVolver') as HTMLAnchorElement | null;
  const etiquetaPosicion = document.getElementById('casoPosicion');
  const nav = document.getElementById('casoNav');
  const anterior = document.getElementById('casoAnterior') as HTMLAnchorElement | null;
  const siguiente = document.getElementById('casoSiguiente') as HTMLAnchorElement | null;
  if (!volver || !etiquetaPosicion || !nav || !anterior || !siguiente) return;
  const guardados = leerResultados();
  const desdeLaTabla = !!guardados && guardados.ids.includes(id);
  const ids = desdeLaTabla ? guardados!.ids : idsDeTodosLosCasos(casesMap);
  const posicion = ids.indexOf(id);
  if (posicion < 0) return;
  if (desdeLaTabla) {
    const separador = guardados!.urlTabla.includes('?') ? '&' : '?';
    volver.href = `${guardados!.urlTabla}${separador}volver=1`;
  } else {
    volver.href = `${base}base-de-datos/index.html`;
  }
  volver.textContent = 'Volver a resultados';
  etiquetaPosicion.textContent = `Caso ${fmt(posicion + 1)} de ${fmt(ids.length)}`;
  const enlazar = (a: HTMLAnchorElement, destino: string | undefined) => {
    const activo = destino !== undefined;
    if (activo) a.href = `${base}base-de-datos/caso.html?caso=${encodeURIComponent(destino)}`;
    else a.removeAttribute('href');
    a.setAttribute('aria-disabled', String(!activo));
  };
  enlazar(anterior, ids[posicion - 1]);
  enlazar(siguiente, ids[posicion + 1]);
  nav.hidden = false;
}
function encabezadoSeccion(titulo: string): HTMLElement {
  const encabezado = document.createElement('header');
  encabezado.className = 'page-header page-header--seccion';
  const texto = document.createElement('div');
  texto.className = 'page-header-texto';
  const h2 = document.createElement('h2');
  h2.className = 'page-header-titulo';
  h2.textContent = titulo;
  texto.appendChild(h2);
  encabezado.appendChild(texto);
  return encabezado;
}
function claveDocumento(idCaso?: string, idCrimen?: string): string {
  return `${idCaso}|${idCrimen}`;
}
function formatearRangoAnios(
  fechaInicial?: string,
  fechaFinal?: string,
  fallback?: string,
): string {
  const inicial = (fechaInicial || '').trim();
  const final = (fechaFinal || '').trim();
  if (inicial && final) return inicial === final ? inicial : `${inicial} – ${final}`;
  return inicial || final || fallback || '';
}
function buildCasesMap(
  crimenes: Fila[],
  fuentes: Fila[],
  linaje: Fila[],
  negrilla: Fila[],
  casos: Fila[],
) {
  const fuentesIdx: Record<string, Fila> = {};
  fuentes.forEach((f: Fila) => {
    fuentesIdx[f['ID_Crímen']!] = f;
  });
  const linajeMap: Record<string, string> = {};
  linaje.forEach((l: Fila) => {
    linajeMap[l['ID_Código']!] = l.Nombre!;
  });
  const casosIdx: Record<string, Fila> = {};
  casos.forEach((c: Fila) => {
    casosIdx[c.ID_Caso!] = c;
  });
  const negrillaIdx: Record<string, string> = {};
  negrilla.forEach((n: Fila) => {
    negrillaIdx[claveDocumento(n.ID_Caso, n['ID_Crímen'])] = n['Descripción']!;
  });
  const casesMap = new Map();
  crimenes.forEach((row: Fila) => {
    const caseId = row.ID_Caso;
    const idCrimen = row['ID_Crímen'];
    if (!casesMap.has(caseId)) {
      const casoInfo = casosIdx[caseId!];
      casesMap.set(caseId, {
        id: caseId,
        descripcion: row['Descripción'],
        año: row['Año'],
        rangoAnios: formatearRangoAnios(
          casoInfo?.FechaInicial,
          casoInfo?.['Fecha_Final'],
          row['Año'],
        ),
        lugar: row['Lugar'],
        especificaciones: row['Especificaciones'],
        documentos: [],
      });
    }
    const caso = casesMap.get(caseId);
    const descripcionNegrilla = negrillaIdx[claveDocumento(caseId, idCrimen)];
    caso.documentos.push({
      id_documento: idCrimen,
      descripcion: descripcionNegrilla ?? row['Descripción'],
      año: row['Año'],
      crimen: linajeMap[row['Código']!] || '',
      subcrimen: linajeMap[row['Sub_Código']!] || '',
      fuente: fuentesIdx[idCrimen!] ?? null,
    });
  });
  return casesMap;
}
export function inicializarCaso() {
  const params = new URLSearchParams(window.location.search);
  const casoId = params.get('caso');
  const main = document.getElementById('main-content');
  const loading = document.getElementById('loading-msg');
  if (!casoId) {
    loading!.textContent = 'No se especificó un caso. Vuelve a la tabla.';
  } else {
    loadCase(casoId, { main, loading });
  }
}
async function loadCase(
  id: string,
  { main, loading }: { main: HTMLElement | null; loading: HTMLElement | null },
) {
  try {
    const [crimenes, fuentes, personas, linaje, negrilla, casos] = await Promise.all([
      d3.csv(CSV_CRIMENES),
      d3.csv(CSV_FUENTES),
      d3.csv(CSV_Personas),
      d3.csv(CSV_LINAJE),
      d3.csv(CSV_NEGRILLA),
      d3.csv(CSV_CASOS),
    ]);
    const casesMap = buildCasesMap(crimenes, fuentes, linaje, negrilla, casos);
    const caso = casesMap.get(id);
    if (!caso) {
      loading!.textContent = `No se encontró el caso con ID "${id}".`;
      return;
    }
    loading!.remove();
    renderCase(caso, personas, main!, casesMap);
    renderNavegacion(id, casesMap);
  } catch (err) {
    loading!.textContent = 'Error al cargar los datos. Revisa la consola.';
    console.error(err);
  }
}
function renderCase(caso: any, personas: Fila[], main: HTMLElement, casesMap: Map<string, any>) {
  document.getElementById('casoCeja')!.textContent = `Caso ID ${caso.id}`;
  document.getElementById('casoTitulo')!.innerHTML = formatearDescripcion(caso.descripcion, false);
  document.getElementById('casoMeta')!.innerHTML = `
      <span class="ui-chip ui-chip--estatico">
        <span class="ui-chip-texto"><span class="ui-chip-etiqueta">Año </span>${caso.rangoAnios}</span>
      </span>
      <span class="ui-chip ui-chip--estatico">
        <span class="ui-chip-texto"><span class="ui-chip-etiqueta">Lugar </span>${caso.lugar}</span>
      </span>
  `;
  document.getElementById('casoMeta')!.closest('header')!.hidden = false;
  if (caso.documentos.length > 1) {
    main.appendChild(encabezadoSeccion(`Crímenes registrados (${caso.documentos.length})`));
  }
  const list = document.createElement('div');
  list.className = 'crimes-list';
  caso.documentos.forEach((doc: any) => {
    const card = document.createElement('article');
    card.className = 'crime-card ui-clara';
    const agentesDocumento = personas.filter((p: Fila) =>
      ((p['Relación_crimenes'] as string) || '')
        .split(',')
        .some((c) => c.trim() === String(doc.id_documento).trim()),
    );
    let agentesHTML = '';
    if (agentesDocumento.length > 0) {
      const grupos: Record<string, Fila[]> = {};
      agentesDocumento.forEach((p: Fila) => {
        const atributo = p.Atributo || 'Sin especificar';
        if (!grupos[atributo]) {
          grupos[atributo] = [];
        }
        grupos[atributo].push(p);
      });
      const entradas = Object.entries(grupos);
      const unSoloRol = entradas.length === 1;
      agentesHTML = `
        <div class="agents-block">
          <header class="page-header page-header--subseccion">
            <div class="page-header-texto">
              <h3 class="page-header-titulo">Agentes involucrados</h3>
            </div>
            ${unSoloRol ? `<div class="page-header-extra"><span class="agent-role">${entradas[0][0]}</span></div>` : ''}
          </header>
          ${entradas
            .map(
              ([atributo, personasGrupo]) => `
              <div class="agent-group">
                ${unSoloRol ? '' : `<div class="agent-role">${atributo}</div>`}
                <div class="agents-list">
                  ${personasGrupo
                    .map(
                      (p: Fila) => `
                        <div class="agent-person">
                          <span class="agent-avatar" style="--avatar: var(${variableColorAgente(p)})" aria-hidden="true"></span>
                          <div>
                            <div class="agent-name">
                              ${p.Agente}
                            </div>
                            <div class="agent-meta">
                              ${[
                                { label: 'Género', valor: p.Género },
                                { label: 'Calidad', valor: p.Calidad },
                                { label: 'Labor', valor: p.Labor },
                              ]
                                .filter((c) => c.valor && c.valor !== 'null')
                                .map((c) => `<span data-tooltip="${c.label}">${c.valor}</span>`)
                                .join(' · ')}
                            </div>
                          </div>
                        </div>
                      `,
                    )
                    .join('')}
                </div>
              </div>
            `,
            )
            .join('')}
        </div>
      `;
    }
    const camposFicha = doc.fuente
      ? [
          ['Archivo', doc.fuente.Archivo],
          ['Sección', doc.fuente['Sección']],
          ['Fondo', doc.fuente.Fondo],
          ['Legajo', doc.fuente.Legajo],
          ['Documento', doc.fuente.Documento],
          ['Folios', doc.fuente.Folios],
        ]
      : [];
    const referencia = referenciaArchivistica(doc.fuente);
    const fuenteHTML = `
      <div class="ficha">
        <header class="page-header page-header--subseccion">
          <div class="page-header-texto">
            <h3 class="page-header-titulo">Referencia</h3>
          </div>
        </header>
        ${
          doc.fuente
            ? `<div class="ficha-grid">
                ${camposFicha
                  .map(
                    ([etiqueta, valor]) => `
                  <div class="source-field">
                    <span class="sf-label">${etiqueta}</span>
                    <span class="sf-value">${valor ?? '—'}</span>
                  </div>`,
                  )
                  .join('')}
              </div>`
            : `<p class="no-source">Fuente documental no disponible para este documento.</p>`
        }
        <div class="ficha-pie">
          <div class="ficha-chips">
            ${doc.año ? `<span class="ui-chip ui-chip--estatico"><span class="ui-chip-texto"><span class="ui-chip-etiqueta">Año </span>${doc.año}</span></span>` : ''}
          </div>
          ${
            referencia
              ? `<button type="button" class="ui-btn copiar-ref">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <rect x="5.25" y="5.25" width="8" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.3"></rect>
                    <path d="M10.75 5.25V3.5a1.2 1.2 0 0 0-1.2-1.2H3.5a1.2 1.2 0 0 0-1.2 1.2v6.05a1.2 1.2 0 0 0 1.2 1.2h1.75" fill="none" stroke="currentColor" stroke-width="1.3"></path>
                  </svg>
                  <span class="copiar-ref-texto">Copiar referencia archivística</span>
                </button>`
              : ''
          }
        </div>
      </div>`;
    const subcrimen = doc.subcrimen.trim();
    const crimeFieldsHTML = `
      <div class="crime-fields">
        <div class="crime-field">
          <p class="crime-name">${doc.crimen.trim()}</p>
          <span class="crime-field-label">Crimen</span>
        </div>
        ${
          subcrimen
            ? `
        <div class="crime-field">
          <p class="crime-sub">${subcrimen}</p>
          <span class="crime-field-label">Subcrimen</span>
        </div>
        `
            : ''
        }
      </div>
    `;
    const crimeHeaderHTML = `
      <div class="crime-header">
        <p class="crime-descripcion">${formatearDescripcion(doc.descripcion, true)}</p>
        ${crimeFieldsHTML}
      </div>
    `;
    const idDocumentoHTML = `
      <div class="crime-id">
        <span class="ui-chip ui-chip--estatico crime-id-chip">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 1.75h5.2L12.5 5v9.25H4V1.75Z M9 1.75V5.25h3.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"></path>
          </svg>
          ID Crimen: ${doc.id_documento}
        </span>
      </div>
    `;
    card.innerHTML = `
      <div class="crime-info">
        ${idDocumentoHTML}
        ${crimeHeaderHTML}
        ${agentesHTML}
        ${fuenteHTML}
      </div>
    `;
    const botonCopiar = card.querySelector<HTMLButtonElement>('.copiar-ref');
    if (botonCopiar) {
      const textoBoton = botonCopiar.querySelector('.copiar-ref-texto')!;
      const textoInicial = textoBoton.textContent;
      let temporizador: number | undefined;
      botonCopiar.addEventListener('click', async () => {
        const copiado = await copiarTexto(referenciaArchivistica(doc.fuente));
        textoBoton.textContent = copiado ? 'Referencia copiada' : 'No se pudo copiar';
        botonCopiar.classList.toggle('copiar-ref--copiado', copiado);
        window.clearTimeout(temporizador);
        temporizador = window.setTimeout(() => {
          textoBoton.textContent = textoInicial;
          botonCopiar.classList.remove('copiar-ref--copiado');
        }, 2000);
      });
    }
    list.appendChild(card);
  });
  main.appendChild(list);
  renderCasosSimilares(caso, casesMap, main);
}
type CriterioSimilar = 'lugar' | 'crimen' | 'anio';
const CRITERIOS_SIMILARES: { criterio: CriterioSimilar; etiqueta: string }[] = [
  { criterio: 'crimen', etiqueta: 'Mismo crimen' },
  { criterio: 'lugar', etiqueta: 'Mismo lugar' },
  { criterio: 'anio', etiqueta: 'Mismo año' },
];
const MAX_CASOS_SIMILARES = 24;
function crimenesDeCaso(caso: any): Set<string> {
  return new Set(caso.documentos.map((d: any) => d.crimen).filter(Boolean));
}
function buscarCasosSimilares(criterio: CriterioSimilar, caso: any, casesMap: Map<string, any>) {
  const crimenesCaso = criterio === 'crimen' ? crimenesDeCaso(caso) : null;
  const candidatos: any[] = [];
  casesMap.forEach((otro) => {
    if (otro.id === caso.id) return;
    let coincide = false;
    if (criterio === 'lugar') {
      coincide = !!caso.lugar && otro.lugar === caso.lugar;
    } else if (criterio === 'anio') {
      coincide = !!caso.año && otro.año === caso.año;
    } else {
      coincide = [...crimenesDeCaso(otro)].some((c) => crimenesCaso!.has(c));
    }
    if (coincide) candidatos.push(otro);
  });
  return candidatos.slice(0, MAX_CASOS_SIMILARES);
}
function renderCasosSimilares(caso: any, casesMap: Map<string, any>, main: HTMLElement) {
  const base = import.meta.env.BASE_URL;
  const section = document.createElement('div');
  section.className = 'similares-section';
  section.innerHTML = `
    <div class="ui-tabs ui-tabs--sm" role="tablist" aria-label="Criterio de similitud">
      ${CRITERIOS_SIMILARES.map(
        ({ criterio, etiqueta }, i) => `
        <button type="button" class="ui-tab" role="tab" aria-selected="${i === 0}" aria-controls="similaresCarrusel" data-criterio="${criterio}">
          ${etiqueta}
        </button>
      `,
      ).join('')}
    </div>
    <div class="similares-carrusel-wrap">
      <button type="button" class="ui-btn ui-btn--icono carrusel-flecha--prev" aria-label="Ver casos anteriores">‹</button>
      <div class="similares-carrusel" id="similaresCarrusel" role="tabpanel"></div>
      <button type="button" class="ui-btn ui-btn--icono carrusel-flecha--next" aria-label="Ver casos siguientes">›</button>
    </div>
  `;
  main.append(encabezadoSeccion('Casos similares'), section);
  const carrusel = section.querySelector<HTMLElement>('.similares-carrusel')!;
  const flechaPrev = section.querySelector<HTMLButtonElement>('.carrusel-flecha--prev')!;
  const flechaNext = section.querySelector<HTMLButtonElement>('.carrusel-flecha--next')!;
  function pintarCriterio(criterio: CriterioSimilar) {
    const similares = buscarCasosSimilares(criterio, caso, casesMap);
    carrusel.innerHTML = similares.length
      ? similares
          .map(
            (s) => `
        <a class="similar-card ui-clara" href="${base}base-de-datos/caso.html?caso=${encodeURIComponent(s.id)}" title="Ver expediente ${s.id}">
          <div class="similar-card-meta">
            <span>${s.año || 'Sin año'}</span>
            <span>${s.lugar || 'Sin lugar'}</span>
          </div>
          <p class="similar-card-desc">${formatearDescripcion(s.descripcion, false)}</p>
          <div class="similar-card-crimen">${[...crimenesDeCaso(s)].join(', ')}</div>
        </a>
      `,
          )
          .join('')
      : `<p class="similares-vacio">No se encontraron casos similares para este criterio.</p>`;
  }
  section.querySelectorAll<HTMLButtonElement>('.ui-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      section
        .querySelectorAll('.ui-tab')
        .forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      carrusel.scrollTo({ left: 0 });
      pintarCriterio(tab.dataset.criterio as CriterioSimilar);
    });
  });
  flechaPrev.addEventListener('click', () => carrusel.scrollBy({ left: -300, behavior: 'smooth' }));
  flechaNext.addEventListener('click', () => carrusel.scrollBy({ left: 300, behavior: 'smooth' }));
  pintarCriterio(CRITERIOS_SIMILARES[0].criterio);
}
