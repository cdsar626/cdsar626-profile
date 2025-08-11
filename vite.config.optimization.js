import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Enable build optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vue': ['vue'],
          'astro': ['astro'],
          
          // Utility chunks
          'utils': ['src/utils/performance.ts', 'src/utils/seo.ts'],
          
          // Component chunks
          'components': [
            'src/components/ui/CVViewer.vue',
            'src/components/ui/ProjectCard.astro'
          ],
        },
        
        // Asset naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Asset optimization
    assetsInlineLimit: 4096, // 4KB
    cssCodeSplit: true,
    sourcemap: false, // Disable in production
    
    // Target modern browsers
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    
    // Enable polyfills only when needed
    polyfillModulePreload: false,
  },
  
  // CSS optimization
  css: {
    devSourcemap: false,
    postcss: {
      plugins: [
        // Add PostCSS plugins for optimization
        require('autoprefixer'),
        require('cssnano')({
          preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
            colormin: true,
            convertValues: true,
            discardDuplicates: true,
            discardEmpty: true,
            mergeRules: true,
            minifyFontValues: true,
            minifyParams: true,
            minifySelectors: true,
            reduceIdents: false, // Keep for CSS custom properties
            zindex: false, // Avoid z-index optimization issues
          }],
        }),
      ],
    },
  },
  
  // Server optimization for development
  server: {
    hmr: {
      overlay: false, // Disable error overlay in production builds
    },
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: ['vue', '@astrojs/vue'],
    exclude: ['astro'],
  },
});