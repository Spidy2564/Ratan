import React from 'react';
import { useTShirtDesigner } from './TShirtDesignerContext';
import { 
  ArrowUp, 
  ArrowDown, 
  ChevronsUp, 
  ChevronsDown, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Trash2,
  Type,
  Square,
  Circle,
  Triangle,
  Image as ImageIcon,
  Minus
} from 'lucide-react';

const LayerPanel = () => {
  const { 
    state, 
    bringForward, 
    bringToFront, 
    sendBackward, 
    sendToBack,
    deleteSelected,
    lockSelectedObject,
    unlockSelectedObject
  } = useTShirtDesigner();

  // Get type of object as string
  const getObjectType = (obj: any) => {
    if (!obj) return '';
    
    if (obj.type === 'i-text' || obj.type === 'text') return 'text';
    if (obj.type === 'image') return 'image';
    if (obj.type === 'rect') return 'rectangle';
    if (obj.type === 'circle') return 'circle';
    if (obj.type === 'triangle') return 'triangle';
    if (obj.type === 'line') return 'line';
    if (obj.type === 'path') return 'drawing';
    if (obj.type === 'group') return 'group';
    return obj.type;
  };

  // Get icon for object type
  const getObjectIcon = (obj: any) => {
    const type = getObjectType(obj);
    
    switch (type) {
      case 'text':
        return <Type size={16} />;
      case 'rectangle':
        return <Square size={16} />;
      case 'circle':
        return <Circle size={16} />;
      case 'triangle':
        return <Triangle size={16} />;
      case 'image':
        return <ImageIcon size={16} />;
      case 'line':
        return <Minus size={16} />;
      default:
        return <Square size={16} />;
    }
  };

  // Get name of object
  const getObjectName = (obj: any) => {
    if (!obj) return '';
    
    const type = getObjectType(obj);
    
    if (type === 'text') {
      // Use first 15 chars of text as name
      const text = obj.text || 'Text';
      return text.length > 15 ? `${text.substring(0, 15)}...` : text;
    }
    
    // Capitalize first letter
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Check if object is locked
  const isObjectLocked = (obj: any) => {
    if (!obj) return false;
    return obj.selectable === false || obj.evented === false;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-300 bg-gray-100">
        <h2 className="text-sm font-medium text-gray-700">Layers</h2>
      </div>
      
      {/* Order controls */}
      <div className="p-2 border-b border-gray-300 flex flex-wrap gap-1">
        <button
          onClick={bringToFront}
          disabled={!state.activeObject}
          className={`p-1 rounded ${!state.activeObject ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
          title="Bring to Front"
        >
          <ChevronsUp size={16} />
        </button>
        <button
          onClick={bringForward}
          disabled={!state.activeObject}
          className={`p-1 rounded ${!state.activeObject ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
          title="Bring Forward"
        >
          <ArrowUp size={16} />
        </button>
        <button
          onClick={sendBackward}
          disabled={!state.activeObject}
          className={`p-1 rounded ${!state.activeObject ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
          title="Send Backward"
        >
          <ArrowDown size={16} />
        </button>
        <button
          onClick={sendToBack}
          disabled={!state.activeObject}
          className={`p-1 rounded ${!state.activeObject ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
          title="Send to Back"
        >
          <ChevronsDown size={16} />
        </button>
        
        <div className="border-r border-gray-300 h-6 mx-1"></div>
        
        <button
          onClick={lockSelectedObject}
          disabled={!state.activeObject}
          className={`p-1 rounded ${!state.activeObject ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
          title="Lock"
        >
          <Lock size={16} />
        </button>
        <button
          onClick={unlockSelectedObject}
          className={`p-1 rounded text-gray-700 hover:bg-gray-200`}
          title="Unlock All"
        >
          <Unlock size={16} />
        </button>
        
        <div className="border-r border-gray-300 h-6 mx-1"></div>
        
        <button
          onClick={deleteSelected}
          disabled={!state.activeObject}
          className={`p-1 rounded ${!state.activeObject ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-100'}`}
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      {/* Layer list */}
      <div className="flex-1 overflow-y-auto">
        {state.layers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No layers yet. Add elements to your design.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {/* Render layers in reverse order to match canvas stacking order */}
            {state.layers.slice().reverse().map((obj, index) => {
              const isActive = state.activeObject === obj;
              const isLocked = isObjectLocked(obj);
              
              return (
                <li 
                  key={index}
                  className={`p-2 flex items-center hover:bg-gray-100 ${isActive ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    if (state.canvas && !isLocked) {
                      state.canvas.setActiveObject(obj);
                      state.canvas.renderAll();
                    }
                  }}
                >
                  <div className="mr-2 text-gray-500">
                    {getObjectIcon(obj)}
                  </div>
                  <div className="flex-1 overflow-hidden text-sm">
                    {getObjectName(obj)}
                  </div>
                  <div className="flex items-center space-x-1">
                    {isLocked ? (
                      <Lock size={16} className="text-gray-500" />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LayerPanel;