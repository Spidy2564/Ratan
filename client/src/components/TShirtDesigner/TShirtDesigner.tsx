import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import { useTShirtDesigner, TShirtDesignerProvider, DesignExport } from './TShirtDesignerContext';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import LayerPanel from './LayerPanel';
import PropertyPanel from './PropertyPanel';
import GridOverlay from './GridOverlay';
import BuyButton from "../common/BuyButton"; // FIXED: Changed from "../../common/BuyButton" to "../common/BuyButton"

export type TShirtDesignerProps = {
  width?: number;
  height?: number;
  showToolbar?: boolean;
  showSidebar?: boolean;
  showLayerPanel?: boolean;
  showPropertyPanel?: boolean;
  mockupUrl?: string;
  onExport?: (data: DesignExport) => void;
  className?: string;
};

// The internal component that uses the context
const TShirtDesignerContent: React.FC<TShirtDesignerProps> = ({
  width = 1152,
  height = 1440, // 16 × 20 inches at 72 DPI
  showToolbar = true,
  showSidebar = true,
  showLayerPanel = true,
  showPropertyPanel = true,
  mockupUrl,
  onExport,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const designerContainerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const [artboardWidth, setArtboardWidth] = useState(width);
  const [artboardHeight, setArtboardHeight] = useState(height);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState<{ x: number, y: number } | null>(null);
  const [isEyedropping, setIsEyedropping] = useState(false);
  const [designPrice, setDesignPrice] = useState(29.99);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('White');
  
  const { 
    state, 
    initCanvas, 
    setIsDragging, 
    setSelectedColor: setDesignerColor,
    setActiveTool,
    exportDesign
  } = useTShirtDesigner();

  // Initialize the canvas when the component mounts
  useEffect(() => {
    if (canvasRef.current && !state.canvas) {
      initCanvas(canvasRef.current, artboardWidth, artboardHeight);
    }
  }, [canvasRef, initCanvas, artboardWidth, artboardHeight, state.canvas]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (artboardRef.current && state.canvas) {
        // Adjust canvas size based on container size while maintaining aspect ratio
        const containerWidth = artboardRef.current.clientWidth;
        const containerHeight = artboardRef.current.clientHeight;
        
        const originalAspect = width / height;
        const containerAspect = containerWidth / containerHeight;
        
        let newWidth, newHeight;
        
        if (containerAspect > originalAspect) {
          // Container is wider than needed
          newHeight = containerHeight;
          newWidth = newHeight * originalAspect;
        } else {
          // Container is taller than needed
          newWidth = containerWidth;
          newHeight = newWidth / originalAspect;
        }
        
        setArtboardWidth(newWidth);
        setArtboardHeight(newHeight);
        
        // Update the canvas size
        state.canvas.setWidth(newWidth);
        state.canvas.setHeight(newHeight);
        state.canvas.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size adjustment
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [state.canvas, width, height]);

  // Handle panning/dragging the canvas
  useEffect(() => {
    if (!state.canvas) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (!state.isPanning) return;
      
      setIsDraggingCanvas(true);
      setLastPointerPosition({ x: e.clientX, y: e.clientY });
      setIsDragging(true);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingCanvas || !lastPointerPosition) return;
      
      const deltaX = e.clientX - lastPointerPosition.x;
      const deltaY = e.clientY - lastPointerPosition.y;
      
      if (state.canvas) {
        const vpt = state.canvas.viewportTransform;
        if (vpt) {
          vpt[4] += deltaX;
          vpt[5] += deltaY;
          state.canvas.requestRenderAll();
        }
      }
      
      setLastPointerPosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseUp = () => {
      if (isDraggingCanvas) {
        setIsDraggingCanvas(false);
        setLastPointerPosition(null);
        setIsDragging(false);
      }
    };

    // Handle eyedropper tool
    const handleEyedropper = (e: MouseEvent) => {
      if (state.activeTool !== 'eyedropper' || !state.canvas) return;
      
      const pointer = state.canvas.getPointer(e);
      const ctx = state.canvas.getContext();
      
      // Get the pixel data at the mouse pointer position
      const imageData = ctx.getImageData(pointer.x, pointer.y, 1, 1).data;
      
      // Convert RGB to Hex
      const hexColor = `#${((1 << 24) + (imageData[0] << 16) + (imageData[1] << 8) + imageData[2]).toString(16).slice(1)}`;
      
      // Set the selected color and switch back to select tool
      setDesignerColor(hexColor);
      setActiveTool('select');
      setIsEyedropping(false);
    };
    
    // Add event listeners
    const canvas = state.canvas.getElement();
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add eyedropper event listener
    if (state.activeTool === 'eyedropper' && !isEyedropping) {
      canvas.addEventListener('mousedown', handleEyedropper);
      setIsEyedropping(true);
    } else if (state.activeTool !== 'eyedropper' && isEyedropping) {
      canvas.removeEventListener('mousedown', handleEyedropper);
      setIsEyedropping(false);
    }
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (isEyedropping) {
        canvas.removeEventListener('mousedown', handleEyedropper);
      }
    };
  }, [
    state.canvas, 
    state.isPanning, 
    isDraggingCanvas, 
    lastPointerPosition, 
    setIsDragging, 
    state.activeTool, 
    isEyedropping, 
    setDesignerColor, 
    setActiveTool
  ]);

  // Handle exporting the design
  const handleExport = () => {
    if (onExport) {
      exportDesign(onExport);
    }
  };

  // Get current design as base64 for preview
  const getCurrentDesignPreview = () => {
    if (state.canvas) {
      return state.canvas.toDataURL('image/png');
    }
    return null;
  };

  return (
    <div className={`t-shirt-designer-container ${className || ''} w-full h-full flex flex-col`}>
      {/* Toolbar - Top on mobile, Left on desktop */}
      {showToolbar && (
        <div className="toolbar-container md:w-16 w-full h-16 md:h-full bg-gray-800 text-white z-10 md:fixed md:left-0 md:top-0">
          <Toolbar onExport={handleExport} />
        </div>
      )}
      
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden md:ml-16">
        {/* Sidebar - Left side panel (shapes, images, etc.) */}
        {showSidebar && (
          <div className="sidebar-container w-full md:w-64 h-auto md:h-full bg-gray-100 border-r border-gray-300 overflow-y-auto">
            <Sidebar />
          </div>
        )}
        
        {/* Main content area with canvas */}
        <div 
          ref={designerContainerRef}
          className="flex-1 relative flex flex-col items-center justify-center bg-gray-200 overflow-hidden"
        >
          {/* Purchase Section - ADDED */}
          <div className="w-full bg-white border-b border-gray-300 p-4 flex flex-col md:flex-row items-center justify-between gap-4 z-20">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <label className="block text-gray-600 mb-1">Size:</label>
                <select 
                  value={selectedSize} 
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
              
              <div className="text-sm">
                <label className="block text-gray-600 mb-1">Color:</label>
                <select 
                  value={selectedColor} 
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1"
                >
                  <option value="White">White</option>
                  <option value="Black">Black</option>
                  <option value="Gray">Gray</option>
                  <option value="Navy">Navy</option>
                  <option value="Red">Red</option>
                </select>
              </div>

              <div className="text-sm">
                <label className="block text-gray-600 mb-1">Price:</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="1" 
                  max="999"
                  value={designPrice}
                  onChange={(e) => setDesignPrice(parseFloat(e.target.value) || 29.99)}
                  className="border border-gray-300 rounded px-3 py-1 w-20"
                />
              </div>
            </div>

            {/* Buy Button */}
            <BuyButton
              productData={{
                id: `custom_design_${Date.now()}`,
                name: "Custom T-Shirt Design",
                price: designPrice,
                design: state.canvas ? state.canvas.toJSON() : null,
                size: selectedSize,
                color: selectedColor,
                preview: getCurrentDesignPreview()
              }}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🛒 Buy This Design - ${designPrice.toFixed(2)}
            </BuyButton>
          </div>

          {/* T-shirt mockup background if provided */}
          {mockupUrl && state.showMockup && (
            <img 
              src={mockupUrl}
              alt="T-Shirt Mockup"
              className="absolute inset-0 pointer-events-none object-contain h-full w-full z-0"
              style={{ opacity: 0.9 }}
            />
          )}
          
          {/* Grid overlay */}
          {state.showGrid && (
            <GridOverlay 
              width={artboardWidth} 
              height={artboardHeight} 
              gridSize={state.gridSize} 
              zoom={state.zoom}
            />
          )}
          
          {/* Fabric.js canvas wrapper */}
          <div 
            ref={artboardRef}
            className="canvas-wrapper relative overflow-hidden"
            style={{ 
              width: `${artboardWidth}px`, 
              height: `${artboardHeight}px`,
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
              backgroundColor: 'transparent',
              transform: `scale(${state.zoom})`,
              transition: 'transform 0.2s ease'
            }}
          >
            <canvas ref={canvasRef} />
          </div>
        </div>
        
        {/* Right side panels (Layer panel and Property panel) */}
        {(showLayerPanel || showPropertyPanel) && (
          <div className="right-panels-container w-full md:w-64 h-auto md:h-full bg-gray-100 border-l border-gray-300 overflow-y-auto">
            {showLayerPanel && <LayerPanel />}
            {showPropertyPanel && <PropertyPanel />}
          </div>
        )}
      </div>
    </div>
  );
};

// Export the component wrapped with the context provider
export const TShirtDesigner: React.FC<TShirtDesignerProps> = (props) => {
  return (
    <TShirtDesignerProvider>
      <TShirtDesignerContent {...props} />
    </TShirtDesignerProvider>
  );
};

export default TShirtDesigner;