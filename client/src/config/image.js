export const imageConfig = {
  // Hero-specific images (no overlap with products)
  hero: [
    '/images/hero/hero-1.jpg',
    '/images/hero/hero-2.jpg', 
    '/images/hero/hero-3.jpg',
    '/images/hero/hero-4.jpg'
  ],
  
  // Product catalog images
  products: [
    {
      id: 'zoro',
      name: 'Zoro Design',
      front: '/images/products/zoro-front.jpg',
      back: '/images/backs/zoro-back.jpg'
    },
    {
      id: 'sung-jin-woo', 
      name: 'Sung Jin Woo Design',
      front: '/images/products/sung-jin-woo-front.jpg',
      back: '/images/backs/sung-jin-woo-back.jpg'
    },
    {
      id: 'naruto',
      name: 'Naruto Design', 
      front: '/images/products/naruto-front.jpg',
      back: '/images/backs/naruto-back.jpg'
    }
    // Add more products...
  ]
};

// 🚀 **2. Optimized Hero Component**
// /src/components/Hero.tsx
import React from 'react';
import { imageConfig } from '../config/images';

const Hero = () => {
  return (
    <div className="hero-carousel">
      {imageConfig.hero.map((image, index) => (
        <div key={index} className="hero-slide">
          <img 
            src={image}
            alt={`Hero slide ${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"} // First image loads immediately
            className="hero-image"
          />
        </div>
      ))}
    </div>
  );
};

export default Hero;