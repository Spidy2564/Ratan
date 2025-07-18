import React, { useState } from 'react';

const FixedCarousel = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Use your ACTUAL filenames from the directory listing
  const products = [
    {
      name: 'Design 1',
      front: '/tshirts-new/image_174774126492.jpg',  // 26KB
      back: '/tshirts/itachi back.jpg'
    },
    {
      name: 'Design 2', 
      front: '/tshirts-new/image_174780602685.jpg',  // 93KB
      back: '/tshirts/gojo back.jpg'
    },
    {
      name: 'Design 3',
      front: '/tshirts-new/image_174780724673.jpg',  // 90KB  
      back: '/tshirts/goku back.jpg'
    },
    {
      name: 'Itachi Design',
      front: '/tshirts-new/image_174774126492.jpg',  // You can reuse front images
      back: '/tshirts/itachi back.jpg'
    },
    {
      name: 'Light Design',
      front: '/tshirts-new/image_174780602685.jpg',
      back: '/tshirts/light back.jpg'
    },
    {
      name: 'Madara Design', 
      front: '/tshirts-new/image_174780724673.jpg',
      back: '/tshirts/madara back.jpg'
    },
    {
      name: 'Naruto Design',
      front: '/tshirts-new/image_174774126492.jpg',  // Reuse available fronts
      back: '/tshirts/naruto back.jpg'
    },
    {
      name: 'Sukuna Design',
      front: '/tshirts-new/image_174780602685.jpg',
      back: '/tshirts/sukuna back.jpg'
    },
    {
      name: 'Sung Jin Woo',
      front: '/tshirts-new/image_174780724673.jpg', 
      back: '/tshirts/sung jin woo back.jpg'
    },
    {
      name: 'Tanjiro Design',
      front: '/tshirts-new/image_174774126492.jpg',
      back: '/tshirts/tanjiro back.jpg'
    },
    {
      name: 'Vegeta Design',
      front: '/tshirts-new/image_174780602685.jpg',
      back: '/tshirts/vegeta back.jpg'
    },
    {
      name: 'Zoro Design',
      front: '/tshirts-new/image_174780724673.jpg',
      back: '/tshirts/zoro back.jpg'
    }
  ];

  return (
    <div className="fixed-carousel" style={{ padding: '20px' }}>
      <div style={{
        background: '#4caf50',
        color: 'white', 
        padding: '10px',
        marginBottom: '20px',
        borderRadius: '4px'
      }}>
        ✅ <strong>FIXED:</strong> Now using your actual filenames!
      </div>
      
      {products.map((product, index) => (
        <div 
          key={index}
          className="product-card"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{
            display: 'inline-block',
            margin: '10px',
            position: 'relative',
            border: '2px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            width: '200px'
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '250px' }}>
            {/* Front Image */}
            <img 
              src={product.front}
              alt={`${product.name} front`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: hoveredIndex === index ? 0 : 1,
                transition: 'opacity 0.3s ease',
                // Performance optimizations
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
              onLoad={() => console.log(`✅ Front loaded: ${product.front}`)}
              onError={() => console.error(`❌ Front failed: ${product.front}`)}
            />
            
            {/* Back Image */}
            <img 
              src={product.back}
              alt={`${product.name} back`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: hoveredIndex === index ? 1 : 0,
                transition: 'opacity 0.3s ease',
                // Performance optimizations
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
              onLoad={() => console.log(`✅ Back loaded: ${product.back}`)}
              onError={() => console.error(`❌ Back failed: ${product.back}`)}
            />
          </div>
          
          <div style={{ padding: '10px', textAlign: 'center', background: '#f5f5f5' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
              {product.name}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FixedCarousel;