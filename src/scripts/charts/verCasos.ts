interface FiltrosTabla {
  genero?: string;
  atributo?: string;
  agente?: string;
  codigo?: string;
  subcodigo?: string;
  lugar?: string;
  // 'decada' (por defecto): 1650 = 1650-1659 · 'anio': año exacto · 'siglo': 1600 = 1600-1699
  fecha?: string | number;
  escala?: 'decada' | 'anio' | 'año' | 'siglo' | string;
  fechaDesde?: string | number;
  fechaHasta?: string | number;
  casos?: string[];
}

export function crearBotonVerCasos() {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'ui-btn ui-btn--primario ui-btn--sm btn-ver-casos-generico';
  let handlerActivo: (() => void) | null = null;
  boton.addEventListener('click', () => {
    if (handlerActivo) handlerActivo();
  });
  function ocultar() {
    boton.classList.remove('btn-ver-casos-generico--visible');
    handlerActivo = null;
  }
  function mostrar(texto: string, handler: () => void) {
    boton.textContent = `Ver casos: ${texto}`;
    boton.classList.add('btn-ver-casos-generico--visible');
    handlerActivo = handler;
  }
  return { boton, mostrar, ocultar };
}

export function irATablasFiltradas(overrides: FiltrosTabla = {}) {
  const params = new URLSearchParams();
  if (overrides.genero) params.set('genero', overrides.genero);
  if (overrides.atributo) params.set('atributo', overrides.atributo);
  if (overrides.agente) params.set('agente', overrides.agente);
  if (overrides.codigo) params.set('codigo', overrides.codigo);
  if (overrides.subcodigo) params.set('subcodigo', overrides.subcodigo);
  if (overrides.lugar) params.set('lugar', overrides.lugar);

  if (overrides.casos?.length) {
    params.set('casos', overrides.casos.join(','));
  } else if (overrides.fecha != null) {
    params.set('fecha', String(overrides.fecha));
    params.set('escala', overrides.escala || 'decada');
  } else if (overrides.fechaDesde != null && overrides.fechaHasta != null) {
    params.set('fechaDesde', String(overrides.fechaDesde));
    params.set('fechaHasta', String(overrides.fechaHasta));
  }

  window.location.href = `${import.meta.env.BASE_URL}base-de-datos/index.html?${params.toString()}`;
}