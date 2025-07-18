"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Filter, 
  Search, 
  Grid3X3, 
  List, 
  ArrowUpDown,
  X,
  Plus,
  Minus,
  Home,
  Truck,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
  Type,
  Image as ImageIcon,
  Palette,
  Save,
  Share2,
  Download,
  Eye,
  EyeOff,
  Layers,
  MousePointer,
  Smartphone
} from "lucide-react";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// T-Shirt and Design Types
interface DesignLayer {
  id: string;
  type: 'character' | 'text' | 'image';
  content: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  color?: string;
  font?: string;
  fontSize?: number;
  visible: boolean;
}

interface TShirtDesign {
  id: string;
  shirtColor: string;
  shirtStyle: string;
  size: string;
  layers: DesignLayer[];
  price: number;
}

// Anime Characters Data
const animeCharacters = [
  {
    id: "naruto",
    name: "Naruto",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&h=100&fit=crop",
    series: "Naruto",
    price: 100
  },
  {
    id: "luffy",
    name: "Luffy",
    image: "https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=100&h=100&fit=crop",
    series: "One Piece",
    price: 100
  },
  {
    id: "goku",
    name: "Goku",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&h=100&fit=crop",
    series: "Dragon Ball Z",
    price: 100
  },
  {
    id: "ichigo",
    name: "Ichigo",
    image: "https://images.unsplash.com/photo-1621799754526-a0d52c49fad5?w=100&h=100&fit=crop",
    series: "Bleach",
    price: 100
  },
  {
    id: "eren",
    name: "Eren",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=100&h=100&fit=crop",
    series: "Attack on Titan",
    price: 100
  },
  {
    id: "tanjiro",
    name: "Tanjiro",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=100&h=100&fit=crop",
    series: "Demon Slayer",
    price: 100
  }
];

// Anime Quotes
const animeQuotes = [
  "Believe it! - Naruto",
  "I am going to be King of the Pirates! - Luffy",
  "Plus Ultra! - All Might",
  "Kamehameha! - Goku",
  "I'll take a potato chip... and eat it! - Light",
  "I want to be the very best! - Ash",
  "People die when they are killed - Shirou",
  "The only one who can beat me is me - Aomine"
];

// Design Templates
const designTemplates = {
  naruto: {
    name: "Naruto Theme",
    shirtColor: "#ff6600",
    layers: [
      { type: 'character', content: 'naruto', position: { x: 0, y: 20 } },
      { type: 'text', content: 'Believe it!', position: { x: 0, y: -80 }, color: '#000000' }
    ]
  },
  onepiece: {
    name: "One Piece Theme", 
    shirtColor: "#dc143c",
    layers: [
      { type: 'character', content: 'luffy', position: { x: 0, y: 20 } },
      { type: 'text', content: 'King of Pirates!', position: { x: 0, y: -80 }, color: '#ffffff' }
    ]
  },
  dbz: {
    name: "Dragon Ball Theme",
    shirtColor: "#ff8c00", 
    layers: [
      { type: 'character', content: 'goku', position: { x: 0, y: 20 } },
      { type: 'text', content: 'Kamehameha!', position: { x: 0, y: -80 }, color: '#000000' }
    ]
  },
  aot: {
    name: "Attack on Titan Theme",
    shirtColor: "#654321",
    layers: [
      { type: 'character', content: 'eren', position: { x: 0, y: 20 } },
      { type: 'text', content: 'Fight for Freedom!', position: { x: 0, y: -80 }, color: '#ffffff' }
    ]
  }
};

export default function UltimateTShirtCustomizer() {
  // Design State
  const [currentDesign, setCurrentDesign] = useState<TShirtDesign>({
    id: 'new-design',
    shirtColor: '#000000',
    shirtStyle: 'regular',
    size: 'M',
    layers: [],
    price: 599
  });

  // UI State
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'front' | 'back' | '3d'>('front');
  const [isRotating, setIsRotating] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [customText, setCustomText] = useState("");
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [fontSize, setFontSize] = useState([24]);
  const [textColor, setTextColor] = useState("#000000");
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<TShirtDesign[]>([]);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tshirtRef = useRef<HTMLDivElement>(null);

  // T-Shirt Colors
  const tshirtColors = [
    "#000000", "#ffffff", "#1a202c", "#2d3748", "#e53e3e", "#3182ce",
    "#38a169", "#d69e2e", "#805ad5", "#dd6b20", "#319795", "#e91e63"
  ];

  // Font Options
  const fontOptions = [
    "Arial", "Comic Sans MS", "Impact", "Times New Roman", 
    "Helvetica", "Georgia", "Verdana", "Trebuchet MS"
  ];

  // Calculate Price
  const calculatePrice = useCallback((design: TShirtDesign) => {
    let basePrice = 599;
    let additionalCost = 0;

    // Layer costs
    additionalCost += design.layers.length * 100;

    // Premium colors
    if (['#e53e3e', '#805ad5', '#d69e2e'].includes(design.shirtColor)) {
      additionalCost += 50;
    }

    // Size modifiers
    if (['XL', 'XXL'].includes(design.size)) {
      additionalCost += 100;
    }

    return basePrice + additionalCost;
  }, []);

  // Update price when design changes
  useEffect(() => {
    const newPrice = calculatePrice(currentDesign);
    setCurrentDesign(prev => ({ ...prev, price: newPrice }));
  }, [currentDesign.layers, currentDesign.shirtColor, currentDesign.size, calculatePrice]);

  // Add Character to Design
  const addCharacter = (character: typeof animeCharacters[0]) => {
    const newLayer: DesignLayer = {
      id: `character-${Date.now()}`,
      type: 'character',
      content: character.id,
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0,
      visible: true
    };

    setCurrentDesign(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer]
    }));

    setSelectedLayer(newLayer.id);
    showNotification(`${character.name} added to design!`);
  };

  // Add Text to Design
  const addText = (text: string) => {
    if (!text.trim()) return;

    const newLayer: DesignLayer = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: text,
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0,
      color: textColor,
      font: selectedFont,
      fontSize: fontSize[0],
      visible: true
    };

    setCurrentDesign(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer]
    }));

    setSelectedLayer(newLayer.id);
    setCustomText("");
    showNotification("Text added to design!");
  };

  // Update Layer
  const updateLayer = (layerId: string, updates: Partial<DesignLayer>) => {
    setCurrentDesign(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      )
    }));
  };

  // Remove Layer
  const removeLayer = (layerId: string) => {
    setCurrentDesign(prev => ({
      ...prev,
      layers: prev.layers.filter(layer => layer.id !== layerId)
    }));
    if (selectedLayer === layerId) {
      setSelectedLayer(null);
    }
    showNotification("Layer removed!");
  };

  // Load Template
  const loadTemplate = (templateKey: keyof typeof designTemplates) => {
    const template = designTemplates[templateKey];
    const newLayers: DesignLayer[] = template.layers.map((layerData, index) => ({
      id: `template-${Date.now()}-${index}`,
      type: layerData.type as 'character' | 'text',
      content: layerData.content,
      position: layerData.position,
      scale: 1,
      rotation: 0,
      color: layerData.color || textColor,
      font: selectedFont,
      fontSize: fontSize[0],
      visible: true
    }));

    setCurrentDesign(prev => ({
      ...prev,
      shirtColor: template.shirtColor,
      layers: newLayers
    }));

    showNotification(`${template.name} loaded!`);
  };

  // Save Design
  const saveDesign = () => {
    const designToSave = { ...currentDesign, id: `design-${Date.now()}` };
    setSavedDesigns(prev => [...prev, designToSave]);
    localStorage.setItem('saved_tshirt_designs', JSON.stringify([...savedDesigns, designToSave]));
    showNotification("Design saved successfully!");
  };

  // Export Design
  const exportDesign = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = 'my-tshirt-design.png';
      link.href = canvas.toDataURL();
      link.click();
      showNotification("Design exported!");
    }
  };

  // Add to Cart
  const addToCart = () => {
    setCart(prev => ({
      ...prev,
      [currentDesign.id]: (prev[currentDesign.id] || 0) + 1
    }));
    showNotification("Added to cart!");
    
    // Redirect to products page after delay
    setTimeout(() => {
      window.location.href = '/products';
    }, 1500);
  };

  // Share Design
  const shareDesign = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out my custom T-shirt design!',
        text: 'I created this awesome anime T-shirt design',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showNotification("Design link copied to clipboard!");
    }
  };

  // Upload Custom Image
  const uploadCustomImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newLayer: DesignLayer = {
            id: `image-${Date.now()}`,
            type: 'image',
            content: event.target?.result as string,
            position: { x: 0, y: 0 },
            scale: 1,
            rotation: 0,
            visible: true
          };
          setCurrentDesign(prev => ({
            ...prev,
            layers: [...prev.layers, newLayer]
          }));
          setSelectedLayer(newLayer.id);
          showNotification("Custom image added!");
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Show Notification
  const showNotification = (message: string) => {
    // This would typically use a toast library
    console.log(message);
  };

  // Get selected layer
  const getSelectedLayer = () => {
    return currentDesign.layers.find(layer => layer.id === selectedLayer);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>

      {/* Breadcrumb */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Home className="h-4 w-4" />
            <span>Home</span>
            <span>/</span>
            <span className="text-purple-300 font-medium">T-Shirt Designer</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">🎨 Ultimate T-Shirt Designer</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-6">
              Create your perfect anime T-shirt with our advanced 3D designer
            </p>
            <Badge variant="secondary" className="bg-white/20 text-white px-6 py-2 text-lg font-semibold">
              {currentDesign.layers.length} layers • ₹{currentDesign.price}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Panel - Tools & Settings */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardContent className="p-6 space-y-6">
                
                {/* T-Shirt Style */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    👕 T-Shirt Style
                  </h3>
                  <Select 
                    value={currentDesign.shirtStyle} 
                    onValueChange={(value) => setCurrentDesign(prev => ({ ...prev, shirtStyle: value }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular Fit</SelectItem>
                      <SelectItem value="oversized">Oversized</SelectItem>
                      <SelectItem value="hoodie">Hoodie</SelectItem>
                      <SelectItem value="polo">Polo Shirt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* T-Shirt Color */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    🎨 T-Shirt Color
                  </h3>
                  <div className="grid grid-cols-6 gap-2">
                    {tshirtColors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          currentDesign.shirtColor === color
                            ? 'border-white scale-110'
                            : 'border-white/30 hover:border-white/60'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setCurrentDesign(prev => ({ ...prev, shirtColor: color }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    📏 Size
                  </h3>
                  <Select 
                    value={currentDesign.size} 
                    onValueChange={(value) => setCurrentDesign(prev => ({ ...prev, size: value }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">Extra Small (XS)</SelectItem>
                      <SelectItem value="S">Small (S)</SelectItem>
                      <SelectItem value="M">Medium (M)</SelectItem>
                      <SelectItem value="L">Large (L)</SelectItem>
                      <SelectItem value="XL">Extra Large (XL)</SelectItem>
                      <SelectItem value="XXL">Double XL (XXL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Layer Management */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Design Layers
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {currentDesign.layers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                          selectedLayer === layer.id
                            ? 'bg-purple-500/30 border border-purple-400'
                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                        }`}
                        onClick={() => setSelectedLayer(layer.id)}
                      >
                        <span className="flex items-center gap-2">
                          {layer.type === 'character' && '🎭'}
                          {layer.type === 'text' && '✏️'}
                          {layer.type === 'image' && '🖼️'}
                          <span className="text-sm">
                            {layer.type === 'text' 
                              ? layer.content.substring(0, 15) + '...'
                              : layer.content
                            }
                          </span>
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLayer(layer.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save & Export */}
                <div className="space-y-2">
                  <Button onClick={saveDesign} className="w-full bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Design
                  </Button>
                  <Button onClick={shareDesign} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Design
                  </Button>
                  <Button onClick={exportDesign} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    <Download className="w-4 h-4 mr-2" />
                    Export PNG
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Center - 3D Viewer */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 relative overflow-hidden h-[600px]">
              <CardContent className="p-0 h-full">
                
                {/* View Controls */}
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                  <Button
                    size="sm"
                    variant={viewMode === 'front' ? 'default' : 'outline'}
                    className={viewMode === 'front' ? 'bg-purple-600' : 'border-white/20 text-white hover:bg-white/10'}
                    onClick={() => setViewMode('front')}
                  >
                    Front
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'back' ? 'default' : 'outline'}
                    className={viewMode === 'back' ? 'bg-purple-600' : 'border-white/20 text-white hover:bg-white/10'}
                    onClick={() => setViewMode('back')}
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === '3d' ? 'default' : 'outline'}
                    className={viewMode === '3d' ? 'bg-purple-600' : 'border-white/20 text-white hover:bg-white/10'}
                    onClick={() => setViewMode('3d')}
                  >
                    3D View
                  </Button>
                </div>

                {/* Canvas Area */}
                <div 
                  ref={tshirtRef}
                  className="w-full h-full flex items-center justify-center relative"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  {/* T-Shirt SVG */}
                  <div className="relative">
                    <svg width="300" height="360" viewBox="0 0 300 360" className="drop-shadow-2xl">
                      <path
                        d="M50 80 L50 50 Q50 30 70 30 L100 30 Q120 20 180 20 Q240 20 230 30 L260 30 Q280 30 280 50 L280 80 L250 100 L250 340 Q250 350 240 350 L60 350 Q50 350 50 340 L50 100 Z"
                        fill={currentDesign.shirtColor}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="2"
                      />
                    </svg>
                    
                    {/* Design Layers */}
                    {currentDesign.layers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                          selectedLayer === layer.id ? 'ring-2 ring-purple-400' : ''
                        }`}
                        style={{
                          transform: `translate(${layer.position.x}px, ${layer.position.y}px) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                          opacity: layer.visible ? 1 : 0.5
                        }}
                      >
                        {layer.type === 'character' && (
                          <div className="w-20 h-20 bg-purple-500/30 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">
                              {animeCharacters.find(c => c.id === layer.content)?.name.charAt(0) || '🎭'}
                            </span>
                          </div>
                        )}
                        {layer.type === 'text' && (
                          <div
                            style={{
                              color: layer.color,
                              fontFamily: layer.font,
                              fontSize: `${layer.fontSize}px`,
                              fontWeight: 'bold',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                            }}
                          >
                            {layer.content}
                          </div>
                        )}
                        {layer.type === 'image' && (
                          <img 
                            src={layer.content} 
                            alt="Custom" 
                            className="max-w-20 max-h-20 object-contain"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grid Toggle */}
                <div className="absolute bottom-4 left-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => setShowGrid(!showGrid)}
                  >
                    {showGrid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Price Display */}
                <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4">
                  <div className="text-center text-white">
                    <div className="text-sm opacity-80">Total Price</div>
                    <div className="text-2xl font-bold">₹{currentDesign.price}</div>
                    <Button 
                      onClick={addToCart}
                      className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Design Elements */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardContent className="p-6 space-y-6">
                
                {/* Anime Characters */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    🎭 Anime Characters
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {animeCharacters.map((character) => (
                      <button
                        key={character.id}
                        className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400 rounded-lg p-3 transition-all"
                        onClick={() => addCharacter(character)}
                      >
                        <img 
                          src={character.image} 
                          alt={character.name}
                          className="w-full h-16 object-cover rounded-md mb-2"
                        />
                        <div className="text-xs font-medium">{character.name}</div>
                        <div className="text-xs text-white/60">{character.series}</div>
                      </button>
                    ))}
                  </div>
                  <Button 
                    onClick={uploadCustomImage}
                    variant="outline" 
                    className="w-full mt-3 border-white/20 text-white hover:bg-white/10"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload Custom Image
                  </Button>
                </div>

                {/* Text Editor */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Add Text
                  </h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Enter your text..."
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addText(customText);
                        }
                      }}
                    />
                    
                    {/* Font Selection */}
                    <Select value={selectedFont} onValueChange={setSelectedFont}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Font Size */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Font Size: {fontSize[0]}px
                      </label>
                      <Slider
                        value={fontSize}
                        onValueChange={setFontSize}
                        max={100}
                        min={10}
                        step={2}
                        className="w-full"
                      />
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Text Color</label>
                      <div className="grid grid-cols-6 gap-2">
                        {tshirtColors.map((color) => (
                          <button
                            key={color}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              textColor === color
                                ? 'border-white scale-110'
                                : 'border-white/30 hover:border-white/60'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setTextColor(color)}
                          />
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => addText(customText)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={!customText.trim()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Text
                    </Button>
                  </div>
                </div>

                {/* Design Controls */}
                {getSelectedLayer() && (
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <MousePointer className="w-5 h-5" />
                      Design Controls
                    </h3>
                    <div className="space-y-4">
                      
                      {/* Position X */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Position X</label>
                        <Slider
                          value={[getSelectedLayer()?.position.x || 0]}
                          onValueChange={(value) => 
                            selectedLayer && updateLayer(selectedLayer, { position: { ...getSelectedLayer()!.position, x: value[0] } })
                          }
                          max={100}
                          min={-100}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      {/* Position Y */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Position Y</label>
                        <Slider
                          value={[getSelectedLayer()?.position.y || 0]}
                          onValueChange={(value) => 
                            selectedLayer && updateLayer(selectedLayer, { position: { ...getSelectedLayer()!.position, y: value[0] } })
                          }
                          max={100}
                          min={-100}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      {/* Scale */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Scale: {getSelectedLayer()?.scale.toFixed(1)}x
                        </label>
                        <Slider
                          value={[getSelectedLayer()?.scale || 1]}
                          onValueChange={(value) => 
                            selectedLayer && updateLayer(selectedLayer, { scale: value[0] })
                          }
                          max={3}
                          min={0.1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Rotation */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Rotation: {getSelectedLayer()?.rotation}°
                        </label>
                        <Slider
                          value={[getSelectedLayer()?.rotation || 0]}
                          onValueChange={(value) => 
                            selectedLayer && updateLayer(selectedLayer, { rotation: value[0] })
                          }
                          max={360}
                          min={0}
                          step={15}
                          className="w-full"
                        />
                      </div>

                      {/* Visibility Toggle */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="layer-visible"
                          checked={getSelectedLayer()?.visible}
                          onCheckedChange={(checked) => 
                            selectedLayer && updateLayer(selectedLayer, { visible: Boolean(checked) })
                          }
                        />
                        <label htmlFor="layer-visible" className="text-sm font-medium">
                          Layer Visible
                        </label>
                      </div>

                    </div>
                  </div>
                )}

                {/* Anime Quotes */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    💬 Famous Quotes
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {animeQuotes.map((quote, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start border-white/20 text-white hover:bg-white/10 text-xs p-2 h-auto"
                        onClick={() => addText(quote)}
                      >
                        {quote.length > 30 ? quote.substring(0, 30) + '...' : quote}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Design Templates */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    🎨 Quick Templates
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(designTemplates).map(([key, template]) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                        onClick={() => loadTemplate(key as keyof typeof designTemplates)}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Advanced Features */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    ⚡ Advanced Features
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                      onClick={() => showNotification('AR Mode coming soon! 🥽')}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      AR Try-On
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                      onClick={() => setCurrentDesign(prev => ({ ...prev, layers: [] }))}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                      onClick={() => showNotification('Undo feature coming soon!')}
                    >
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Undo/Redo
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-center">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-white text-center sm:text-left">
                  <div className="text-2xl font-bold">₹{currentDesign.price}</div>
                  <div className="text-sm opacity-80">
                    {currentDesign.layers.length} design elements
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={addToCart}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button 
                    onClick={() => setWishlist(prev => [...prev, currentDesign.id])}
                    variant="outline"
                    size="lg"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button 
                    onClick={shareDesign}
                    variant="outline"
                    size="lg"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Showcase */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-bold mb-2">Unlimited Creativity</h3>
              <p className="text-sm opacity-80">
                Mix and match anime characters, custom text, and personal images
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-lg font-bold mb-2">360° Preview</h3>
              <p className="text-sm opacity-80">
                See your design from every angle with our advanced 3D viewer
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-bold mb-2">Real-time Pricing</h3>
              <p className="text-sm opacity-80">
                See exactly what you'll pay as you design, no hidden costs
              </p>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}