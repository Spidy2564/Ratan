import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, Heart, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

type Review = {
  id: number;
  text: string;
  stars: number;
  productImage: string;
  customer: {
    name: string;
    role: string;
    image: string;
  };
  verified: boolean;
  purchaseDate: string;
  helpfulCount: number;
};

const reviews: Review[] = [
  {
    id: 1,
    text: "The Demon Slayer design on my t-shirt is incredible! Perfect print quality that captures all the details and vibrant colors. Even after multiple washes, it still looks amazing.",
    stars: 5,
    productImage: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    customer: {
      name: "Arjun Sharma",
      role: "Anime T-Shirt Enthusiast",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    },
    verified: true,
    purchaseDate: "2 weeks ago",
    helpfulCount: 24
  },
  {
    id: 2,
    text: "Just received my custom My Hero Academia phone case and it's beyond perfect! The design tool made it so easy to position the artwork. Will be ordering more anime merch soon!",
    stars: 5,
    productImage: "https://images.unsplash.com/photo-1606041011872-596597976b25?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    customer: {
      name: "Priya Patel",
      role: "Cosplay Enthusiast",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    },
    verified: true,
    purchaseDate: "1 month ago",
    helpfulCount: 18
  },
  {
    id: 3,
    text: "Ordered oversized tees with Naruto designs for our anime club, and they were a massive hit! The 3D preview feature helped me perfect the design placement before ordering.",
    stars: 4.5,
    productImage: "https://images.unsplash.com/photo-1621799754526-a0d52c49fad5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    customer: {
      name: "Vikram Mehta",
      role: "Anime Club President",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    },
    verified: true,
    purchaseDate: "3 weeks ago",
    helpfulCount: 31
  },
  {
    id: 4,
    text: "My custom Attack on Titan water bottle gets compliments everywhere I go! The print quality is exceptional and the design tool made it easy to get the artwork placed perfectly.",
    stars: 5,
    productImage: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    customer: {
      name: "Anjali Kumar",
      role: "Anime Collector",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    },
    verified: true,
    purchaseDate: "5 days ago",
    helpfulCount: 12
  },
  {
    id: 5,
    text: "The quality exceeded my expectations! Got a custom Jujutsu Kaisen hoodie and the colors are so vibrant. Fast shipping and amazing customer service too!",
    stars: 5,
    productImage: "https://images.unsplash.com/photo-1556821840-3a9c6dcb0c88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    customer: {
      name: "Rohit Singh",
      role: "Manga Reader",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    },
    verified: true,
    purchaseDate: "1 week ago",
    helpfulCount: 15
  },
  {
    id: 6,
    text: "Love my One Piece themed plate set! Perfect for my anime room setup. The designs are crisp and the quality is restaurant-grade. Highly recommend!",
    stars: 4.5,
    productImage: "https://images.pexels.com/photos/6373307/pexels-photo-6373307.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
    customer: {
      name: "Sakshi Gupta",
      role: "Anime Merchandise Lover",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    },
    verified: true,
    purchaseDate: "2 months ago",
    helpfulCount: 22
  }
];

export default function CustomerReviews() {
  const [visibleReviews, setVisibleReviews] = useState<number[]>([]);
  const [hoveredReview, setHoveredReview] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleReviews(prev => {
        if (prev.length < reviews.length) {
          return [...prev, prev.length];
        }
        return prev;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const isFilled = i < Math.floor(count);
      const isHalf = i === Math.floor(count) && count % 1 !== 0;
      
      return (
        <div key={i} className="relative">
          <Star 
            className="h-5 w-5 text-gray-300" 
            fill="currentColor"
          />
          {(isFilled || isHalf) && (
            <Star 
              className="h-5 w-5 text-yellow-400 absolute top-0 left-0" 
              fill="currentColor"
              style={{ 
                clipPath: isHalf ? 'inset(0 50% 0 0)' : 'none'
              }}
            />
          )}
        </div>
      );
    });
  };

  const averageRating = reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length;
  const totalReviews = reviews.length;

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full blur-3xl opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-700 text-sm font-medium mb-6">
            <Heart className="w-4 h-4 mr-2 fill-current" />
            Trusted by Anime Fans
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            What Our
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Amazing Customers Say
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of satisfied anime fans who've brought their favorite characters to life with our premium custom merchandise
          </p>

          {/* Rating Summary */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {renderStars(5)}
              </div>
              <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            
            <div className="w-px h-16 bg-gray-200"></div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalReviews}+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            
            <div className="w-px h-16 bg-gray-200"></div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">98%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className={`transition-all duration-700 transform ${
                visibleReviews.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Card 
                className="group relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
                onMouseEnter={() => setHoveredReview(review.id)}
                onMouseLeave={() => setHoveredReview(null)}
              >
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                
                <div className="relative bg-white rounded-3xl overflow-hidden">
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={review.productImage} 
                      alt="Customer product" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Verified badge */}
                    {review.verified && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                    
                    {/* Quote icon overlay */}
                    <div className="absolute bottom-3 left-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <Quote className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Stars and date */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        {renderStars(review.stars)}
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {review.purchaseDate}
                      </span>
                    </div>

                    {/* Review text */}
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      "{review.text}"
                    </p>

                    {/* Customer info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 border-2 border-blue-100 mr-3 shadow-md">
                          <AvatarImage src={review.customer.image} alt={review.customer.name} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                            {review.customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.customer.name}</h4>
                          <p className="text-sm text-blue-600 font-medium">{review.customer.role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Helpful counter */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <button className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        <Heart className="w-4 h-4 mr-1" />
                        {review.helpfulCount} found helpful
                      </button>
                      

                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Join Our Happy Customers?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Create your own custom anime merchandise and experience the same quality that made our customers so happy!
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => window.location.href = '/products'}
                className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Now
              </button>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-blue-600 mb-2">50k+</div>
            <div className="text-sm text-gray-600">Products Sold</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-green-600 mb-2">24h</div>
            <div className="text-sm text-gray-600">Fast Shipping</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <div className="text-sm text-gray-600">Premium Quality</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-pink-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Customer Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}