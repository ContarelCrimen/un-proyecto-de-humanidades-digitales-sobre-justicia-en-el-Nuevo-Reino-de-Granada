export type SeccionActiva =
  | 'inicio'
  | 'base-de-datos'
  | 'tiempo'
  | 'personas'
  | 'about'
  | 'estudios-de-caso';

const base = import.meta.env.BASE_URL;

export const enlacesNav = [
  { id: 'inicio', texto: 'Inicio', href: `${base}index.html` },
  { id: 'tiempo', texto: 'Cambio en el tiempo', href: `${base}tiempo/index.html` },
  { id: 'personas', texto: 'Composición social', href: `${base}personas/index.html` },
  { id: 'base-de-datos', texto: 'Base de datos', href: `${base}base-de-datos/index.html` },
  { id: 'about', texto: 'Fuentes y metodología', href: `${base}about/index.html` },
  { id: 'estudios-de-caso', texto: 'Estudios de caso', href: `${base}estudios-de-caso/index.html` },
] as const satisfies ReadonlyArray<{ id: SeccionActiva; texto: string; href: string }>;
