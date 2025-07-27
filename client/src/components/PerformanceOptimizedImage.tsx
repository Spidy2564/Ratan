import React, { useState, useRef, useEffect, useCallback } from 'react';

interface PerformanceOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  [key: string]: any;
}

const PerformanceOptimizedImage: React.FC<PerformanceOptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=300&fit=crop",
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoized error handler
  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      setIsLoading(false);
    }
  }, [hasError, fallbackSrc]);

  // Memoized load handler
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Set image source when in view
  useEffect(() => {
    if (isInView && src) {
      setImageSrc(src);
    }
  }, [isInView, src]);

  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? imageSrc : ''}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
};

export default PerformanceOptimizedImage; 