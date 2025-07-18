import { Link } from "wouter";
import { Youtube, Instagram, Twitter, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white pt-16 pb-8 relative overflow-hidden">
      {/* Anime-inspired background patterns */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80')] bg-fixed bg-center bg-no-repeat opacity-[0.03]"></div>
      
      {/* Animated gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
      
      {/* Divider with animated gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-red-600 to-red-700 opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="md:col-span-1">
            <Link href="/" className="group inline-flex items-center pb-2">
              <span className="font-bold text-3xl animated-text">
                ANIME
              </span>
              <span className="ml-2 font-bold text-3xl animated-text">
                INDIA
              </span>
              <span className="ml-2 font-bold text-3xl animated-text">
                POD
              </span>
            </Link>
            
            <div className="mt-6 bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <p className="text-gray-300">
                Express your anime passion with our premium custom merchandise.
              </p>
              <div className="mt-4 flex space-x-5">
                <a href="#" className="text-white/70 hover:text-red-500 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                  <div className="bg-white/10 hover:bg-white/20 p-2 rounded-full">
                    <Instagram size={20} />
                  </div>
                </a>
                <a href="#" className="text-white/70 hover:text-red-500 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                  <div className="bg-white/10 hover:bg-white/20 p-2 rounded-full">
                    <Youtube size={20} />
                  </div>
                </a>
                <a href="#" className="text-white/70 hover:text-red-500 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                  <div className="bg-white/10 hover:bg-white/20 p-2 rounded-full">
                    <Twitter size={20} />
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <h3 className="text-lg font-bold mb-5 text-white relative inline-block">
              Products
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-red-500"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#regular" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Regular T-Shirts
                </a>
              </li>
              <li>
                <a href="#oversized" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Oversized T-Shirts
                </a>
              </li>
              <li>
                <a href="#polo" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Polo T-Shirts
                </a>
              </li>
              <li>
                <a href="#phone-covers" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Phone Covers
                </a>
              </li>
              <li>
                <a href="#plates" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Plates
                </a>
              </li>
              <li>
                <a href="#bottles" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Bottles
                </a>
              </li>
            </ul>
          </div>

          <div className="mt-4 md:mt-0">
            <h3 className="text-lg font-bold mb-5 text-white relative inline-block">
              Resources
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-red-500"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/customize" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Customization Guide
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Anime Design Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Size Charts
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Design Gallery
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-4 md:mt-0">
            <h3 className="text-lg font-bold mb-5 text-white relative inline-block">
              Customer Support
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-red-500"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Shipping Information
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Order Tracking
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors flex items-center group">
                  <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  Bulk Orders
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800/70 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 mr-3">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36Z" fill="#1A1A1A"/>
                <path d="M28.5 18C28.5 23.799 23.799 28.5 18 28.5C12.201 28.5 7.5 23.799 7.5 18C7.5 12.201 12.201 7.5 18 7.5C23.799 7.5 28.5 12.201 28.5 18Z" stroke="#EF4444" strokeWidth="1.5"/>
                <path d="M24 18C24 21.3137 21.3137 24 18 24C14.6863 24 12 21.3137 12 18C12 14.6863 14.6863 12 18 12C21.3137 12 24 14.6863 24 18Z" fill="#EF4444"/>
              </svg>
            </div>
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} <span className="text-red-500 font-semibold">ANIME</span><span className="text-gray-300">INDIA</span>. All rights reserved.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Privacy Policy</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Terms of Service</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Cookies Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
