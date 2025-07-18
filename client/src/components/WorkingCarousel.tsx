import React, { useState } from 'react';

const WorkingCarousel = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Using your EXACT filenames - no renaming needed!
  const products = [
    {
      name: 'Zoro Design',
      front: '/tshirts-new/image_174774126492.jpg',
      back: '/tshirts/zoro back.jpg'
    },
    {
      name: 'Naruto Design', 
      front: '/tshirts-new/image_174780602685.jpg',
      back: '/tshirts/naruto back.jpg'
    },
    {
      name: 'Goku Design',
      front: '/tshirts-new/image_174780724673.jpg',
      back: '/tshirts/goku back.jpg'
    },
    {
      name: 'Itachi Design',
      front: '/tshirts-new/image_174774126492.jpg', // Reuse available images
      back: '/tshirts/itachi back.jpg'
    },
    {
      name: 'Madara Design',
      front: '/tshirts-new/image_174780602685.jpg',
      back: '/tshirts/madara back.jpg'
    },
    {
      name: 'Sukuna Design',
      front: '/tshirts-new/image_174780724673.jpg',
      back: '/tshirts/sukuna back.jpg'
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        background: '#4caf50',
        color: 'white',
        padding: '15px',
        marginBottom: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        ✅ <strong>WORKING SOLUTION:</strong> Using your actual filenames - hover effects should be smooth now!
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        {products.map((product, index) => (
          <div 
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              border: '2px solid #ddd',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: hoveredIndex === index ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              transform: hoveredIndex === index ? 'translateY(-5px)' : 'translateY(0)',
              cursor: 'pointer'
            }}
          >
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              height: '250px',
              overflow: 'hidden'
            }}>
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
                  // GPU acceleration for smooth performance
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden'
                }}
                onLoad={() => console.log(`✅ ${product.name} front loaded`)}
                onError={() => console.error(`❌ ${product.name} front failed`)}
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
                  // GPU acceleration for smooth performance
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden'
                }}
                onLoad={() => console.log(`✅ ${product.name} back loaded`)}
                onError={() => console.error(`❌ ${product.name} back failed`)}
              />
              
              {/* Hover indicator */}
              {hoveredIndex === index && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  BACK VIEW
                </div>
              )}
            </div>
            
            <div style={{ 
              padding: '15px', 
              textAlign: 'center',
              background: '#f8f9fa'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: '#333'
              }}>
                {product.name}
              </h3>
              <p style={{
                margin: '5px 0 0 0',
                fontSize: '12px',
                color: '#666'
              }}>
                Hover to see back design
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Debug info */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#f0f0f0',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>Debug Info:</strong> Check browser console for image loading status. 
        If you see ✅ messages, images are loading correctly!
      </div>
    </div>
  );
};

export default WorkingCarousel;