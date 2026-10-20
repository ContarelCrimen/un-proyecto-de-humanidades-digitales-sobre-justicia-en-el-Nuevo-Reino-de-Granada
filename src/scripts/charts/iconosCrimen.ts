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
  Prostitución: 'prostitucion',
  'Delitos sobre sexualidad': 'delitos-sexualidad',
  Rapto: 'rapto',
  'Juicio de residencia': 'juicio-residencia',
  Injuria: 'injuria',
  'Crimen militar': 'crimen-militar',
  Financiero: 'financiero',
  Desacato: 'desacato',
  Robo: 'robo',
  'Fuga o intento de fuga': 'fuga',
  Vagancia: 'vagancia',
  'Crimen eclesiástico': 'crimen-eclesiastico',
  'Mala praxis de abogados': 'mala-praxis-abogados',
  Sublevación: 'sublevacion',
  'Suicidio o intento': 'suicidio-intento',
  'Migración ilegal': 'migracion-ilegal',
  'Tipo de documento diferente a sumario': 'documento-sumario',
  Separación: 'separacion',
  Sucesión: 'sucesion',
  'Actos oficiales': 'actos-oficiales',
  'No Casos': 'no-casos',
  Ambiguos: 'ambiguos',
  'Traslados y petición de traslado': 'traslados',
  'Petición de indulto': 'peticion-indulto',
  'Juicios civiles': 'juicios-civiles',
};

export function iconoDeCrimen(nombre: string): string | undefined {
  const archivo = ICONOS_CRIMEN[nombre.trim()];
  if (!archivo) return undefined;
  return archivos[`../../assets/iconos-crimenes/${archivo}.png`]?.src;
}
