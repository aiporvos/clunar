import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';

// Versión markdown cruda de cada post — para "Ver como Markdown" / "Copiar página"
// (widget PageActions) y para que agentes/LLMs consuman el contenido directo,
// sin parsear HTML. Ver BRAND.md §Agentes.
export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as any;
  const siteUrl = import.meta.env.SITE_URL || 'https://cluna.ar';
  const url = `${siteUrl}/blog/${post.slug}`;

  const header = [
    `# ${post.data.title}`,
    '',
    `> ${post.data.excerpt}`,
    '',
    `**Autor:** ${post.data.author}  `,
    `**Publicado:** ${post.data.publishedAt}  `,
    `**Fuente:** ${url}`,
    '',
    '---',
    '',
  ].join('\n');

  const body = (post.body ?? '').trim();

  return new Response(header + body + '\n', {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
