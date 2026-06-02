import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    coverImage: z.string().optional(),
    publishedAt: z.string(),
    author: z.string().default('Valeria De Giorgi'),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    readTime: z.number().optional(),
    draft: z.boolean().default(false),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

export const collections = { posts };
