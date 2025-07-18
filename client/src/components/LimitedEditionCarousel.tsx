import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight } from "lucide-react";

type LimitedEditionDesign = {
  id: string;
  title: string;
  images: string[];
  products: string[];
  colorScheme: string;
  customers?: {
    avatar: string;
    initials: string;
  }[];
};

// ✅ Using your actual JPG filenames from public/tshirts-new/
const designs: LimitedEditionDesign[] = [
  {
    id: '1',
    title: 'Roronoa Zoro',
    images: ['/tshirts-new/7.jpg', '/tshirts-new/zoro back.jpg'],
    colorScheme: 'from-green-900/40 via-green-800/20 to-green-700/10',
    products: ['T-Shirts', 'Hoodies', 'Phone Cases'],
    customers: [
      { avatar: '', initials: 'AK' },
      { avatar: '', initials: 'TN' },
      { avatar: '', initials: 'SM' },
      { avatar: '', initials: 'RP' },
    ]
  },
  {
    id: '2',
    title: 'Sung Jin Woo',
    images: ['/tshirts-new/8.jpg', '/tshirts-new/sung jin woo back.jpg'],
    colorScheme: 'from-purple-900/40 via-purple-800/20 to-indigo-700/10',
    products: ['T-Shirts', 'Stickers', 'Posters'],
    customers: [
      { avatar: '', initials: 'JD' },
      { avatar: '', initials: 'KL' },
      { avatar: '', initials: 'MT' },
      { avatar: '', initials: 'SR' },
    ]
  },
  {
    id: '3',
    title: 'Naruto Uzumaki',
    images: ['/tshirts-new/9.jpg', '/tshirts-new/naruto back.jpg'],
    colorScheme: 'from-orange-700/40 via-orange-600/20 to-yellow-500/10',
    products: ['T-Shirts', 'Posters', 'Figurines'],
    customers: [
      { avatar: '', initials: 'DK' },
      { avatar: '', initials: 'AL' },
      { avatar: '', initials: 'FG' },
      { avatar: '', initials: 'HT' },
    ]
  },
  {
    id: '4',
    title: 'Itachi Uchiha',
    images: ['/tshirts-new/10.jpg', '/tshirts-new/itachi back.jpg'],
    colorScheme: 'from-red-900/40 via-slate-800/20 to-gray-700/10',
    products: ['T-Shirts', 'LED Signs', 'Laptop Sleeves'],
    customers: [
      { avatar: '', initials: 'CP' },
      { avatar: '', initials: 'MX' },
      { avatar: '', initials: 'EV' },
      { avatar: '', initials: 'RN' },
    ]
  },
  {
    id: '5',
    title: 'Madara Uchiha',
    images: ['/tshirts-new/12.jpg', '/tshirts-new/madara back.jpg'],
    colorScheme: 'from-purple-700/40 via-indigo-800/20 to-blue-700/10',
    products: ['T-Shirts', 'Wall Scrolls', 'Jewelry'],
    customers: [
      { avatar: '', initials: 'GH' },
      { avatar: '', initials: 'JL' },
      { avatar: '', initials: 'KA' },
      { avatar: '', initials: 'TW' },
    ]
  },
  {
    id: '6',
    title: 'Ryomen Sukuna',
    images: ['/tshirts-new/13.jpg', '/tshirts-new/sukuna back.jpg'],
    colorScheme: 'from-red-800/40 via-red-700/20 to-orange-600/10',
    products: ['T-Shirts', 'Mouse Pads', 'Mugs'],
    customers: [
      { avatar: '', initials: 'BN' },
      { avatar: '', initials: 'HS' },
      { avatar: '', initials: 'PK' },
      { avatar: '', initials: 'VL' },
    ]
  }
];

// 🔧 Optimized Image Component with Performance Features
const PerformantImage = React.memo(({ 
  src, 
  alt, 
  design,
  isVisible 
}: { 
  src: string; 
  alt: string; 
  design: LimitedEditionDesign;
  isVisible: boolean;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    setHasError(false);
  }, []);
  
  const handleError = useCallback(() => {
    setHasError(true);
    console.warn(`Failed to load image: ${src}`);
  }, [src]);
  
  return (
    <div className="h-72 overflow-hidden relative group">
      {/* Loading state */}
      {!imageLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm text-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div>Loading {design.title}...</div>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm flex items-center justify-center">
          <div className="text-red-400 text-sm text-center p-4">
            <div className="text-2xl mb-2">⚠️</div>
            <div>Image not found</div>
            <div className="text-xs mt-1 opacity-70 break-all">{src}</div>
          </div>
        </div>
      )}
      
      {/* Main image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${
          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        } group-hover:scale-110`}
        style={{ 
          objectFit: "cover", 
          objectPosition: "center",
          // GPU acceleration for smooth performance
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform, opacity'
        }}
        loading={isVisible ? "eager" : "lazy"}
        onLoad={handleLoad}
        onError={handleError}
      />
      

      
      {/* Hover overlay with smooth animation */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
        <div className="p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h4 className="font-bold text-lg mb-1">{design.title}</h4>
          <p className="text-xs text-gray-200">Limited Edition Design</p>
        </div>
      </div>
    </div>
  );
});

// Product badge component
const ProductBadge = React.memo(({ text }: { text: string }) => (
  <span className="px-3 py-1 text-white text-xs rounded-full bg-white/10 border border-white/20 backdrop-blur-sm transition-colors hover:bg-white/20">
    {text}
  </span>
));

// Design card component
const DesignCard = React.memo(({ 
  design, 
  index,
  isVisible 
}: { 
  design: LimitedEditionDesign; 
  index: number;
  isVisible: boolean;
}) => {
  return (
    <div 
      className="w-64 shrink-0 overflow-hidden rounded-xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer" 
      style={{
        background: "rgba(91, 33, 182, 0.08)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)"
      }}
    >
      <PerformantImage 
        src={design.images[0]} 
        alt={`${design.title} T-shirt design`}
        design={design}
        isVisible={isVisible}
      />
      
      <div className="p-4 bg-gray-800/60 backdrop-blur-sm">
        <h3 className="text-white font-bold mb-3 text-lg">{design.title}</h3>
        <div className="flex flex-wrap gap-2">
          {design.products.slice(0, 2).map((product, i) => (
            <ProductBadge key={i} text={product} />
          ))}
        </div>
      </div>
    </div>
  );
});

// Main carousel component
export default function LimitedEditionCarousel() {
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set([0, 1, 2]));
  
  // Smooth scrolling functions
  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  }, []);
  
  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  }, []);
  
  // Optimized scroll handler with throttling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    let throttleTimer: number;
    
    const handleScroll = () => {
      if (throttleTimer) return;
      
      throttleTimer = window.setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const cardWidth = 300;
        const startIndex = Math.floor(scrollLeft / cardWidth);
        const endIndex = Math.min(startIndex + 4, designs.length - 1);
        
        const newVisibleIndices = new Set<number>();
        for (let i = Math.max(0, startIndex - 1); i <= endIndex + 1; i++) {
          newVisibleIndices.add(i);
        }
        setVisibleIndices(newVisibleIndices);
        
        throttleTimer = 0;
      }, 150);
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-purple-900 via-violet-950 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="container px-8 mx-auto max-w-7xl relative z-10">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Limited Edition Designs
            </h2>
            <p className="text-violet-200 text-xl">Premium quality prints on multiple products</p>
          </div>
          
          {/* Customer avatars */}
          <div className="flex items-center mt-6 md:mt-0">
            <div className="flex -space-x-2 mr-3">
              {designs[0].customers?.slice(0, 4).map((customer, index) => (
                <Avatar key={index} className="border-2 border-violet-900 w-10 h-10">
                  <AvatarFallback className="bg-violet-700 text-white text-sm font-bold">
                    {customer.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-violet-200 font-medium">250+ customers</span>
          </div>
        </div>

        {/* Carousel container */}
        <div className="relative mx-auto px-4">
          <div className="relative overflow-hidden bg-gray-900/30 backdrop-blur-lg p-8 rounded-2xl border border-purple-900/30 shadow-2xl">
            
            {/* Navigation buttons */}
            <button 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/80 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500" 
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/80 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500" 
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {/* Scrollable carousel */}
            <div className="overflow-hidden relative">
              <div 
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-hide"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  scrollBehavior: 'smooth'
                }}
              >
                <div className="flex space-x-6 py-4">
                  {designs.map((design, index) => (
                    <DesignCard 
                      key={design.id} 
                      design={design} 
                      index={index}
                      isVisible={visibleIndices.has(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Gradient fade overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-900/80 via-gray-900/40 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-900/80 via-gray-900/40 to-transparent z-10 pointer-events-none"></div>
          </div>
        </div>
        
        {/* Call to action */}
        <div className="w-full flex justify-center mt-12">
         <button 
  onClick={() => window.location.href = '/products'}
  className="px-10 py-3 border-2 border-violet-500 text-white font-semibold rounded-lg hover:bg-violet-500/20 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
>
  View All Designs
</button>
        </div>
      </div>
    </section>
  );
}