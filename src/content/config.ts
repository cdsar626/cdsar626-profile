import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    thumbnail: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    links: z.object({
      main: z.string().url().optional(),
      github: z.string().url().optional(),
      additional: z.string().url().optional(),
    }),
    publishDate: z.date(),
  }),
});

export const collections = {
  projects: projectsCollection,
};