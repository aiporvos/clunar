import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://tudominio.com',

  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
    keystatic(),
  ],

  // SSR necesario para Keystatic en producción
  output: 'static',

  adapter: node({
    mode: 'standalone',
  }),
});
