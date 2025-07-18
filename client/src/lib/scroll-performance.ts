/**
 * Scroll Performance Optimizer
 * Improves scrolling by temporarily disabling animations while scrolling
 */

let scrollTimer: number | null = null;
const SCROLL_ACTIVE_CLASS = 'scroll-active';

/**
 * Apply scroll-active class during scroll and remove it after scrolling stops
 */
function handleScroll() {
  document.body.classList.add(SCROLL_ACTIVE_CLASS);
  
  // Clear previous timeout if it exists
  if (scrollTimer !== null) {
    window.clearTimeout(scrollTimer);
  }
  
  // Set a timeout to remove the class after scrolling stops
  scrollTimer = window.setTimeout(() => {
    document.body.classList.remove(SCROLL_ACTIVE_CLASS);
  }, 150); // Wait 150ms after scrolling stops before re-enabling animations
}

/**
 * Debounce function to limit scroll event handling
 */
function debounce(fn: Function, delay: number) {
  let timer: number | null = null;
  return function(this: any, ...args: any[]) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Initialize scroll performance optimizations
 */
export function initScrollPerformance() {
  // Add passive scroll listener to improve performance
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Add scroll end detection
  window.addEventListener('scrollend', () => {
    document.body.classList.remove(SCROLL_ACTIVE_CLASS);
  }, { passive: true });
  
  // Use Intersection Observer to lazy load off-screen content
  const lazyLoadObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.style.visibility = 'visible';
          lazyLoadObserver.unobserve(target);
        }
      });
    },
    { rootMargin: '200px' }
  );
  
  // Apply to sections that don't need to be rendered immediately
  document.querySelectorAll('.lazy-section').forEach(section => {
    lazyLoadObserver.observe(section);
  });
  
  // Add class to carousel to optimize it
  document.querySelectorAll('.embla').forEach(carousel => {
    carousel.classList.add('carousel-component');
  });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('scrollend', () => {
      document.body.classList.remove(SCROLL_ACTIVE_CLASS);
    });
  };
}