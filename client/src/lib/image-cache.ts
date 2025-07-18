// src/lib/image-cache.ts
import React from 'react';

class ImageCache {
  private loadedImages = new Set<string>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();

  async loadImage(src: string): Promise<HTMLImageElement> {
    // If already loaded, return immediately
    if (this.loadedImages.has(src)) {
      const img = new Image();
      img.src = src;
      return img;
    }

    // If currently loading, return the existing promise
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    // Start loading
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.add(src);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  isLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }

  preload(sources: string[]): Promise<void> {
    console.log(`🚀 Preloading ${sources.length} images...`);
    
    const promises = sources.map(src => 
      this.loadImage(src).catch(error => {
        console.warn(`⚠️ Failed to preload image: ${src}`, error);
      })
    );

    return Promise.all(promises).then(() => {
      console.log(`✅ Preloaded ${sources.length} images`);
    });
  }
}

export const imageCache = new ImageCache();

// React hook for optimized image loading
export const useOptimizedImage = (src: string, priority = false) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!src) return;

    // Check if already loaded
    if (imageCache.isLoaded(src)) {
      setLoaded(true);
      return;
    }

    // Load with caching
    imageCache.loadImage(src)
      .then(() => setLoaded(true))
      .catch(() => setError(true));
  }, [src]);

  return { loaded, error };
};