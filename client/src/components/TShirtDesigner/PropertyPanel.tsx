import React, { useState } from 'react';
import { useTShirtDesigner } from './TShirtDesignerContext';
import { HexColorPicker } from 'react-colorful';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline
} from 'lucide-react';

const PropertyPanel = () => {
  const { state, setSelectedColor, setSelectedFont, setSelectedFontSize } = useTShirtDesigner();
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Get active object properties
  const getActiveObjectProperties = () => {
    if (!state.activeObject) return null;

    const obj = state.activeObject;
    const isText = obj.type === 'text' || obj.type === 'i-text';
    
    return {
      type: obj.type,
      fill: obj.fill || '#000000',
      width: Math.round(obj.width! || 0),
      height: Math.round(obj.height! || 0),
      left: Math.round(obj.left! || 0),
      top: Math.round(obj.top! || 0),
      angle: Math.round(obj.angle! || 0),
      text: isText ? (obj as fabric.IText).text : '',
      fontFamily: isText ? (obj as fabric.IText).fontFamily : '',
      fontSize: isText ? (obj as fabric.IText).fontSize : 0,
      isBold: isText ? (obj as fabric.IText).fontWeight === 'bold' : false,
      isItalic: isText ? (obj as fabric.IText).fontStyle === 'italic' : false,
      isUnderline: isText ? (obj as fabric.IText).underline : false,
      textAlign: isText ? (obj as fabric.IText).textAlign : 'left',
    };
  };

  const properties = getActiveObjectProperties();
  const isText = properties?.type === 'text' || properties?.type === 'i-text';

  // Update object properties
  const updateProperty = (property: string, value: any) => {
    if (!state.canvas || !state.activeObject) return;
    
    const obj = state.activeObject;
    
    switch (property) {
      case 'fill':
        obj.set('fill', value);
        setSelectedColor(value);
        break;
      case 'width':
        if (obj.type !== 'text' && obj.type !== 'i-text') {
          obj.set('width', parseFloat(value));
          obj.set('scaleX', 1); // Reset scale to apply direct width
        }
        break;
      case 'height':
        if (obj.type !== 'text' && obj.type !== 'i-text') {
          obj.set('height', parseFloat(value));
          obj.set('scaleY', 1); // Reset scale to apply direct height
        }
        break;
      case 'left':
        obj.set('left', parseFloat(value));
        break;
      case 'top':
        obj.set('top', parseFloat(value));
        break;
      case 'angle':
        obj.set('angle', parseFloat(value));
        break;
      case 'fontFamily':
        if (isText) {
          (obj as fabric.IText).set('fontFamily', value);
          setSelectedFont(value);
        }
        break;
      case 'fontSize':
        if (isText) {
          (obj as fabric.IText).set('fontSize', parseFloat(value));
          setSelectedFontSize(parseFloat(value));
        }
        break;
      case 'fontWeight':
        if (isText) {
          (obj as fabric.IText).set('fontWeight', value ? 'bold' : 'normal');
        }
        break;
      case 'fontStyle':
        if (isText) {
          (obj as fabric.IText).set('fontStyle', value ? 'italic' : 'normal');
        }
        break;
      case 'underline':
        if (isText) {
          (obj as fabric.IText).set('underline', value);
        }
        break;
      case 'textAlign':
        if (isText) {
          (obj as fabric.IText).set('textAlign', value);
        }
        break;
    }
    
    state.canvas.renderAll();
  };

  // Format type name for display
  const formatTypeName = (type: string) => {
    if (type === 'i-text') return 'Text';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (!properties) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-300 bg-gray-100">
          <h2 className="text-sm font-medium text-gray-700">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-4 text-center">
          Select an object to view and edit its properties.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-300 bg-gray-100">
        <h2 className="text-sm font-medium text-gray-700">
          {formatTypeName(properties.type)} Properties
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4">
          {/* Color picker */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Fill Color</label>
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
                style={{ backgroundColor: properties.fill }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <input
                type="text"
                value={properties.fill}
                onChange={(e) => updateProperty('fill', e.target.value)}
                className="ml-2 flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>
            
            {showColorPicker && (
              <div className="mt-2">
                <HexColorPicker 
                  color={properties.fill as string} 
                  onChange={(color) => updateProperty('fill', color)}
                  className="w-full"
                />
              </div>
            )}
          </div>
          
          {/* Position and Size */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">X Position</label>
              <input
                type="number"
                value={properties.left}
                onChange={(e) => updateProperty('left', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Y Position</label>
              <input
                type="number"
                value={properties.top}
                onChange={(e) => updateProperty('top', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>
            
            {properties.type !== 'text' && properties.type !== 'i-text' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Width</label>
                  <input
                    type="number"
                    value={properties.width}
                    onChange={(e) => updateProperty('width', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Height</label>
                  <input
                    type="number"
                    value={properties.height}
                    onChange={(e) => updateProperty('height', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Rotation</label>
              <input
                type="number"
                value={properties.angle}
                onChange={(e) => updateProperty('angle', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>
          
          {/* Text properties */}
          {isText && (
            <div className="space-y-4 pt-2 border-t border-gray-200">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Text Content</label>
                <textarea
                  value={properties.text}
                  onChange={(e) => {
                    if (state.canvas && state.activeObject) {
                      (state.activeObject as fabric.IText).text = e.target.value;
                      state.canvas.renderAll();
                    }
                  }}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  rows={2}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Font Family</label>
                <select
                  value={properties.fontFamily}
                  onChange={(e) => updateProperty('fontFamily', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  {['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New'].map(font => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Font Size</label>
                <input
                  type="number"
                  value={properties.fontSize}
                  onChange={(e) => updateProperty('fontSize', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
              
              {/* Text formatting controls */}
              <div className="flex border border-gray-300 rounded-md divide-x divide-gray-300">
                <button
                  className={`flex-1 py-1 ${properties.isBold ? 'bg-gray-200' : 'bg-white'}`}
                  onClick={() => updateProperty('fontWeight', !properties.isBold)}
                  title="Bold"
                >
                  <Bold size={16} className="mx-auto" />
                </button>
                <button
                  className={`flex-1 py-1 ${properties.isItalic ? 'bg-gray-200' : 'bg-white'}`}
                  onClick={() => updateProperty('fontStyle', !properties.isItalic)}
                  title="Italic"
                >
                  <Italic size={16} className="mx-auto" />
                </button>
                <button
                  className={`flex-1 py-1 ${properties.isUnderline ? 'bg-gray-200' : 'bg-white'}`}
                  onClick={() => updateProperty('underline', !properties.isUnderline)}
                  title="Underline"
                >
                  <Underline size={16} className="mx-auto" />
                </button>
              </div>
              
              {/* Text alignment controls */}
              <div className="flex border border-gray-300 rounded-md divide-x divide-gray-300">
                <button
                  className={`flex-1 py-1 ${properties.textAlign === 'left' ? 'bg-gray-200' : 'bg-white'}`}
                  onClick={() => updateProperty('textAlign', 'left')}
                  title="Align Left"
                >
                  <AlignLeft size={16} className="mx-auto" />
                </button>
                <button
                  className={`flex-1 py-1 ${properties.textAlign === 'center' ? 'bg-gray-200' : 'bg-white'}`}
                  onClick={() => updateProperty('textAlign', 'center')}
                  title="Align Center"
                >
                  <AlignCenter size={16} className="mx-auto" />
                </button>
                <button
                  className={`flex-1 py-1 ${properties.textAlign === 'right' ? 'bg-gray-200' : 'bg-white'}`}
                  onClick={() => updateProperty('textAlign', 'right')}
                  title="Align Right"
                >
                  <AlignRight size={16} className="mx-auto" />
                </button>
                <button
                  className={`flex-1 py-1 ${properties.textAlign === 'justify' ? 'bg-gray-200' : 'bg-white'}`}
                  onClick={() => updateProperty('textAlign', 'justify')}
                  title="Justify"
                >
                  <AlignJustify size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;