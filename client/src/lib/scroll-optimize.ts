/**
 * Optimizations for scrolling performance
 * 
 * This file contains utility functions to improve scrolling performance
 * by reducing unnecessary repaints, optimizing animations, and properly
 * handling intersection observations.
 */

// Apply optimization to images to prevent layout shifts
export function optimizeImages() {
  document.querySelectorAll('img').forEach(img => {
    // Enable native lazy loading
    img.loading = 'lazy';
    
    // Use async decoding to prevent UI blocking
    img.decoding = 'async';
    
    // Set explicit dimensions where possible to reduce layout shifts
    if (!img.width && !img.height && img.complete) {
      const { naturalWidth, naturalHeight } = img;
      if (naturalWidth && naturalHeight) {
        img.width = naturalWidth;
        img.height = naturalHeight;
      }
    }
  });
}

// Apply performance improvements to the DOM
export function applyScrollOptimizations() {
  // Optimize images
  optimizeImages();
  
  // Find potential heavy elements like carousels, animations, etc.
  const heavyElements = document.querySelectorAll('.anime-scroll-animation, .limited-edition-scroll');
  
  heavyElements.forEach(element => {
    if (element instanceof HTMLElement) {
      // Apply hardware acceleration
      element.style.transform = 'translateZ(0)';
      element.style.willChange = 'transform';
      element.style.backfaceVisibility = 'hidden';
      
      // Make sure GPU is handling animations
      element.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
    }
  });
  
  // Reduce scroll jank by disabling hover effects during scroll
  let scrollTimer: number | null = null;
  const body = document.body;
  
  window.addEventListener('scroll', () => {
    if (!body.classList.contains('is-scrolling')) {
      body.classList.add('is-scrolling');
    }
    
    if (scrollTimer !== null) {
      window.clearTimeout(scrollTimer);
    }
    
    scrollTimer = window.setTimeout(() => {
      body.classList.remove('is-scrolling');
    }, 150) as unknown as number;
  }, { passive: true });
}

// Fix for Safari and Chrome specific issues with backdrop-filter
export function fixBackdropFilterPerformance() {
  // Detect Safari/Chrome
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isChrome = /chrome/i.test(navigator.userAgent);
  
  if (isSafari || isChrome) {
    const glassElements = document.querySelectorAll('[style*="backdrop-filter"]');
    
    glassElements.forEach(element => {
      if (element instanceof HTMLElement) {
        // For Safari/Chrome, use a simpler backdrop filter or disable during scroll
        element.setAttribute('data-has-backdrop', 'true');
        
        // Add a class that we can target during scroll
        element.classList.add('backdrop-element');
      }
    });
    
    // Add event listener to handle backdrop-filter during scroll
    let backdropScrollTimer: number | null = null;
    document.addEventListener('scroll', () => {
      document.body.classList.add('is-scrolling');
      
      if (backdropScrollTimer !== null) {
        window.clearTimeout(backdropScrollTimer);
      }
      
      backdropScrollTimer = window.setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 150) as unknown as number;
    }, { passive: true });
  }
}

// Initialize all optimizations
export function initScrollOptimizations() {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyScrollOptimizations();
      fixBackdropFilterPerformance();
    });
  } else {
    applyScrollOptimizations();
    fixBackdropFilterPerformance();
  }
  
  // Also apply optimizations when new content might be loaded
  window.addEventListener('load', applyScrollOptimizations);
}