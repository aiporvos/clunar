// Utilidades del proyecto

// Formatea una fecha en español argentino
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

// Genera un slug desde un título
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Trunca texto a n caracteres
export function truncate(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

// Tiempo de lectura estimado
export function readingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200); // 200 palabras por minuto
}
