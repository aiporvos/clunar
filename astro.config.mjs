import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://tudominio.com',

  integrations: [
    react(),
    mdx(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
    keystatic(),
  ],

  // server: SSR completo necesario para Keystatic admin
  output: 'server',

  adapter: node({
    mode: 'standalone',
    trustProxy: true,
  }),
});
