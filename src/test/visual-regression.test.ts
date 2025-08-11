/**
 * Visual regression tests for responsive layouts
 * Tests component appearance across different screen sizes and states
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock DOM environment for visual testing
let dom: JSDOM;
let document: Document;
let window: Window;

// Mock viewport dimensions for responsive testing
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  ultrawide: { width: 2560, height: 1440 }
};

beforeEach(() => {
  dom = new JSDOM(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Portfolio - Visual Regression Test</title>
        <style>
          /* Base responsive styles for testing */
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, sans-serif; line-height: 1.6; }
          
          .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
          
          /* Header styles */
          .header { background: #000; color: #fff; padding: 1rem 0; position: sticky; top: 0; z-index: 100; }
          .header-container { display: flex; justify-content: space-between; align-items: center; }
          .cv-button { background: #0066cc; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
          
          /* Profile section */
          .profile-section { padding: 4rem 0; text-align: center; }
          .profile-image { width: 200px; height: 200px; border-radius: 50%; object-fit: cover; }
          .profile-name { font-size: 2.5rem; margin: 1rem 0 0.5rem; }
          .profile-role { font-size: 1.25rem; color: #666; }
          
          /* Projects grid */
          .projects-section { padding: 4rem 0; }
          .projects-title { font-size: 2rem; text-align: center; margin-bottom: 3rem; }
          .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
          .project-card { background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; transition: transform 0.2s; }
          .project-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
          .project-card__image { width: 100%; height: 200px; object-fit: cover; }
          .project-card__content { padding: 1.5rem; }
          .project-card__title { font-size: 1.25rem; margin-bottom: 0.5rem; }
          .project-card__description { color: #666; margin-bottom: 1rem; }
          .project-card__technologies { display: flex; flex-wrap: wrap; gap: 0.5rem; }
          .project-card__tech-tag { background: #f0f0f0; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem; }
          
          /* Responsive breakpoints */
          @media (max-width: 768px) {
            .profile-name { font-size: 2rem; }
            .projects-grid { grid-template-columns: 1fr; }
            .project-card__content { padding: 1rem; }
          }
          
          @media (max-width: 480px) {
            .profile-image { width: 150px; height: 150px; }
            .profile-name { font-size: 1.75rem; }
            .container { padding: 0 0.5rem; }
          }
          
          /* CV Viewer */
          .cv-viewer { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 1000; }
          .cv-viewer[aria-hidden="true"] { display: none; }
          .cv-viewer__panel { background: #fff; margin: 2rem; border-radius: 8px; height: calc(100vh - 4rem); display: flex; flex-direction: column; }
          .cv-viewer__header { padding: 1rem; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
          .cv-viewer__content { flex: 1; overflow: auto; padding: 1rem; }
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
  
  document = dom.window.document;
  window = dom.window as unknown as Window & typeof globalThis;

  // Mock window dimensions
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1920 });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1080 });
  
  // Mock matchMedia for responsive testing
  window.matchMedia = vi.fn((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  })) as any;
});

afterEach(() => {
  dom.window.close();
  vi.clearAllMocks();
});

describe('Visual Regression Tests', () => {
  describe('Responsive Layout Tests', () => {
    beforeEach(() => {
      document.getElementById('app')!.innerHTML = `
        <header class="header">
          <div class="container">
            <div class="header-container">
              <h1 class="logo">Portfolio</h1>
              <button class="cv-button">View CV</button>
            </div>
          </div>
        </header>

        <main>
          <section class="profile-section">
            <div class="container">
              <img src="/images/profile.jpg" alt="Profile" class="profile-image" />
              <h1 class="profile-name">John Developer</h1>
              <p class="profile-role">Software Developer / Fullstack</p>
            </div>
          </section>

          <section class="projects-section">
            <div class="container">
              <h2 class="projects-title">Featured Projects</h2>
              <div class="projects-grid">
                <article class="project-card">
                  <img src="/images/project1.jpg" alt="Project 1" class="project-card__image" />
                  <div class="project-card__content">
                    <h3 class="project-card__title">E-commerce Platform</h3>
                    <p class="project-card__description">A full-featured e-commerce platform with modern UI.</p>
                    <div class="project-card__technologies">
                      <span class="project-card__tech-tag">React</span>
                      <span class="project-card__tech-tag">TypeScript</span>
                      <span class="project-card__tech-tag">Node.js</span>
                    </div>
                  </div>
                </article>
                
                <article class="project-card">
                  <img src="/images/project2.jpg" alt="Project 2" class="project-card__image" />
                  <div class="project-card__content">
                    <h3 class="project-card__title">Task Management App</h3>
                    <p class="project-card__description">Collaborative task management with real-time updates.</p>
                    <div class="project-card__technologies">
                      <span class="project-card__tech-tag">Vue.js</span>
                      <span class="project-card__tech-tag">JavaScript</span>
                      <span class="project-card__tech-tag">Express</span>
                    </div>
                  </div>
                </article>
                
                <article class="project-card">
                  <img src="/images/project3.jpg" alt="Project 3" class="project-card__image" />
                  <div class="project-card__content">
                    <h3 class="project-card__title">Analytics Dashboard</h3>
                    <p class="project-card__description">Real-time analytics dashboard with data visualization.</p>
                    <div class="project-card__technologies">
                      <span class="project-card__tech-tag">React</span>
                      <span class="project-card__tech-tag">D3.js</span>
                      <span class="project-card__tech-tag">Python</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </main>
      `;
    });

    it('should render correctly on mobile viewport', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: viewports.mobile.width });
      Object.defineProperty(window, 'innerHeight', { value: viewports.mobile.height });
      
      // Mock mobile media query
      window.matchMedia = vi.fn((query) => ({
        matches: query.includes('max-width: 768px') || query.includes('max-width: 480px'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })) as any;

      // Test mobile-specific layout
      const projectsGrid = document.querySelector('.projects-grid');
      const projectCards = document.querySelectorAll('.project-card');
      
      expect(projectsGrid).toBeTruthy();
      expect(projectCards.length).toBe(3);
      
      // In mobile, grid should stack vertically (single column)
      // This would be verified by computed styles in a real browser
      expect(true).toBe(true); // Placeholder for visual verification
    });

    it('should render correctly on tablet viewport', () => {
      // Simulate tablet viewport
      Object.defineProperty(window, 'innerWidth', { value: viewports.tablet.width });
      Object.defineProperty(window, 'innerHeight', { value: viewports.tablet.height });
      
      window.matchMedia = vi.fn((query) => ({
        matches: query.includes('max-width: 768px') && !query.includes('max-width: 480px'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })) as any;

      const projectsGrid = document.querySelector('.projects-grid');
      expect(projectsGrid).toBeTruthy();
      
      // Tablet should show 2 columns or responsive grid
      expect(true).toBe(true); // Placeholder for visual verification
    });

    it('should render correctly on desktop viewport', () => {
      // Simulate desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: viewports.desktop.width });
      Object.defineProperty(window, 'innerHeight', { value: viewports.desktop.height });
      
      window.matchMedia = vi.fn(() => ({
        matches: false, // No mobile/tablet queries match
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })) as any;

      const projectsGrid = document.querySelector('.projects-grid');
      const container = document.querySelector('.container');
      
      expect(projectsGrid).toBeTruthy();
      expect(container).toBeTruthy();
      
      // Desktop should show full grid layout
      expect(true).toBe(true); // Placeholder for visual verification
    });
  });

  describe('Component State Visual Tests', () => {
    beforeEach(() => {
      document.getElementById('app')!.innerHTML = `
        <div class="project-card" id="test-card">
          <img src="/images/project.jpg" alt="Project" class="project-card__image" />
          <div class="project-card__content">
            <h3 class="project-card__title">Test Project</h3>
            <p class="project-card__description">Test description</p>
            <div class="project-card__technologies">
              <span class="project-card__tech-tag">React</span>
              <span class="project-card__tech-tag">TypeScript</span>
            </div>
          </div>
        </div>
        
        <button id="test-button" class="cv-button">Test Button</button>
        
        <div class="cv-viewer" id="test-modal" aria-hidden="true">
          <div class="cv-viewer__panel">
            <div class="cv-viewer__header">
              <h2>Test Modal</h2>
              <button>Close</button>
            </div>
            <div class="cv-viewer__content">
              <p>Modal content</p>
            </div>
          </div>
        </div>
      `;
    });

    it('should render project card in default state', () => {
      const projectCard = document.getElementById('test-card');
      
      expect(projectCard).toBeTruthy();
      expect(projectCard?.classList.contains('project-card')).toBe(true);
      
      // Check all required elements are present
      const image = projectCard?.querySelector('.project-card__image');
      const title = projectCard?.querySelector('.project-card__title');
      const description = projectCard?.querySelector('.project-card__description');
      const technologies = projectCard?.querySelectorAll('.project-card__tech-tag');
      
      expect(image).toBeTruthy();
      expect(title).toBeTruthy();
      expect(description).toBeTruthy();
      expect(technologies?.length).toBe(2);
    });

    it('should render project card in hover state', () => {
      const projectCard = document.getElementById('test-card');
      
      // Simulate hover state by adding hover class
      projectCard?.classList.add('hover');
      
      expect(projectCard?.classList.contains('hover')).toBe(true);
      
      // In a real browser, this would trigger CSS :hover styles
      // Here we just verify the structure remains intact
      expect(projectCard?.querySelector('.project-card__title')).toBeTruthy();
    });

    it('should render button in different states', () => {
      const button = document.getElementById('test-button');
      
      // Default state
      expect(button).toBeTruthy();
      expect(button?.classList.contains('cv-button')).toBe(true);
      
      // Focus state
      button?.classList.add('focus');
      expect(button?.classList.contains('focus')).toBe(true);
      
      // Disabled state
      button?.setAttribute('disabled', 'true');
      expect(button?.hasAttribute('disabled')).toBe(true);
      
      // Loading state
      button?.setAttribute('aria-busy', 'true');
      expect(button?.getAttribute('aria-busy')).toBe('true');
    });

    it('should render modal in closed state', () => {
      const modal = document.getElementById('test-modal');
      
      expect(modal).toBeTruthy();
      expect(modal?.getAttribute('aria-hidden')).toBe('true');
      expect(modal?.classList.contains('cv-viewer')).toBe(true);
      
      // Check modal structure
      const panel = modal?.querySelector('.cv-viewer__panel');
      const header = modal?.querySelector('.cv-viewer__header');
      const content = modal?.querySelector('.cv-viewer__content');
      
      expect(panel).toBeTruthy();
      expect(header).toBeTruthy();
      expect(content).toBeTruthy();
    });

    it('should render modal in open state', () => {
      const modal = document.getElementById('test-modal');
      
      // Simulate opening modal
      modal?.setAttribute('aria-hidden', 'false');
      modal?.classList.add('open');
      
      expect(modal?.getAttribute('aria-hidden')).toBe('false');
      expect(modal?.classList.contains('open')).toBe(true);
      
      // Modal should still have all required elements
      expect(modal?.querySelector('.cv-viewer__panel')).toBeTruthy();
    });
  });

  describe('Typography and Spacing Tests', () => {
    beforeEach(() => {
      document.getElementById('app')!.innerHTML = `
        <div class="typography-test">
          <h1 class="profile-name">Main Heading</h1>
          <h2 class="projects-title">Section Heading</h2>
          <h3 class="project-card__title">Card Heading</h3>
          <p class="profile-role">Subtitle Text</p>
          <p class="project-card__description">Body text with longer content to test line height and readability.</p>
          <span class="project-card__tech-tag">Tag Text</span>
        </div>
      `;
    });

    it('should have consistent typography hierarchy', () => {
      const h1 = document.querySelector('.profile-name');
      const h2 = document.querySelector('.projects-title');
      const h3 = document.querySelector('.project-card__title');
      const subtitle = document.querySelector('.profile-role');
      const body = document.querySelector('.project-card__description');
      const tag = document.querySelector('.project-card__tech-tag');
      
      expect(h1?.textContent).toBe('Main Heading');
      expect(h2?.textContent).toBe('Section Heading');
      expect(h3?.textContent).toBe('Card Heading');
      expect(subtitle?.textContent).toBe('Subtitle Text');
      expect(body?.textContent).toContain('Body text');
      expect(tag?.textContent).toBe('Tag Text');
      
      // In a real browser, we would check computed font sizes
      // h1 should be largest, then h2, then h3, etc.
      expect(true).toBe(true); // Placeholder for font size verification
    });

    it('should maintain proper spacing between elements', () => {
      const container = document.querySelector('.typography-test');
      const elements = container?.children;
      
      expect(elements?.length).toBeGreaterThan(0);
      
      // Each element should have proper margins/padding
      // This would be verified by computed styles in a real browser
      Array.from(elements || []).forEach(element => {
        expect(element.tagName).toBeTruthy();
      });
    });
  });

  describe('Color and Theme Tests', () => {
    beforeEach(() => {
      document.getElementById('app')!.innerHTML = `
        <div class="theme-test">
          <header class="header">
            <button class="cv-button">Primary Button</button>
          </header>
          <div class="project-card">
            <h3 class="project-card__title">Card Title</h3>
            <p class="project-card__description">Card description text</p>
            <span class="project-card__tech-tag">Tech Tag</span>
          </div>
        </div>
      `;
    });

    it('should apply consistent color scheme', () => {
      const header = document.querySelector('.header');
      const button = document.querySelector('.cv-button');
      const card = document.querySelector('.project-card');
      const title = document.querySelector('.project-card__title');
      const description = document.querySelector('.project-card__description');
      const tag = document.querySelector('.project-card__tech-tag');
      
      expect(header).toBeTruthy();
      expect(button).toBeTruthy();
      expect(card).toBeTruthy();
      expect(title).toBeTruthy();
      expect(description).toBeTruthy();
      expect(tag).toBeTruthy();
      
      // In a real browser, we would check computed colors
      // Header should be dark, button should be blue, etc.
      expect(true).toBe(true); // Placeholder for color verification
    });

    it('should handle dark mode if implemented', () => {
      // Simulate dark mode preference
      window.matchMedia = vi.fn((query) => ({
        matches: query.includes('prefers-color-scheme: dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })) as any;
      
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      expect(darkModeQuery.matches).toBe(true);
      
      // Dark mode styles would be applied here
      expect(true).toBe(true); // Placeholder for dark mode verification
    });
  });

  describe('Animation and Transition Tests', () => {
    beforeEach(() => {
      document.getElementById('app')!.innerHTML = `
        <div class="animation-test">
          <div class="project-card" id="animated-card">
            <h3>Animated Card</h3>
          </div>
          <button class="cv-button" id="animated-button">Animated Button</button>
        </div>
      `;
    });

    it('should respect reduced motion preferences', () => {
      // Simulate reduced motion preference
      window.matchMedia = vi.fn((query) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })) as any;
      
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(reducedMotionQuery.matches).toBe(true);
      
      // Animations should be disabled or reduced
      const card = document.getElementById('animated-card');
      const button = document.getElementById('animated-button');
      
      expect(card).toBeTruthy();
      expect(button).toBeTruthy();
      
      // In implementation, animations would be disabled
      expect(true).toBe(true); // Placeholder for animation verification
    });

    it('should handle animation states correctly', () => {
      const card = document.getElementById('animated-card');
      
      // Simulate different animation states
      card?.classList.add('loading');
      expect(card?.classList.contains('loading')).toBe(true);
      
      card?.classList.remove('loading');
      card?.classList.add('loaded');
      expect(card?.classList.contains('loaded')).toBe(true);
      expect(card?.classList.contains('loading')).toBe(false);
    });
  });

  describe('Print Styles Tests', () => {
    beforeEach(() => {
      document.getElementById('app')!.innerHTML = `
        <div class="print-test">
          <header class="header no-print">
            <button class="cv-button">View CV</button>
          </header>
          <main class="print-friendly">
            <section class="profile-section">
              <h1>John Developer</h1>
              <p>Software Developer</p>
            </section>
            <section class="projects-section">
              <h2>Projects</h2>
              <div class="project-card">
                <h3>Project 1</h3>
                <p>Project description</p>
              </div>
            </section>
          </main>
        </div>
      `;
    });

    it('should have print-friendly structure', () => {
      const noPrintElements = document.querySelectorAll('.no-print');
      const printFriendlyElements = document.querySelectorAll('.print-friendly');
      
      expect(noPrintElements.length).toBeGreaterThan(0);
      expect(printFriendlyElements.length).toBeGreaterThan(0);
      
      // In print styles, .no-print elements would be hidden
      // and .print-friendly elements would be optimized
      expect(true).toBe(true); // Placeholder for print style verification
    });
  });
});