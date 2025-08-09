// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Enable code splitting for better performance
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate Vue components into their own chunk
            vue: ['vue'],
            // Separate large dependencies
            vendor: ['@astrojs/vue']
          }
        }
      }
    }
  },

  integrations: [vue()],

  // Enhanced image optimization configuration
  image: {
    domains: [],
    remotePatterns: [],
    // Enable responsive image generation
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: 268402689, // ~16K x 16K pixels
      }
    }
  },

  // Build configuration for optimal performance
  build: {
    // Inline critical CSS automatically
    inlineStylesheets: 'auto',
    // Enable asset optimization
    assets: 'assets',
  },

  // Enhanced prefetch configuration for better performance
  prefetch: {
    prefetchAll: false, // More selective prefetching
    defaultStrategy: 'viewport',
  },

  // Compression and optimization
  compressHTML: true,
  
  // Output configuration for static hosting
  output: 'static',
  
  // Performance optimizations
  // Note: optimizeHoistedScript is now enabled by default in Astro 5+
});