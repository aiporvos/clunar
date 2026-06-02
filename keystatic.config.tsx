import { config, fields, collection, singleton } from '@keystatic/core';

// En producción usa GitHub mode, en dev usa local
const isProd = process.env.NODE_ENV === 'production';

let githubOwner = '';
let githubRepo = '';

if (isProd) {
  try {
    const projectConfig = await import('./project.json', { assert: { type: 'json' } });
    githubOwner = projectConfig.default.github.account;
    githubRepo = projectConfig.default.github.repo;
  } catch {
    // Si no hay project.json, usar local
  }
}

export default config({
  storage: isProd && githubOwner
    ? {
        kind: 'github',
        repo: `${githubOwner}/${githubRepo}`,
        branchPrefix: 'keystatic/',
      }
    : { kind: 'local' },

  ui: {
    brand: {
      // Se puede personalizar el logo del CMS
      name: 'HIVE CMS',
    },
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
          description: 'Descripción corta para el listing y redes sociales (máx. 160 chars)',
          multiline: true,
          validation: { length: { max: 160 } },
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
          defaultValue: 'Claudio',
        }),

        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            itemLabel: props => props.value || 'Tag sin nombre',
          }
        ),

        draft: fields.checkbox({
          label: 'Borrador',
          description: 'Los borradores no se muestran en producción',
          defaultValue: true,
        }),

        seoTitle: fields.text({
          label: 'Título SEO',
          description: 'Opcional. Si está vacío usa el título del post.',
        }),

        seoDescription: fields.text({
          label: 'Meta descripción',
          description: '150-160 caracteres para SEO',
          multiline: true,
        }),

        content: fields.markdoc({
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

    authors: collection({
      label: 'Autores',
      slugField: 'name',
      path: 'src/content/authors/*',
      schema: {
        name: fields.slug({ name: { label: 'Nombre' } }),

        bio: fields.text({
          label: 'Bio',
          multiline: true,
        }),

        avatar: fields.image({
          label: 'Avatar',
          directory: 'public/images/authors',
          publicPath: '/images/authors/',
        }),

        social: fields.object({
          twitter: fields.text({ label: 'Twitter (sin @)' }),
          linkedin: fields.text({ label: 'LinkedIn URL' }),
          website: fields.url({ label: 'Sitio web' }),
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

        siteDescription: fields.text({
          label: 'Descripción del sitio',
          multiline: true,
        }),

        logo: fields.image({
          label: 'Logo',
          directory: 'public/images',
          publicPath: '/images/',
        }),

        socialLinks: fields.object({
          twitter: fields.url({ label: 'Twitter URL' }),
          linkedin: fields.url({ label: 'LinkedIn URL' }),
          instagram: fields.url({ label: 'Instagram URL' }),
          youtube: fields.url({ label: 'YouTube URL' }),
        }),

        navigation: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            href: fields.text({ label: 'URL' }),
          }),
          { label: 'Links de navegación', itemLabel: props => props.fields.label.value }
        ),
      },
    }),
  },
});
