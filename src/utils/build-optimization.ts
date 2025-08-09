/**
 * Build-time optimization utilities for Astro
 */

// Critical CSS extraction utility
export function extractCriticalCSS(html: string): { critical: string; remaining: string } {
  // This would typically use a tool like critical or penthouse
  // For now, we'll define critical CSS patterns
  const criticalSelectors = [
    // Layout and structure
    'html', 'body', '*', '*::before', '*::after',
    // Above-the-fold content
    '.profile-section', '.profile-container', '.profile-image', '.profile-name', '.profile-role',
    '.header', '.main-content',
    // Critical utilities
    '.container', '.sr-only',
    // CSS custom properties
    ':root',
    // Critical animations
    '@keyframes fadeIn', '@keyframes slideUp'
  ];

  // Extract critical CSS (simplified implementation)
  const critical = criticalSelectors.map(selector => {
    // This would extract actual CSS rules matching these selectors
    return `/* Critical CSS for ${selector} */`;
  }).join('\n');

  return {
    critical,
    remaining: '/* Non-critical CSS would be here */'
  };
}

// Asset optimization configuration
export const assetOptimization = {
  images: {
    // WebP conversion settings
    webp: {
      quality: 85,
      effort: 6,
    },
    // AVIF conversion settings (next-gen format)
    avif: {
      quality: 80,
      effort: 9,
    },
    // JPEG optimization
    jpeg: {
      quality: 85,
      progressive: true,
    },
    // PNG optimization
    png: {
      compressionLevel: 9,
      adaptiveFiltering: true,
    },
    // Responsive image breakpoints
    breakpoints: [320, 640, 768, 1024, 1280, 1536],
    // Lazy loading threshold
    lazyThreshold: '50px',
  },
  
  fonts: {
    // Font display strategy
    display: 'swap',
    // Preload critical fonts
    preload: ['/fonts/inter-var.woff2'],
    // Font subsetting (if implemented)
    subset: {
      latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    },
  },
  
  css: {
    // Purge unused CSS
    purge: {
      content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue}'],
      safelist: [
        // Keep dynamic classes
        /^fade-/, /^slide-/, /^scale-/,
        // Keep state classes
        /^is-/, /^has-/, /^show/, /^hide/,
        // Keep responsive classes
        /^sm:/, /^md:/, /^lg:/, /^xl:/,
      ],
    },
    // Minification settings
    minify: {
      removeComments: true,
      removeEmptyRules: true,
      mergeRules: true,
      optimizeFont: true,
    },
  },
  
  javascript: {
    // Tree shaking configuration
    treeShaking: {
      moduleSideEffects: false,
      usedExports: true,
    },
    // Code splitting configuration
    splitting: {
      chunks: 'async',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        vue: {
          test: /[\\/]node_modules[\\/]vue/,
          name: 'vue',
          chunks: 'all',
        },
      },
    },
    // Minification settings
    minify: {
      removeComments: true,
      removeConsole: true, // Remove console.log in production
      removeDebugger: true,
      dropDeadCode: true,
    },
  },
};

// Performance budget configuration
export const performanceBudgets = {
  // Lighthouse thresholds
  lighthouse: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 95,
  },
  
  // Core Web Vitals thresholds
  webVitals: {
    // Largest Contentful Paint (ms)
    lcp: 2500,
    // First Input Delay (ms)
    fid: 100,
    // Cumulative Layout Shift
    cls: 0.1,
    // First Contentful Paint (ms)
    fcp: 1800,
    // Time to Interactive (ms)
    tti: 3800,
  },
  
  // Bundle size budgets (bytes)
  bundles: {
    // Initial JavaScript bundle
    initial: 100 * 1024, // 100KB
    // Async chunks
    async: 50 * 1024, // 50KB
    // CSS bundle
    css: 50 * 1024, // 50KB
    // Images per page
    images: 500 * 1024, // 500KB
    // Fonts
    fonts: 100 * 1024, // 100KB
  },
  
  // Network budgets
  network: {
    // Total page weight
    totalSize: 1 * 1024 * 1024, // 1MB
    // Number of requests
    requests: 50,
    // Time to first byte (ms)
    ttfb: 600,
  },
};

// Build-time optimization functions
export const buildOptimizations = {
  // Inline critical CSS
  inlineCriticalCSS: (html: string, css: string): string => {
    const { critical } = extractCriticalCSS(html);
    return html.replace(
      '</head>',
      `<style>${critical}</style></head>`
    );
  },
  
  // Preload critical resources
  addResourceHints: (html: string): string => {
    const hints = [
      '<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>',
      '<link rel="dns-prefetch" href="//fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>',
    ];
    
    return html.replace(
      '</head>',
      `${hints.join('\n')}</head>`
    );
  },
  
  // Optimize images
  optimizeImages: async (imagePath: string): Promise<string[]> => {
    // This would use sharp or similar to generate optimized versions
    const formats = ['webp', 'avif'];
    const breakpoints = assetOptimization.images.breakpoints;
    
    const optimizedImages: string[] = [];
    
    for (const format of formats) {
      for (const width of breakpoints) {
        // Generate optimized image
        const optimizedPath = `${imagePath}-${width}w.${format}`;
        optimizedImages.push(optimizedPath);
      }
    }
    
    return optimizedImages;
  },
  
  // Generate service worker
  generateServiceWorker: (assets: string[]): string => {
    return `
      const CACHE_NAME = 'portfolio-v${Date.now()}';
      const ASSETS_TO_CACHE = ${JSON.stringify(assets)};
      
      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
        );
      });
      
      self.addEventListener('fetch', (event) => {
        event.respondWith(
          caches.match(event.request)
            .then((response) => response || fetch(event.request))
        );
      });
    `;
  },
  
  // Validate performance budgets
  validateBudgets: (stats: any): { passed: boolean; violations: string[] } => {
    const violations: string[] = [];
    
    // Check bundle sizes
    if (stats.assets) {
      const jsSize = stats.assets
        .filter((asset: any) => asset.name.endsWith('.js'))
        .reduce((total: number, asset: any) => total + asset.size, 0);
      
      if (jsSize > performanceBudgets.bundles.initial) {
        violations.push(`JavaScript bundle size (${jsSize}) exceeds budget (${performanceBudgets.bundles.initial})`);
      }
      
      const cssSize = stats.assets
        .filter((asset: any) => asset.name.endsWith('.css'))
        .reduce((total: number, asset: any) => total + asset.size, 0);
      
      if (cssSize > performanceBudgets.bundles.css) {
        violations.push(`CSS bundle size (${cssSize}) exceeds budget (${performanceBudgets.bundles.css})`);
      }
    }
    
    return {
      passed: violations.length === 0,
      violations,
    };
  },
};

// Runtime performance monitoring
export const runtimeOptimizations = {
  // Measure and report Core Web Vitals
  measureWebVitals: (): void => {
    if (typeof window === 'undefined') return;
    
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry.startTime > performanceBudgets.webVitals.lcp) {
          console.warn(`LCP (${lastEntry.startTime}ms) exceeds budget (${performanceBudgets.webVitals.lcp}ms)`);
        }
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Fallback for unsupported browsers
      }
    }
  },
  
  // Monitor memory usage
  monitorMemory: (): void => {
    if (typeof window === 'undefined' || !('performance' in window)) return;
    
    const memory = (performance as any).memory;
    if (memory) {
      const memoryInfo = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
      
      // Warn if memory usage is high
      const usagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
      if (usagePercent > 80) {
        console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
      }
    }
  },
  
  // Optimize animations
  optimizeAnimations: (): void => {
    if (typeof window === 'undefined') return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Disable animations
      document.documentElement.style.setProperty('--animation-duration', '0ms');
      document.documentElement.style.setProperty('--transition-duration', '0ms');
    } else {
      // Optimize animations for performance
      const animatedElements = document.querySelectorAll('[class*="animate"]');
      animatedElements.forEach((el) => {
        (el as HTMLElement).style.willChange = 'transform, opacity';
      });
    }
  },
};

// Export default configuration
export default {
  assetOptimization,
  performanceBudgets,
  buildOptimizations,
  runtimeOptimizations,
};