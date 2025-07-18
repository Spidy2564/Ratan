import { Card, CardContent } from "@/components/ui/card";
import { Shirt, Image, Truck, Wand2, Globe, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
};

const features: Feature[] = [
  {
    icon: <Shirt className="h-6 w-6" />,
    title: "Premium Fabric & Printing",
    description: "High-quality materials that perfectly showcase your favorite anime designs with vibrant, durable prints.",
    bgColor: "bg-red-600/10 text-red-600",
    borderColor: "border-red-500/20"
  },
  {
    icon: <Image className="h-6 w-6" />,
    title: "High-Resolution 3D Mockups",
    description: "Preview your designs with realistic 3D mockups before ordering to ensure perfect placement.",
    bgColor: "bg-purple-500/10 text-purple-500",
    borderColor: "border-purple-500/20"
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Global Shipping",
    description: "Fast and reliable worldwide shipping to bring your anime merchandise anywhere in the world.",
    bgColor: "bg-blue-500/10 text-blue-500",
    borderColor: "border-blue-500/20"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Anime-Focused Community",
    description: "Join our community of anime enthusiasts sharing their passion through custom merchandise.",
    bgColor: "bg-amber-500/10 text-amber-500",
    borderColor: "border-amber-500/20"
  },
  {
    icon: <Wand2 className="h-6 w-6" />,
    title: "Multi-Position Design Options",
    description: "Place your designs on multiple positions of the same product for unique, personalized items.",
    bgColor: "bg-emerald-500/10 text-emerald-500",
    borderColor: "border-emerald-500/20"
  }
];

export default function WhyChooseUs() {
  const [visibleFeatures, setVisibleFeatures] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Animate features in with staggered delay
    const timeouts = features.map((_, index) => {
      return setTimeout(() => {
        setVisibleFeatures(prev => ({
          ...prev,
          [index]: true
        }));
      }, 100 * index);
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <section className="py-16 bg-gray-900 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80')] bg-fixed bg-center bg-no-repeat opacity-5"></div>
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-900 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold inline-block relative">
            Why Choose <span className="text-red-600 drop-shadow-sm">ANIME</span> <span className="text-white ml-2">INDIA</span>?
            <div className="absolute -right-8 -top-5 text-yellow-400 animate-pulse-slow">
              <Sparkles className="h-6 w-6" />
            </div>
          </h2>
          <div className="mt-2 h-1 w-24 bg-gradient-to-r from-red-500 to-red-400 rounded-full mx-auto"></div>
          <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
            We're dedicated to helping anime fans express their passion through high-quality merchandise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`transition-all duration-700 transform ${visibleFeatures[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card 
                className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/70 shadow-lg hover:shadow-xl hover:shadow-red-600/5 transition-all group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-gray-700/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 text-center relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${feature.bgColor} ${feature.borderColor} border mb-5 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-red-100 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
