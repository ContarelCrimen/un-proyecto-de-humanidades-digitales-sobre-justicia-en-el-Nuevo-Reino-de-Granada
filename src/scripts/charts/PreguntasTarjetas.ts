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
  function enlazarNavegacion(respuesta: HTMLElement) {
    respuesta.querySelectorAll<HTMLAnchorElement>('[data-ir-vista]').forEach((enlace) => {
      enlace.addEventListener('click', (evento) => {
        evento.preventDefault();
        onNavegarVista?.(enlace.dataset.irVista!);
      });
    });
  }
  function crearItem(titulo: string, html: string, abierto: boolean) {
    const item = document.createElement('details');
    item.className = 'ui-accordion-item';
    item.open = abierto;
    const resumen = document.createElement('summary');
    resumen.className = 'ui-accordion-trigger';
    resumen.textContent = titulo;
    const panel = document.createElement('div');
    panel.className = 'ui-accordion-panel';
    if (html) {
      const respuesta = document.createElement('div');
      respuesta.className = 'preguntas-respuesta';
      respuesta.innerHTML = html;
      enlazarNavegacion(respuesta);
      panel.appendChild(respuesta);
    }
    item.append(resumen, panel);
    return { item, panel };
  }
  const acordeon = document.createElement('div');
  acordeon.className = 'ui-accordion';
  preguntas.forEach((fila, indice) => {
    const { item, panel } = crearItem(fila.Pregunta, fila.Respuesta, indice === 0);
    if (fila.Desglose) {
      const rutaDesglose = fila.Desglose;
      let cargado = false;
      const cargar = async () => {
        if (cargado) return;
        cargado = true;
        const decisiones = await cargarDesglose(`${import.meta.env.BASE_URL}${rutaDesglose}`);
        const anidado = document.createElement('div');
        anidado.className = 'ui-accordion preguntas-desglose';
        decisiones.forEach((decision, i) => {
          anidado.appendChild(crearItem(decision.Decision, decision.Explicacion, i === 0).item);
        });
        panel.appendChild(anidado);
      };
      item.addEventListener('toggle', () => {
        if (item.open) cargar();
      });
      if (item.open) cargar();
    }
    acordeon.appendChild(item);
  });
  contenedor.replaceChildren(acordeon);
}
