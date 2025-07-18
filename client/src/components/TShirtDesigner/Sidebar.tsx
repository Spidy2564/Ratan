import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTShirtDesigner } from './TShirtDesignerContext';
import { HexColorPicker } from 'react-colorful';
import { Upload, Palette } from 'lucide-react';

const Sidebar = () => {
  const { 
    state, 
    addImage, 
    setSelectedColor, 
    setSelectedFont,
    setSelectedFontSize 
  } = useTShirtDesigner();
  
  const [tab, setTab] = useState<'images' | 'colors' | 'fonts'>('images');
  const [customColor, setCustomColor] = useState('#ff0000');

  // File dropzone for images
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const dataUrl = reader.result as string;
        addImage(dataUrl);
      };
      
      reader.readAsDataURL(file);
    });
  }, [addImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/svg+xml': ['.svg']
    }
  });

  // List of web-safe fonts
  const fonts = [
    'Arial', 
    'Verdana', 
    'Helvetica', 
    'Tahoma', 
    'Trebuchet MS', 
    'Times New Roman', 
    'Georgia', 
    'Garamond', 
    'Courier New', 
    'Brush Script MT'
  ];

  // Font sizes
  const fontSizes = [
    8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-300">
        <button
          className={`flex-1 py-2 text-sm font-medium ${tab === 'images' ? 'bg-gray-200 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => setTab('images')}
        >
          Images
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${tab === 'colors' ? 'bg-gray-200 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => setTab('colors')}
        >
          Colors
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${tab === 'fonts' ? 'bg-gray-200 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => setTab('fonts')}
        >
          Fonts
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'images' && (
          <div className="space-y-4">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isDragActive
                  ? "Drop the image here"
                  : "Drag & drop an image, or click to select"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, SVG up to 5MB
              </p>
            </div>

            {/* Sample Images */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Sample Images</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'https://via.placeholder.com/150',
                  'https://via.placeholder.com/150/0000FF',
                  'https://via.placeholder.com/150/FF0000',
                  'https://via.placeholder.com/150/FFFF00'
                ].map((url, index) => (
                  <div 
                    key={index}
                    className="border rounded-md p-1 cursor-pointer hover:border-blue-500"
                    onClick={() => addImage(url)}
                  >
                    <img 
                      src={url} 
                      alt={`Sample ${index + 1}`} 
                      className="w-full h-auto rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'colors' && (
          <div className="space-y-4">
            {/* Color picker */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Color</h3>
              <HexColorPicker 
                color={customColor} 
                onChange={color => {
                  setCustomColor(color);
                  setSelectedColor(color);
                }}
                className="w-full"
              />
              <div className="mt-2 flex items-center">
                <div 
                  className="w-8 h-8 mr-2 rounded-md border border-gray-300" 
                  style={{ backgroundColor: customColor }}
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setSelectedColor(e.target.value);
                  }}
                  className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* Color palettes */}
            {state.colorPalettes.map(palette => (
              <div key={palette.id} className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{palette.name}</h3>
                <div className="grid grid-cols-4 gap-2">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-full aspect-square rounded-md border border-gray-300 cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'fonts' && (
          <div className="space-y-4">
            {/* Font selector */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Font Family</h3>
              <select
                value={state.selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
              >
                {fonts.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font size */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Font Size</h3>
              <select
                value={state.selectedFontSize}
                onChange={(e) => setSelectedFontSize(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
              >
                {fontSizes.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </div>

            {/* Font preview */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
              <div 
                className="w-full p-4 border border-gray-300 rounded-md"
                style={{ 
                  fontFamily: state.selectedFont, 
                  fontSize: `${Math.min(state.selectedFontSize, 36)}px`,
                  color: state.selectedColor
                }}
              >
                Sample Text
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;