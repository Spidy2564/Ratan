import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { useLocation } from 'wouter';

// Define the mascot character types and their properties
type MascotType = 'neko' | 'samurai' | 'magical';

interface MascotCharacter {
  type: MascotType;
  name: string;
  avatar: string;
  expressions: {
    idle: string;
    happy: string;
    excited: string;
    sad: string;
    confused: string;
  };
  animations: {
    entrance: string;
    idle: string;
    talking: string;
    exit: string;
  };
  greetings: string[];
  responses: {
    products: string[];
    help: string[];
    customize: string[];
    random: string[];
  };
}

// Sample mascot characters
const mascotCharacters: Record<MascotType, MascotCharacter> = {
  neko: {
    type: 'neko',
    name: 'Neko-chan',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Neko&backgroundColor=ffadad',
    expressions: {
      idle: '😊',
      happy: '😄',
      excited: '🤩',
      sad: '😢',
      confused: '😕'
    },
    animations: {
      entrance: 'animate-bounce-in',
      idle: 'animate-floating',
      talking: 'animate-bounce-subtle',
      exit: 'animate-slide-out'
    },
    greetings: [
      "Nyaa~ Welcome to Anime India! I'm Neko-chan, your guide!",
      "Konnichiwa! Need help finding the purr-fect anime merch?",
      "Nyaa~ Looking for something special? I can help you!"
    ],
    responses: {
      products: [
        "We have the cutest anime t-shirts, nyaa~!",
        "Check out our limited edition phone cases, they're paw-some!",
        "Our anime water bottles are perfect for staying hydrated while watching your favorite shows!"
      ],
      help: [
        "Need help? Just ask me anything, nyaa~!",
        "I can help you find the perfect anime merchandise, just tell me what you're looking for!",
        "Not sure what to get? Try our customization tool to create your own design!"
      ],
      customize: [
        "You can create your own unique design in our customization page, nyaa~!",
        "Want something unique? Try uploading your own artwork to our customizer!",
        "Our customization tool lets you place designs exactly where you want them!"
      ],
      random: [
        "Did you know? One Piece has been running for over 20 years!",
        "My favorite anime is... well, I love them all, nyaa~!",
        "The most popular anime character in our store is currently Naruto!",
        "Don't forget to check our weekly specials!"
      ]
    }
  },
  samurai: {
    type: 'samurai',
    name: 'Kenshin',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Samurai&backgroundColor=c1deff',
    expressions: {
      idle: '😌',
      happy: '😁',
      excited: '⚔️',
      sad: '😔',
      confused: '🤔'
    },
    animations: {
      entrance: 'animate-slide-in-right',
      idle: 'animate-pulse-slow',
      talking: 'animate-subtle-shake',
      exit: 'animate-fade-out'
    },
    greetings: [
      "Greetings, honorable customer. I am Kenshin, your merchandise guide.",
      "Welcome to our dojo of anime merchandise. How may I assist you today?",
      "A warrior seeks the perfect merchandise. May I help you on your quest?"
    ],
    responses: {
      products: [
        "Our samurai-inspired t-shirts are crafted with honor and quality.",
        "The way of the warrior is represented in our exclusive anime collection.",
        "Our battle-ready merchandise awaits your selection."
      ],
      help: [
        "A true warrior knows when to seek guidance. How may I assist you?",
        "I am here to guide you through our collection with wisdom and expertise.",
        "Ask, and you shall receive the knowledge you seek about our products."
      ],
      customize: [
        "Create a design that reflects your warrior spirit in our customization dojo.",
        "The path to unique merchandise begins with our customization tools.",
        "Express your true nature by designing your own battle gear."
      ],
      random: [
        "Did you know? The samurai code of bushido has seven virtues.",
        "The most powerful weapon is not the sword, but knowledge of good merchandise.",
        "Many anime series are inspired by Japan's rich samurai history.",
        "A true warrior chooses quality over quantity. Our products offer both."
      ]
    }
  },
  magical: {
    type: 'magical',
    name: 'Magi-chan',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Magical&backgroundColor=d4ffea',
    expressions: {
      idle: '✨',
      happy: '🌟',
      excited: '🔮',
      sad: '🌧️',
      confused: '❓'
    },
    animations: {
      entrance: 'animate-sparkle-in',
      idle: 'animate-glow-pulse',
      talking: 'animate-magic-bounce',
      exit: 'animate-poof-out'
    },
    greetings: [
      "✨ Magical greetings! I'm Magi-chan, your enchanted shopping assistant! ✨",
      "By the power of anime, I appear! How can I make your shopping magical today?",
      "✨ Bibbidi-bobbidi-boo! Your magical guide has appeared! What's your wish? ✨"
    ],
    responses: {
      products: [
        "Our magical collection will transport you to your favorite anime worlds!",
        "✨ These enchanted designs are limited edition - they might disappear in a poof! ✨",
        "Each product is crafted with a sprinkle of magical quality and anime love!"
      ],
      help: [
        "My crystal ball can help you find exactly what you're looking for!",
        "✨ Ask and you shall receive magical guidance through our collections! ✨",
        "I've been trained in the ancient arts of customer assistance magic!"
      ],
      customize: [
        "✨ Our customization spell allows you to create truly magical merchandise! ✨",
        "Wave your creative wand in our customization workshop!",
        "Transform ordinary products into magical treasures with your own designs!"
      ],
      random: [
        "✨ Fun spell: The most magical anime series often involve transformation sequences!",
        "Did you know? Our magical items are most powerful when worn during anime marathons!",
        "The magic of anime brings people together across the world!",
        "✨ Magical tip: Our weekly enchantments (sales) appear every Friday! ✨"
      ]
    }
  }
};

interface AnimeMascotProps {
  defaultMascot?: MascotType;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  autoGreet?: boolean;
  minimizeByDefault?: boolean;
}

export default function AnimeMascot({
  defaultMascot = 'neko',
  position = 'bottom-right',
  autoGreet = true,
  minimizeByDefault = false
}: AnimeMascotProps) {
  const [currentMascot, setCurrentMascot] = useState<MascotCharacter>(mascotCharacters[defaultMascot]);
  const [isMinimized, setIsMinimized] = useState(minimizeByDefault);
  const [isChangingMascot, setIsChangingMascot] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<keyof MascotCharacter['expressions']>('idle');
  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [animation, setAnimation] = useState<string>(currentMascot.animations.entrance);
  const messageTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Initialize mascot with greeting
  useEffect(() => {
    if (autoGreet && !isMinimized) {
      const randomGreeting = currentMascot.greetings[Math.floor(Math.random() * currentMascot.greetings.length)];
      showMessage(randomGreeting, 'happy');
    }

    return () => {
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
      }
    };
  }, [currentMascot, autoGreet, isMinimized]);

  // Function to show a message with animation and expression
  const showMessage = (text: string, expression: keyof MascotCharacter['expressions'] = 'idle') => {
    setCurrentExpression(expression);
    setMessage(text);
    setAnimation(currentMascot.animations.talking);

    // Clear any existing timeout
    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current);
    }

    // Set timeout to clear message and return to idle
    messageTimeoutRef.current = window.setTimeout(() => {
      setMessage('');
      setCurrentExpression('idle');
      setAnimation(currentMascot.animations.idle);
    }, 5000);
  };

  // Function to change the mascot character
  const changeMascot = (type: MascotType) => {
    setIsChangingMascot(false);
    setAnimation(currentMascot.animations.exit);

    // After exit animation, change the mascot
    setTimeout(() => {
      setCurrentMascot(mascotCharacters[type]);
      setAnimation(mascotCharacters[type].animations.entrance);
      showMessage(`Hello! I'm ${mascotCharacters[type].name}!`, 'happy');
    }, 300);
  };

  // Function to trigger random tips
  const showRandomTip = () => {
    const categories = ['products', 'help', 'customize', 'random'] as const;
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const responses = currentMascot.responses[randomCategory];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    showMessage(randomResponse, 'excited');
  };

  // Toggle sound effects
  const toggleSound = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Sound effects enabled" : "Sound effects disabled",
      description: isMuted ? "You can now hear mascot interactions" : "Mascot will be silent"
    });
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 transition-all duration-300 ease-in-out`}>
      {/* Minimized state - just shows the mascot head */}
      {isMinimized ? (
        <div
          className="cursor-pointer bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110"
          onClick={() => setIsMinimized(false)}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 border-red-500">
            <img
              src={currentMascot.avatar}
              alt={currentMascot.name}
              className="w-full h-full object-cover animate-pulse-slow"
            />
          </div>
        </div>
      ) : (
        /* Expanded mascot interface */
        <div className="mascot-container">
          {/* Mascot character card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100 overflow-hidden w-72">
            {/* Header bar with controls */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-white font-medium">{currentMascot.name}</span>

                {/* Mascot selector button */}
                <button
                  onClick={() => setIsChangingMascot(!isChangingMascot)}
                  className="ml-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="m16 10-4-4-4 4" />
                    <path d="m16 14-4 4-4-4" />
                  </svg>
                </button>
              </div>

              <div className="flex space-x-1">
                {/* Sound toggle */}
                <button
                  onClick={toggleSound}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {/* Minimize button */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="M18 12H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mascot selector dropdown */}
            {isChangingMascot && (
              <div className="bg-white border-b border-gray-200 p-2 animate-fade-in">
                <div className="text-xs text-gray-500 mb-2">Choose your companion:</div>
                <div className="flex space-x-2">
                  {Object.keys(mascotCharacters).map((type) => (
                    <button
                      key={type}
                      onClick={() => changeMascot(type as MascotType)}
                      className={`flex-1 p-1.5 rounded-lg border transition-all ${currentMascot.type === type
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                        }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                          <img
                            src={mascotCharacters[type as MascotType].avatar}
                            alt={mascotCharacters[type as MascotType].name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs mt-1">{mascotCharacters[type as MascotType].name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mascot character display */}
            <div className="p-3 flex">
              <div className="mr-3 flex-shrink-0">
                <div
                  className={`relative w-16 h-16 rounded-full overflow-hidden border-2 border-red-200 ${animation}`}
                >
                  <img
                    src={currentMascot.avatar}
                    alt={currentMascot.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Expression overlay */}
                  <div className="absolute bottom-0 right-0 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-red-200">
                    <span>{currentMascot.expressions[currentExpression]}</span>
                  </div>
                </div>
              </div>

              {/* Message bubble */}
              <div className="flex-1 relative">
                <div className={`bg-gray-100 p-2 rounded-lg min-h-[50px] flex items-center message-bubble ${message ? 'animate-pop-in' : ''
                  }`}>
                  <p className="text-sm text-gray-800">
                    {message || "How can I help you today?"}
                  </p>
                </div>
                <div className="absolute left-[-6px] top-3 w-3 h-3 bg-gray-100 transform rotate-45"></div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-3 pt-0 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => {
                  showMessage(currentMascot.responses.products[Math.floor(Math.random() * currentMascot.responses.products.length)], 'happy');
                  setTimeout(() => setLocation('/products'), 600);
                }}
              >
                Show Products
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => {
                  showMessage(currentMascot.responses.customize[Math.floor(Math.random() * currentMascot.responses.customize.length)], 'excited');
                  setTimeout(() => setLocation('/customize'), 600);
                }}
              >
                Customize
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => {
                  showMessage('Here are your orders, nyaa~!', 'excited');
                  setTimeout(() => setLocation('/user-orders'), 600);
                }}
              >
                Orders
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => {
                  showMessage(currentMascot.responses.help[Math.floor(Math.random() * currentMascot.responses.help.length)], 'happy');
                  setTimeout(() => {
                    window.open('https://wa.me/919266767693', '_blank');
                  }, 600);
                }}
              >
                Need Help
              </Button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}