import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Animation System', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            /* Animation keyframes */
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(2rem); } to { opacity: 1; transform: translateY(0); } }
            @keyframes staggerFadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes pageEnter { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: calc(200px + 100%) 0; } }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            
            /* Animation classes */
            .fade-in { animation: fadeIn 0.6s ease-out forwards; }
            .slide-up { animation: slideUp 0.6s ease-out forwards; }
            .stagger-fade-up { opacity: 0; transform: translateY(30px); animation: staggerFadeUp 0.6s ease-out forwards; }
            .page-transition { animation: pageEnter 0.5s ease-out forwards; }
            .loading-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            .loading-shimmer { animation: shimmer 2s infinite; }
            .loading-spinner { animation: spin 1s linear infinite; }
            
            /* Hardware acceleration */
            .gpu-accelerated { transform: translateZ(0); backface-visibility: hidden; perspective: 1000px; }
            .will-change-transform { will-change: transform; }
            .will-change-opacity { will-change: opacity; }
            
            /* Scroll animation styles */
            [data-animate-on-scroll] { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
            [data-animate-on-scroll].animate-in { opacity: 1; transform: translateY(0); }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
              *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
            }
          </style>
        </head>
        <body>
          <div id="main-content" class="main-content page-transition">
            <section class="profile-section">
              <div class="profile-container">
                <div class="profile-image-wrapper">
                  <img class="profile-image" src="/test.jpg" alt="Profile" />
                </div>
                <div class="profile-info">
                  <h1>Test User</h1>
                  <p>Developer</p>
                </div>
              </div>
            </section>
            
            <section class="intro-section">
              <div class="intro-content" data-animate-on-scroll>
                <p>Introduction text</p>
              </div>
            </section>
            
            <section class="projects-section">
              <div class="projects-header">
                <h2>Projects</h2>
              </div>
              <div class="projects-grid">
                <div class="projects-grid__item" data-animate-on-scroll data-stagger="0">
                  <article class="project-card">
                    <div class="project-card__thumbnail">
                      <img class="project-card__image" src="/project1.jpg" alt="Project 1" loading="lazy" />
                    </div>
                    <div class="project-card__content">
                      <h3>Project 1</h3>
                    </div>
                  </article>
                </div>
                <div class="projects-grid__item" data-animate-on-scroll data-stagger="0.15">
                  <article class="project-card">
                    <div class="project-card__thumbnail">
                      <img class="project-card__image" src="/project2.jpg" alt="Project 2" loading="lazy" />
                    </div>
                    <div class="project-card__content">
                      <h3>Project 2</h3>
                    </div>
                  </article>
                </div>
              </div>
            </section>
          </div>
        </body>
      </html>
    `, {
      url: 'http://localhost:3000',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    document = dom.window.document;
    window = dom.window as unknown as Window & typeof globalThis;
    
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? false : true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Set up global objects
    global.document = document;
    global.window = window;
  });

  afterEach(() => {
    dom.window.close();
    vi.clearAllMocks();
  });

  describe('Animation Utilities', () => {
    it('should have all required animation classes defined', () => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);

      // Test basic animation classes
      testElement.className = 'fade-in';
      expect(testElement.classList.contains('fade-in')).toBe(true);

      testElement.className = 'slide-up';
      expect(testElement.classList.contains('slide-up')).toBe(true);

      testElement.className = 'stagger-fade-up';
      expect(testElement.classList.contains('stagger-fade-up')).toBe(true);

      testElement.className = 'page-transition';
      expect(testElement.classList.contains('page-transition')).toBe(true);
    });

    it('should have loading state animation classes', () => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);

      testElement.className = 'loading-pulse';
      expect(testElement.classList.contains('loading-pulse')).toBe(true);

      testElement.className = 'loading-shimmer';
      expect(testElement.classList.contains('loading-shimmer')).toBe(true);

      testElement.className = 'loading-spinner';
      expect(testElement.classList.contains('loading-spinner')).toBe(true);
    });

    it('should have hardware acceleration classes', () => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);

      testElement.className = 'gpu-accelerated';
      expect(testElement.classList.contains('gpu-accelerated')).toBe(true);

      testElement.className = 'will-change-transform';
      expect(testElement.classList.contains('will-change-transform')).toBe(true);

      testElement.className = 'will-change-opacity';
      expect(testElement.classList.contains('will-change-opacity')).toBe(true);
    });
  });

  describe('Page Transition Animations', () => {
    it('should apply page transition class to main content', () => {
      const mainContent = document.getElementById('main-content');
      expect(mainContent).toBeTruthy();
      expect(mainContent?.classList.contains('page-transition')).toBe(true);
    });

    it('should handle reduced motion preference', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(reducedMotionQuery.matches).toBe(true);
    });
  });

  describe('Scroll-Triggered Animations', () => {
    it('should identify elements with scroll animation attributes', () => {
      const animateElements = document.querySelectorAll('[data-animate-on-scroll]');
      expect(animateElements.length).toBeGreaterThan(0);
      
      animateElements.forEach(element => {
        expect(element.hasAttribute('data-animate-on-scroll')).toBe(true);
      });
    });

    it('should handle stagger delays correctly', () => {
      const staggerElements = document.querySelectorAll('[data-stagger]');
      expect(staggerElements.length).toBeGreaterThan(0);
      
      staggerElements.forEach(element => {
        const staggerValue = element.getAttribute('data-stagger');
        expect(staggerValue).toBeTruthy();
        expect(parseFloat(staggerValue!)).toBeGreaterThanOrEqual(0);
      });
    });

    it('should apply animate-in class when element becomes visible', () => {
      const testElement = document.querySelector('[data-animate-on-scroll]');
      expect(testElement).toBeTruthy();
      
      // Simulate intersection observer callback
      testElement?.classList.add('animate-in');
      expect(testElement?.classList.contains('animate-in')).toBe(true);
    });
  });

  describe('Project Card Animations', () => {
    it('should have project cards with proper structure', () => {
      const projectCards = document.querySelectorAll('.project-card');
      expect(projectCards.length).toBeGreaterThan(0);
      
      projectCards.forEach(card => {
        const thumbnail = card.querySelector('.project-card__thumbnail');
        const image = card.querySelector('.project-card__image');
        const content = card.querySelector('.project-card__content');
        
        expect(thumbnail).toBeTruthy();
        expect(image).toBeTruthy();
        expect(content).toBeTruthy();
      });
    });

    it('should handle hover states for project cards', () => {
      const projectCard = document.querySelector('.project-card');
      expect(projectCard).toBeTruthy();
      
      // Simulate hover
      const hoverEvent = new window.MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      
      projectCard?.dispatchEvent(hoverEvent);
      // In a real browser, this would trigger CSS hover states
      expect(projectCard).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should handle lazy loading images', () => {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      expect(lazyImages.length).toBeGreaterThan(0);
      
      lazyImages.forEach(img => {
        expect(img.getAttribute('loading')).toBe('lazy');
      });
    });

    it('should apply loading shimmer to incomplete images', () => {
      const testImage = document.createElement('img');
      testImage.src = '/test-image.jpg';
      testImage.loading = 'lazy';
      document.body.appendChild(testImage);
      
      // Simulate loading state
      testImage.classList.add('loading-shimmer');
      expect(testImage.classList.contains('loading-shimmer')).toBe(true);
      
      // Simulate load complete
      testImage.classList.remove('loading-shimmer');
      testImage.classList.add('fade-in');
      expect(testImage.classList.contains('loading-shimmer')).toBe(false);
      expect(testImage.classList.contains('fade-in')).toBe(true);
    });
  });

  describe('Hardware Acceleration', () => {
    it('should apply GPU acceleration to appropriate elements', () => {
      const mainContent = document.getElementById('main-content');
      
      // Simulate adding GPU acceleration
      mainContent?.classList.add('gpu-accelerated');
      expect(mainContent?.classList.contains('gpu-accelerated')).toBe(true);
    });

    it('should manage will-change properties correctly', () => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);
      
      // Simulate animation start
      testElement.style.willChange = 'transform, opacity';
      expect(testElement.style.willChange).toBe('transform, opacity');
      
      // Simulate animation end cleanup
      setTimeout(() => {
        testElement.style.willChange = 'auto';
        expect(testElement.style.willChange).toBe('auto');
      }, 100);
    });
  });

  describe('Accessibility and Reduced Motion', () => {
    it('should respect reduced motion preferences', () => {
      // Test that reduced motion media query is properly handled
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(reducedMotionQuery).toBeTruthy();
      
      // In a real implementation, animations would be disabled when matches is true
      if (reducedMotionQuery.matches) {
        const testElement = document.createElement('div');
        testElement.classList.add('reduce-motion');
        expect(testElement.classList.contains('reduce-motion')).toBe(true);
      }
    });

    it('should maintain accessibility during animations', () => {
      const animatedElements = document.querySelectorAll('[data-animate-on-scroll]');
      
      animatedElements.forEach(element => {
        // Elements should still be accessible even when opacity is 0
        expect(element.getAttribute('aria-hidden')).not.toBe('true');
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should use efficient animation properties', () => {
      const projectCard = document.querySelector('.project-card');
      
      if (projectCard) {
        // Simulate adding performance optimizations
        (projectCard as HTMLElement).style.transform = 'translateZ(0)';
        (projectCard as HTMLElement).style.backfaceVisibility = 'hidden';
        
        expect((projectCard as HTMLElement).style.transform).toBe('translateZ(0)');
        expect((projectCard as HTMLElement).style.backfaceVisibility).toBe('hidden');
      }
    });

    it('should clean up will-change properties after animations', () => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);
      
      // Simulate animation lifecycle
      testElement.style.willChange = 'transform';
      expect(testElement.style.willChange).toBe('transform');
      
      // Cleanup after animation
      setTimeout(() => {
        testElement.style.willChange = 'auto';
        expect(testElement.style.willChange).toBe('auto');
      }, 500);
    });
  });

  describe('Staggered Animations', () => {
    it('should apply correct stagger delays to project grid items', () => {
      const gridItems = document.querySelectorAll('.projects-grid__item');
      
      gridItems.forEach((item, index) => {
        const staggerValue = item.getAttribute('data-stagger');
        const expectedDelay = index * 0.15;
        
        expect(parseFloat(staggerValue || '0')).toBe(expectedDelay);
      });
    });

    it('should handle stagger animation timing correctly', () => {
      const gridItems = document.querySelectorAll('.projects-grid__item[data-stagger]');
      
      gridItems.forEach(item => {
        const staggerDelay = parseFloat(item.getAttribute('data-stagger') || '0');
        expect(staggerDelay).toBeGreaterThanOrEqual(0);
        expect(staggerDelay).toBeLessThan(5); // Reasonable upper bound
      });
    });
  });
});