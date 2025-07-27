import React, { useRef, useEffect } from "react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Menu, Home, Palette, Mail, ShoppingBag, Shield, User, LogOut, ShoppingCart, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { useAuth } from "../contexts/AuthContext"; // FIXED: Changed from "../../contexts/AuthContext" to "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import AuthModal from "../components/auth/AuthModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();
  const isAdmin = user?.email === 'admin@tshirtapp.com' || user?.role === 'admin';

  const [isOpen, setIsOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Calculate dynamic effects based on scroll position
  const glassIntensity = Math.min(scrollPosition / 200, 1);
  const blurAmount = 8 + (glassIntensity * 12);

  return (
    <>
      <style>{`
        .glass-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          backdrop-filter: blur(${blurAmount}px);
          background: rgba(15, 23, 42, ${0.1 + glassIntensity * 0.4});
          border-bottom: 1px solid rgba(220, 38, 38, ${0.2 + glassIntensity * 0.3});
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 4rem; /* Fixed height for consistent spacing */
        }

        .glass-navbar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(220, 38, 38, 0.1) 0%,
            rgba(147, 51, 234, 0.05) 25%,
            rgba(59, 130, 246, 0.05) 50%,
            rgba(16, 185, 129, 0.05) 75%,
            rgba(245, 158, 11, 0.1) 100%
          );
          animation: gradientShift 8s ease-in-out infinite;
        }

        @keyframes gradientShift {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .glass-nav-container {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .glass-brand {
          position: relative;
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          text-decoration: none;
          overflow: hidden;
          border-radius: 0.75rem;
          transition: all 0.3s ease;
          /* margin-right: 33rem; */
          margin-right: 0; /* No right margin for better alignment */
          margin-left: -1rem;
        }

        .glass-brand:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3);
        }

        .glass-brand::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(241, 245, 249, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .glass-brand:hover::before {
          opacity: 1;
        }

        .animated-text {
          color: #fff;
          font-weight: 800;
          font-size: 1.75rem;
          position: relative;
          z-index: 10;
          text-shadow: 0 0 8px #fff, 0 0 2px #fff;
        }

        @keyframes textGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .glass-nav-list {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .glass-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          text-decoration: none;
          color: white;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-nav-item:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 10px 40px rgba(220, 38, 38, 0.3);
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(220, 38, 38, 0.4);
        }

        .admin-nav-item {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
        }

        .admin-nav-item:hover {
          background: rgba(34, 197, 94, 0.2);
          border-color: rgba(34, 197, 94, 0.5);
          box-shadow: 0 10px 40px rgba(34, 197, 94, 0.3);
        }

        .glass-nav-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(220, 38, 38, 0.2), rgba(147, 51, 234, 0.2));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .admin-nav-bg {
          background: linear-gradient(45deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2));
        }

        .glass-nav-item:hover .glass-nav-bg {
          opacity: 1;
        }

        .glass-nav-content {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-icon {
          transition: all 0.3s ease;
        }

        .nav-title {
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.025em;
        }

        .glass-dropdown {
          backdrop-filter: blur(20px);
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 0.75rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .glass-dropdown-item {
          color: white;
          transition: all 0.2s ease;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin: 0.125rem;
        }

        .glass-dropdown-item:hover {
          background: rgba(220, 38, 38, 0.2);
          transform: translateX(4px);
        }

        .mobile-menu-trigger {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.75rem;
          transition: all 0.3s ease;
        }

        .mobile-menu-trigger:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .floating-orb {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: linear-gradient(45deg, rgba(220, 38, 38, 0.1), rgba(147, 51, 234, 0.1));
          filter: blur(40px);
          animation: float 6s ease-in-out infinite;
          pointer-events: none;
        }

        .floating-orb:nth-child(1) {
          top: -100px;
          left: 10%;
          animation-delay: 0s;
        }

        .floating-orb:nth-child(2) {
          top: -100px;
          right: 10%;
          animation-delay: -2s;
        }

        .floating-orb:nth-child(3) {
          top: -100px;
          left: 50%;
          animation-delay: -4s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(-10px) rotate(240deg); }
        }

        .nav-container-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 4rem;
        }

        .nav-menu-section {
          display: flex;
          align-items: center;
          margin-left: auto;
          margin-right: -8rem;
        }

        @media (max-width: 768px) {
          .glass-nav-list {
            display: none;
          }
          
          .nav-menu-section {
            margin-right: 0;
          }
          
          .glass-nav-container {
            padding: 0 -1rem;
          }
          
          .glass-brand {
            margin-right: 1rem;
          }
          
          .animated-text {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <nav className="glass-navbar">
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>

        <div className="glass-nav-container">
          <div className="nav-container-flex">
            <div className="flex-shrink-0 flex items-center" style={{ marginLeft: '-1rem' }}>
              <Link href="/" className="glass-brand">
                <span className="animated-text">ANIME</span>
                <span className="animated-text ml-2">INDIA</span>
                <span className="animated-text ml-2">POD</span>
              </Link>
            </div>

            {/* Desktop Navigation - Moved to right */}
            <div className="nav-menu-section ml-auto">
              <ul className="glass-nav-list">
                <li>
                  <Link href="/" className="glass-nav-item group">
                    <div className="glass-nav-content">
                      <span className="nav-icon group-hover:scale-110 transition-transform duration-300">
                        <Home size={18} />
                      </span>
                      <span className="nav-title">Home</span>
                    </div>
                    <div className="glass-nav-bg"></div>
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="glass-nav-item group">
                    <div className="glass-nav-content">
                      <span className="nav-icon group-hover:scale-110 transition-transform duration-300">
                        <ShoppingBag size={18} />
                      </span>
                      <span className="nav-title">Products</span>
                    </div>
                    <div className="glass-nav-bg"></div>
                  </Link>
                </li>
                <li>
                  <Link href="/customize" className="glass-nav-item group">
                    <div className="glass-nav-content">
                      <span className="nav-icon group-hover:scale-110 transition-transform duration-300">
                        <Palette size={18} />
                      </span>
                      <span className="nav-title">Customize</span>
                    </div>
                    <div className="glass-nav-bg"></div>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="glass-nav-item group">
                    <div className="glass-nav-content">
                      <span className="nav-icon group-hover:scale-110 transition-transform duration-300">
                        <Mail size={18} />
                      </span>
                      <span className="nav-title">Contact</span>
                    </div>
                    <div className="glass-nav-bg"></div>
                  </Link>
                </li>
                {/* User Menu */}
                <li>
                  {!user ? (
                    <button className="glass-nav-item group" onClick={() => setShowAuthModal(true)}>
                      <div className="glass-nav-content">
                        <span className="nav-icon group-hover:scale-110 transition-transform duration-300">
                          <User size={18} />
                        </span>
                        <span className="nav-title">Account</span>
                      </div>
                      <div className="glass-nav-bg"></div>
                    </button>
                  ) : (
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                      <button className="glass-nav-item group" onClick={() => setShowDropdown((v) => !v)}>
                        <div className="glass-nav-content">
                          <span className="nav-icon group-hover:scale-110 transition-transform duration-300">
                            <User size={18} />
                          </span>
                          <span className="nav-title">Account</span>
                        </div>
                        <div className="glass-nav-bg"></div>
                      </button>
                      {showDropdown && (
                        <div className="glass-dropdown" style={{ position: 'absolute', right: 0, top: '2.5rem', minWidth: '160px' }}>
                          <Link href="/account" className="glass-dropdown-item block" onClick={() => setShowDropdown(false)}>
                            <User size={16} className="inline mr-2" /> My Account
                          </Link>
                          <Link href="/cart" className="glass-dropdown-item block" onClick={() => setShowDropdown(false)}>
                            <ShoppingCart size={16} className="inline mr-2" /> My Cart
                          </Link>
                          <Link href="/wishlist" className="glass-dropdown-item block" onClick={() => setShowDropdown(false)}>
                            <Heart size={16} className="inline mr-2" /> My Wishlist
                          </Link>
                          <Link href="/user-orders" className="glass-dropdown-item block" onClick={() => setShowDropdown(false)}>
                            <ShoppingBag size={16} className="inline mr-2" /> My Orders
                          </Link>
                          <button className="glass-dropdown-item block w-full text-left" onClick={() => { logout(); setShowDropdown(false); }}>
                            <LogOut size={16} className="inline mr-2" /> Logout
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              </ul>
            </div>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="mobile-menu-trigger">
                  <Menu className="h-6 w-6 text-white" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[240px] sm:w-[300px] bg-gradient-to-br from-slate-900/95 to-black/95 backdrop-blur-xl text-white border-red-800/30"
              >
                <div className="py-4 flex flex-col space-y-4">
                  <Link href="/" className="px-4 py-2 text-lg font-medium hover:bg-red-800/20 rounded-lg transition-colors">
                    🏠 Home
                  </Link>
                  <Link href="/products" className="px-4 py-2 text-lg font-medium hover:bg-red-800/20 rounded-lg transition-colors">
                    🛍️ Products
                  </Link>
                  <Link href="/customize" className="px-4 py-2 text-lg font-medium hover:bg-red-800/20 rounded-lg transition-colors">
                    🎨 Customize
                  </Link>
                  <Link href="/contact" className="px-4 py-2 text-lg font-medium hover:bg-red-800/20 rounded-lg transition-colors">
                    📧 Contact
                  </Link>
                  <Link href="/cart" className="px-4 py-2 text-lg font-medium hover:bg-red-800/20 rounded-lg transition-colors flex items-center justify-between">
                    🛒 Cart
                    {cartState.cart && cartState.cart.itemCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartState.cart.itemCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/wishlist" className="px-4 py-2 text-lg font-medium hover:bg-red-800/20 rounded-lg transition-colors flex items-center justify-between">
                    ❤️ Wishlist
                    {wishlistState.wishlist && wishlistState.wishlist.itemCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistState.wishlist.itemCount}
                      </span>
                    )}
                  </Link>
                  {!user ? (
                    <Button className="glass-nav-item group w-full justify-center text-lg" onClick={() => setShowAuthModal(true)}>
                      <div className="glass-nav-content">
                        <span className="nav-title">Login</span>
                      </div>
                      <div className="glass-nav-bg"></div>
                    </Button>
                  ) : (
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                      <Button className="glass-nav-item group w-full justify-center text-lg" onClick={() => setShowDropdown((v) => !v)}>
                        <User size={20} /> Account
                      </Button>
                      {showDropdown && (
                        <div className="glass-dropdown" style={{ position: 'absolute', right: 0, top: '2.5rem', minWidth: '160px' }}>
                          <Link href="/account" className="glass-dropdown-item block" onClick={() => setShowDropdown(false)}>
                            <User size={16} className="inline mr-2" /> My Account
                          </Link>
                          <Link href="/cart" className="glass-dropdown-item block" onClick={() => setShowDropdown(false)}>
                            <ShoppingCart size={16} className="inline mr-2" /> My Cart
                          </Link>
                          <Link href="/wishlist" className="glass-dropdown-item block" onClick={() => setShowDropdown(false)}>
                            <Heart size={16} className="inline mr-2" /> My Wishlist
                          </Link>
                          <Link href="/user-orders" className="glass-dropdown-item block" onClick={() => setShowDropdown(false)}>
                            <ShoppingBag size={16} className="inline mr-2" /> My Orders
                          </Link>
                          <button className="glass-dropdown-item block w-full text-left" onClick={() => { logout(); setShowDropdown(false); }}>
                            <LogOut size={16} className="inline mr-2" /> Logout
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
      />
    </>
  );
}