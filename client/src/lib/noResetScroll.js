/**
 * No Reset Scroll - A specialized script to prevent CSS animations from resetting during scroll
 * This works by using a different approach: replacing CSS animations with requestAnimationFrame
 */

// Store active animations
const animationRegistry = new Map();

// Animation function using requestAnimationFrame instead of CSS animation
export function setupNoResetScrollAnimation() {
  let animationId = null;
  let lastTime = 0;
  const speed = 0.02; // Adjust speed as needed
  let progress = 0;
  let scrollerElement = null;
  
  // Find our animation container when DOM is ready
  setTimeout(() => {
    scrollerElement = document.querySelector('.continuous-scroll');
    if (scrollerElement) {
      // Start the animation
      animationId = window.requestAnimationFrame(animateScroll);
    }
  }, 500);
  
  // Animation function that won't reset on scroll
  function animateScroll(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;
    
    if (scrollerElement) {
      // Calculate smooth animation progress
      progress += speed * (elapsed / 16); // normalize based on 60fps
      
      // Reset when we reach halfway (for seamless loop)
      if (progress >= 50) {
        progress = 0;
      }
      
      // Apply transform without using CSS animations
      scrollerElement.style.transform = `translate3d(-${progress}%, 0, 0)`;
    }
    
    lastTime = timestamp;
    animationId = window.requestAnimationFrame(animateScroll);
  }
  
  // Handle mouse hover to pause animation
  document.addEventListener('mouseover', event => {
    const container = document.querySelector('.product-carousel-container');
    if (container && container.contains(event.target) && animationId) {
      window.cancelAnimationFrame(animationId);
      animationId = null;
    }
  });
  
  // Resume animation on mouse out
  document.addEventListener('mouseout', event => {
    const container = document.querySelector('.product-carousel-container');
    if (container && !container.contains(event.relatedTarget) && !animationId) {
      animationId = window.requestAnimationFrame(animateScroll);
    }
  });
  
  // Return cleanup function
  return () => {
    if (animationId) {
      window.cancelAnimationFrame(animationId);
    }
    
    // Remove event listeners
    document.removeEventListener('mouseover', () => {});
    document.removeEventListener('mouseout', () => {});
  };
}

export default setupNoResetScrollAnimation;