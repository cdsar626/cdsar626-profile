// Global type declarations for the portfolio project

declare global {
  interface Window {
    performanceObserver?: {
      disconnect(): void;
      observe(options: any): void;
    };
    registerCleanup?: (obj: any, identifier: any) => void;
  }

  interface PerformanceEntry {
    value?: number;
    hadRecentInput?: boolean;
  }

  interface Element {
    complete?: boolean;
    style?: CSSStyleDeclaration;
    dataset?: DOMStringMap;
    href?: string;
  }

  interface HTMLElement {
    style: CSSStyleDeclaration;
    dataset: DOMStringMap;
  }

  interface HTMLAnchorElement {
    href: string;
  }

  interface HTMLImageElement {
    complete: boolean;
  }

  // Project-specific classes - using var declarations instead of class declarations
  var ProjectTooltipManager: {
    new(): {
      tooltips: Map<any, any>;
      showDelay: number;
      hideDelay: number;
      isTouchDevice: boolean;
      handleTouchStart(event: any, tooltipData: any): void;
      handleTouchEnd(event: any, tooltipData: any): void;
      handleTouchCancel(event: any, tooltipData: any): void;
      handleMouseEnter(event: any, tooltipData: any): void;
      handleMouseLeave(event: any, tooltipData: any): void;
      handleMouseMove(event: any, tooltipData: any): void;
      handleFocusIn(event: any, tooltipData: any): void;
      handleFocusOut(event: any, tooltipData: any): void;
      handleKeydown(event: any, tooltipData: any): void;
      showTooltip(tooltipData: any, event: any): void;
      hideTooltip(tooltipData: any): void;
      positionTooltip(tooltipData: any, event: any): void;
    };
  };

  var PageAnimationManager: {
    new(): {
      isReducedMotion: boolean;
      init(): void;
      animateOnScroll(): void;
      staggerAnimations(): void;
    };
  };
}

export {};