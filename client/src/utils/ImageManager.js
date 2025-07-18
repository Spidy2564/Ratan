class ImageManager {
  constructor() {
    this.loadedImages = new Map();
    this.imagePromises = new Map();
  }

  // Preload image and cache the promise
  preloadImage(src) {
    if (this.imagePromises.has(src)) {
      return this.imagePromises.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      if (this.loadedImages.has(src)) {
        resolve(this.loadedImages.get(src));
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.loadedImages.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });

    this.imagePromises.set(src, promise);
    return promise;
  }

  // Check if image is already loaded
  isLoaded(src) {
    return this.loadedImages.has(src);
  }

  // Get cached image
  getCachedImage(src) {
    return this.loadedImages.get(src);
  }
}

// Global instance
export const imageManager = new ImageManager();