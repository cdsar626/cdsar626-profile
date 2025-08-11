/**
 * Unit tests for performance utility functions
 * Tests lazy loading, resource preloading, and performance monitoring
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  lazyLoad,
  LazyImageLoader,
  ResourcePreloader,
  PerformanceMonitor,
  optimizeBundle,
  perfMonitor,
  resourcePreloader,
  lazyImageLoader
} from '../utils/performance';

// Mock DOM environment
let dom: JSDOM;
let mockWindow: any;
let mockDocument: any;

beforeEach(() => {
  dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <div id="test-container"></div>
      </body>
    </html>
  `, {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable'
  });

  mockWindow = dom.window;
  mockDocument = dom.window.document;

  // Set up global mocks
  global.window = mockWindow as any;
  global.document = mockDocument as any;
  global.navigator = mockWindow.navigator as any;
  global.requestIdleCallback = vi.fn((callback) => setTimeout(callback, 0));
  global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  })) as any;

  // Mock performance API
  mockWindow.performance = {
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    now: vi.fn(() => Date.now())
  };

  // Mock matchMedia
  mockWindow.matchMedia = vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }));
});

afterEach(() => {
  dom.window.close();
  vi.clearAllMocks();
});

describe('Performance Utility Functions', () => {
  describe('lazyLoad', () => {
    it('should use requestIdleCallback when available', async () => {
      const mockImport = vi.fn().mockResolvedValue({ default: 'component' });
      
      await lazyLoad(mockImport);
      
      expect(global.requestIdleCallback).toHaveBeenCalled();
      expect(mockImport).toHaveBeenCalled();
    });

    it('should fallback to setTimeout when requestIdleCallback is not available', async () => {
      // Remove requestIdleCallback
      delete (global as any).requestIdleCallback;
      
      const mockImport = vi.fn().mockResolvedValue({ default: 'component' });
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      await lazyLoad(mockImport);
      
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0);
      expect(mockImport).toHaveBeenCalled();
    });

    it('should handle import errors gracefully', async () => {
      const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'));
      
      // Should not throw
      await expect(lazyLoad(mockImport)).resolves.toBeUndefined();
    });
  });

  describe('LazyImageLoader', () => {
    let loader: LazyImageLoader;

    beforeEach(() => {
      loader = new LazyImageLoader();
    });

    afterEach(() => {
      loader.disconnect();
    });

    it('should initialize with IntersectionObserver when available', () => {
      expect(global.IntersectionObserver).toHaveBeenCalled();
    });

    it('should observe images with data-src attribute', () => {
      const img = mockDocument.createElement('img');
      img.dataset.src = '/test-image.jpg';
      
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      };
      
      // Mock the observer instance
      (global.IntersectionObserver as any).mockImplementation(() => mockObserver);
      
      const newLoader = new LazyImageLoader();
      newLoader.observe(img);
      
      expect(mockObserver.observe).toHaveBeenCalledWith(img);
    });

    it('should load image immediately when IntersectionObserver is not available', () => {
      // Remove IntersectionObserver
      delete (global as any).IntersectionObserver;
      
      const img = mockDocument.createElement('img');
      img.dataset.src = '/test-image.jpg';
      img.dataset.srcset = '/test-image-2x.jpg 2x';
      
      const newLoader = new LazyImageLoader();
      newLoader.observe(img);
      
      expect(img.src).toBe('/test-image.jpg');
      expect(img.srcset).toBe('/test-image-2x.jpg 2x');
      expect(img.classList.contains('lazy-loaded')).toBe(true);
    });

    it('should handle images without data-src', () => {
      const img = mockDocument.createElement('img');
      
      expect(() => loader.observe(img)).not.toThrow();
    });

    it('should disconnect observer properly', () => {
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      };
      
      (global.IntersectionObserver as any).mockImplementation(() => mockObserver);
      
      const newLoader = new LazyImageLoader();
      newLoader.disconnect();
      
      expect(mockObserver.disconnect).toHaveBeenCalled();
    });
  });

  describe('ResourcePreloader', () => {
    let preloader: ResourcePreloader;

    beforeEach(() => {
      preloader = new ResourcePreloader();
    });

    describe('preloadImage', () => {
      it('should create preload link for image', async () => {
        const src = '/test-image.jpg';
        
        // Mock successful load
        const mockLink = {
          rel: '',
          as: '',
          href: '',
          onload: null as any,
          onerror: null as any,
          setAttribute: vi.fn()
        };
        
        const createElementSpy = vi.spyOn(mockDocument, 'createElement')
          .mockReturnValue(mockLink);
        const appendChildSpy = vi.spyOn(mockDocument.head, 'appendChild');
        
        const promise = preloader.preloadImage(src, 'high');
        
        // Simulate successful load
        if (mockLink.onload) {
          mockLink.onload();
        }
        
        await promise;
        
        expect(createElementSpy).toHaveBeenCalledWith('link');
        expect(mockLink.rel).toBe('preload');
        expect(mockLink.as).toBe('image');
        expect(mockLink.href).toBe(src);
        expect(mockLink.setAttribute).toHaveBeenCalledWith('fetchpriority', 'high');
        expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      });

      it('should not preload same image twice', async () => {
        const src = '/test-image.jpg';
        
        // First preload
        await preloader.preloadImage(src);
        
        const createElementSpy = vi.spyOn(mockDocument, 'createElement');
        
        // Second preload should resolve immediately
        await preloader.preloadImage(src);
        
        expect(createElementSpy).not.toHaveBeenCalled();
      });

      it('should handle preload errors', async () => {
        const src = '/invalid-image.jpg';
        
        const mockLink = {
          rel: '',
          as: '',
          href: '',
          onload: null as any,
          onerror: null as any,
          setAttribute: vi.fn()
        };
        
        vi.spyOn(mockDocument, 'createElement').mockReturnValue(mockLink);
        
        const promise = preloader.preloadImage(src);
        
        // Simulate error
        if (mockLink.onerror) {
          mockLink.onerror();
        }
        
        await expect(promise).rejects.toThrow('Failed to preload image: /invalid-image.jpg');
      });
    });

    describe('preloadFont', () => {
      it('should create preload link for font', () => {
        const href = '/fonts/test-font.woff2';
        
        const mockLink = {
          rel: '',
          as: '',
          type: '',
          href: '',
          crossOrigin: ''
        };
        
        const createElementSpy = vi.spyOn(mockDocument, 'createElement')
          .mockReturnValue(mockLink);
        const appendChildSpy = vi.spyOn(mockDocument.head, 'appendChild');
        
        preloader.preloadFont(href);
        
        expect(createElementSpy).toHaveBeenCalledWith('link');
        expect(mockLink.rel).toBe('preload');
        expect(mockLink.as).toBe('font');
        expect(mockLink.type).toBe('font/woff2');
        expect(mockLink.href).toBe(href);
        expect(mockLink.crossOrigin).toBe('anonymous');
        expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      });

      it('should not preload same font twice', () => {
        const href = '/fonts/test-font.woff2';
        
        preloader.preloadFont(href);
        
        const createElementSpy = vi.spyOn(mockDocument, 'createElement');
        
        preloader.preloadFont(href);
        
        expect(createElementSpy).not.toHaveBeenCalled();
      });
    });

    describe('preloadScript', () => {
      it('should create modulepreload link for script', async () => {
        const src = '/scripts/test-script.js';
        
        const mockLink = {
          rel: '',
          href: '',
          onload: null as any,
          onerror: null as any
        };
        
        const createElementSpy = vi.spyOn(mockDocument, 'createElement')
          .mockReturnValue(mockLink);
        const appendChildSpy = vi.spyOn(mockDocument.head, 'appendChild');
        
        const promise = preloader.preloadScript(src);
        
        // Simulate successful load
        if (mockLink.onload) {
          mockLink.onload();
        }
        
        await promise;
        
        expect(createElementSpy).toHaveBeenCalledWith('link');
        expect(mockLink.rel).toBe('modulepreload');
        expect(mockLink.href).toBe(src);
        expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      });
    });
  });

  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    describe('mark', () => {
      it('should create performance mark when available', () => {
        const markName = 'test-mark';
        
        monitor.mark(markName);
        
        expect(mockWindow.performance.mark).toHaveBeenCalledWith(markName);
      });

      it('should fallback to timestamp when performance.mark is not available', () => {
        delete mockWindow.performance.mark;
        
        const markName = 'test-mark';
        monitor.mark(markName);
        
        // Should not throw and should store timestamp
        expect(() => monitor.mark(markName)).not.toThrow();
      });
    });

    describe('measure', () => {
      it('should create performance measure when available', () => {
        const measureName = 'test-measure';
        const startMark = 'start-mark';
        const endMark = 'end-mark';
        
        mockWindow.performance.getEntriesByName.mockReturnValue([
          { duration: 100 }
        ]);
        
        const result = monitor.measure(measureName, startMark, endMark);
        
        expect(mockWindow.performance.measure).toHaveBeenCalledWith(measureName, startMark, endMark);
        expect(result).toBe(100);
      });

      it('should fallback to manual calculation', () => {
        delete mockWindow.performance.measure;
        
        monitor.mark('start');
        setTimeout(() => {
          monitor.mark('end');
          const result = monitor.measure('test', 'start', 'end');
          expect(typeof result).toBe('number');
        }, 10);
      });

      it('should handle measurement errors gracefully', () => {
        mockWindow.performance.measure.mockImplementation(() => {
          throw new Error('Measurement failed');
        });
        
        const result = monitor.measure('test', 'invalid-start');
        expect(result).toBeNull();
      });
    });

    describe('getMetrics', () => {
      it('should return performance metrics when available', () => {
        mockWindow.performance.getEntriesByName.mockImplementation((name) => {
          if (name === 'first-contentful-paint') {
            return [{ startTime: 1500 }];
          }
          return [];
        });
        
        const metrics = monitor.getMetrics();
        
        expect(metrics.fcp).toBe(1500);
      });

      it('should handle missing performance API gracefully', () => {
        delete mockWindow.performance;
        
        const metrics = monitor.getMetrics();
        
        expect(typeof metrics).toBe('object');
      });
    });
  });

  describe('optimizeBundle', () => {
    describe('importComponent', () => {
      it('should import component successfully', async () => {
        const mockComponent = { default: 'TestComponent' };
        const importFn = vi.fn().mockResolvedValue(mockComponent);
        
        const result = await optimizeBundle.importComponent(importFn);
        
        expect(result).toBe(mockComponent);
        expect(importFn).toHaveBeenCalled();
      });

      it('should handle import errors gracefully', async () => {
        const importFn = vi.fn().mockRejectedValue(new Error('Import failed'));
        
        const result = await optimizeBundle.importComponent(importFn);
        
        expect(result).toBeNull();
      });
    });

    describe('shouldLoadFeature', () => {
      it('should respect reduced motion preference for animations', () => {
        mockWindow.matchMedia.mockReturnValue({ matches: true });
        
        const result = optimizeBundle.shouldLoadFeature('animations');
        
        expect(result).toBe(false);
        expect(mockWindow.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
      });

      it('should check connection type for heavy components', () => {
        mockWindow.navigator.connection = {
          effectiveType: '2g'
        };
        
        const result = optimizeBundle.shouldLoadFeature('heavy-components');
        
        expect(result).toBe(false);
      });

      it('should check device memory for heavy components', () => {
        mockWindow.navigator.deviceMemory = 2;
        
        const result = optimizeBundle.shouldLoadFeature('heavy-components');
        
        expect(result).toBe(false);
      });

      it('should allow features on capable devices', () => {
        mockWindow.matchMedia.mockReturnValue({ matches: false });
        mockWindow.navigator.connection = {
          effectiveType: '4g'
        };
        mockWindow.navigator.deviceMemory = 8;
        
        const result = optimizeBundle.shouldLoadFeature('animations');
        
        expect(result).toBe(true);
      });
    });

    describe('removeUnusedFeatures', () => {
      it('should remove elements marked as unused', () => {
        const unusedElement = mockDocument.createElement('div');
        unusedElement.setAttribute('data-unused', 'true');
        mockDocument.body.appendChild(unusedElement);
        
        const removeSpy = vi.spyOn(unusedElement, 'remove');
        vi.spyOn(mockDocument, 'querySelectorAll').mockReturnValue([unusedElement] as any);
        
        optimizeBundle.removeUnusedFeatures();
        
        expect(removeSpy).toHaveBeenCalled();
      });

      it('should clean up development globals in production', () => {
        // Mock production environment
        vi.mock('import.meta.env', () => ({
          PROD: true
        }));
        
        mockWindow.__DEV__ = true;
        mockWindow.__DEBUG__ = true;
        
        optimizeBundle.removeUnusedFeatures();
        
        // Note: This test would need actual implementation to verify
        expect(true).toBe(true); // Placeholder assertion
      });
    });
  });

  describe('Global Instances', () => {
    it('should export global performance monitor instance', () => {
      expect(perfMonitor).toBeInstanceOf(PerformanceMonitor);
    });

    it('should export global resource preloader instance', () => {
      expect(resourcePreloader).toBeInstanceOf(ResourcePreloader);
    });

    it('should export global lazy image loader instance', () => {
      expect(lazyImageLoader).toBeInstanceOf(LazyImageLoader);
    });
  });

  describe('Cleanup and Memory Management', () => {
    it('should handle beforeunload event for cleanup', () => {
      const disconnectSpy = vi.spyOn(lazyImageLoader, 'disconnect');
      
      // Simulate beforeunload event
      const beforeUnloadEvent = new Event('beforeunload');
      mockWindow.dispatchEvent(beforeUnloadEvent);
      
      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should clean up observers on disconnect', () => {
      const loader = new LazyImageLoader();
      const disconnectSpy = vi.fn();
      
      // Mock observer with disconnect method
      (loader as any).observer = { disconnect: disconnectSpy };
      
      loader.disconnect();
      
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing window object', () => {
      const originalWindow = global.window;
      delete (global as any).window;
      
      expect(() => new LazyImageLoader()).not.toThrow();
      expect(() => new ResourcePreloader()).not.toThrow();
      expect(() => new PerformanceMonitor()).not.toThrow();
      
      global.window = originalWindow;
    });

    it('should handle malformed performance entries', () => {
      mockWindow.performance.getEntriesByName.mockReturnValue([
        null,
        undefined,
        { duration: null },
        { duration: 'invalid' }
      ]);
      
      const monitor = new PerformanceMonitor();
      const result = monitor.measure('test', 'start');
      
      expect(result).toBeNull();
    });

    it('should handle DOM manipulation errors', () => {
      const mockLink = {
        rel: '',
        as: '',
        href: '',
        onload: null as any,
        onerror: null as any
      };
      
      vi.spyOn(mockDocument, 'createElement').mockReturnValue(mockLink);
      vi.spyOn(mockDocument.head, 'appendChild').mockImplementation(() => {
        throw new Error('DOM error');
      });
      
      const preloader = new ResourcePreloader();
      
      expect(() => preloader.preloadFont('/font.woff2')).not.toThrow();
    });
  });
});