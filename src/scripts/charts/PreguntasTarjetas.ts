import * as d3 from 'd3';
interface FilaPreguntaTarjeta {
  Pregunta: string;
  Respuesta: string;
  Desglose?: string;
}
interface FilaDecision {
  Decision: string;
  Explicacion: string;
}
const cache = new Map<string, Promise<FilaPreguntaTarjeta[]>>();
function cargarPreguntas(rutaCsv: string): Promise<FilaPreguntaTarjeta[]> {
  let promesa = cache.get(rutaCsv);
  if (!promesa) {
    promesa = d3.csv(rutaCsv).then((filas) => filas as unknown as FilaPreguntaTarjeta[]);
    cache.set(rutaCsv, promesa);
  }
  return promesa;
}
const cacheDesglose = new Map<string, Promise<FilaDecision[]>>();
function cargarDesglose(rutaCsv: string): Promise<FilaDecision[]> {
  let promesa = cacheDesglose.get(rutaCsv);
  if (!promesa) {
    promesa = d3.csv(rutaCsv).then((filas) => filas as unknown as FilaDecision[]);
    cacheDesglose.set(rutaCsv, promesa);
  }
  return promesa;
}
export async function crearPreguntasTarjetas(
  containerId: string,
  rutaCsv: string = `${import.meta.env.BASE_URL}data/PreguntasMetodologicas.csv`,
  onNavegarVista?: (vista: string) => void,
) {
  const preguntas = await cargarPreguntas(rutaCsv);
  const contenedor = document.getElementById(containerId)!;
  const idPanel = `${containerId}-respuesta`;
  const idTab = (indice: number) => `${containerId}-pregunta-${indice}`;
  const raiz = document.createElement('div');
  raiz.className = 'preguntas-tarjetas';
  const columna = document.createElement('div');
  columna.className = 'preguntas-tarjetas-columna';
  const volver = document.createElement('button');
  volver.type = 'button';
  volver.className = 'ui-btn ui-btn--fantasma ui-btn--sm';
  volver.textContent = '‹ Volver';
  volver.hidden = true;
  const lista = document.createElement('div');
  lista.className = 'ui-tabs ui-tabs--vertical';
  lista.setAttribute('role', 'tablist');
  lista.setAttribute('aria-orientation', 'vertical');
  lista.setAttribute('aria-label', 'Preguntas');
  columna.append(volver, lista);
  const panel = document.createElement('div');
  panel.className = 'preguntas-tarjetas-panel ui-clara';
  panel.id = idPanel;
  panel.setAttribute('role', 'tabpanel');
  const encabezado = document.createElement('header');
  encabezado.className = 'page-header page-header--subseccion';
  const encabezadoTexto = document.createElement('div');
  encabezadoTexto.className = 'page-header-texto';
  const titulo = document.createElement('h3');
  titulo.className = 'page-header-titulo';
  encabezadoTexto.appendChild(titulo);
  encabezado.appendChild(encabezadoTexto);
  const respuesta = document.createElement('div');
  respuesta.className = 'preguntas-respuesta';
  panel.append(encabezado, respuesta);
  raiz.append(columna, panel);
  contenedor.replaceChildren(raiz);
  function enlazarNavegacion() {
    respuesta.querySelectorAll<HTMLAnchorElement>('[data-ir-vista]').forEach((enlace) => {
      enlace.addEventListener('click', (evento) => {
        evento.preventDefault();
        onNavegarVista?.(enlace.dataset.irVista!);
      });
    });
  }
  function pintarRespuesta(texto: string, html: string, indice: number) {
    titulo.textContent = texto;
    respuesta.innerHTML = html;
    panel.setAttribute('aria-labelledby', idTab(indice));
    enlazarNavegacion();
  }
  function pestanas() {
    return [...lista.querySelectorAll<HTMLButtonElement>('.ui-tab')];
  }
  function marcar(activo: number) {
    pestanas().forEach((tab, indice) => {
      tab.setAttribute('aria-selected', String(indice === activo));
      tab.tabIndex = indice === activo ? 0 : -1;
    });
  }
  let activarActual: (indice: number) => void = () => {};
  let automaticas: boolean[] = [];
  function pintarLista(
    textos: string[],
    activo: number,
    alActivar: (indice: number) => void,
    activacionAutomatica: boolean[],
  ) {
    activarActual = alActivar;
    automaticas = activacionAutomatica;
    lista.replaceChildren(
      ...textos.map((texto, indice) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'ui-tab';
        tab.id = idTab(indice);
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', idPanel);
        tab.textContent = texto;
        tab.addEventListener('click', () => activarActual(indice));
        return tab;
      }),
    );
    marcar(activo);
  }
  lista.addEventListener('keydown', (evento) => {
    const tabs = pestanas();
    const actual = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (actual < 0) return;
    const ultimo = tabs.length - 1;
    const destinos: Record<string, number> = {
      ArrowDown: actual === ultimo ? 0 : actual + 1,
      ArrowUp: actual === 0 ? ultimo : actual - 1,
      Home: 0,
      End: ultimo,
    };
    const destino = destinos[evento.key];
    if (destino === undefined) return;
    evento.preventDefault();
    tabs[destino].focus();
    if (automaticas[destino]) activarActual(destino);
  });
  let indiceRaiz = 0;
  function mostrarRaiz(indice: number) {
    indiceRaiz = indice;
    volver.hidden = true;
    pintarLista(
      preguntas.map((fila) => fila.Pregunta),
      indice,
      activarRaiz,
      preguntas.map((fila) => !fila.Desglose),
    );
    pintarRespuesta(preguntas[indice].Pregunta, preguntas[indice].Respuesta, indice);
  }
  function activarRaiz(indice: number) {
    indiceRaiz = indice;
    const fila = preguntas[indice];
    if (fila.Desglose) {
      abrirDesglose(fila.Desglose);
      return;
    }
    marcar(indice);
    pintarRespuesta(fila.Pregunta, fila.Respuesta, indice);
  }
  async function abrirDesglose(rutaDesglose: string) {
    const decisiones = await cargarDesglose(`${import.meta.env.BASE_URL}${rutaDesglose}`);
    const activarDecision = (indice: number) => {
      marcar(indice);
      pintarRespuesta(decisiones[indice].Decision, decisiones[indice].Explicacion, indice);
    };
    volver.hidden = false;
    pintarLista(
      decisiones.map((decision) => decision.Decision),
      0,
      activarDecision,
      decisiones.map(() => true),
    );
    activarDecision(0);
    pestanas()[0]?.focus();
  }
  volver.addEventListener('click', () => {
    mostrarRaiz(indiceRaiz);
    pestanas()[indiceRaiz]?.focus();
  });
  mostrarRaiz(0);
}
