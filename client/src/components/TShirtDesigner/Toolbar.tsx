import React from 'react';
import { 
  MoveVertical, 
  ChevronRight, 
  ChevronLeft, 
  Undo, 
  Redo, 
  Type, 
  Image, 
  Square, 
  Circle, 
  Triangle, 
  Minus, 
  Pencil, 
  Save, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Trash2, 
  Group, 
  Ungroup, 
  Download,
  Grid,
  Pipette,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTShirtDesigner } from './TShirtDesignerContext';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  onExport?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onExport }) => {
  const { 
    state, 
    setActiveTool, 
    addText, 
    addShape, 
    addLine, 
    zoomIn, 
    zoomOut, 
    resetZoom,
    undo,
    redo,
    saveDesign,
    clearCanvas,
    groupSelectedObjects,
    ungroupSelectedObjects,
    deleteSelected,
    toggleSnapToGrid,
    toggleShowGrid,
    pickColor,
    lockSelectedObject,
    unlockSelectedObject,
    setShowMockup
  } = useTShirtDesigner();

  const ToolButton = ({ 
    icon, 
    onClick, 
    active = false, 
    disabled = false,
    tooltip
  }: { 
    icon: React.ReactNode, 
    onClick: () => void, 
    active?: boolean, 
    disabled?: boolean,
    tooltip: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-md transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50",
        active 
          ? "bg-blue-500 text-white hover:bg-blue-600" 
          : "bg-gray-700 text-gray-200 hover:bg-gray-600",
        disabled && "opacity-50 cursor-not-allowed hover:bg-gray-700"
      )}
      title={tooltip}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col h-full p-2 gap-2">
      {/* Selection and Movement Tools */}
      <div className="flex flex-col gap-2">
        <ToolButton 
          icon={<MoveVertical size={20} />} 
          onClick={() => {
            useTShirtDesigner().togglePanning(!state.isPanning);
          }}
          active={state.isPanning}
          tooltip="Pan Canvas"
        />
      </div>

      <div className="border-t border-gray-600 my-1"></div>

      {/* History Controls */}
      <div className="flex flex-col gap-2">
        <ToolButton 
          icon={<Undo size={20} />} 
          onClick={undo} 
          disabled={state.historyIndex <= 0}
          tooltip="Undo"
        />
        <ToolButton 
          icon={<Redo size={20} />} 
          onClick={redo} 
          disabled={state.historyIndex >= state.history.length - 1}
          tooltip="Redo"
        />
      </div>

      <div className="border-t border-gray-600 my-1"></div>

      {/* Creation Tools */}
      <div className="flex flex-col gap-2">
        <ToolButton 
          icon={<Type size={20} />} 
          onClick={() => {
            setActiveTool('text');
            addText();
          }} 
          active={state.activeTool === 'text'}
          tooltip="Add Text"
        />
        <ToolButton 
          icon={<Image size={20} />} 
          onClick={() => setActiveTool('image')} 
          active={state.activeTool === 'image'}
          tooltip="Add Image"
        />
        <ToolButton 
          icon={<Square size={20} />} 
          onClick={() => {
            setActiveTool('rectangle');
            addShape('rectangle');
          }} 
          active={state.activeTool === 'rectangle'}
          tooltip="Add Rectangle"
        />
        <ToolButton 
          icon={<Circle size={20} />} 
          onClick={() => {
            setActiveTool('circle');
            addShape('circle');
          }} 
          active={state.activeTool === 'circle'}
          tooltip="Add Circle"
        />
        <ToolButton 
          icon={<Triangle size={20} />} 
          onClick={() => {
            setActiveTool('triangle');
            addShape('triangle');
          }} 
          active={state.activeTool === 'triangle'}
          tooltip="Add Triangle"
        />
        <ToolButton 
          icon={<Minus size={20} />} 
          onClick={() => {
            setActiveTool('line');
            addLine();
          }} 
          active={state.activeTool === 'line'}
          tooltip="Add Line"
        />
        <ToolButton 
          icon={<Pencil size={20} />} 
          onClick={() => setActiveTool('freeform')} 
          active={state.activeTool === 'freeform'}
          tooltip="Freeform Drawing"
        />
        <ToolButton 
          icon={<Pipette size={20} />} 
          onClick={pickColor} 
          active={state.activeTool === 'eyedropper'}
          tooltip="Color Picker"
        />
      </div>

      <div className="border-t border-gray-600 my-1"></div>

      {/* Edit Tools */}
      <div className="flex flex-col gap-2">
        <ToolButton 
          icon={<Group size={20} />} 
          onClick={groupSelectedObjects} 
          disabled={!state.activeObject || state.activeObject.type !== 'activeSelection'}
          tooltip="Group Objects"
        />
        <ToolButton 
          icon={<Ungroup size={20} />} 
          onClick={ungroupSelectedObjects} 
          disabled={!state.activeObject || state.activeObject.type !== 'group'}
          tooltip="Ungroup Objects"
        />
        <ToolButton 
          icon={<Lock size={20} />} 
          onClick={lockSelectedObject} 
          disabled={!state.activeObject}
          tooltip="Lock Object"
        />
        <ToolButton 
          icon={<Unlock size={20} />} 
          onClick={unlockSelectedObject} 
          tooltip="Unlock All Objects"
        />
        <ToolButton 
          icon={<Trash2 size={20} />} 
          onClick={deleteSelected} 
          disabled={!state.activeObject}
          tooltip="Delete Selected"
        />
      </div>

      <div className="border-t border-gray-600 my-1"></div>

      {/* View Controls */}
      <div className="flex flex-col gap-2">
        <ToolButton 
          icon={<ZoomIn size={20} />} 
          onClick={zoomIn} 
          disabled={state.zoom >= 5}
          tooltip="Zoom In"
        />
        <ToolButton 
          icon={<ZoomOut size={20} />} 
          onClick={zoomOut} 
          disabled={state.zoom <= 0.1}
          tooltip="Zoom Out"
        />
        <ToolButton 
          icon={<RotateCcw size={20} />} 
          onClick={resetZoom} 
          tooltip="Reset Zoom"
        />
        <ToolButton 
          icon={<Grid size={20} />} 
          onClick={() => {
            toggleShowGrid();
            if (!state.showGrid) toggleSnapToGrid();
          }} 
          active={state.showGrid}
          tooltip="Toggle Grid"
        />
        <ToolButton 
          icon={state.showMockup ? <Eye size={20} /> : <EyeOff size={20} />} 
          onClick={() => setShowMockup(!state.showMockup)} 
          active={state.showMockup}
          tooltip={state.showMockup ? "Hide Mockup" : "Show Mockup"}
        />
      </div>

      <div className="border-t border-gray-600 my-1"></div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        <ToolButton 
          icon={<Save size={20} />} 
          onClick={saveDesign} 
          tooltip="Save Design"
        />
        <ToolButton 
          icon={<Download size={20} />} 
          onClick={onExport} 
          tooltip="Export Design"
        />
      </div>
    </div>
  );
};

export default Toolbar;