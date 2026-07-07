import { config, fields, collection, singleton } from '@keystatic/core';

const isProd = process.env.NODE_ENV === 'production';

let githubOwner = '';
let githubRepo = '';

if (isProd) {
  try {
    const projectConfig = await import('./project.json', { with: { type: 'json' } });
    githubOwner = projectConfig.default.github.account;
    githubRepo = projectConfig.default.github.repo;
  } catch {
    // fallback a local
  }
}

export default config({
  storage: isProd && githubOwner
    ? { kind: 'github', repo: `${githubOwner}/${githubRepo}` }
    : { kind: 'local' },

  ui: {
    brand: { name: 'cluna.ar — CMS' },
  },

  collections: {
    posts: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),

        excerpt: fields.text({
          label: 'Extracto',
          description: 'Descripción corta para listing y redes (máx. 160 chars)',
          multiline: true,
        }),

        coverImage: fields.image({
          label: 'Imagen de portada',
          directory: 'public/images/posts',
          publicPath: '/images/posts/',
        }),

        publishedAt: fields.date({
          label: 'Fecha de publicación',
          defaultValue: { kind: 'today' },
        }),

        author: fields.text({
          label: 'Autor',
          defaultValue: 'Claudio Luna',
        }),

        category: fields.select({
          label: 'Categoría',
          defaultValue: 'Automatización',
          options: [
            { label: 'Automatización',    value: 'Automatización' },
            { label: 'Arquitectura IA',   value: 'Arquitectura IA' },
            { label: 'Adopción de IA',    value: 'Adopción de IA' },
            { label: 'Liderazgo & IA',    value: 'Liderazgo & IA' },
            { label: 'RAG & Datos',       value: 'RAG & Datos' },
            { label: 'Ecommerce',         value: 'Ecommerce' },
          ],
        }),

        readTime: fields.integer({
          label: 'Tiempo de lectura (minutos)',
          defaultValue: 5,
          validation: { min: 1, max: 60 },
        }),

        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags', itemLabel: props => props.value || 'Tag' }
        ),

        draft: fields.checkbox({
          label: 'Borrador',
          description: 'Los borradores no se muestran en el sitio',
          defaultValue: false,
        }),

        seoTitle: fields.text({
          label: 'Título SEO',
          description: 'Opcional. Si está vacío usa el título del post.',
        }),

        seoDescription: fields.text({
          label: 'Meta descripción SEO',
          description: '150-160 caracteres',
          multiline: true,
        }),

        content: fields.mdx({
          label: 'Contenido',
          options: {
            image: {
              directory: 'public/images/posts',
              publicPath: '/images/posts/',
            },
          },
        }),

      },
    }),
  },

  singletons: {
    siteConfig: singleton({
      label: 'Configuración del sitio',
      path: 'src/content/site-config',
      schema: {
        siteName: fields.text({ label: 'Nombre del sitio' }),
        siteDescription: fields.text({ label: 'Descripción', multiline: true }),
        logo: fields.image({ label: 'Logo', directory: 'public/images', publicPath: '/images/' }),
        socialLinks: fields.object({
          linkedin:  fields.url({ label: 'LinkedIn URL' }),
          instagram: fields.url({ label: 'Instagram URL' }),
          email:     fields.text({ label: 'Email de contacto' }),
        }),
      },
    }),
  },
});
