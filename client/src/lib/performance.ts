// lib/performance.ts
// Performance optimization utilities for the anime store

interface PerformanceConfig {
  enableFPSMonitoring?: boolean;
  scrollThrottleMs?: number;
  resizeThrottleMs?: number;
  intersectionObserverRootMargin?: string;
  enableLazyLoading?: boolean;
  enablePrefetch?: boolean;
}

const defaultConfig: PerformanceConfig = {
  enableFPSMonitoring: true,
  scrollThrottleMs: 16, // ~60fps
  resizeThrottleMs: 100,
  intersectionObserverRootMargin: '50px',
  enableLazyLoading: true,
  enablePrefetch: true,
};

class PerformanceManager {
  private config: PerformanceConfig;
  private observers: IntersectionObserver[] = [];
  private listeners: Array<{ element: any; event: string; handler: any }> = [];
  private rafId: number | null = null;
  private isScrolling = false;
  private scrollTimeout: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fpsElement: HTMLElement | null = null;

  constructor(config: PerformanceConfig = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  init(): () => void {
    console.log('🚀 Initializing performance optimizations...');
    
    this.setupScrollOptimizations();
    this.setupResizeOptimizations();
    this.setupLazyLoading();
    this.setupImageOptimizations();
    this.setupAnimationOptimizations();
    this.setupMemoryOptimizations();
    
    if (this.config.enableFPSMonitoring && process.env.NODE_ENV === 'development') {
      this.startFPSMonitoring();
    }

    // Detect device capabilities and apply optimizations
    this.detectAndOptimizeForDevice();

    console.log('✅ Performance optimizations initialized');

    // Return cleanup function
    return () => {
      this.cleanup();
    };
  }

  private setupScrollOptimizations(): void {
    let scrollTimer: number | null = null;

    const handleScroll = () => {
      if (!this.isScrolling) {
        document.body.classList.add('scroll-active');
        this.isScrolling = true;
      }

      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }

      scrollTimer = window.setTimeout(() => {
        document.body.classList.remove('scroll-active');
        this.isScrolling = false;
      }, 150);
    };

    const throttledScroll = this.throttle(handleScroll, this.config.scrollThrottleMs!);
    this.addListener(window, 'scroll', throttledScroll, { passive: true });
  }

  private setupResizeOptimizations(): void {
    const handleResize = () => {
      // Update CSS custom properties for viewport dimensions
      const vh = window.innerHeight * 0.01;
      const vw = window.innerWidth * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--vw', `${vw}px`);

      // Dispatch custom event for components that need to know about resize
      window.dispatchEvent(new CustomEvent('optimized-resize'));
    };

    const throttledResize = this.throttle(handleResize, this.config.resizeThrottleMs!);
    this.addListener(window, 'resize', throttledResize);
    
    // Initial call
    handleResize();
  }

  private setupLazyLoading(): void {
    if (!this.config.enableLazyLoading || !('IntersectionObserver' in window)) {
      return;
    }

    // Lazy load images
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('image-placeholder');
            img.classList.add('image-loaded');
            delete img.dataset.src;
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: this.config.intersectionObserverRootMargin,
    });

    // Observe existing images with data-src
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });

    // Lazy load sections
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          // Trigger any animations or data loading for this section
          entry.target.dispatchEvent(new CustomEvent('section-visible'));
        }
      });
    });

    document.querySelectorAll('.lazy-section').forEach((section) => {
      sectionObserver.observe(section);
    });

    this.observers.push(imageObserver, sectionObserver);
  }

  private setupImageOptimizations(): void {
    // Add loading='lazy' to images that don't have it
    document.querySelectorAll('img:not([loading])').forEach((img) => {
      (img as HTMLImageElement).loading = 'lazy';
    });

    // Preload critical images
    const criticalImages = document.querySelectorAll('img[data-priority="high"]');
    criticalImages.forEach((img) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = (img as HTMLImageElement).src;
      document.head.appendChild(link);
    });
  }

  private setupAnimationOptimizations(): void {
    // Pause animations when tab is not visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.classList.add('tab-hidden');
      } else {
        document.body.classList.remove('tab-hidden');
      }
    };

    this.addListener(document, 'visibilitychange', handleVisibilityChange);

    // Reduce animations on low-end devices
    if (this.isLowEndDevice()) {
      document.body.classList.add('reduced-animations');
    }

    // Honor prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('prefers-reduced-motion');
    }
  }

  private setupMemoryOptimizations(): void {
    // Clean up event listeners on route changes
    const handleRouteChange = () => {
      // Clean up any orphaned event listeners
      this.cleanupOrphanedListeners();
    };

    // Listen for route changes (works with wouter)
    this.addListener(window, 'popstate', handleRouteChange);

    // Periodically clean up memory
    setInterval(() => {
      if (this.frameCount % 1000 === 0) { // Every ~16 seconds at 60fps
        this.performMemoryCleanup();
      }
    }, 1000);
  }

  private detectAndOptimizeForDevice(): void {
    const isLowEnd = this.isLowEndDevice();
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isLowEnd) {
      document.body.classList.add('low-performance-device');
      console.log('🐌 Low-end device detected, applying optimizations');
    }

    if (isMobile) {
      document.body.classList.add('mobile-device');
      console.log('📱 Mobile device detected');
    }

    // Network optimization
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        document.body.classList.add('slow-connection');
        console.log('🐌 Slow connection detected');
      }
    }
  }

  private isLowEndDevice(): boolean {
    // Check various indicators of device performance
    const checks = [
      navigator.hardwareConcurrency <= 2,
      (navigator as any).deviceMemory <= 4,
      window.innerWidth <= 768 && window.devicePixelRatio <= 1.5,
    ];

    return checks.filter(Boolean).length >= 2;
  }

  private startFPSMonitoring(): void {
    // Create FPS counter for development
    this.fpsElement = document.createElement('div');
    this.fpsElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(this.fpsElement);

    const measureFPS = (currentTime: number) => {
      this.frameCount++;
      
      if (currentTime >= this.lastFrameTime + 1000) {
        const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
        
        if (this.fpsElement) {
          this.fpsElement.textContent = `FPS: ${fps}`;
          this.fpsElement.style.color = fps >= 55 ? '#4CAF50' : fps >= 30 ? '#FF9800' : '#F44336';
        }

        // Apply performance mode if FPS is consistently low
        if (fps < 30) {
          document.body.classList.add('performance-mode');
        } else if (fps > 55) {
          document.body.classList.remove('performance-mode');
        }

        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }

      this.rafId = requestAnimationFrame(measureFPS);
    };

    this.rafId = requestAnimationFrame(measureFPS);
  }

  private throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    }) as T;
  }

  private addListener(element: any, event: string, handler: any, options?: any): void {
    element.addEventListener(event, handler, options);
    this.listeners.push({ element, event, handler });
  }

  private cleanupOrphanedListeners(): void {
    // Remove listeners from elements that are no longer in the DOM
    this.listeners = this.listeners.filter(({ element }) => {
      if (element === window || element === document) {
        return true; // Keep global listeners
      }
      return document.contains(element);
    });
  }

  private performMemoryCleanup(): void {
    // Force garbage collection if available (dev tools)
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }

    // Clean up any detached DOM nodes
    this.cleanupOrphanedListeners();

    console.log('🧹 Memory cleanup performed');
  }

  private cleanup(): void {
    console.log('🧹 Cleaning up performance optimizations...');

    // Remove all event listeners
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];

    // Disconnect all observers
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers = [];

    // Cancel animation frame
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Remove FPS counter
    if (this.fpsElement) {
      this.fpsElement.remove();
      this.fpsElement = null;
    }

    // Clear scroll timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }

    console.log('✅ Performance optimizations cleaned up');
  }
}

// Global performance manager instance
let performanceManager: PerformanceManager | null = null;

/**
 * Initialize performance optimizations
 * @param config Optional configuration object
 * @returns Cleanup function
 */
export function initPerformanceOptimizations(config?: PerformanceConfig): () => void {
  if (performanceManager) {
    console.warn('⚠️ Performance optimizations already initialized');
    return () => {};
  }

  performanceManager = new PerformanceManager(config);
  const cleanup = performanceManager.init();

  return () => {
    if (performanceManager) {
      cleanup();
      performanceManager = null;
    }
  };
}

/**
 * Get the current performance manager instance
 */
export function getPerformanceManager(): PerformanceManager | null {
  return performanceManager;
}

/**
 * Utility function to mark an element for lazy loading
 */
export function markForLazyLoading(element: HTMLElement): void {
  element.classList.add('lazy-section');
  
  if (performanceManager && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          entry.target.dispatchEvent(new CustomEvent('section-visible'));
          observer.unobserve(entry.target);
        }
      });
    });
    
    observer.observe(element);
  }
}

/**
 * Utility function to preload an image
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;

    if (priority === 'high') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }
  });
}

/**
 * Utility function to defer a function until the page is idle
 */
export function runWhenIdle(callback: () => void, timeout = 5000): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 0);
  }
}

export default {
  initPerformanceOptimizations,
  getPerformanceManager,
  markForLazyLoading,
  preloadImage,
  runWhenIdle,
};