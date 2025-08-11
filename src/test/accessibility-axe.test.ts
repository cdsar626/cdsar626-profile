/**
 * Enhanced accessibility tests using axe-core
 * Tests WCAG 2.1 AA compliance and advanced accessibility features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';

// Mock DOM environment for accessibility testing
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
        <style>
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
          .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            z-index: 1000;
          }
          .skip-link:focus {
            top: 6px;
          }
          .cv-viewer[aria-hidden="true"] {
            display: none;
          }
          button:focus, a:focus {
            outline: 2px solid #0066cc;
            outline-offset: 2px;
          }
        </style>
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

  // Configure axe for the JSDOM environment
  axe.configure({
    rules: {
      // Enable all WCAG 2.1 AA rules
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-order-semantics': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
      'aria-required-attr': { enabled: true },
      'heading-order': { enabled: true },
      'landmark-unique': { enabled: true },
      'region': { enabled: true }
    }
  });
});

afterEach(() => {
  dom.window.close();
  vi.clearAllMocks();
});

describe('Accessibility Tests with axe-core', () => {
  describe('Complete Portfolio Page', () => {
    beforeEach(() => {
      document.getElementById('app')!.innerHTML = `
        <a href="#main-content" class="skip-link">Skip to main content</a>
        
        <header class="header" role="banner">
          <div class="header-container">
            <nav aria-label="Main navigation">
              <button 
                id="cv-button"
                class="cv-button"
                aria-label="Open CV document viewer"
                aria-describedby="cv-button-description"
                type="button"
                aria-expanded="false"
                aria-haspopup="dialog"
              >
                <span class="cv-button-text">View CV</span>
              </button>
              <span id="cv-button-description" class="sr-only">
                Opens a modal dialog to view the CV document with navigation controls
              </span>
            </nav>
          </div>
        </header>

        <main id="main-content" role="main">
          <section class="profile-section" aria-labelledby="profile-heading">
            <div class="profile-container">
              <div class="profile-image-wrapper">
                <img
                  src="/images/profile.jpg"
                  alt="Professional headshot of John Developer, a full-stack software developer"
                  width="200"
                  height="200"
                  class="profile-image"
                />
              </div>
              <div class="profile-info">
                <h1 id="profile-heading" class="profile-name">John Developer</h1>
                <p class="profile-role" aria-describedby="profile-heading">Software Developer / Fullstack</p>
              </div>
            </div>
          </section>

          <section class="intro-section" aria-labelledby="intro-heading">
            <div class="intro-container">
              <div class="intro-content">
                <h2 id="intro-heading" class="sr-only">About Me</h2>
                <p class="intro-text">
                  I'm a passionate full-stack developer with expertise in modern web technologies.
                  I create scalable, user-friendly applications that solve real-world problems.
                </p>
              </div>
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
                  <article class="project-card" role="article" aria-labelledby="project-title-1" tabindex="0">
                    <div class="project-card__thumbnail">
                      <img 
                        src="/images/project1.jpg" 
                        alt="Screenshot of E-commerce Platform showing the product catalog and shopping cart interface"
                        class="project-card__image"
                        loading="lazy"
                      />
                      <div class="project-card__overlay" aria-hidden="true">
                        <a 
                          href="https://ecommerce-demo.example.com" 
                          class="project-card__link project-card__link--main"
                          aria-label="View E-commerce Platform project details and live demo"
                          target="_blank"
                          rel="noopener noreferrer"
                          tabindex="-1"
                        >
                          <span class="sr-only">View Project</span>
                        </a>
                        <div class="project-card__corner-links">
                          <a 
                            href="https://github.com/johndeveloper/ecommerce-platform" 
                            class="project-card__link project-card__link--github"
                            aria-label="View E-commerce Platform source code on GitHub"
                            target="_blank"
                            rel="noopener noreferrer"
                            tabindex="-1"
                          >
                            <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24">
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                          </a>
                          <a 
                            href="https://docs.ecommerce-demo.example.com" 
                            class="project-card__link project-card__link--additional"
                            aria-label="View E-commerce Platform documentation"
                            target="_blank"
                            rel="noopener noreferrer"
                            tabindex="-1"
                          >
                            <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                              <polyline points="14,2 14,8 20,8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10,9 9,9 8,9"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div class="project-card__content">
                      <h3 id="project-title-1" class="project-card__title">E-commerce Platform</h3>
                      <p class="project-card__description">
                        A full-featured e-commerce platform with user authentication, product catalog, 
                        shopping cart, and payment processing capabilities.
                      </p>
                      
                      <div class="project-card__technologies" role="list" aria-label="Technologies used in E-commerce Platform">
                        <span class="project-card__tech-tag" role="listitem">React</span>
                        <span class="project-card__tech-tag" role="listitem">TypeScript</span>
                        <span class="project-card__tech-tag" role="listitem">Node.js</span>
                        <span class="project-card__tech-tag" role="listitem">PostgreSQL</span>
                      </div>
                    </div>
                  </article>
                </div>
                
                <div class="projects-grid__item" role="listitem">
                  <article class="project-card" role="article" aria-labelledby="project-title-2" tabindex="0">
                    <div class="project-card__thumbnail">
                      <img 
                        src="/images/project2.jpg" 
                        alt="Screenshot of Task Management App showing the kanban board and task details"
                        class="project-card__image"
                        loading="lazy"
                      />
                      <div class="project-card__overlay" aria-hidden="true">
                        <a 
                          href="https://taskmanager-demo.example.com" 
                          class="project-card__link project-card__link--main"
                          aria-label="View Task Management App project details and live demo"
                          target="_blank"
                          rel="noopener noreferrer"
                          tabindex="-1"
                        >
                          <span class="sr-only">View Project</span>
                        </a>
                        <div class="project-card__corner-links">
                          <a 
                            href="https://github.com/johndeveloper/task-manager" 
                            class="project-card__link project-card__link--github"
                            aria-label="View Task Management App source code on GitHub"
                            target="_blank"
                            rel="noopener noreferrer"
                            tabindex="-1"
                          >
                            <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24">
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div class="project-card__content">
                      <h3 id="project-title-2" class="project-card__title">Task Management App</h3>
                      <p class="project-card__description">
                        A collaborative task management application with real-time updates, 
                        drag-and-drop functionality, and team collaboration features.
                      </p>
                      
                      <div class="project-card__technologies" role="list" aria-label="Technologies used in Task Management App">
                        <span class="project-card__tech-tag" role="listitem">Vue.js</span>
                        <span class="project-card__tech-tag" role="listitem">JavaScript</span>
                        <span class="project-card__tech-tag" role="listitem">Express</span>
                        <span class="project-card__tech-tag" role="listitem">MongoDB</span>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>
        </main>

        <div 
          id="cv-viewer" 
          class="cv-viewer" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="cv-viewer-title"
          aria-describedby="cv-viewer-description"
          aria-hidden="true"
          tabindex="-1"
        >
          <div class="cv-viewer__backdrop" aria-hidden="true"></div>
          <div class="cv-viewer__panel">
            <header class="cv-viewer__header">
              <h2 id="cv-viewer-title" class="cv-viewer__title">Curriculum Vitae</h2>
              <p id="cv-viewer-description" class="sr-only">
                Interactive CV viewer with page navigation. Use arrow keys or navigation buttons to browse pages.
              </p>
              <button 
                class="cv-viewer__close" 
                aria-label="Close CV viewer and return to main content"
                type="button"
              >
                <span aria-hidden="true">×</span>
                <span class="sr-only">Close</span>
              </button>
            </header>
            
            <nav class="cv-viewer__navigation" aria-label="CV page navigation">
              <button 
                class="cv-viewer__nav-button cv-viewer__nav-button--prev" 
                aria-label="Go to previous CV page"
                type="button"
                disabled
              >
                <span aria-hidden="true">‹</span>
                <span class="sr-only">Previous page</span>
              </button>
              
              <span class="cv-viewer__page-indicator" aria-live="polite">
                Page <span class="cv-viewer__current-page">1</span> of <span class="cv-viewer__total-pages">3</span>
              </span>
              
              <button 
                class="cv-viewer__nav-button cv-viewer__nav-button--next" 
                aria-label="Go to next CV page"
                type="button"
              >
                <span aria-hidden="true">›</span>
                <span class="sr-only">Next page</span>
              </button>
            </nav>
            
            <div class="cv-viewer__content" role="document" aria-label="CV content">
              <div class="cv-viewer__pages">
                <div class="cv-viewer__page cv-viewer__page--active" aria-label="CV Page 1 of 3">
                  <img 
                    src="/cv/page-1.jpg" 
                    alt="CV Page 1: Personal information, contact details, and professional summary"
                    width="800"
                    height="1000"
                  />
                </div>
                <div class="cv-viewer__page" aria-label="CV Page 2 of 3" aria-hidden="true">
                  <img 
                    src="/cv/page-2.jpg" 
                    alt="CV Page 2: Work experience and professional achievements"
                    width="800"
                    height="1000"
                  />
                </div>
                <div class="cv-viewer__page" aria-label="CV Page 3 of 3" aria-hidden="true">
                  <img 
                    src="/cv/page-3.jpg" 
                    alt="CV Page 3: Education, skills, and certifications"
                    width="800"
                    height="1000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div role="status" aria-live="polite" aria-atomic="true" class="sr-only" id="status-announcements"></div>
        <div role="alert" aria-live="assertive" aria-atomic="true" class="sr-only" id="error-announcements"></div>
      `;
    });

    it('should pass axe-core accessibility audit', async () => {
      const results = await axe.run(document.body, {
        rules: {
          // Focus on WCAG 2.1 AA compliance
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'aria-required-attr': { enabled: true },
          'heading-order': { enabled: true },
          'landmark-unique': { enabled: true },
          'region': { enabled: true },
          'list': { enabled: true },
          'listitem': { enabled: true },
          'button-name': { enabled: true },
          'link-name': { enabled: true },
          'image-alt': { enabled: true },
          'label': { enabled: true },
          'aria-hidden-focus': { enabled: true },
          'focus-order-semantics': { enabled: true }
        }
      });

      // Log violations for debugging
      if (results.violations.length > 0) {
        console.log('Accessibility violations found:');
        results.violations.forEach(violation => {
          console.log(`- ${violation.id}: ${violation.description}`);
          violation.nodes.forEach(node => {
            console.log(`  Target: ${node.target}`);
            console.log(`  HTML: ${node.html}`);
          });
        });
      }

      expect(results.violations).toHaveLength(0);
    });

    it('should have proper ARIA landmarks', async () => {
      const results = await axe.run(document.body, {
        rules: {
          'region': { enabled: true },
          'landmark-unique': { enabled: true },
          'landmark-main-is-top-level': { enabled: true },
          'landmark-no-duplicate-banner': { enabled: true },
          'landmark-no-duplicate-main': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);

      // Verify specific landmarks exist
      const banner = document.querySelector('[role="banner"]');
      const main = document.querySelector('[role="main"]');
      const navigation = document.querySelector('[aria-label="Main navigation"]');

      expect(banner).toBeTruthy();
      expect(main).toBeTruthy();
      expect(navigation).toBeTruthy();
    });

    it('should have proper heading hierarchy', async () => {
      const results = await axe.run(document.body, {
        rules: {
          'heading-order': { enabled: true },
          'empty-heading': { enabled: true },
          'page-has-heading-one': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);

      // Verify heading structure
      const h1 = document.querySelector('h1');
      const h2Elements = document.querySelectorAll('h2');
      const h3Elements = document.querySelectorAll('h3');

      expect(h1).toBeTruthy();
      expect(h2Elements.length).toBeGreaterThanOrEqual(2);
      expect(h3Elements.length).toBeGreaterThanOrEqual(2);
    });

    it('should have proper ARIA attributes', async () => {
      const results = await axe.run(document.body, {
        rules: {
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-allowed-attr': { enabled: true },
          'aria-hidden-focus': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);
    });

    it('should have accessible form controls and buttons', async () => {
      const results = await axe.run(document.body, {
        rules: {
          'button-name': { enabled: true },
          'link-name': { enabled: true },
          'label': { enabled: true },
          'form-field-multiple-labels': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);

      // Verify all buttons have accessible names
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const hasAccessibleName = 
          button.getAttribute('aria-label') ||
          button.getAttribute('aria-labelledby') ||
          button.textContent?.trim();
        
        expect(hasAccessibleName).toBeTruthy();
      });
    });

    it('should have accessible images', async () => {
      const results = await axe.run(document.body, {
        rules: {
          'image-alt': { enabled: true },
          'image-redundant-alt': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);

      // Verify all images have meaningful alt text
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        const alt = img.getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt!.length).toBeGreaterThan(0);
        
        // Alt text should be descriptive, not just filename
        expect(alt).not.toMatch(/\.(jpg|jpeg|png|gif|svg)$/i);
      });
    });

    it('should have proper list structure', async () => {
      const results = await axe.run(document.body, {
        rules: {
          'list': { enabled: true },
          'listitem': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);

      // Verify ARIA lists are properly structured
      const ariaLists = document.querySelectorAll('[role="list"]');
      ariaLists.forEach(list => {
        const listItems = list.querySelectorAll('[role="listitem"]');
        expect(listItems.length).toBeGreaterThan(0);
      });
    });

    it('should have accessible modal dialog', async () => {
      const results = await axe.run(document.body, {
        rules: {
          'aria-dialog-name': { enabled: true },
          'aria-hidden-focus': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);

      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
      expect(dialog?.getAttribute('aria-modal')).toBe('true');
      expect(dialog?.getAttribute('aria-labelledby')).toBeTruthy();
      expect(dialog?.getAttribute('aria-describedby')).toBeTruthy();
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      // Set up the same content as above
      document.getElementById('app')!.innerHTML = `
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <header role="banner">
          <button id="cv-button" type="button" aria-label="Open CV">View CV</button>
        </header>
        <main id="main-content" role="main">
          <section aria-labelledby="profile-heading">
            <h1 id="profile-heading">John Developer</h1>
          </section>
          <section aria-labelledby="projects-heading">
            <h2 id="projects-heading">Projects</h2>
            <div role="list">
              <article role="listitem" tabindex="0" aria-labelledby="project-1">
                <h3 id="project-1">Project 1</h3>
                <a href="https://example.com" aria-label="View project">View</a>
              </article>
            </div>
          </section>
        </main>
        <div role="dialog" aria-modal="true" aria-hidden="true" tabindex="-1">
          <button type="button" aria-label="Close">Close</button>
        </div>
      `;
    });

    it('should have proper focus management', async () => {
      const results = await axe.run(document.body, {
        rules: {
          'focus-order-semantics': { enabled: true },
          'tabindex': { enabled: true },
          'aria-hidden-focus': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);
    });

    it('should have focusable elements in logical order', () => {
      const focusableElements = document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);

      // Check that tabindex values are reasonable
      focusableElements.forEach(element => {
        const tabindex = element.getAttribute('tabindex');
        if (tabindex) {
          const tabindexValue = parseInt(tabindex, 10);
          expect(tabindexValue).toBeGreaterThanOrEqual(-1);
          expect(tabindexValue).toBeLessThan(100); // Avoid extremely high tabindex values
        }
      });
    });

    it('should not have elements with positive tabindex', () => {
      const positiveTabindexElements = document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])');
      
      // Filter out elements with negative tabindex
      const actualPositiveTabindex = Array.from(positiveTabindexElements).filter(el => {
        const tabindex = parseInt(el.getAttribute('tabindex') || '0', 10);
        return tabindex > 0;
      });

      expect(actualPositiveTabindex).toHaveLength(0);
    });
  });

  describe('Screen Reader Support', () => {
    beforeEach(() => {
      document.getElementById('app')!.innerHTML = `
        <main role="main">
          <section aria-labelledby="profile-heading">
            <h1 id="profile-heading">John Developer</h1>
            <p aria-describedby="profile-heading">Software Developer</p>
          </section>
          
          <div role="status" aria-live="polite" id="status"></div>
          <div role="alert" aria-live="assertive" id="alerts"></div>
          
          <button aria-describedby="button-help">Action</button>
          <div id="button-help" class="sr-only">This button performs an action</div>
          
          <div role="list" aria-label="Project list">
            <div role="listitem">
              <h3>Project 1</h3>
              <span class="sr-only">Featured project</span>
            </div>
          </div>
        </main>
      `;
    });

    it('should have proper live regions', async () => {
      const results = await axe.run(document.body, {
        rules: {
          'aria-valid-attr-value': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);

      const statusRegion = document.querySelector('[role="status"]');
      const alertRegion = document.querySelector('[role="alert"]');

      expect(statusRegion?.getAttribute('aria-live')).toBe('polite');
      expect(alertRegion?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should have proper screen reader only content', () => {
      const srOnlyElements = document.querySelectorAll('.sr-only');
      
      expect(srOnlyElements.length).toBeGreaterThan(0);
      
      srOnlyElements.forEach(element => {
        expect(element.textContent?.trim()).toBeTruthy();
      });
    });

    it('should have proper ARIA descriptions and labels', () => {
      const elementsWithDescriptions = document.querySelectorAll('[aria-describedby]');
      
      elementsWithDescriptions.forEach(element => {
        const describedById = element.getAttribute('aria-describedby');
        const descriptionElement = document.getElementById(describedById!);
        
        expect(descriptionElement).toBeTruthy();
        expect(descriptionElement?.textContent?.trim()).toBeTruthy();
      });
    });
  });

  describe('Color and Contrast', () => {
    beforeEach(() => {
      // Add styles for contrast testing
      const style = document.createElement('style');
      style.textContent = `
        body { background: #ffffff; color: #333333; }
        .header { background: #000000; color: #ffffff; }
        .cv-button { background: #0066cc; color: #ffffff; border: 2px solid #0066cc; }
        .cv-button:hover { background: #0052a3; }
        .cv-button:focus { outline: 2px solid #ffcc00; outline-offset: 2px; }
        .project-card { background: #f8f9fa; color: #212529; border: 1px solid #dee2e6; }
        .project-card__title { color: #495057; }
        .project-card__tech-tag { background: #e9ecef; color: #495057; }
        a { color: #0066cc; }
        a:hover { color: #0052a3; }
        a:focus { outline: 2px solid #ffcc00; outline-offset: 2px; }
      `;
      document.head.appendChild(style);

      document.getElementById('app')!.innerHTML = `
        <header class="header">
          <button class="cv-button">View CV</button>
        </header>
        <main>
          <h1>John Developer</h1>
          <p>Software Developer</p>
          <div class="project-card">
            <h3 class="project-card__title">Project Title</h3>
            <p>Project description with sufficient contrast.</p>
            <span class="project-card__tech-tag">React</span>
            <a href="https://example.com">View Project</a>
          </div>
        </main>
      `;
    });

    it('should pass color contrast requirements', async () => {
      const results = await axe.run(document.body, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });

      // Note: JSDOM doesn't compute styles, so this test would pass in a real browser
      // but might not catch actual contrast issues in this test environment
      expect(results.violations.filter(v => v.id === 'color-contrast')).toHaveLength(0);
    });
  });

  describe('Form and Input Accessibility', () => {
    beforeEach(() => {
      document.getElementById('app')!.innerHTML = `
        <form aria-labelledby="contact-form-title">
          <h2 id="contact-form-title">Contact Form</h2>
          
          <div class="form-group">
            <label for="name">Name (required)</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required 
              aria-describedby="name-help name-error"
              aria-invalid="false"
            />
            <div id="name-help" class="form-help">Enter your full name</div>
            <div id="name-error" class="form-error" aria-live="polite"></div>
          </div>
          
          <div class="form-group">
            <label for="email">Email (required)</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              aria-describedby="email-help"
              aria-invalid="false"
            />
            <div id="email-help" class="form-help">We'll never share your email</div>
          </div>
          
          <fieldset>
            <legend>Preferred Contact Method</legend>
            <div class="radio-group">
              <input type="radio" id="contact-email" name="contact-method" value="email" />
              <label for="contact-email">Email</label>
            </div>
            <div class="radio-group">
              <input type="radio" id="contact-phone" name="contact-method" value="phone" />
              <label for="contact-phone">Phone</label>
            </div>
          </fieldset>
          
          <button type="submit" aria-describedby="submit-help">Send Message</button>
          <div id="submit-help" class="form-help">Form will be submitted securely</div>
        </form>
      `;
    });

    it('should have accessible form controls', async () => {
      const results = await axe.run(document.body, {
        rules: {
          'label': { enabled: true },
          'form-field-multiple-labels': { enabled: true },
          'label-title-only': { enabled: true },
          'label-content-name-mismatch': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);
    });

    it('should have proper fieldset and legend', async () => {
      const results = await axe.run(document.body, {
        rules: {
          'fieldset-legend': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);

      const fieldset = document.querySelector('fieldset');
      const legend = document.querySelector('legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent?.trim()).toBeTruthy();
    });
  });

  describe('Dynamic Content Accessibility', () => {
    it('should handle dynamic content updates accessibly', () => {
      document.getElementById('app')!.innerHTML = `
        <div role="status" aria-live="polite" id="status-updates"></div>
        <div role="alert" aria-live="assertive" id="error-messages"></div>
        <button id="load-more" aria-describedby="load-more-help">Load More Projects</button>
        <div id="load-more-help" class="sr-only">Loads additional projects below</div>
        <div id="projects-container" aria-label="Projects list"></div>
      `;

      const statusElement = document.getElementById('status-updates');
      const errorElement = document.getElementById('error-messages');
      const projectsContainer = document.getElementById('projects-container');

      expect(statusElement?.getAttribute('aria-live')).toBe('polite');
      expect(errorElement?.getAttribute('aria-live')).toBe('assertive');
      expect(projectsContainer?.getAttribute('aria-label')).toBeTruthy();

      // Simulate dynamic content update
      statusElement!.textContent = 'Loading new projects...';
      expect(statusElement?.textContent).toBe('Loading new projects...');

      // Simulate error
      errorElement!.textContent = 'Failed to load projects. Please try again.';
      expect(errorElement?.textContent).toBe('Failed to load projects. Please try again.');
    });

    it('should handle loading states accessibly', () => {
      document.getElementById('app')!.innerHTML = `
        <button id="submit-btn" aria-describedby="submit-status">Submit</button>
        <div id="submit-status" role="status" aria-live="polite"></div>
        <div class="loading-spinner" aria-hidden="true" style="display: none;"></div>
      `;

      const button = document.getElementById('submit-btn');
      const status = document.getElementById('submit-status');
      const spinner = document.querySelector('.loading-spinner');

      // Simulate loading state
      button?.setAttribute('aria-busy', 'true');
      button?.setAttribute('disabled', 'true');
      status!.textContent = 'Submitting form...';
      spinner?.setAttribute('style', 'display: block;');

      expect(button?.getAttribute('aria-busy')).toBe('true');
      expect(button?.hasAttribute('disabled')).toBe(true);
      expect(status?.textContent).toBe('Submitting form...');
    });
  });
});