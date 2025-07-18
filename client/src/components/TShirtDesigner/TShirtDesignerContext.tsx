import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

// Types
export type DesignExport = {
  pngBlob: Blob;
  pdfBlob: Blob;
  designJson: string;
};

export type ColorPalette = {
  id: string;
  name: string;
  colors: string[];
};

export type DesignerTool = 
  | 'select'
  | 'text'
  | 'image'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'line'
  | 'freeform'
  | 'eyedropper';

export type TShirtMockup = {
  id: string;
  name: string;
  frontImage: string;
  backImage?: string;
  color: string;
};

export type DesignerState = {
  canvas: fabric.Canvas | null;
  activeTool: DesignerTool;
  activeObject: fabric.Object | null;
  history: string[];
  historyIndex: number;
  showMockup: boolean;
  currentMockup: TShirtMockup | null;
  zoom: number;
  isPanning: boolean;
  selectedFont: string;
  selectedFontSize: number;
  selectedColor: string;
  isDragging: boolean;
  isSaving: boolean;
  colorPalettes: ColorPalette[];
  activeColorPalette: ColorPalette | null;
  layers: fabric.Object[];
  snapToGrid: boolean;
  gridSize: number;
  showGuides: boolean;
  showGrid: boolean;
};

type DesignerContextType = {
  state: DesignerState;
  initCanvas: (canvasEl: HTMLCanvasElement, width: number, height: number) => void;
  setActiveTool: (tool: DesignerTool) => void;
  addText: (text?: string) => void;
  addImage: (url: string, callback?: () => void) => void;
  addShape: (type: 'rectangle' | 'circle' | 'triangle') => void;
  addLine: () => void;
  groupSelectedObjects: () => void;
  ungroupSelectedObjects: () => void;
  deleteSelected: () => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  undo: () => void;
  redo: () => void;
  setShowMockup: (show: boolean) => void;
  setCurrentMockup: (mockup: TShirtMockup | null) => void;
  setSelectedFont: (font: string) => void;
  setSelectedFontSize: (size: number) => void;
  setSelectedColor: (color: string) => void;
  togglePanning: (isPanning: boolean) => void;
  setIsDragging: (isDragging: boolean) => void;
  saveDesign: () => void;
  loadDesign: (json: string) => void;
  clearCanvas: () => void;
  bringForward: () => void;
  bringToFront: () => void;
  sendBackward: () => void;
  sendToBack: () => void;
  exportDesign: (callback: (data: DesignExport) => void) => void;
  alignObjects: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeObjects: (direction: 'horizontal' | 'vertical') => void;
  lockSelectedObject: () => void;
  unlockSelectedObject: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  toggleShowGuides: () => void;
  toggleShowGrid: () => void;
  pickColor: () => void;
  addColorPalette: (palette: ColorPalette) => void;
  setActiveColorPalette: (palette: ColorPalette | null) => void;
  updateCanvasSize: (width: number, height: number) => void;
};

// Default values
const DEFAULT_FONT = 'Arial';
const DEFAULT_FONT_SIZE = 40;
const DEFAULT_COLOR = '#000000';
const DEFAULT_GRID_SIZE = 20;
const DEFAULT_COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'basic',
    name: 'Basic Colors',
    colors: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff']
  },
  {
    id: 'pastel',
    name: 'Pastel',
    colors: ['#FFB6C1', '#FFD700', '#FFDAB9', '#98FB98', '#ADD8E6', '#DDA0DD', '#AFEEEE']
  }
];

// Create the context with default values
const TShirtDesignerContext = createContext<DesignerContextType | undefined>(undefined);

// Initial state
const initialState: DesignerState = {
  canvas: null,
  activeTool: 'select',
  activeObject: null,
  history: [],
  historyIndex: -1,
  showMockup: true,
  currentMockup: null,
  zoom: 1,
  isPanning: false,
  selectedFont: DEFAULT_FONT,
  selectedFontSize: DEFAULT_FONT_SIZE,
  selectedColor: DEFAULT_COLOR,
  isDragging: false,
  isSaving: false,
  colorPalettes: DEFAULT_COLOR_PALETTES,
  activeColorPalette: DEFAULT_COLOR_PALETTES[0],
  layers: [],
  snapToGrid: false,
  gridSize: DEFAULT_GRID_SIZE,
  showGuides: true,
  showGrid: false,
};

export const TShirtDesignerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DesignerState>(initialState);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to save current canvas state to history
  const saveToHistory = () => {
    if (!canvasRef.current) return;

    // Clear any pending history saves
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    // Debounce saving to history to avoid too many snapshots
    historyTimeoutRef.current = setTimeout(() => {
      const json = canvasRef.current?.toJSON();
      if (!json) return;

      const jsonStr = JSON.stringify(json);

      setState(prevState => {
        // If we're in the middle of the history stack, remove the "future" states
        const newHistory = prevState.historyIndex < prevState.history.length - 1
          ? prevState.history.slice(0, prevState.historyIndex + 1)
          : prevState.history;

        return {
          ...prevState,
          history: [...newHistory, jsonStr],
          historyIndex: newHistory.length
        };
      });
    }, 500);
  };

  // Initialize the canvas
  const initCanvas = (canvasEl: HTMLCanvasElement, width: number, height: number) => {
    if (canvasRef.current) {
      canvasRef.current.dispose();
    }

    const canvas = new fabric.Canvas(canvasEl, {
      width,
      height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    });

    // Set up event listeners
    canvas.on('object:modified', () => {
      saveToHistory();
      updateLayers();
    });

    canvas.on('object:added', () => {
      saveToHistory();
      updateLayers();
    });

    canvas.on('object:removed', () => {
      saveToHistory();
      updateLayers();
    });

    canvas.on('selection:created', (e) => {
      setState(prevState => ({
        ...prevState,
        activeObject: canvas.getActiveObject()
      }));
    });

    canvas.on('selection:updated', (e) => {
      setState(prevState => ({
        ...prevState,
        activeObject: canvas.getActiveObject()
      }));
    });

    canvas.on('selection:cleared', () => {
      setState(prevState => ({
        ...prevState,
        activeObject: null
      }));
    });

    // Update state with the new canvas
    canvasRef.current = canvas;
    setState(prevState => ({
      ...prevState,
      canvas,
      history: [JSON.stringify(canvas.toJSON())],
      historyIndex: 0
    }));

    // Save initial state to history
    saveToHistory();
  };

  // Update layers list when objects change
  const updateLayers = () => {
    if (!canvasRef.current) return;
    
    const objects = canvasRef.current.getObjects();
    setState(prevState => ({
      ...prevState,
      layers: objects
    }));
  };

  // Set active tool
  const setActiveTool = (tool: DesignerTool) => {
    setState(prevState => ({
      ...prevState,
      activeTool: tool
    }));

    // Reset canvas drawing mode if tool is not freeform
    if (tool !== 'freeform' && canvasRef.current) {
      canvasRef.current.isDrawingMode = false;
    }

    // Enable drawing mode if tool is freeform
    if (tool === 'freeform' && canvasRef.current) {
      canvasRef.current.isDrawingMode = true;
      if (canvasRef.current.freeDrawingBrush) {
        canvasRef.current.freeDrawingBrush.color = state.selectedColor;
        canvasRef.current.freeDrawingBrush.width = 5;
      }
    }
  };

  // Add text to canvas
  const addText = (text = 'Add Text') => {
    if (!canvasRef.current) return;

    const textObj = new fabric.IText(text, {
      left: canvasRef.current.width! / 2,
      top: canvasRef.current.height! / 2,
      fontFamily: state.selectedFont,
      fontSize: state.selectedFontSize,
      fill: state.selectedColor,
      originX: 'center',
      originY: 'center',
      editable: true,
    });

    canvasRef.current.add(textObj);
    canvasRef.current.setActiveObject(textObj);
    canvasRef.current.renderAll();
  };

  // Add image to canvas
  const addImage = (url: string, callback?: () => void) => {
    if (!canvasRef.current) return;

    fabric.Image.fromURL(url, (img) => {
      // Scale image to fit within canvas while maintaining aspect ratio
      const canvasWidth = canvasRef.current!.width!;
      const canvasHeight = canvasRef.current!.height!;
      const maxWidth = canvasWidth * 0.8;
      const maxHeight = canvasHeight * 0.8;

      if (img.width! > maxWidth || img.height! > maxHeight) {
        const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
        img.scale(scale);
      }

      img.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
      });

      canvasRef.current!.add(img);
      canvasRef.current!.setActiveObject(img);
      canvasRef.current!.renderAll();
      
      if (callback) callback();
    });
  };

  // Add shape to canvas
  const addShape = (type: 'rectangle' | 'circle' | 'triangle') => {
    if (!canvasRef.current) return;

    let shape: fabric.Object;
    const canvasWidth = canvasRef.current.width!;
    const canvasHeight = canvasRef.current.height!;

    switch (type) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          width: 100,
          height: 100,
          fill: state.selectedColor,
          originX: 'center',
          originY: 'center',
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          radius: 50,
          fill: state.selectedColor,
          originX: 'center',
          originY: 'center',
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          width: 100,
          height: 100,
          fill: state.selectedColor,
          originX: 'center',
          originY: 'center',
        });
        break;
      default:
        return;
    }

    canvasRef.current.add(shape);
    canvasRef.current.setActiveObject(shape);
    canvasRef.current.renderAll();
  };

  // Add line to canvas
  const addLine = () => {
    if (!canvasRef.current) return;

    const canvasWidth = canvasRef.current.width!;
    const canvasHeight = canvasRef.current.height!;

    const line = new fabric.Line([
      canvasWidth / 2 - 50, 
      canvasHeight / 2, 
      canvasWidth / 2 + 50, 
      canvasHeight / 2
    ], {
      stroke: state.selectedColor,
      strokeWidth: 5,
      originX: 'center',
      originY: 'center',
    });

    canvasRef.current.add(line);
    canvasRef.current.setActiveObject(line);
    canvasRef.current.renderAll();
  };

  // Group selected objects
  const groupSelectedObjects = () => {
    if (!canvasRef.current) return;

    const activeSelection = canvasRef.current.getActiveObject() as fabric.ActiveSelection;
    if (activeSelection && activeSelection.type === 'activeSelection') {
      const group = activeSelection.toGroup();
      canvasRef.current.setActiveObject(group);
      canvasRef.current.renderAll();
      saveToHistory();
    }
  };

  // Ungroup selected objects
  const ungroupSelectedObjects = () => {
    if (!canvasRef.current) return;

    const activeObject = canvasRef.current.getActiveObject() as fabric.Group;
    if (activeObject && activeObject.type === 'group') {
      const items = activeObject.getObjects();
      activeObject.destroy();
      canvasRef.current.remove(activeObject);

      items.forEach(item => {
        canvasRef.current!.add(item);
      });

      canvasRef.current.renderAll();
      saveToHistory();
    }
  };

  // Delete selected objects
  const deleteSelected = () => {
    if (!canvasRef.current) return;

    const activeObject = canvasRef.current.getActiveObject();
    if (activeObject) {
      // If it's an active selection, remove all objects in the selection
      if (activeObject.type === 'activeSelection') {
        const activeSelection = activeObject as fabric.ActiveSelection;
        activeSelection.getObjects().forEach(obj => {
          canvasRef.current!.remove(obj);
        });
        canvasRef.current.discardActiveObject();
      } else {
        // Otherwise, just remove the active object
        canvasRef.current.remove(activeObject);
      }
      canvasRef.current.renderAll();
      saveToHistory();
    }
  };

  // Zoom functions
  const setZoom = (zoom: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const center = {
      x: canvas.width! / 2,
      y: canvas.height! / 2
    };

    canvas.zoomToPoint(new fabric.Point(center.x, center.y), zoom);
    
    setState(prevState => ({
      ...prevState,
      zoom
    }));
  };

  const zoomIn = () => {
    setZoom(Math.min(state.zoom + 0.1, 5));
  };

  const zoomOut = () => {
    setZoom(Math.max(state.zoom - 0.1, 0.1));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  // History navigation
  const undo = () => {
    if (!canvasRef.current || state.historyIndex <= 0) return;

    setState(prevState => {
      const newIndex = prevState.historyIndex - 1;
      canvasRef.current!.loadFromJSON(prevState.history[newIndex], () => {
        canvasRef.current!.renderAll();
        updateLayers();
      });

      return {
        ...prevState,
        historyIndex: newIndex,
        activeObject: null
      };
    });
  };

  const redo = () => {
    if (!canvasRef.current || state.historyIndex >= state.history.length - 1) return;

    setState(prevState => {
      const newIndex = prevState.historyIndex + 1;
      canvasRef.current!.loadFromJSON(prevState.history[newIndex], () => {
        canvasRef.current!.renderAll();
        updateLayers();
      });

      return {
        ...prevState,
        historyIndex: newIndex,
        activeObject: null
      };
    });
  };

  // Toggle mockup visibility
  const setShowMockup = (show: boolean) => {
    setState(prevState => ({
      ...prevState,
      showMockup: show
    }));
  };

  // Set current mockup
  const setCurrentMockup = (mockup: TShirtMockup | null) => {
    setState(prevState => ({
      ...prevState,
      currentMockup: mockup
    }));
  };

  // Font controls
  const setSelectedFont = (font: string) => {
    setState(prevState => ({
      ...prevState,
      selectedFont: font
    }));

    // Apply to selected text object if applicable
    if (canvasRef.current) {
      const activeObject = canvasRef.current.getActiveObject();
      if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text')) {
        (activeObject as fabric.IText).set('fontFamily', font);
        canvasRef.current.renderAll();
        saveToHistory();
      }
    }
  };

  const setSelectedFontSize = (size: number) => {
    setState(prevState => ({
      ...prevState,
      selectedFontSize: size
    }));

    // Apply to selected text object if applicable
    if (canvasRef.current) {
      const activeObject = canvasRef.current.getActiveObject();
      if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text')) {
        (activeObject as fabric.IText).set('fontSize', size);
        canvasRef.current.renderAll();
        saveToHistory();
      }
    }
  };

  // Color controls
  const setSelectedColor = (color: string) => {
    setState(prevState => ({
      ...prevState,
      selectedColor: color
    }));

    // Apply to selected object if applicable
    if (canvasRef.current) {
      const activeObject = canvasRef.current.getActiveObject();
      if (activeObject) {
        if (activeObject.type === 'text' || activeObject.type === 'i-text') {
          (activeObject as fabric.IText).set('fill', color);
        } else if (activeObject.type === 'path') {
          (activeObject as fabric.Path).set('stroke', color);
        } else {
          activeObject.set('fill', color);
        }
        canvasRef.current.renderAll();
        saveToHistory();
      }

      // Update free drawing brush color
      if (canvasRef.current.isDrawingMode && canvasRef.current.freeDrawingBrush) {
        canvasRef.current.freeDrawingBrush.color = color;
      }
    }
  };

  // Toggle panning mode
  const togglePanning = (isPanning: boolean) => {
    setState(prevState => ({
      ...prevState,
      isPanning
    }));

    if (canvasRef.current) {
      if (isPanning) {
        canvasRef.current.defaultCursor = 'grab';
        canvasRef.current.selection = false;
        canvasRef.current.getObjects().forEach(obj => {
          obj.selectable = false;
        });
      } else {
        canvasRef.current.defaultCursor = 'default';
        canvasRef.current.selection = true;
        canvasRef.current.getObjects().forEach(obj => {
          obj.selectable = true;
        });
      }
      canvasRef.current.renderAll();
    }
  };

  // Set dragging state
  const setIsDragging = (isDragging: boolean) => {
    setState(prevState => ({
      ...prevState,
      isDragging
    }));

    if (canvasRef.current && state.isPanning) {
      canvasRef.current.defaultCursor = isDragging ? 'grabbing' : 'grab';
      canvasRef.current.renderAll();
    }
  };

  // Save design to localStorage
  const saveDesign = () => {
    if (!canvasRef.current) return;

    setState(prevState => ({
      ...prevState,
      isSaving: true
    }));

    try {
      const json = canvasRef.current.toJSON();
      localStorage.setItem('tshirtDesign', JSON.stringify(json));
      
      setTimeout(() => {
        setState(prevState => ({
          ...prevState,
          isSaving: false
        }));
      }, 1000);
    } catch (error) {
      console.error('Error saving design:', error);
      setState(prevState => ({
        ...prevState,
        isSaving: false
      }));
    }
  };

  // Load design from JSON
  const loadDesign = (json: string) => {
    if (!canvasRef.current) return;

    try {
      canvasRef.current.loadFromJSON(json, () => {
        canvasRef.current!.renderAll();
        saveToHistory();
        updateLayers();
      });
    } catch (error) {
      console.error('Error loading design:', error);
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!canvasRef.current) return;

    canvasRef.current.clear();
    canvasRef.current.setBackgroundColor('#ffffff', () => {
      canvasRef.current!.renderAll();
      saveToHistory();
      updateLayers();
    });
  };

  // Object ordering functions
  const bringForward = () => {
    if (!canvasRef.current) return;

    const activeObject = canvasRef.current.getActiveObject();
    if (activeObject) {
      canvasRef.current.bringForward(activeObject);
      canvasRef.current.renderAll();
      saveToHistory();
      updateLayers();
    }
  };

  const bringToFront = () => {
    if (!canvasRef.current) return;

    const activeObject = canvasRef.current.getActiveObject();
    if (activeObject) {
      canvasRef.current.bringToFront(activeObject);
      canvasRef.current.renderAll();
      saveToHistory();
      updateLayers();
    }
  };

  const sendBackward = () => {
    if (!canvasRef.current) return;

    const activeObject = canvasRef.current.getActiveObject();
    if (activeObject) {
      canvasRef.current.sendBackwards(activeObject);
      canvasRef.current.renderAll();
      saveToHistory();
      updateLayers();
    }
  };

  const sendToBack = () => {
    if (!canvasRef.current) return;

    const activeObject = canvasRef.current.getActiveObject();
    if (activeObject) {
      canvasRef.current.sendToBack(activeObject);
      canvasRef.current.renderAll();
      saveToHistory();
      updateLayers();
    }
  };

  // Export design to PNG, PDF and JSON
  const exportDesign = (callback: (data: DesignExport) => void) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Get design as JSON
    const designJson = JSON.stringify(canvas.toJSON());
    
    // Get PNG blob
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) {
        console.error('Error creating PNG blob');
        return;
      }
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width!, canvas.height!]
      });
      
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width!, canvas.height!);
      
      const pdfBlob = pdf.output('blob');
      
      // Return data via callback
      callback({
        pngBlob,
        pdfBlob,
        designJson
      });
    }, 'png', { quality: 1, multiplier: 3 }); // 300 DPI (3x scale for print quality)
  };

  // Alignment functions
  const alignObjects = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!canvasRef.current) return;

    const activeSelection = canvasRef.current.getActiveObject() as fabric.ActiveSelection;
    if (!activeSelection || activeSelection.type !== 'activeSelection') return;

    const selectionBoundingBox = activeSelection.getBoundingRect();

    activeSelection.getObjects().forEach((obj) => {
      const objectBoundingBox = obj.getBoundingRect();

      switch (direction) {
        case 'left':
          obj.set('left', selectionBoundingBox.left);
          break;
        case 'center':
          obj.set('left', selectionBoundingBox.left + selectionBoundingBox.width / 2 - objectBoundingBox.width / 2);
          break;
        case 'right':
          obj.set('left', selectionBoundingBox.left + selectionBoundingBox.width - objectBoundingBox.width);
          break;
        case 'top':
          obj.set('top', selectionBoundingBox.top);
          break;
        case 'middle':
          obj.set('top', selectionBoundingBox.top + selectionBoundingBox.height / 2 - objectBoundingBox.height / 2);
          break;
        case 'bottom':
          obj.set('top', selectionBoundingBox.top + selectionBoundingBox.height - objectBoundingBox.height);
          break;
      }
      obj.setCoords();
    });

    canvasRef.current.renderAll();
    saveToHistory();
  };

  // Distribution functions
  const distributeObjects = (direction: 'horizontal' | 'vertical') => {
    if (!canvasRef.current) return;

    const activeSelection = canvasRef.current.getActiveObject() as fabric.ActiveSelection;
    if (!activeSelection || activeSelection.type !== 'activeSelection') return;

    const objects = activeSelection.getObjects();
    if (objects.length < 3) return; // Need at least 3 objects to distribute

    // Sort objects by their position
    const sortedObjects = objects.slice().sort((a, b) => {
      const aBBox = a.getBoundingRect();
      const bBBox = b.getBoundingRect();
      return direction === 'horizontal' 
        ? aBBox.left - bBBox.left 
        : aBBox.top - bBBox.top;
    });

    // Calculate the total space and the space between objects
    const firstObj = sortedObjects[0];
    const lastObj = sortedObjects[sortedObjects.length - 1];
    const firstBBox = firstObj.getBoundingRect();
    const lastBBox = lastObj.getBoundingRect();

    let totalSpace;
    if (direction === 'horizontal') {
      totalSpace = (lastBBox.left + lastBBox.width) - firstBBox.left;
    } else {
      totalSpace = (lastBBox.top + lastBBox.height) - firstBBox.top;
    }

    // Calculate the total object size
    let totalObjectSize = 0;
    sortedObjects.forEach(obj => {
      const bbox = obj.getBoundingRect();
      totalObjectSize += direction === 'horizontal' ? bbox.width : bbox.height;
    });

    // Calculate the space between objects
    const spaceBetween = (totalSpace - totalObjectSize) / (sortedObjects.length - 1);

    // Distribute objects
    let currentPosition = direction === 'horizontal' ? firstBBox.left : firstBBox.top;
    sortedObjects.forEach((obj, index) => {
      if (index === 0) return; // Skip the first object

      const prevObj = sortedObjects[index - 1];
      const prevBBox = prevObj.getBoundingRect();
      const objBBox = obj.getBoundingRect();

      if (direction === 'horizontal') {
        const newLeft = currentPosition + prevBBox.width + spaceBetween;
        obj.set('left', newLeft);
        currentPosition = newLeft;
      } else {
        const newTop = currentPosition + prevBBox.height + spaceBetween;
        obj.set('top', newTop);
        currentPosition = newTop;
      }
      obj.setCoords();
    });

    canvasRef.current.renderAll();
    saveToHistory();
  };

  // Lock/unlock objects
  const lockSelectedObject = () => {
    if (!canvasRef.current) return;

    const activeObject = canvasRef.current.getActiveObject();
    if (activeObject) {
      activeObject.set('selectable', false);
      activeObject.set('evented', false);
      canvasRef.current.discardActiveObject();
      canvasRef.current.renderAll();
      saveToHistory();
    }
  };

  const unlockSelectedObject = () => {
    if (!canvasRef.current) return;

    // Temporarily make all objects selectable
    const objects = canvasRef.current.getObjects();
    objects.forEach(obj => {
      obj.set('selectable', true);
      obj.set('evented', true);
    });
    canvasRef.current.renderAll();
    saveToHistory();
  };

  // Grid and guides
  const toggleSnapToGrid = () => {
    setState(prevState => ({
      ...prevState,
      snapToGrid: !prevState.snapToGrid
    }));
  };

  const setGridSize = (size: number) => {
    setState(prevState => ({
      ...prevState,
      gridSize: size
    }));
  };

  const toggleShowGuides = () => {
    setState(prevState => ({
      ...prevState,
      showGuides: !prevState.showGuides
    }));
  };

  const toggleShowGrid = () => {
    setState(prevState => ({
      ...prevState,
      showGrid: !prevState.showGrid
    }));
  };

  // Eyedropper tool
  const pickColor = () => {
    if (!canvasRef.current) return;

    // Enable eyedropper mode
    setActiveTool('eyedropper');

    // The actual color picking is handled in the mouse:down event in the TShirtDesigner component
  };

  // Color palette functions
  const addColorPalette = (palette: ColorPalette) => {
    setState(prevState => ({
      ...prevState,
      colorPalettes: [...prevState.colorPalettes, palette]
    }));
  };

  const setActiveColorPalette = (palette: ColorPalette | null) => {
    setState(prevState => ({
      ...prevState,
      activeColorPalette: palette
    }));
  };

  // Update canvas size
  const updateCanvasSize = (width: number, height: number) => {
    if (!canvasRef.current) return;

    canvasRef.current.setWidth(width);
    canvasRef.current.setHeight(height);
    canvasRef.current.renderAll();
  };

  // Set up effect for snap-to-grid
  useEffect(() => {
    if (!canvasRef.current) return;

    if (state.snapToGrid) {
      canvasRef.current.on('object:moving', function(options) {
        if (!options.target) return;

        options.target.set({
          left: Math.round(options.target.left! / state.gridSize) * state.gridSize,
          top: Math.round(options.target.top! / state.gridSize) * state.gridSize
        });
      });
    } else {
      canvasRef.current.off('object:moving');
    }
  }, [state.snapToGrid, state.gridSize]);

  // Load saved design from localStorage on mount
  useEffect(() => {
    const savedDesign = localStorage.getItem('tshirtDesign');
    if (savedDesign && canvasRef.current) {
      try {
        canvasRef.current.loadFromJSON(savedDesign, () => {
          canvasRef.current!.renderAll();
          saveToHistory();
          updateLayers();
        });
      } catch (error) {
        console.error('Error loading saved design:', error);
      }
    }
  }, []);

  // Context value
  const contextValue: DesignerContextType = {
    state,
    initCanvas,
    setActiveTool,
    addText,
    addImage,
    addShape,
    addLine,
    groupSelectedObjects,
    ungroupSelectedObjects,
    deleteSelected,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    undo,
    redo,
    setShowMockup,
    setCurrentMockup,
    setSelectedFont,
    setSelectedFontSize,
    setSelectedColor,
    togglePanning,
    setIsDragging,
    saveDesign,
    loadDesign,
    clearCanvas,
    bringForward,
    bringToFront,
    sendBackward,
    sendToBack,
    exportDesign,
    alignObjects,
    distributeObjects,
    lockSelectedObject,
    unlockSelectedObject,
    toggleSnapToGrid,
    setGridSize,
    toggleShowGuides,
    toggleShowGrid,
    pickColor,
    addColorPalette,
    setActiveColorPalette,
    updateCanvasSize
  };

  return (
    <TShirtDesignerContext.Provider value={contextValue}>
      {children}
    </TShirtDesignerContext.Provider>
  );
};

// Custom hook to use the context
export const useTShirtDesigner = (): DesignerContextType => {
  const context = useContext(TShirtDesignerContext);
  if (context === undefined) {
    throw new Error('useTShirtDesigner must be used within a TShirtDesignerProvider');
  }
  return context;
};