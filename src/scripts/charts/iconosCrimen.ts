const archivos = import.meta.glob<{ src: string }>('../../assets/iconos-crimenes/*.png', {
  eager: true,
  import: 'default',
});

const ICONOS_CRIMEN: Record<string, string> = {
  Homicidio: 'homicidio',
  'Sin codificar': 'sin-codificar',
  Violencia: 'violencia',
  'Violencia conyugal': 'violencia-conyugal',
  Amenazas: 'amenazas',
  Secuestros: 'secuestros',
  Aborto: 'aborto',
  Estupro: 'estupro',
  Concubinato: 'concubinato',
  Envenenamiento: 'envenenamiento',
};

export function iconoDeCrimen(nombre: string): string | undefined {
  const archivo = ICONOS_CRIMEN[nombre.trim()];
  if (!archivo) return undefined;
  return archivos[`../../assets/iconos-crimenes/${archivo}.png`]?.src;
}
