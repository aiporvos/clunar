// Guía práctica de consultoría IA con Claude: estructura de bloques y temas.
// Cada bloque tiene su página en /guias/consultoria-ia/{slug}. Un tema con `listo: false`
// aparece en el índice como "próximamente".

export interface Tema {
  n: number;
  slug: string;
  titulo: string;
  resumen: string;
  listo: boolean;
}

export interface Bloque {
  numeral: string;
  slug: string;
  titulo: string;
  bajada: string;
  nivel: string;
  color: string; // HSL de la paleta de marca (BRAND.md §07), para hsl(var(--bloque))
  temas: Tema[];
}

const t = (n: number, slug: string, titulo: string, resumen: string, listo = false): Tema => ({ n, slug, titulo, resumen, listo });

export const BLOQUES: Bloque[] = [
  {
    numeral: 'I',
    slug: 'primeros-pasos',
    titulo: 'Primeros pasos',
    bajada: 'Entender el negocio antes de tocar una herramienta: qué duele, a quién, cuánto cuesta y qué vamos a lograr.',
    nivel: 'Nivel 1',
    color: '41 97% 57%',
    temas: [
      t(1, 'que-es-la-consultoria-ia', 'Qué es la consultoría IA', 'Qué aporta, qué no, y cuándo conviene usar IA en un proceso.', true),
      t(2, 'detectar-oportunidades', 'Detectar oportunidades', 'Encontrar las tareas donde la IA ahorra horas de verdad.', true),
      t(3, 'problema-de-negocio', 'Problema de negocio', 'Separar el síntoma de la causa y escribir el problema en una frase.', true),
      t(4, 'stakeholders', 'Stakeholders', 'Quién decide, quién usa y quién puede frenar el proyecto.', true),
      t(5, 'casos-de-uso', 'Casos de uso', 'Bajar la idea a escenarios concretos que se pueden probar.', true),
      t(6, 'objetivos-y-alcance', 'Objetivos y alcance', 'Qué se va a lograr, cómo se mide y qué queda afuera.', true),
    ],
  },
  {
    numeral: 'II',
    slug: 'organiza-y-personaliza',
    titulo: 'Organizá y personalizá',
    bajada: 'Preparar a Claude para que trabaje con tu método, tus clientes y tus herramientas.',
    nivel: 'Nivel 2',
    color: '194 85% 48%',
    temas: [
      t(7, 'proyectos', 'Proyectos', 'Un espacio por cliente con su documentación y sus instrucciones.'),
      t(8, 'artefactos', 'Artefactos', 'Propuestas, tableros y prototipos que se ven y se comparten.'),
      t(9, 'estilos-de-escritura', 'Estilos de escritura', 'El tono y el formato de tus entregables, siempre igual.'),
      t(10, 'memoria', 'Memoria', 'Que Claude recuerde tu metodología y las decisiones de cada cliente.'),
      t(11, 'importar-memoria', 'Importar memoria', 'Traer el contexto que ya tenés en otra herramienta.'),
      t(12, 'conectores', 'Conectores', 'Drive, correo, calendario y otras fuentes al alcance de Claude.'),
      t(13, 'skills', 'Skills', 'Procedimientos reutilizables: diagnóstico, relevamiento, informe.'),
      t(14, 'plugins', 'Plugins', 'Paquetes de skills, comandos y conectores listos para instalar.'),
    ],
  },
  {
    numeral: 'III',
    slug: 'desarrollo-de-soluciones',
    titulo: 'Desarrollo de soluciones',
    bajada: 'Del relevamiento al prototipo: diagnosticar, especificar, diseñar y validar antes de construir.',
    nivel: 'Nivel 2',
    color: '22 97% 57%',
    temas: [
      t(15, 'diagnostico', 'Diagnóstico', 'Mapear el proceso actual, sus brechas y sus oportunidades.'),
      t(16, 'levantamiento-de-requerimientos', 'Levantamiento de requerimientos', 'Funcionales y no funcionales, priorizados y escritos para probar.'),
      t(17, 'diseno-de-solucion', 'Diseño de la solución', 'Componentes, flujo de datos y plan de trabajo.'),
      t(18, 'arquitectura-ia', 'Arquitectura IA', 'Modelos, herramientas, datos y dónde vive cada cosa.'),
      t(19, 'poc-y-mvp', 'POC y MVP', 'Probar la idea rápido y después la versión mínima que sirve.'),
      t(20, 'validacion', 'Validación', 'Criterios de éxito acordados y pruebas con casos reales.'),
    ],
  },
  {
    numeral: 'IV',
    slug: 'implementacion-y-adopcion',
    titulo: 'Implementación y adopción',
    bajada: 'Poner la solución a trabajar en el negocio, medirla y lograr que la usen.',
    nivel: 'Nivel 3',
    color: '150 88% 35%',
    temas: [
      t(21, 'automatizaciones', 'Automatizaciones', 'Tareas que corren solas y procesos programados.'),
      t(22, 'agentes', 'Agentes', 'IA que usa herramientas, toma pasos y pide ayuda cuando corresponde.'),
      t(23, 'integraciones', 'Integraciones', 'Conectar la solución con los sistemas que ya existen.'),
      t(24, 'datos-y-herramientas', 'Datos y herramientas', 'Preparar las fuentes y las herramientas que la solución necesita.'),
      t(25, 'entregables', 'Entregables', 'Informes, manuales y documentación que el cliente se queda.'),
      t(26, 'seguimiento', 'Seguimiento', 'Ver cómo funciona en producción y corregir a tiempo.'),
      t(27, 'metricas', 'Métricas', 'Medir el impacto con números que el cliente entiende.'),
      t(28, 'adopcion', 'Adopción', 'Que el equipo la use: capacitación, acompañamiento y confianza.'),
      t(29, 'iteracion', 'Iteración', 'Mejorar por ciclos cortos con lo que aprendiste.'),
      t(30, 'escalado', 'Escalado', 'Llevar lo que funcionó a más áreas, más volumen o más clientes.'),
    ],
  },
  {
    numeral: 'V',
    slug: 'comandos-de-claude-code',
    titulo: 'Comandos de Claude Code',
    bajada: 'Los comandos que usás todos los días en la terminal, y cómo crear los tuyos.',
    nivel: 'Nivel 3',
    color: '266 30% 51%',
    temas: [
      t(31, 'clear', '/clear', 'Empezar una conversación limpia.'),
      t(32, 'compact', '/compact', 'Resumir la conversación para liberar contexto.'),
      t(33, 'context', '/context', 'Ver cuánto contexto estás usando y en qué.'),
      t(34, 'plan', 'Modo plan', 'Que Claude piense el plan antes de tocar archivos.'),
      t(35, 'model', '/model', 'Elegir el modelo según la tarea.'),
      t(36, 'resume', '/resume', 'Retomar una sesión anterior.'),
      t(37, 'review', '/review', 'Pedir una revisión de código.'),
      t(38, 'export', '/export', 'Llevarte la conversación como texto.'),
      t(39, 'rename', '/rename', 'Ponerle nombre a la sesión.'),
      t(40, 'cost', '/cost y /usage', 'Cuánto llevás gastado y cuánto te queda.'),
      t(41, 'init', '/init', 'Crear el CLAUDE.md del proyecto.'),
      t(42, 'memory', '/memory', 'Editar lo que Claude recuerda de vos y del proyecto.'),
      t(43, 'diff', 'Ver los cambios', 'Qué tocó Claude en tus archivos.'),
      t(44, 'security-review', '/security-review', 'Buscar problemas de seguridad en los cambios.'),
      t(45, 'permissions', '/permissions', 'Qué puede hacer Claude sin preguntarte.'),
      t(46, 'config', '/config', 'Ajustes: tema, modelo y preferencias.'),
      t(47, 'atajos-propios', 'Tus propios atajos', 'Crear comandos a medida con skills.'),
    ],
  },
];

export const TOTAL_TEMAS = BLOQUES.reduce((n, b) => n + b.temas.length, 0);
export const bloque = (slug: string) => BLOQUES.find(b => b.slug === slug)!;
