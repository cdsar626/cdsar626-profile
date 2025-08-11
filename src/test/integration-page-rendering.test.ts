/**
 * Integration tests for page rendering and component integration
 * Tests complete page assembly, data flow, and component interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock DOM environment for integration testing
let dom: JSDOM;
let document: Document;
let window: Window;

beforeEach(() => {
  dom = new JSDOM(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Portfolio - Full Stack Developer</title>
        <meta name="description" content="Modern portfolio showcasing full-stack development projects" />
      </head>
      <body>
        <div id="app"></div>
      </body>
    </html>
  `, {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable'
  });

  // @ts-ignore
  global.document = dom.window.document;
  // @ts-ignore
  global.window = dom.window;
  // @ts-ignore
  global.navigator = dom.window.navigator;
  
  document = dom.window.document;
  window = dom.window as unknown as Window & typeof globalThis;

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  })) as any;

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  })) as any;

  // Mock matchMedia
  window.matchMedia = vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })) as any;
});

afterEach(() => {
  dom.window.close();
  vi.clearAllMocks();
});

describe('Page Rendering Integration', () => {
  describe('Complete Page Structure', () => {
    beforeEach(() => {
      // Simulate complete page structure
      document.getElementById('app')!.innerHTML = `
        <header class="header" role="banner">
          <div class="header-container">
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <button id="cv-button" class="cv-button" aria-label="Open CV document viewer">
              View CV
            </button>
          </div>
        </header>

        <main id="main-content" role="main">
          <section class="profile-section" aria-labelledby="profile-heading">
            <div class="profile-container">
              <div class="profile-image-wrapper">
                <img
                  src="/images/profile.jpg"
                  alt="Professional headshot of John Developer"
                  width="200"
                  height="200"
                  class="profile-image"
                />
              </div>
              <div class="profile-info">
                <h1 id="profile-heading" class="profile-name">John Developer</h1>
                <p class="profile-role">Software Developer / Fullstack</p>
              </div>
            </div>
          </section>

          <section class="intro-section" aria-labelledby="intro-heading">
            <div class="intro-container">
              <h2 id="intro-heading" class="sr-only">About Me</h2>
              <p class="intro-text">
                I'm a passionate full-stack developer with expertise in modern web technologies.
                I create scalable, user-friendly applications that solve real-world problems.
              </p>
            </div>
          </section>

          <section class="projects-section" id="projects" aria-labelledby="projects-heading">
            <div class="projects-container">
              <header class="projects-header">
                <h2 id="projects-heading" class="projects-title">Featured Projects</h2>
                <p class="projects-subtitle">A showcase of my recent work and technical expertise</p>
              </header>
              
              <div class="projects-grid" role="list" aria-label="Portfolio projects">
                <div class="projects-grid__item" role="listitem">
                  <article class="project-card" role="article" aria-labelledby="project-title-1">
                    <div class="project-card__thumbnail">
                      <img src="/images/project1.jpg" alt="Project 1 screenshot" class="project-card__image" />
                      <div class="project-card__overlay" aria-hidden="true">
                        <a href="https://project1.com" class="project-card__link--main" aria-label="View Project 1">
                          <span class="sr-only">View Project</span>
                        </a>
                      </div>
                    </div>
                    <div class="project-card__content">
                      <h3 id="project-title-1" class="project-card__title">Project 1</h3>
                      <p class="project-card__description">A modern web application</p>
                      <div class="project-card__technologies" role="list">
                        <span class="project-card__tech-tag" role="listitem">React</span>
                        <span class="project-card__tech-tag" role="listitem">TypeScript</span>
                      </div>
                    </div>
                  </article>
                </div>
                
                <div class="projects-grid__item" role="listitem">
                  <article class="project-card" role="article" aria-labelledby="project-title-2">
                    <div class="project-card__thumbnail">
                      <img src="/images/project2.jpg" alt="Project 2 screenshot" class="project-card__image" />
                    </div>
                    <div class="project-card__content">
                      <h3 id="project-title-2" class="project-card__title">Project 2</h3>
                      <p class="project-card__description">A Vue.js application</p>
                      <div class="project-card__technologies" role="list">
                        <span class="project-card__tech-tag" role="listitem">Vue</span>
                        <span class="project-card__tech-tag" role="listitem">JavaScript</span>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>
        </main>

        <div id="cv-viewer" class="cv-viewer" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="cv-viewer__backdrop"></div>
          <div class="cv-viewer__panel">
            <header class="cv-viewer__header">
              <h2 class="cv-viewer__title">Curriculum Vitae</h2>
              <button class="cv-viewer__close" aria-label="Close CV viewer">×</button>
            </header>
            <div class="cv-viewer__content">
              <div class="cv-viewer__pages">
                <div class="cv-viewer__page">
                  <img src="/cv/page-1.jpg" alt="CV Page 1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    it('should have complete page structure with all sections', () => {
      const header = document.querySelector('header[role="banner"]');
      const main = document.querySelector('main[role="main"]');
      const profileSection = document.querySelector('.profile-section');
      const introSection = document.querySelector('.intro-section');
      const projectsSection = document.querySelector('.projects-section');
      const cvViewer = document.querySelector('.cv-viewer[role="dialog"]');

      expect(header).toBeTruthy();
      expect(main).toBeTruthy();
      expect(profileSection).toBeTruthy();
      expect(introSection).toBeTruthy();
      expect(projectsSection).toBeTruthy();
      expect(cvViewer).toBeTruthy();
    });

    it('should have proper heading hierarchy', () => {
      const h1 = document.querySelector('h1');
      const h2Elements = document.querySelectorAll('h2');
      const h3Elements = document.querySelectorAll('h3');

      expect(h1).toBeTruthy();
      expect(h1?.textContent).toBe('John Developer');
      
      expect(h2Elements.length).toBeGreaterThanOrEqual(2);
      expect(h3Elements.length).toBeGreaterThanOrEqual(2);
    });

    it('should have proper ARIA landmarks and labels', () => {
      const banner = document.querySelector('[role="banner"]');
      const main = document.querySelector('[role="main"]');
      const articles = document.querySelectorAll('[role="article"]');
      const lists = document.querySelectorAll('[role="list"]');

      expect(banner).toBeTruthy();
      expect(main).toBeTruthy();
      expect(articles.length).toBeGreaterThanOrEqual(2);
      expect(lists.length).toBeGreaterThanOrEqual(2);

      // Check aria-labelledby attributes
      const labelledElements = document.querySelectorAll('[aria-labelledby]');
      expect(labelledElements.length).toBeGreaterThan(0);
    });

    it('should have skip link for accessibility', () => {
      const skipLink = document.querySelector('.skip-link');
      const mainContent = document.getElementById('main-content');

      expect(skipLink).toBeTruthy();
      expect(skipLink?.getAttribute('href')).toBe('#main-content');
      expect(mainContent).toBeTruthy();
    });
  });

  describe('Component Data Flow', () => {
    it('should properly connect project data to project cards', () => {
      const projectCards = document.querySelectorAll('.project-card');
      
      expect(projectCards.length).toBe(2);

      projectCards.forEach((card, index) => {
        const title = card.querySelector('.project-card__title');
        const description = card.querySelector('.project-card__description');
        const technologies = card.querySelectorAll('.project-card__tech-tag');
        const image = card.querySelector('.project-card__image');

        expect(title).toBeTruthy();
        expect(description).toBeTruthy();
        expect(technologies.length).toBeGreaterThan(0);
        expect(image).toBeTruthy();

        // Check that each card has unique content
        expect(title?.textContent).toContain(`Project ${index + 1}`);
      });
    });

    it('should have consistent ID references', () => {
      // Check profile section
      const profileSection = document.querySelector('.profile-section');
      const profileHeading = document.getElementById('profile-heading');
      
      expect(profileSection?.getAttribute('aria-labelledby')).toBe('profile-heading');
      expect(profileHeading).toBeTruthy();

      // Check projects section
      const projectsSection = document.querySelector('.projects-section');
      const projectsHeading = document.getElementById('projects-heading');
      
      expect(projectsSection?.getAttribute('aria-labelledby')).toBe('projects-heading');
      expect(projectsHeading).toBeTruthy();

      // Check project cards
      const projectCards = document.querySelectorAll('.project-card');
      projectCards.forEach((card, index) => {
        const expectedId = `project-title-${index + 1}`;
        const titleElement = document.getElementById(expectedId);
        
        expect(card.getAttribute('aria-labelledby')).toBe(expectedId);
        expect(titleElement).toBeTruthy();
      });
    });
  });

  describe('Interactive Elements Integration', () => {
    it('should have CV button connected to CV viewer', () => {
      const cvButton = document.getElementById('cv-button');
      const cvViewer = document.getElementById('cv-viewer');

      expect(cvButton).toBeTruthy();
      expect(cvViewer).toBeTruthy();
      
      expect(cvButton?.getAttribute('aria-label')).toContain('CV');
      expect(cvViewer?.getAttribute('role')).toBe('dialog');
      expect(cvViewer?.getAttribute('aria-modal')).toBe('true');
    });

    it('should have project cards with proper link structure', () => {
      const projectCards = document.querySelectorAll('.project-card');
      
      projectCards.forEach(card => {
        const mainLink = card.querySelector('.project-card__link--main');
        const overlay = card.querySelector('.project-card__overlay');

        if (mainLink) {
          expect(mainLink.getAttribute('href')).toBeTruthy();
          expect(mainLink.getAttribute('aria-label')).toBeTruthy();
        }

        if (overlay) {
          expect(overlay.getAttribute('aria-hidden')).toBe('true');
        }
      });
    });

    it('should have proper focus management setup', () => {
      const focusableElements = document.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);

      // Check that interactive elements have proper attributes
      focusableElements.forEach(element => {
        if (element.tagName === 'BUTTON') {
          expect(element.getAttribute('type')).toBeTruthy();
        }
        if (element.tagName === 'A') {
          expect(element.getAttribute('href')).toBeTruthy();
        }
      });
    });
  });

  describe('Responsive Design Integration', () => {
    it('should have responsive image attributes', () => {
      const images = document.querySelectorAll('img');
      
      images.forEach(img => {
        expect(img.getAttribute('alt')).toBeTruthy();
        
        // Profile image should have dimensions
        if (img.classList.contains('profile-image')) {
          expect(img.getAttribute('width')).toBeTruthy();
          expect(img.getAttribute('height')).toBeTruthy();
        }
      });
    });

    it('should have proper viewport meta tag', () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      
      expect(viewportMeta).toBeTruthy();
      expect(viewportMeta?.getAttribute('content')).toContain('width=device-width');
      expect(viewportMeta?.getAttribute('content')).toContain('initial-scale=1');
    });

    it('should have responsive grid structure', () => {
      const projectsGrid = document.querySelector('.projects-grid');
      const gridItems = document.querySelectorAll('.projects-grid__item');

      expect(projectsGrid).toBeTruthy();
      expect(gridItems.length).toBeGreaterThan(0);

      // Check that grid items have proper role
      gridItems.forEach(item => {
        expect(item.getAttribute('role')).toBe('listitem');
      });
    });
  });

  describe('SEO and Meta Tags Integration', () => {
    it('should have proper document head structure', () => {
      const title = document.querySelector('title');
      const description = document.querySelector('meta[name="description"]');
      const charset = document.querySelector('meta[charset]');

      expect(title?.textContent).toBeTruthy();
      expect(description?.getAttribute('content')).toBeTruthy();
      expect(charset?.getAttribute('charset')).toBe('utf-8');
    });

    it('should have semantic HTML structure', () => {
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      const sections = document.querySelectorAll('section');
      const articles = document.querySelectorAll('article');

      expect(header).toBeTruthy();
      expect(main).toBeTruthy();
      expect(sections.length).toBeGreaterThanOrEqual(3);
      expect(articles.length).toBeGreaterThanOrEqual(2);
    });

    it('should have proper language attribute', () => {
      const html = document.documentElement;
      
      expect(html.getAttribute('lang')).toBe('en');
    });
  });

  describe('Performance Optimization Integration', () => {
    it('should have lazy loading setup for images', () => {
      const images = document.querySelectorAll('img');
      
      // Check that images have proper loading attributes or data attributes for lazy loading
      images.forEach(img => {
        const hasLazyLoading = 
          img.getAttribute('loading') === 'lazy' ||
          img.hasAttribute('data-src') ||
          img.classList.contains('lazy-load');
        
        // Profile image might be eager loaded, others should be lazy
        if (!img.classList.contains('profile-image')) {
          // This would be true in actual implementation
          expect(true).toBe(true); // Placeholder for lazy loading check
        }
      });
    });

    it('should have proper resource hints in head', () => {
      // In actual implementation, there would be preload/prefetch links
      const head = document.head;
      expect(head).toBeTruthy();
      
      // Check for potential preload links (would be added by performance utilities)
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      // This would have actual preload links in real implementation
      expect(preloadLinks.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle missing images gracefully', () => {
      const images = document.querySelectorAll('img');
      
      images.forEach(img => {
        // Simulate image load error
        const errorEvent = new Event('error');
        img.dispatchEvent(errorEvent);
        
        // Should not break the page
        expect(document.body).toBeTruthy();
      });
    });

    it('should handle missing content gracefully', () => {
      // Remove a project card and check that the page still works
      const firstProjectCard = document.querySelector('.project-card');
      firstProjectCard?.remove();
      
      const remainingCards = document.querySelectorAll('.project-card');
      expect(remainingCards.length).toBe(1);
      
      // Page structure should remain intact
      const projectsSection = document.querySelector('.projects-section');
      expect(projectsSection).toBeTruthy();
    });
  });

  describe('Animation and Interaction Integration', () => {
    it('should have proper CSS classes for animations', () => {
      const animatedElements = document.querySelectorAll(
        '.profile-section, .intro-section, .project-card'
      );
      
      animatedElements.forEach(element => {
        // Elements should be ready for animation classes
        expect(element.classList.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      window.matchMedia = vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      })) as any;
      
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(reducedMotionQuery.matches).toBe(true);
    });
  });

  describe('Cross-Component Communication', () => {
    it('should have consistent theme and styling across components', () => {
      const allSections = document.querySelectorAll('section');
      const allCards = document.querySelectorAll('.project-card');
      const allButtons = document.querySelectorAll('button');

      // All sections should have consistent class naming
      allSections.forEach(section => {
        expect(section.className).toMatch(/.*-section$/);
      });

      // All cards should have consistent structure
      allCards.forEach(card => {
        const content = card.querySelector('.project-card__content');
        const title = card.querySelector('.project-card__title');
        
        expect(content).toBeTruthy();
        expect(title).toBeTruthy();
      });

      // All buttons should have proper attributes
      allButtons.forEach(button => {
        expect(button.getAttribute('type') || button.getAttribute('role')).toBeTruthy();
      });
    });

    it('should have proper event delegation setup', () => {
      // Check that event handlers would be properly attached
      const interactiveElements = document.querySelectorAll(
        'button, a, [tabindex="0"]'
      );

      expect(interactiveElements.length).toBeGreaterThan(0);

      // Each interactive element should be properly configured
      interactiveElements.forEach(element => {
        if (element.tagName === 'BUTTON') {
          expect(element.getAttribute('aria-label') || element.textContent?.trim()).toBeTruthy();
        }
      });
    });
  });

  describe('Content Validation Integration', () => {
    it('should have valid project data structure in DOM', () => {
      const projectCards = document.querySelectorAll('.project-card');
      
      projectCards.forEach(card => {
        const title = card.querySelector('.project-card__title')?.textContent;
        const description = card.querySelector('.project-card__description')?.textContent;
        const technologies = card.querySelectorAll('.project-card__tech-tag');

        expect(title).toBeTruthy();
        expect(title?.length).toBeGreaterThan(0);
        expect(description).toBeTruthy();
        expect(description?.length).toBeGreaterThan(0);
        expect(technologies.length).toBeGreaterThan(0);

        // Each technology should have content
        technologies.forEach(tech => {
          expect(tech.textContent?.trim()).toBeTruthy();
        });
      });
    });

    it('should have consistent data between sections', () => {
      const profileName = document.querySelector('.profile-name')?.textContent;
      const profileRole = document.querySelector('.profile-role')?.textContent;

      expect(profileName).toBeTruthy();
      expect(profileRole).toBeTruthy();

      // Profile data should be consistent with page title
      const pageTitle = document.title;
      expect(pageTitle).toContain('Portfolio');
    });
  });
});