import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Users, Zap } from "lucide-react";

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

type LimitedEditionDesign = {
  id: string;
  title: string;
  character: string;
  anime: string;
  images: string[];
  products: string[];
  colorScheme: string;
  rating: number;
  sales: number;
  trending?: boolean;
  testimonial: string;
  customers?: {
    avatar: string;
    initials: string;
  }[];
};

// ✅ Using your actual JPG filenames from public/tshirts-new/
const designs: LimitedEditionDesign[] = [
  {
    id: '1',
    title: 'Three Sword Style',
    character: 'Roronoa Zoro',
    anime: 'One Piece',
    images: ['/tshirts-new/7.jpg', '/tshirts-new/zoro back.jpg'],
    colorScheme: 'from-green-900/40 via-green-800/20 to-green-700/10',
    products: ['T-Shirts', 'Hoodies', 'Phone Cases'],
    rating: 4.9,
    sales: 1247,
    trending: true,
    testimonial: "Incredible quality! The Zoro design is absolutely perfect and the fabric feels premium. Best anime merch I've ever bought!",
    customers: [
      { avatar: '', initials: 'AK' },
      { avatar: '', initials: 'TN' },
      { avatar: '', initials: 'SM' },
      { avatar: '', initials: 'RP' },
    ]
  },
  {
    id: '2',
    title: 'Shadow Monarch',
    character: 'Sung Jin Woo',
    anime: 'Solo Leveling',
    images: ['/tshirts-new/8.jpg', '/tshirts-new/sung jin woo back.jpg'],
    colorScheme: 'from-purple-900/40 via-purple-800/20 to-indigo-700/10',
    products: ['T-Shirts', 'Stickers', 'Posters'],
    rating: 4.8,
    sales: 892,
    trending: true,
    testimonial: "The Solo Leveling design is mind-blowing! Print quality is exceptional and it gets compliments everywhere I go.",
    customers: [
      { avatar: '', initials: 'JD' },
      { avatar: '', initials: 'KL' },
      { avatar: '', initials: 'MT' },
      { avatar: '', initials: 'SR' },
    ]
  },
  {
    id: '3',
    title: 'Hokage Dreams',
    character: 'Naruto Uzumaki',
    anime: 'Naruto',
    images: ['/tshirts-new/9.jpg', '/tshirts-new/naruto back.jpg'],
    colorScheme: 'from-orange-700/40 via-orange-600/20 to-yellow-500/10',
    products: ['T-Shirts', 'Posters', 'Figurines'],
    rating: 4.9,
    sales: 2156,
    testimonial: "As a huge Naruto fan, this design exceeded all my expectations. The colors are vibrant and it fits perfectly!",
    customers: [
      { avatar: '', initials: 'DK' },
      { avatar: '', initials: 'AL' },
      { avatar: '', initials: 'FG' },
      { avatar: '', initials: 'HT' },
    ]
  },
  {
    id: '4',
    title: 'Sharingan Master',
    character: 'Itachi Uchiha',
    anime: 'Naruto',
    images: ['/tshirts-new/10.jpg', '/tshirts-new/itachi back.jpg'],
    colorScheme: 'from-red-900/40 via-slate-800/20 to-gray-700/10',
    products: ['T-Shirts', 'LED Signs', 'Laptop Sleeves'],
    rating: 4.7,
    sales: 1543,
    testimonial: "The Itachi design is hauntingly beautiful. Amazing attention to detail and super comfortable to wear daily.",
    customers: [
      { avatar: '', initials: 'CP' },
      { avatar: '', initials: 'MX' },
      { avatar: '', initials: 'EV' },
      { avatar: '', initials: 'RN' },
    ]
  },
  {
    id: '5',
    title: 'Infinite Tsukuyomi',
    character: 'Madara Uchiha',
    anime: 'Naruto',
    images: ['/tshirts-new/12.jpg', '/tshirts-new/madara back.jpg'],
    colorScheme: 'from-purple-700/40 via-indigo-800/20 to-blue-700/10',
    products: ['T-Shirts', 'Wall Scrolls', 'Jewelry'],
    rating: 4.8,
    sales: 987,
    testimonial: "Madara's design is epic! The quality is outstanding and shipping was super fast. Highly recommend this store!",
    customers: [
      { avatar: '', initials: 'GH' },
      { avatar: '', initials: 'JL' },
      { avatar: '', initials: 'KA' },
      { avatar: '', initials: 'TW' },
    ]
  },
  {
    id: '6',
    title: 'King of Curses',
    character: 'Ryomen Sukuna',
    anime: 'Jujutsu Kaisen',
    images: ['/tshirts-new/13.jpg', '/tshirts-new/sukuna back.jpg'],
    colorScheme: 'from-red-800/40 via-red-700/20 to-orange-600/10',
    products: ['T-Shirts', 'Mouse Pads', 'Mugs'],
    rating: 4.9,
    sales: 1765,
    trending: true,
    testimonial: "Sukuna design is absolutely insane! The detail work is incredible and material quality is top-notch.",
    customers: [
      { avatar: '', initials: 'BN' },
      { avatar: '', initials: 'HS' },
      { avatar: '', initials: 'PK' },
      { avatar: '', initials: 'VL' },
    ]
  }
];

// Product badge component
const ProductBadge = React.memo(({ text }: { text: string }) => (
  <span className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20 backdrop-blur-sm transition-colors hover:bg-white/20 text-white">
    {text}
  </span>
));

// Main testimonial slider component
export default function LimitedEditionCarousel() {
  return (
    <section className="testimonial">

      <h2 className="testimonial__title">
        <span className="title-line">LIMITED</span>
        <span className="title-line">EDITION</span>
        <span className="title-line highlight">DESIGNS</span>
      </h2>

      <div className="testimonial__swiper container swiper">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
          loop={true}
          slidesPerView={3}
          spaceBetween={20}
          grabCursor={true}
          speed={600}
          centeredSlides={true}
          effect="coverflow"
          coverflowEffect={{
            rotate: -15,
            depth: 300,
            modifier: 1,
            slideShadows: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
          }}
          className="swiper-wrapper"
        >
          {designs.map((design, index) => (
            <SwiperSlide key={design.id} className="swiper-slide">
              <article className="testimonial__card" style={{ animationDelay: `${index * 0.1}s` }}>

                <div className="testimonial__img-container">
                  <div className="img-wrapper">
                    <img
                      src={design.images[0]}
                      alt={design.character}
                      className="testimonial__img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/tshirts-new/zoro back.jpg';
                      }}
                    />
                    <div className="img-overlay"></div>
                  </div>

                  {design.trending && (
                    <div className="trending-badge">
                      <Zap size={14} />
                      <span>HOT</span>
                      <div className="badge-pulse"></div>
                    </div>
                  )}
                </div>

                <div className="card-content">
                  <h3 className="design-title">{design.title}</h3>
                  <p className="character-name">{design.character}</p>
                  <p className="anime-series">{design.anime}</p>

                  <div className="rating-section">
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" className="star-icon" />
                      ))}
                    </div>
                    <span className="rating-number">{design.rating}</span>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Enhanced Pagination */}

        {/* Enhanced Navigation buttons */}
        
      </div>

        <div className="swiper-pagination custom-pagination"></div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&family=Unbounded:wght@600&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.6.0/remixicon.min.css');

        /*=============== AWESOME VARIABLES ===============*/
        :root {
          --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          --card-gradient: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          --glow-color: #667eea;
          --accent-color: #fbbf24;
          --text-primary: #ffffff;
          --text-secondary: rgba(255,255,255,0.8);
          --shadow-color: rgba(102, 126, 234, 0.3);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /*=============== BACKGROUND ===============*/
        .testimonial {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }

        /*=============== AWESOME TITLE ===============*/
        .testimonial__title {
          font-family: 'Unbounded', sans-serif;
          font-size: clamp(2.5rem, 8vw, 4rem);
          font-weight: 700;
          text-align: center;
          margin-bottom: 4rem;
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: row;
          gap: 0.5rem;
        }

        .title-line {
          display: block;
          background: linear-gradient(45deg, #ffffff, #667eea, #ffffff);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: textShine 3s ease-in-out infinite;
          text-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
        }

        .title-line.highlight {
          background: linear-gradient(45deg, #667eea, #764ba2, #667eea);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: textShine 2s ease-in-out infinite;
        }

        @keyframes textShine {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /*=============== CONTAINER ===============*/
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 10;
        }

        .testimonial__swiper {
          padding-bottom: 15rem;
          position: relative;
        }

        /*=============== AWESOME CARDS ===============*/
        .testimonial__card {
          width: 400px;
          height: 600px;
          background: var(--card-gradient);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 2rem 1.5rem 2.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          transform: translateY(0);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          animation: cardFloat 6s ease-in-out infinite;
          display: flex;
          flex-direction: column;
          z-index: 10;
        }

        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }


        /*=============== IMAGE CONTAINER ===============*/
        .testimonial__img-container {
          position: relative;
          width: 100%;
          height: 350px;
          margin: 0 auto 1.5rem;
          flex-shrink: 0;
        }

        .img-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          animation: imageGlow 4s ease-in-out infinite;
        }

        @keyframes imageGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); }
          50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.8); }
        }

        .testimonial__img {
          width: 120%;
          height: 120%;
          object-fit: contain;
          border-radius: 16px;
          transition: transform 0.3s ease;
          mix-blend-mode: multiply;
          transform: scale(1.2);
        }

        .testimonial__card:hover .testimonial__img {
          transform: scale(1.3);
        }

        .img-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, rgba(102, 126, 234, 0.3), rgba(240, 147, 251, 0.3));
          border-radius: 16px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .testimonial__card:hover .img-overlay {
          opacity: 1;
        }

        /*=============== TRENDING BADGE ===============*/
        .trending-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: linear-gradient(45deg, #ff6b6b, #fbbf24);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 20;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
          animation: badgePulse 2s ease-in-out infinite;
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .badge-pulse {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #ff6b6b, #fbbf24);
          border-radius: 20px;
          opacity: 0.3;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.3; }
        }

        /*=============== CARD CONTENT ===============*/
        .card-content {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .design-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .character-name {
          font-size: 1.3rem;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 0.3rem;
        }

        .anime-series {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .rating-section {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 0;
        }

        .rating-stars {
          display: flex;
          gap: 3px;
        }

        .star-icon {
          color: #667eea;
          filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
          animation: starTwinkle 3s ease-in-out infinite;
        }

        .star-icon:nth-child(2) { animation-delay: 0.2s; }
        .star-icon:nth-child(3) { animation-delay: 0.4s; }
        .star-icon:nth-child(4) { animation-delay: 0.6s; }
        .star-icon:nth-child(5) { animation-delay: 0.8s; }

        @keyframes starTwinkle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        .rating-number {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .products-showcase {
          margin-bottom: 1rem;
        }

        .products-title {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.8rem;
          font-weight: 600;
        }

        .products-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }

        .sales-stats {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .design-description {
          margin-top: auto;
        }

        .design-description p {
          color: var(--text-secondary);
          font-size: 0.8rem;
          line-height: 1.4;
          font-style: italic;
        }

        /*=============== ENHANCED NAVIGATION ===============*/
        .custom-nav {
          position: absolute;
          bottom: 2rem;
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 20;
        }

        .custom-nav:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .nav-icon {
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .nav-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(45deg, #667eea, #764ba2);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .custom-nav:hover .nav-glow {
          opacity: 0.3;
        }

        .swiper-button-prev {
          bottom: 2rem;
          left: calc(50% - 4rem);
        }

        .swiper-button-next {
          bottom: 2rem;
          right: calc(50% - 4rem);
        }

        /*=============== ENHANCED PAGINATION ===============*/
        .custom-pagination {
          bottom: 5rem !important;
        }

        .custom-pagination .swiper-pagination-bullet {
          margin-top:10rem;
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.5);
          opacity: 1;
          transition: all 0.3s ease;
        }

        .custom-pagination .swiper-pagination-bullet-active {
          background: #667eea;
          border-color: #667eea;
          transform: scale(1.3);
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.6);
        }

        /*=============== RESPONSIVE ===============*/
        @media (max-width: 768px) {
          .testimonial__title {
            font-size: 2rem;
            margin-bottom: 2rem;
          }
          
          .testimonial__card {
            height: 450px;
            padding: 1.5rem 1rem 2rem;
          }
          
          .testimonial__img-container {
            width: 120px;
            height: 120px;
          }
          
          .custom-nav {
            width: 50px;
            height: 50px;
          }
          
          .nav-icon {
            font-size: 1.2rem;
          }
        }

        @media (max-width: 480px) {
          .testimonial__card {
            height: 420px;
            padding: 1.2rem 0.8rem 1.5rem;
          }
          
          .testimonial__title {
            font-size: 1.8rem;
          }
          
          .testimonial__img-container {
            width: 100px;
            height: 100px;
          }
        }
      `}</style>
    </section>
  );
}