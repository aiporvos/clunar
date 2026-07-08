import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

// Convención llms.txt (https://llmstxt.org): índice del sitio en markdown plano
// para que agentes/LLMs entiendan la estructura sin rastrear HTML. Cada post
// linkea directo a su versión .md (ver blog/[...slug].md.ts). Ver BRAND.md §Agentes.
export const prerender = true;

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.SITE_URL || 'https://cluna.ar';
  const posts = (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime());

  const lines = [
    '# cluna.ar',
    '',
    '> Claudio Luna — automatización e IA para empresas de LATAM, con foco en sistemas',
    '> multi-agente, RAG especializado, integración de sistemas y gobernanza de datos.',
    '> Más de 15 años en análisis funcional y desarrollo aplicados a IA en producción.',
    '',
    '## Sitio',
    '',
    `- [Inicio](${siteUrl}/): servicios, arquitecturas de referencia, cómo trabaja, contacto.`,
    `- [Brand system](${siteUrl}/brand): manual de marca — voz, sistema visual y reglas para reconstruir el sitio.`,
    `- [Blog](${siteUrl}/blog): artículos, flujos de n8n y sistemas publicados para la comunidad.`,
    '',
    '## Blog',
    '',
    ...posts.map(p => `- [${p.data.title}](${siteUrl}/blog/${p.slug}.md): ${p.data.excerpt}`),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
