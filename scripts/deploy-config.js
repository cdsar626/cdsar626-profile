#!/usr/bin/env node

/**
 * Deployment Configuration Script
 * Generates optimized deployment configurations for various static hosting platforms
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');

// Deployment configurations for different platforms
const deploymentConfigs = {
  // Netlify configuration
  netlify: {
    filename: 'netlify.toml',
    content: `# Netlify deployment configuration
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

# Headers for security and performance
[[headers]]
  for = "/*"
  [headers.values]
    # Security headers
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
    
    # Performance headers
    Cache-Control = "public, max-age=31536000, immutable"

# Specific caching for HTML files
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

# Specific caching for assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Specific caching for images
[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Compression
[[headers]]
  for = "*.js"
  [headers.values]
    Content-Encoding = "gzip"

[[headers]]
  for = "*.css"
  [headers.values]
    Content-Encoding = "gzip"

# Redirects for SPA behavior (if needed)
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# 404 handling
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 404

# Prerender configuration
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[build.processing.images]
  compress = true`
  },

  // Vercel configuration
  vercel: {
    filename: 'vercel.json',
    content: JSON.stringify({
      "version": 2,
      "buildCommand": "npm run build",
      "outputDirectory": "dist",
      "installCommand": "npm install",
      "framework": "astro",
      "headers": [
        {
          "source": "/(.*)",
          "headers": [
            {
              "key": "X-Frame-Options",
              "value": "DENY"
            },
            {
              "key": "X-Content-Type-Options",
              "value": "nosniff"
            },
            {
              "key": "X-XSS-Protection",
              "value": "1; mode=block"
            },
            {
              "key": "Referrer-Policy",
              "value": "strict-origin-when-cross-origin"
            }
          ]
        },
        {
          "source": "/assets/(.*)",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "public, max-age=31536000, immutable"
            }
          ]
        },
        {
          "source": "/(.*).html",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "public, max-age=0, must-revalidate"
            }
          ]
        }
      ],
      "rewrites": [
        {
          "source": "/(.*)",
          "destination": "/index.html"
        }
      ]
    }, null, 2)
  },

  // GitHub Pages configuration
  github: {
    filename: '.github/workflows/deploy.yml',
    content: `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build site
        run: npm run build
        
      - name: Validate build
        run: node scripts/build-performance.js
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`
  },

  // Cloudflare Pages configuration
  cloudflare: {
    filename: '_headers',
    content: `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.svg
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=31536000, immutable

/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/*.webp
  Cache-Control: public, max-age=31536000, immutable`
  },

  // Firebase Hosting configuration
  firebase: {
    filename: 'firebase.json',
    content: JSON.stringify({
      "hosting": {
        "public": "dist",
        "ignore": [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        "headers": [
          {
            "source": "**/*.@(js|css)",
            "headers": [
              {
                "key": "Cache-Control",
                "value": "max-age=31536000"
              }
            ]
          },
          {
            "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
            "headers": [
              {
                "key": "Cache-Control",
                "value": "max-age=31536000"
              }
            ]
          },
          {
            "source": "**/*.@(html|json)",
            "headers": [
              {
                "key": "Cache-Control",
                "value": "max-age=0"
              }
            ]
          }
        ],
        "rewrites": [
          {
            "source": "**",
            "destination": "/index.html"
          }
        ]
      }
    }, null, 2)
  }
};

// Performance optimization configurations
const performanceConfigs = {
  // Service Worker for caching
  serviceWorker: {
    filename: 'public/sw.js',
    content: `// Service Worker for Portfolio Site
const CACHE_NAME = 'portfolio-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/images/og-image.svg',
  '/favicon.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Serving from cache:', event.request.url);
          return cachedResponse;
        }

        console.log('Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for analytics (if implemented)
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(
      // Sync analytics data when back online
      console.log('Syncing analytics data')
    );
  }
});

// Push notifications (if implemented)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'portfolio-notification'
      })
    );
  }
});`
  },

  // Web App Manifest
  manifest: {
    filename: 'public/manifest.json',
    content: JSON.stringify({
      "name": "John Developer - Portfolio",
      "short_name": "Portfolio",
      "description": "Full-stack software developer portfolio showcasing projects and skills",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#000000",
      "orientation": "portrait-primary",
      "icons": [
        {
          "src": "/favicon.svg",
          "sizes": "any",
          "type": "image/svg+xml",
          "purpose": "any maskable"
        },
        {
          "src": "/images/icon-192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "/images/icon-512.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ],
      "categories": ["portfolio", "developer", "business"],
      "lang": "en",
      "dir": "ltr"
    }, null, 2)
  }
};

// Build optimization configurations
const buildConfigs = {
  // Vite build optimization
  viteConfig: {
    filename: 'vite.config.optimization.js',
    content: `import { defineConfig } from 'vite';

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
});`
  }
};

// Function to generate deployment configurations
function generateDeploymentConfigs(platforms = ['netlify', 'vercel', 'github']) {
  console.log('🚀 Generating deployment configurations...\n');
  
  platforms.forEach(platform => {
    if (deploymentConfigs[platform]) {
      const config = deploymentConfigs[platform];
      const filePath = path.join(PROJECT_ROOT, config.filename);
      
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write configuration file
      fs.writeFileSync(filePath, config.content);
      console.log(`✓ Generated ${platform} configuration: ${config.filename}`);
    } else {
      console.warn(`⚠ Unknown platform: ${platform}`);
    }
  });
}

// Function to generate performance configurations
function generatePerformanceConfigs() {
  console.log('\n⚡ Generating performance configurations...\n');
  
  Object.entries(performanceConfigs).forEach(([name, config]) => {
    const filePath = path.join(PROJECT_ROOT, config.filename);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write configuration file
    fs.writeFileSync(filePath, config.content);
    console.log(`✓ Generated ${name} configuration: ${config.filename}`);
  });
}

// Function to generate build configurations
function generateBuildConfigs() {
  console.log('\n🔧 Generating build optimization configurations...\n');
  
  Object.entries(buildConfigs).forEach(([name, config]) => {
    const filePath = path.join(PROJECT_ROOT, config.filename);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write configuration file
    fs.writeFileSync(filePath, config.content);
    console.log(`✓ Generated ${name} configuration: ${config.filename}`);
  });
}

// Function to update package.json with deployment scripts
function updatePackageScripts() {
  console.log('\n📦 Updating package.json scripts...\n');
  
  const packagePath = path.join(PROJECT_ROOT, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add deployment and optimization scripts
  const newScripts = {
    'build:optimize': 'astro build && node scripts/build-performance.js',
    'build:analyze': 'npm run build && node scripts/build-performance.js',
    'deploy:netlify': 'npm run build:optimize && netlify deploy --prod',
    'deploy:vercel': 'npm run build:optimize && vercel --prod',
    'deploy:firebase': 'npm run build:optimize && firebase deploy',
    'validate:build': 'node scripts/build-performance.js',
    'optimize:images': 'node scripts/optimize-images.js',
    'generate:configs': 'node scripts/deploy-config.js'
  };
  
  packageJson.scripts = { ...packageJson.scripts, ...newScripts };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✓ Updated package.json with deployment scripts');
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const platforms = args.length > 0 ? args : ['netlify', 'vercel', 'github'];
  
  console.log('🎯 Portfolio Deployment Configuration Generator\n');
  
  generateDeploymentConfigs(platforms);
  generatePerformanceConfigs();
  generateBuildConfigs();
  updatePackageScripts();
  
  console.log('\n🎉 All configurations generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Review the generated configuration files');
  console.log('2. Customize them according to your needs');
  console.log('3. Run "npm run build:optimize" to test the optimized build');
  console.log('4. Deploy using the appropriate "deploy:*" script');
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.endsWith('deploy-config.js') && process.argv[1].endsWith('deploy-config.js');

if (isMainModule) {
  main();
}

export { generateDeploymentConfigs, generatePerformanceConfigs, generateBuildConfigs };