// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [vue()],

  // Image optimization configuration
  image: {
    domains: [],
    remotePatterns: [],
  },

  // Build configuration for optimal performance
  build: {
    inlineStylesheets: 'auto',
  },

  // Prefetch configuration for better performance
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  }
});