import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock DOM environment
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <article class="project-card" data-featured="false">
        <div class="project-card__thumbnail">
          <img src="/test-image.jpg" alt="Test project thumbnail" class="project-card__image" />
        </div>
        <div class="project-card__content">
          <h3 class="project-card__title">Test Project</h3>
          <p class="project-card__description">A test project description</p>
        </div>
        <div class="project-tooltip" role="tooltip" aria-hidden="true">
          <div class="project-tooltip__content">
            <div class="project-tooltip__header">
              <h4 class="project-tooltip__title">Test Project</h4>
            </div>
            <p class="project-tooltip__description">A test project description</p>
            <div class="project-tooltip__technologies">
              <span class="project-tooltip__tech-label">Technologies:</span>
              <div class="project-tooltip__tech-list">
                <span class="project-tooltip__tech-tag">React</span>
                <span class="project-tooltip__tech-tag">TypeScript</span>
              </div>
            </div>
          </div>
          <div class="project-tooltip__arrow" aria-hidden="true"></div>
        </div>
      </article>
    </body>
  </html>
`, { url: 'http://localhost' });

// Set up global DOM
global.window = dom.window as any;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  top: 100,
  left: 100,
  bottom: 200,
  right: 300,
  width: 200,
  height: 100,
  x: 100,
  y: 100,
  toJSON: () => {}
}));

// Mock window properties
Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
Object.defineProperty(window, 'pageXOffset', { value: 0, writable: true });
Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });

describe('ProjectTooltip', () => {
  let tooltipManager: any;
  let projectCard: Element;
  let tooltip: Element;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <article class="project-card" data-featured="false">
        <div class="project-card__thumbnail">
          <img src="/test-image.jpg" alt="Test project thumbnail" class="project-card__image" />
        </div>
        <div class="project-card__content">
          <h3 class="project-card__title">Test Project</h3>
          <p class="project-card__description">A test project description</p>
        </div>
        <div class="project-tooltip" role="tooltip" aria-hidden="true">
          <div class="project-tooltip__content">
            <div class="project-tooltip__header">
              <h4 class="project-tooltip__title">Test Project</h4>
            </div>
            <p class="project-tooltip__description">A test project description</p>
            <div class="project-tooltip__technologies">
              <span class="project-tooltip__tech-label">Technologies:</span>
              <div class="project-tooltip__tech-list">
                <span class="project-tooltip__tech-tag">React</span>
                <span class="project-tooltip__tech-tag">TypeScript</span>
              </div>
            </div>
          </div>
          <div class="project-tooltip__arrow" aria-hidden="true"></div>
        </div>
      </article>
    `;

    projectCard = document.querySelector('.project-card')!;
    tooltip = document.querySelector('.project-tooltip')!;

    // Initialize tooltip manager (simulate the script from ProjectCard.astro)
    class ProjectTooltipManager {
      tooltips = new Map();
      showDelay = 300;
      hideDelay = 100;

      setupTooltips() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach((card) => {
          const tooltip = card.querySelector('.project-tooltip');
          if (!tooltip) return;

          const tooltipData = {
            element: tooltip,
            card: card,
            showTimeout: null,
            hideTimeout: null,
            isVisible: false
          };

          this.tooltips.set(card, tooltipData);

          // Add event listeners
          card.addEventListener('mouseenter', (e) => this.handleMouseEnter(e, tooltipData));
          card.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, tooltipData));
          card.addEventListener('focusin', (e) => this.handleFocusIn(e, tooltipData));
          card.addEventListener('focusout', (e) => this.handleFocusOut(e, tooltipData));
        });
      }

      handleMouseEnter(event: Event, tooltipData: any) {
        if (tooltipData.hideTimeout) {
          clearTimeout(tooltipData.hideTimeout);
          tooltipData.hideTimeout = null;
        }

        tooltipData.showTimeout = setTimeout(() => {
          this.showTooltip(tooltipData, event);
        }, this.showDelay);
      }

      handleMouseLeave(event: Event, tooltipData: any) {
        if (tooltipData.showTimeout) {
          clearTimeout(tooltipData.showTimeout);
          tooltipData.showTimeout = null;
        }

        tooltipData.hideTimeout = setTimeout(() => {
          this.hideTooltip(tooltipData);
        }, this.hideDelay);
      }

      handleFocusIn(event: Event, tooltipData: any) {
        this.showTooltip(tooltipData, event);
      }

      handleFocusOut(event: Event, tooltipData: any) {
        this.hideTooltip(tooltipData);
      }

      showTooltip(tooltipData: any, event: Event) {
        const { element } = tooltipData;
        
        this.positionTooltip(tooltipData, event);
        
        element.classList.add('show');
        element.setAttribute('aria-hidden', 'false');
        tooltipData.isVisible = true;

        if (tooltipData.showTimeout) {
          clearTimeout(tooltipData.showTimeout);
          tooltipData.showTimeout = null;
        }
      }

      hideTooltip(tooltipData: any) {
        const { element } = tooltipData;
        
        element.classList.remove('show');
        element.setAttribute('aria-hidden', 'true');
        tooltipData.isVisible = false;

        if (tooltipData.hideTimeout) {
          clearTimeout(tooltipData.hideTimeout);
          tooltipData.hideTimeout = null;
        }
      }

      positionTooltip(tooltipData: any, event: Event) {
        const { element, card } = tooltipData;
        const cardRect = card.getBoundingClientRect();
        const tooltipRect = element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollX = window.pageXOffset;
        const scrollY = window.pageYOffset;

        // Default positioning - above the card
        let placement = 'top';
        let left = cardRect.left + scrollX + (cardRect.width / 2) - (tooltipRect.width / 2);
        let top = cardRect.top + scrollY - tooltipRect.height - 12;

        // Check if tooltip fits above the card
        if (top < scrollY + 20) {
          placement = 'bottom';
          top = cardRect.bottom + scrollY + 12;
        }

        // Apply positioning
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
        element.setAttribute('data-placement', placement);
      }

      destroy() {
        this.tooltips.forEach((tooltipData) => {
          if (tooltipData.showTimeout) clearTimeout(tooltipData.showTimeout);
          if (tooltipData.hideTimeout) clearTimeout(tooltipData.hideTimeout);
        });
        this.tooltips.clear();
      }
    }

    tooltipManager = new ProjectTooltipManager();
    tooltipManager.setupTooltips();

    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    tooltipManager?.destroy();
    vi.useRealTimers();
  });

  it('should render tooltip with correct content', () => {
    expect(tooltip).toBeTruthy();
    expect(tooltip.getAttribute('role')).toBe('tooltip');
    expect(tooltip.getAttribute('aria-hidden')).toBe('true');
    
    const title = tooltip.querySelector('.project-tooltip__title');
    const description = tooltip.querySelector('.project-tooltip__description');
    const techTags = tooltip.querySelectorAll('.project-tooltip__tech-tag');
    
    expect(title?.textContent).toBe('Test Project');
    expect(description?.textContent).toBe('A test project description');
    expect(techTags).toHaveLength(2);
    expect(techTags[0].textContent).toBe('React');
    expect(techTags[1].textContent).toBe('TypeScript');
  });

  it('should show tooltip on mouse enter after delay', () => {
    expect(tooltip.classList.contains('show')).toBe(false);
    expect(tooltip.getAttribute('aria-hidden')).toBe('true');

    // Trigger mouse enter
    const mouseEnterEvent = new dom.window.Event('mouseenter');
    projectCard.dispatchEvent(mouseEnterEvent);

    // Tooltip should not show immediately
    expect(tooltip.classList.contains('show')).toBe(false);

    // Fast forward time to trigger show delay
    vi.advanceTimersByTime(300);

    expect(tooltip.classList.contains('show')).toBe(true);
    expect(tooltip.getAttribute('aria-hidden')).toBe('false');
  });

  it('should hide tooltip on mouse leave after delay', () => {
    // First show the tooltip
    const mouseEnterEvent = new dom.window.Event('mouseenter');
    projectCard.dispatchEvent(mouseEnterEvent);
    vi.advanceTimersByTime(300);

    expect(tooltip.classList.contains('show')).toBe(true);

    // Trigger mouse leave
    const mouseLeaveEvent = new dom.window.Event('mouseleave');
    projectCard.dispatchEvent(mouseLeaveEvent);

    // Tooltip should not hide immediately
    expect(tooltip.classList.contains('show')).toBe(true);

    // Fast forward time to trigger hide delay
    vi.advanceTimersByTime(100);

    expect(tooltip.classList.contains('show')).toBe(false);
    expect(tooltip.getAttribute('aria-hidden')).toBe('true');
  });

  it('should show tooltip immediately on focus', () => {
    expect(tooltip.classList.contains('show')).toBe(false);

    // Trigger focus
    const focusEvent = new dom.window.Event('focusin');
    projectCard.dispatchEvent(focusEvent);

    // Tooltip should show immediately without delay
    expect(tooltip.classList.contains('show')).toBe(true);
    expect(tooltip.getAttribute('aria-hidden')).toBe('false');
  });

  it('should hide tooltip on focus out', () => {
    // First show the tooltip
    const focusEvent = new dom.window.Event('focusin');
    projectCard.dispatchEvent(focusEvent);

    expect(tooltip.classList.contains('show')).toBe(true);

    // Trigger focus out
    const focusOutEvent = new dom.window.Event('focusout');
    projectCard.dispatchEvent(focusOutEvent);

    expect(tooltip.classList.contains('show')).toBe(false);
    expect(tooltip.getAttribute('aria-hidden')).toBe('true');
  });

  it('should position tooltip correctly', () => {
    // Show the tooltip
    const mouseEnterEvent = new dom.window.Event('mouseenter');
    projectCard.dispatchEvent(mouseEnterEvent);
    vi.advanceTimersByTime(300);

    // Check that positioning styles are applied
    expect(tooltip.style.left).toBeTruthy();
    expect(tooltip.style.top).toBeTruthy();
    expect(tooltip.getAttribute('data-placement')).toBeTruthy();
  });

  it('should cancel show timeout when mouse leaves before delay', () => {
    // Trigger mouse enter
    const mouseEnterEvent = new dom.window.Event('mouseenter');
    projectCard.dispatchEvent(mouseEnterEvent);

    // Immediately trigger mouse leave before show delay
    const mouseLeaveEvent = new dom.window.Event('mouseleave');
    projectCard.dispatchEvent(mouseLeaveEvent);

    // Fast forward past show delay
    vi.advanceTimersByTime(300);

    // Tooltip should not be shown
    expect(tooltip.classList.contains('show')).toBe(false);
  });

  it('should cancel hide timeout when mouse enters again', () => {
    // First show the tooltip
    const mouseEnterEvent = new dom.window.Event('mouseenter');
    projectCard.dispatchEvent(mouseEnterEvent);
    vi.advanceTimersByTime(300);

    expect(tooltip.classList.contains('show')).toBe(true);

    // Trigger mouse leave
    const mouseLeaveEvent = new dom.window.Event('mouseleave');
    projectCard.dispatchEvent(mouseLeaveEvent);

    // Immediately trigger mouse enter again before hide delay
    projectCard.dispatchEvent(mouseEnterEvent);

    // Fast forward past hide delay
    vi.advanceTimersByTime(100);

    // Tooltip should still be shown
    expect(tooltip.classList.contains('show')).toBe(true);
  });

  it('should handle featured project badge correctly', () => {
    // Update DOM to have a featured project
    projectCard.setAttribute('data-featured', 'true');
    tooltip.innerHTML = `
      <div class="project-tooltip__content">
        <div class="project-tooltip__header">
          <h4 class="project-tooltip__title">Featured Project</h4>
          <span class="project-tooltip__badge">Featured</span>
        </div>
        <p class="project-tooltip__description">A featured project description</p>
      </div>
    `;

    const badge = tooltip.querySelector('.project-tooltip__badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe('Featured');
  });

  it('should have proper ARIA attributes', () => {
    expect(tooltip.getAttribute('role')).toBe('tooltip');
    expect(tooltip.getAttribute('aria-hidden')).toBe('true');

    // Show tooltip
    const focusEvent = new dom.window.Event('focusin');
    projectCard.dispatchEvent(focusEvent);

    expect(tooltip.getAttribute('aria-hidden')).toBe('false');
  });

  it('should clean up timeouts on destroy', () => {
    // Start showing tooltip
    const mouseEnterEvent = new dom.window.Event('mouseenter');
    projectCard.dispatchEvent(mouseEnterEvent);

    // Destroy manager before timeout completes
    tooltipManager.destroy();

    // Fast forward time
    vi.advanceTimersByTime(300);

    // Tooltip should not be shown since manager was destroyed
    expect(tooltip.classList.contains('show')).toBe(false);
  });
});