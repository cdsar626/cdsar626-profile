import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Responsive Design System', () => {
  const globalCssPath = resolve(__dirname, '../styles/global.css');
  const responsiveCssPath = resolve(__dirname, '../styles/responsive.css');
  
  let globalCss: string;
  let responsiveCss: string;

  try {
    globalCss = readFileSync(globalCssPath, 'utf-8');
    responsiveCss = readFileSync(responsiveCssPath, 'utf-8');
  } catch (error) {
    globalCss = '';
    responsiveCss = '';
  }

  describe('CSS Files Existence and Structure', () => {
    it('should have global CSS file with responsive import', () => {
      expect(globalCss).toBeTruthy();
      expect(globalCss).toContain('@import "./responsive.css"');
    });

    it('should have responsive CSS file', () => {
      expect(responsiveCss).toBeTruthy();
      expect(responsiveCss.length).toBeGreaterThan(1000); // Should be substantial
    });
  });

  describe('Breakpoint System', () => {
    it('should define consistent breakpoint custom properties', () => {
      const breakpoints = [
        '--breakpoint-sm: 640px',
        '--breakpoint-md: 768px',
        '--breakpoint-lg: 1024px',
        '--breakpoint-xl: 1280px',
        '--breakpoint-2xl: 1536px'
      ];

      breakpoints.forEach(breakpoint => {
        expect(globalCss).toContain(breakpoint);
      });
    });

    it('should have media queries for each breakpoint', () => {
      const mediaQueries = [
        '@media (min-width: 640px)',
        '@media (min-width: 768px)',
        '@media (min-width: 1024px)',
        '@media (min-width: 1280px)',
        '@media (min-width: 1536px)'
      ];

      mediaQueries.forEach(query => {
        expect(responsiveCss).toContain(query);
      });
    });
  });

  describe('Container System', () => {
    it('should define container classes in CSS', () => {
      expect(responsiveCss).toContain('.container {');
      expect(responsiveCss).toContain('width: 100%');
      expect(responsiveCss).toContain('margin: 0 auto');
    });

    it('should define different container sizes', () => {
      const containerSizes = ['container-xs', 'container-sm', 'container-md', 'container-lg', 'container-xl', 'container-2xl'];
      
      containerSizes.forEach(size => {
        expect(responsiveCss).toContain(`.${size} {`);
      });
    });
  });

  describe('Responsive Spacing Utilities', () => {
    it('should define responsive padding utilities in CSS', () => {
      expect(responsiveCss).toContain('.p-responsive {');
      expect(responsiveCss).toContain('padding: var(--space-4)');
    });

    it('should define responsive margin utilities in CSS', () => {
      expect(responsiveCss).toContain('.m-responsive {');
      expect(responsiveCss).toContain('margin: var(--space-4)');
    });

    it('should define section spacing utilities in CSS', () => {
      const spacingClasses = ['section-spacing', 'section-spacing-sm', 'section-spacing-lg'];
      
      spacingClasses.forEach(className => {
        expect(responsiveCss).toContain(`.${className} {`);
      });
    });
  });

  describe('Typography Utilities', () => {
    it('should define responsive text size utilities in CSS', () => {
      const textSizes = [
        'text-xs-responsive',
        'text-sm-responsive', 
        'text-base-responsive',
        'text-lg-responsive',
        'text-xl-responsive',
        'text-2xl-responsive',
        'text-3xl-responsive',
        'text-4xl-responsive',
        'text-5xl-responsive'
      ];

      textSizes.forEach(size => {
        expect(responsiveCss).toContain(`.${size} {`);
      });
    });

    it('should define responsive heading utilities in CSS', () => {
      const headingClasses = ['heading-display', 'heading-h1', 'heading-h2', 'heading-h3', 'heading-h4'];
      
      headingClasses.forEach(className => {
        expect(responsiveCss).toContain(`.${className} {`);
      });
    });

    it('should define responsive text alignment utilities in CSS', () => {
      const alignments = ['text-left-responsive', 'text-center-responsive', 'text-right-responsive'];
      
      alignments.forEach(alignment => {
        expect(responsiveCss).toContain(`.${alignment} {`);
      });
    });
  });

  describe('Layout Utilities', () => {
    it('should define flexbox utilities in CSS', () => {
      const flexClasses = [
        'flex-responsive',
        'flex-col-responsive', 
        'flex-row-responsive',
        'items-center-responsive',
        'justify-center-responsive'
      ];

      flexClasses.forEach(className => {
        expect(responsiveCss).toContain(`.${className} {`);
      });
    });

    it('should define grid utilities in CSS', () => {
      const gridClasses = ['grid-responsive', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'];
      
      gridClasses.forEach(className => {
        expect(responsiveCss).toContain(`.${className} {`);
      });
    });

    it('should define gap utilities in CSS', () => {
      const gapClasses = ['gap-responsive', 'gap-x-responsive', 'gap-y-responsive'];
      
      gapClasses.forEach(className => {
        expect(responsiveCss).toContain(`.${className} {`);
      });
    });
  });

  describe('Touch Target Utilities', () => {
    it('should define minimum touch target sizes in CSS', () => {
      const touchClasses = ['touch-target', 'touch-target-sm', 'touch-target-lg'];
      
      touchClasses.forEach(className => {
        expect(responsiveCss).toContain(`.${className} {`);
        expect(responsiveCss).toContain('min-height:');
        expect(responsiveCss).toContain('min-width:');
      });
    });

    it('should define touch spacing utilities in CSS', () => {
      const spacingClasses = ['touch-spacing', 'touch-spacing-sm', 'touch-spacing-lg'];
      
      spacingClasses.forEach(className => {
        expect(responsiveCss).toContain(`.${className} {`);
      });
    });
  });

  describe('Image Utilities', () => {
    it('should define responsive image utilities in CSS', () => {
      expect(responsiveCss).toContain('.img-responsive {');
      expect(responsiveCss).toContain('max-width: 100%');
      expect(responsiveCss).toContain('height: auto');
      expect(responsiveCss).toContain('display: block');
    });

    it('should define aspect ratio utilities in CSS', () => {
      const aspectRatios = ['aspect-square', 'aspect-video', 'aspect-photo', 'aspect-portrait'];
      
      aspectRatios.forEach(className => {
        expect(responsiveCss).toContain(`.${className} {`);
        expect(responsiveCss).toContain('aspect-ratio:');
      });
    });
  });

  describe('Visibility Utilities', () => {
    it('should define responsive visibility utilities in CSS', () => {
      const visibilityClasses = [
        'hidden-xs',
        'visible-xs', 
        'hidden-sm',
        'visible-sm',
        'hidden-lg',
        'visible-lg'
      ];

      visibilityClasses.forEach(className => {
        expect(responsiveCss).toContain(`.${className} {`);
      });
    });
  });

  describe('Width and Height Utilities', () => {
    it('should define width utilities in CSS', () => {
      const widthClasses = ['w-full', 'w-auto'];
      
      widthClasses.forEach(className => {
        expect(responsiveCss).toContain(`.${className} {`);
      });
    });

    it('should define max-width utilities in CSS', () => {
      const maxWidthClasses = [
        'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl',
        'max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl'
      ];
      
      maxWidthClasses.forEach(className => {
        expect(responsiveCss).toContain(`.${className} {`);
      });
    });

    it('should define height utilities in CSS', () => {
      const heightClasses = ['h-full', 'h-auto', 'min-h-screen'];
      
      heightClasses.forEach(className => {
        expect(responsiveCss).toContain(`.${className} {`);
      });
    });
  });

  describe('CSS Custom Properties', () => {
    it('should define all required spacing custom properties in CSS', () => {
      const spacingProperties = [
        '--space-1', '--space-2', '--space-3', '--space-4', '--space-6', '--space-8',
        '--space-10', '--space-12', '--space-16', '--space-20', '--space-24', '--space-32',
        '--space-section', '--space-container'
      ];

      spacingProperties.forEach(property => {
        expect(globalCss).toContain(`${property}:`);
      });
    });

    it('should define all required font size custom properties in CSS', () => {
      const fontSizeProperties = [
        '--font-size-xs', '--font-size-sm', '--font-size-base', '--font-size-lg',
        '--font-size-xl', '--font-size-2xl', '--font-size-3xl', '--font-size-4xl',
        '--font-size-5xl', '--font-size-6xl'
      ];

      fontSizeProperties.forEach(property => {
        expect(globalCss).toContain(`${property}:`);
      });
    });

    it('should define all required max-width custom properties in CSS', () => {
      const maxWidthProperties = [
        '--max-width-xs', '--max-width-sm', '--max-width-md', '--max-width-lg',
        '--max-width-xl', '--max-width-2xl', '--max-width-3xl', '--max-width-4xl',
        '--max-width-5xl', '--max-width-6xl', '--max-width-7xl'
      ];

      maxWidthProperties.forEach(property => {
        expect(globalCss).toContain(`${property}:`);
      });
    });
  });

  describe('Accessibility Features', () => {
    it('should define reduced motion utilities in CSS', () => {
      expect(responsiveCss).toContain('@media (prefers-reduced-motion: reduce)');
      expect(responsiveCss).toContain('motion-reduce\\:animate-none');
      expect(responsiveCss).toContain('motion-reduce\\:transition-none');
    });

    it('should define high contrast mode utilities in CSS', () => {
      expect(responsiveCss).toContain('@media (prefers-contrast: high)');
      expect(responsiveCss).toContain('contrast-high\\:border-black');
      expect(responsiveCss).toContain('contrast-high\\:text-black');
    });

    it('should define print utilities in CSS', () => {
      expect(responsiveCss).toContain('@media print');
      expect(responsiveCss).toContain('print\\:hidden');
      expect(responsiveCss).toContain('print\\:text-black');
    });
  });

  describe('Touch Device Optimizations', () => {
    it('should define touch-friendly hover alternatives in CSS', () => {
      expect(responsiveCss).toContain('@media (hover: none) and (pointer: coarse)');
      expect(responsiveCss).toContain('touch-hover\\:scale-105');
      expect(responsiveCss).toContain('touch-hover\\:opacity-80');
    });
  });
});