/**
 * Performance optimization utilities
 */

// Lazy loading utility for components
export const lazyLoad = (importFn: () => Promise<any>) => {
  return new Promise((resolve) => {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFn().then(resolve);
      });
    } else {
      setTimeout(() => {
        importFn().then(resolve);
      }, 0);
    }
  });
};

// Image lazy loading with Intersection Observer
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.observer?.unobserve(img);
              this.images.delete(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      );
    }
  }

  public observe(img: HTMLImageElement) {
    if (this.observer && img.dataset.src) {
      this.images.add(img);
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  private loadImage(img: HTMLImageElement) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      
      // Add loading class for fade-in effect
      img.classList.add('lazy-loaded');
      
      // Handle srcset if present
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
        img.removeAttribute('data-srcset');
      }
    }
  }

  public disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

// Critical resource preloader
export class ResourcePreloader {
  private preloadedResources: Set<string> = new Set();

  public preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedResources.has(src)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }

      link.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      
      link.onerror = () => {
        reject(new Error(`Failed to preload image: ${src}`));
      };

      document.head.appendChild(link);
    });
  }

  public preloadFont(href: string, type: string = 'font/woff2'): void {
    if (this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = type;
    link.href = href;
    link.crossOrigin = 'anonymous';

    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  public preloadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedResources.has(src)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = src;

      link.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      
      link.onerror = () => {
        reject(new Error(`Failed to preload script: ${src}`));
      };

      document.head.appendChild(link);
    });
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  public mark(name: string): void {
    if ('performance' in window && performance.mark) {
      performance.mark(name);
    }
    this.metrics.set(name, Date.now());
  }

  public measure(name: string, startMark: string, endMark?: string): number | null {
    if ('performance' in window && performance.measure) {
      try {
        if (endMark) {
          performance.measure(name, startMark, endMark);
        } else {
          performance.measure(name, startMark);
        }
        
        const entries = performance.getEntriesByName(name, 'measure');
        return entries.length > 0 ? entries[entries.length - 1].duration : null;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }
    
    // Fallback measurement
    const startTime = this.metrics.get(startMark);
    const endTime = endMark ? this.metrics.get(endMark) : Date.now();
    
    if (startTime && endTime) {
      return endTime - startTime;
    }
    
    return null;
  }

  public getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    
    // Get Web Vitals if available
    if ('performance' in window) {
      try {
        // First Contentful Paint
        const fcpEntries = performance.getEntriesByName('first-contentful-paint');
        if (fcpEntries.length > 0) {
          result.fcp = fcpEntries[0].startTime;
        }
        
        // Largest Contentful Paint (requires observer)
        // Time to Interactive (requires polyfill)
        // Cumulative Layout Shift (requires observer)
      } catch (error) {
        console.warn('Failed to get performance metrics:', error);
      }
    }
    
    return result;
  }
}

// Bundle size optimization utilities
export const optimizeBundle = {
  // Dynamic import with error handling
  async importComponent<T>(importFn: () => Promise<T>): Promise<T | null> {
    try {
      return await importFn();
    } catch (error) {
      console.error('Failed to load component:', error);
      return null;
    }
  },

  // Conditional loading based on device capabilities
  shouldLoadFeature(feature: 'animations' | 'advanced-interactions' | 'heavy-components'): boolean {
    // Check for reduced motion preference
    if (feature === 'animations' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    
    // Check for low-end devices
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
        return feature !== 'heavy-components';
      }
    }
    
    // Check for limited memory
    if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) {
      return feature !== 'heavy-components';
    }
    
    return true;
  },

  // Tree-shake unused code
  removeUnusedFeatures(): void {
    // Remove unused event listeners
    const unusedElements = document.querySelectorAll('[data-unused]');
    unusedElements.forEach(el => el.remove());
    
    // Clean up global variables
    if (typeof window !== 'undefined') {
      // Remove development-only globals in production
      if (import.meta.env.PROD) {
        delete (window as any).__DEV__;
        delete (window as any).__DEBUG__;
      }
    }
  }
};

// Initialize performance monitoring
export const perfMonitor = new PerformanceMonitor();
export const resourcePreloader = new ResourcePreloader();
export const lazyImageLoader = new LazyImageLoader();

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    lazyImageLoader.disconnect();
  });
}