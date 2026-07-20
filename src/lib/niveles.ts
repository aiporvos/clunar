export interface Nivel {
  nivel: 1 | 2 | 3 | 4;
  nombre: string;
  colorVar: 'yellow' | 'green' | 'blue' | 'purple';
  descripcion: string;
}

export const NIVELES: Nivel[] = [
  {
    nivel: 1,
    nombre: 'Chat',
    colorVar: 'yellow',
    descripcion: 'Usás ChatGPT o Claude conversando. Vos decidís cada paso.',
  },
  {
    nivel: 2,
    nombre: 'Herramientas',
    colorVar: 'green',
    descripcion: 'La IA ya está conectada a algo: un flujo, una API, una automatización puntual.',
  },
  {
    nivel: 3,
    nombre: 'Agentes',
    colorVar: 'blue',
    descripcion: 'El modelo decide solo qué hacer y qué herramienta usar, en un bucle.',
  },
  {
    nivel: 4,
    nombre: 'Orquestación',
    colorVar: 'purple',
    descripcion: 'Varios agentes trabajan coordinados entre sí, cada uno con su rol.',
  },
];

export function getNivel(n?: number | null): Nivel | undefined {
  return NIVELES.find(x => x.nivel === n);
}
