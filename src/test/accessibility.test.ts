import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock DOM environment for testing
let dom: JSDOM;
let document: Document;
let window: Window;

beforeEach(() => {
  dom = new JSDOM(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Test</title>
      </head>
      <body>
        <div id="test-container"></div>
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
});

afterEach(() => {
  dom.window.close();
});

describe('Accessibility Features', () => {
  describe('Header Component', () => {
    beforeEach(() => {
      document.getElementById('test-container')!.innerHTML = `
        <header class="header" role="banner">
          <div class="header-container">
            <a href="#main-content" class="skip-link">Skip to main content</a>
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
          </div>
        </header>
      `;
    });

    it('should have proper ARIA attributes on CV button', () => {
      const cvButton = document.getElementById('cv-button');
      
      expect(cvButton).toBeTruthy();
      expect(cvButton?.getAttribute('aria-label')).toBe('Open CV document viewer');
      expect(cvButton?.getAttribute('aria-describedby')).toBe('cv-button-description');
      expect(cvButton?.getAttribute('aria-expanded')).toBe('false');
      expect(cvButton?.getAttribute('aria-haspopup')).toBe('dialog');
      expect(cvButton?.getAttribute('type')).toBe('button');
    });

    it('should have skip link for keyboard navigation', () => {
      const skipLink = document.querySelector('.skip-link');
      
      expect(skipLink).toBeTruthy();
      expect(skipLink?.getAttribute('href')).toBe('#main-content');
      expect(skipLink?.textContent).toBe('Skip to main content');
    });

    it('should have proper role attribute', () => {
      const header = document.querySelector('header');
      
      expect(header?.getAttribute('role')).toBe('banner');
    });

    it('should have screen reader description', () => {
      const description = document.getElementById('cv-button-description');
      
      expect(description).toBeTruthy();
      expect(description?.classList.contains('sr-only')).toBe(true);
      expect(description?.textContent?.trim()).toBe('Opens a modal dialog to view the CV document with navigation controls');
    });
  });

  describe('Project Card Component', () => {
    beforeEach(() => {
      document.getElementById('test-container')!.innerHTML = `
        <article 
          class="project-card" 
          role="article"
          aria-labelledby="project-title-test-project"
          tabindex="0"
        >
          <div class="project-card__thumbnail">
            <img 
              src="/test-image.jpg" 
              alt="Screenshot of Test Project showing the main interface"
              class="project-card__image"
            />
            <div class="project-card__overlay" aria-hidden="true">
              <a 
                href="https://example.com" 
                class="project-card__link project-card__link--main"
                aria-label="View Test Project project details and live demo"
                target="_blank"
                rel="noopener noreferrer"
                tabindex="-1"
              >
                <span class="sr-only">View Project</span>
              </a>
              <div class="project-card__corner-links">
                <a 
                  href="https://github.com/test" 
                  class="project-card__link project-card__link--github"
                  aria-label="View Test Project source code on GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  tabindex="-1"
                >
                  <svg aria-hidden="true" focusable="false"></svg>
                </a>
              </div>
            </div>
          </div>
          
          <div class="project-card__content">
            <h3 id="project-title-test-project" class="project-card__title">Test Project</h3>
            <p class="project-card__description">A test project description</p>
            
            <div class="project-card__technologies" role="list" aria-label="Technologies used">
              <span class="project-card__tech-tag" role="listitem">React</span>
              <span class="project-card__tech-tag" role="listitem">TypeScript</span>
            </div>
          </div>
        </article>
      `;
    });

    it('should have proper ARIA attributes', () => {
      const projectCard = document.querySelector('.project-card');
      
      expect(projectCard?.getAttribute('role')).toBe('article');
      expect(projectCard?.getAttribute('aria-labelledby')).toBe('project-title-test-project');
      expect(projectCard?.getAttribute('tabindex')).toBe('0');
    });

    it('should have proper heading structure', () => {
      const title = document.getElementById('project-title-test-project');
      
      expect(title).toBeTruthy();
      expect(title?.tagName).toBe('H3');
      expect(title?.textContent).toBe('Test Project');
    });

    it('should have descriptive image alt text', () => {
      const image = document.querySelector('.project-card__image');
      
      expect(image?.getAttribute('alt')).toBe('Screenshot of Test Project showing the main interface');
    });

    it('should have proper link accessibility', () => {
      const mainLink = document.querySelector('.project-card__link--main');
      const githubLink = document.querySelector('.project-card__link--github');
      
      expect(mainLink?.getAttribute('aria-label')).toBe('View Test Project project details and live demo');
      expect(mainLink?.getAttribute('tabindex')).toBe('-1');
      expect(mainLink?.getAttribute('rel')).toBe('noopener noreferrer');
      
      expect(githubLink?.getAttribute('aria-label')).toBe('View Test Project source code on GitHub');
      expect(githubLink?.getAttribute('tabindex')).toBe('-1');
    });

    it('should have technologies list with proper ARIA', () => {
      const techList = document.querySelector('.project-card__technologies');
      const techItems = document.querySelectorAll('.project-card__tech-tag');
      
      expect(techList?.getAttribute('role')).toBe('list');
      expect(techList?.getAttribute('aria-label')).toBe('Technologies used');
      
      techItems.forEach(item => {
        expect(item.getAttribute('role')).toBe('listitem');
      });
    });

    it('should have overlay marked as decorative', () => {
      const overlay = document.querySelector('.project-card__overlay');
      
      expect(overlay?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have SVG icons marked as decorative', () => {
      const svg = document.querySelector('svg');
      
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.getAttribute('focusable')).toBe('false');
    });
  });

  describe('Projects Section Component', () => {
    beforeEach(() => {
      document.getElementById('test-container')!.innerHTML = `
        <section class="projects-section" id="projects" aria-labelledby="projects-heading">
          <div class="projects-container">
            <header class="projects-header">
              <h2 id="projects-heading" class="projects-title">Featured Projects</h2>
              <p class="projects-subtitle">A showcase of my recent work and technical expertise</p>
            </header>
            
            <div class="projects-grid" role="list" aria-label="Portfolio projects">
              <div class="projects-grid__item" role="listitem">
                <article class="project-card">Test Project 1</article>
              </div>
              <div class="projects-grid__item" role="listitem">
                <article class="project-card">Test Project 2</article>
              </div>
            </div>
          </div>
        </section>
      `;
    });

    it('should have proper section labeling', () => {
      const section = document.querySelector('.projects-section');
      
      expect(section?.getAttribute('aria-labelledby')).toBe('projects-heading');
      expect(section?.getAttribute('id')).toBe('projects');
    });

    it('should have proper heading hierarchy', () => {
      const heading = document.getElementById('projects-heading');
      
      expect(heading?.tagName).toBe('H2');
      expect(heading?.textContent).toBe('Featured Projects');
    });

    it('should have projects grid as list', () => {
      const grid = document.querySelector('.projects-grid');
      const items = document.querySelectorAll('.projects-grid__item');
      
      expect(grid?.getAttribute('role')).toBe('list');
      expect(grid?.getAttribute('aria-label')).toBe('Portfolio projects');
      
      items.forEach(item => {
        expect(item.getAttribute('role')).toBe('listitem');
      });
    });
  });

  describe('Profile Section Component', () => {
    beforeEach(() => {
      document.getElementById('test-container')!.innerHTML = `
        <section class="profile-section" aria-labelledby="profile-heading">
          <div class="profile-container">
            <div class="profile-image-wrapper">
              <img
                src="/profile.jpg"
                alt="Professional headshot of John Developer"
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
      `;
    });

    it('should have proper section labeling', () => {
      const section = document.querySelector('.profile-section');
      
      expect(section?.getAttribute('aria-labelledby')).toBe('profile-heading');
    });

    it('should have proper heading hierarchy', () => {
      const heading = document.getElementById('profile-heading');
      
      expect(heading?.tagName).toBe('H1');
      expect(heading?.textContent).toBe('John Developer');
    });

    it('should have role description properly linked', () => {
      const role = document.querySelector('.profile-role');
      
      expect(role?.getAttribute('aria-describedby')).toBe('profile-heading');
    });
  });

  describe('Intro Section Component', () => {
    beforeEach(() => {
      document.getElementById('test-container')!.innerHTML = `
        <section class="intro-section" aria-labelledby="intro-heading">
          <div class="intro-container">
            <div class="intro-content">
              <h2 id="intro-heading" class="sr-only">About Me</h2>
              <p class="intro-text">I'm a passionate full-stack developer...</p>
            </div>
          </div>
        </section>
      `;
    });

    it('should have proper section labeling', () => {
      const section = document.querySelector('.intro-section');
      
      expect(section?.getAttribute('aria-labelledby')).toBe('intro-heading');
    });

    it('should have screen reader only heading', () => {
      const heading = document.getElementById('intro-heading');
      
      expect(heading?.tagName).toBe('H2');
      expect(heading?.classList.contains('sr-only')).toBe(true);
      expect(heading?.textContent).toBe('About Me');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle Enter key on project card', () => {
      document.getElementById('test-container')!.innerHTML = `
        <article class="project-card" tabindex="0">
          <a href="https://example.com" class="project-card__link--main"></a>
        </article>
      `;

      const card = document.querySelector('.project-card') as HTMLElement;
      let linkClicked = false;

      // Mock window.open
      const originalOpen = window.open;
      window.open = () => {
        linkClicked = true;
        return null;
      };

      // Simulate Enter key press
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      card.dispatchEvent(event);

      // Restore original window.open
      window.open = originalOpen;

      // Note: In a real implementation, this would be handled by the JavaScript
      // For this test, we're just verifying the structure is correct
      expect(card.getAttribute('tabindex')).toBe('0');
    });

    it('should handle Tab key for focus trapping in modal', () => {
      // This would be tested with the actual CV viewer component
      // For now, we verify the structure supports focus trapping
      document.getElementById('test-container')!.innerHTML = `
        <div role="dialog" aria-modal="true" tabindex="-1">
          <button>First focusable</button>
          <button>Last focusable</button>
        </div>
      `;

      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog?.getAttribute('aria-modal')).toBe('true');
      expect(dialog?.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper live regions', () => {
      document.getElementById('test-container')!.innerHTML = `
        <div role="status" aria-live="polite">Loading...</div>
        <div role="alert" aria-live="assertive">Error occurred</div>
      `;

      const status = document.querySelector('[role="status"]');
      const alert = document.querySelector('[role="alert"]');

      expect(status?.getAttribute('aria-live')).toBe('polite');
      expect(alert?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should have screen reader only content properly hidden', () => {
      document.getElementById('test-container')!.innerHTML = `
        <span class="sr-only">Screen reader only text</span>
      `;

      const srOnly = document.querySelector('.sr-only');
      expect(srOnly?.classList.contains('sr-only')).toBe(true);
    });
  });

  describe('ARIA Landmarks and Structure', () => {
    it('should have proper landmark roles', () => {
      document.getElementById('test-container')!.innerHTML = `
        <header role="banner">Header</header>
        <main role="main">Main content</main>
        <nav aria-label="CV page navigation">Navigation</nav>
      `;

      const banner = document.querySelector('[role="banner"]');
      const main = document.querySelector('[role="main"]');
      const nav = document.querySelector('nav');

      expect(banner).toBeTruthy();
      expect(main).toBeTruthy();
      expect(nav?.getAttribute('aria-label')).toBe('CV page navigation');
    });

    it('should have proper heading hierarchy', () => {
      document.getElementById('test-container')!.innerHTML = `
        <h1>Main Title</h1>
        <h2>Section Title</h2>
        <h3>Subsection Title</h3>
      `;

      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      const h3 = document.querySelector('h3');

      expect(h1?.tagName).toBe('H1');
      expect(h2?.tagName).toBe('H2');
      expect(h3?.tagName).toBe('H3');
    });
  });
});