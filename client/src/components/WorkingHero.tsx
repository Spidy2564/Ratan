import React, { useState, useEffect } from 'react';

const WorkingHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Use different images for Hero so no duplicates with carousel
  const heroImages = [
    '/tshirts-new/image_174774126492.jpg',
    '/tshirts-new/image_174780602685.jpg',
    '/tshirts-new/image_174780724673.jpg'
  ];

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div style={{ 
      position: 'relative', 
      height: '500px', 
      overflow: 'hidden',
      borderRadius: '12px',
      margin: '20px'
    }}>
      {/* Hero Images */}
      {heroImages.map((imageSrc, index) => (
        <div 
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: currentSlide === index ? 1 : 0,
            transition: 'opacity 1s ease-in-out'
          }}
        >
          <img 
            src={imageSrc}
            alt={`Hero slide ${index + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            loading={index === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
      
      {/* Overlay Content */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'white',
        background: 'rgba(0,0,0,0.5)',
        padding: '30px',
        borderRadius: '12px'
      }}>
        <h1 style={{ fontSize: '48px', margin: '0 0 10px 0', fontWeight: 'bold' }}>
          PrintCraft HQ
        </h1>
        <p style={{ fontSize: '18px', margin: 0 }}>
          Premium T-Shirt Designs
        </p>
      </div>
      
      {/* Slide Indicators */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px'
      }}>
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: currentSlide === index ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkingHero;