export const ULTIMO_ANIO_COLONIAL = 1824;
export const ULTIMA_DECADA = Math.floor(ULTIMO_ANIO_COLONIAL / 10) * 10;

export const ANIO_MIN_VALIDO = 1500;
export const ANIO_MAX_VALIDO = 1824;

export const getDecada = (y: number): number => Math.floor(y / 10) * 10;

export const decadaValida = (y: number): boolean =>
  y >= ANIO_MIN_VALIDO && y <= ANIO_MAX_VALIDO;

export const formatoDecada = (decada: number): number =>
  decada === ULTIMA_DECADA ? ULTIMO_ANIO_COLONIAL : decada;

export const finDecada = (decada: number): number =>
  decada === ULTIMA_DECADA ? ULTIMO_ANIO_COLONIAL : decada + 9;