import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import {
  ShoppingCart, Share2, Upload, RotateCcw, Palette, Grid3X3,
  Download, Camera, Video, ImagePlus
} from 'lucide-react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* -------------------------------------------------------------------------- */
/*                               Helper types                                 */
/* -------------------------------------------------------------------------- */
type PartsColour = {
  body: string; collar: string; cuff: string; bottomHem: string;
  background: string; sleeves: string; inner: string;
};

type ShowParts = {
  collar: boolean; cuff: boolean; bottomHem: boolean;
  sleeves: boolean; inner: boolean; grid: boolean;
};

type AnimationSettings = { animate: boolean; reverse: boolean; speed: number };

type ModelType = 'men' | 'women' | 'long';

/* -------------------------------------------------------------------------- */
/*                            Main React component                            */
/* -------------------------------------------------------------------------- */
const TShirtDesigner: React.FC = () => {
  /* -------------------------- Refs & React state ------------------------- */
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const tshirtGroupRef = useRef<THREE.Group>();
  const overlayGroupRef = useRef<THREE.Group>(new THREE.Group());
  const mouseRef = useRef({ x: 0, y: 0, down: false });
  const animationRef = useRef<number>();
  const rotationSpeedRef = useRef<number>(0);

  const [parts, setParts] = useState<PartsColour>({
    body: '#ffffff', collar: '#cccccc', cuff: '#cccccc',
    bottomHem: '#cccccc', background: '#ffffff',
    sleeves: '#ffffff', inner: '#ffffff',
  });
  const [show, setShow] = useState<ShowParts>({
    collar: true, cuff: true, bottomHem: true,
    sleeves: true, inner: true, grid: true,
  });
  const [model, setModel] = useState<ModelType>('men');
  const [anim, setAnim] = useState<AnimationSettings>({
    animate: true, reverse: false, speed: 1,
  });
  const [angle, setAngle] = useState<number>(0);
  const [bgHex, setBgHex] = useState<string>('#f0f0f0');
  const [bgImg, setBgImg] = useState<string | null>(null);

  const animRef = useRef(anim);

  /* ------------------------- Build / rebuild model ----------------------- */
  const buildTShirt = () => {
    const scene = sceneRef.current!;
    // Remove old T-shirt group if present
    if (tshirtGroupRef.current) {
      scene.remove(tshirtGroupRef.current);
      tshirtGroupRef.current.traverse((c: any) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) (Array.isArray(c.material) ? c.material : [c.material]).forEach((m: any) => m.dispose());
      });
    }

    // Load the .glb T-shirt model
    const loader = new GLTFLoader();
    loader.load(
      '/models/tshirt.glb',
      (gltf) => {
        const tshirtMesh = gltf.scene;
        tshirtMesh.name = 'tshirtGLB';
        tshirtMesh.scale.set(6, 6, 6); // Increase the T-shirt size
        tshirtMesh.position.set(0, -4, 0); // Move even further down for better centering
        
        // First, log all material names to understand the structure
        console.log('=== T-shirt Materials ===');
        const materialMap = new Map();
        
        tshirtMesh.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            console.log('Mesh name:', mesh.name);
            
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat, index) => {
                console.log(`  Material ${index}:`, mat.name || 'Unnamed', mat);
                if (mat.name) materialMap.set(mat.name, mat);
              });
            } else if (mesh.material) {
              console.log('  Single Material:', mesh.material.name || 'Unnamed', mesh.material);
              if (mesh.material.name) materialMap.set(mesh.material.name, mesh.material);
            }
          }
        });
        
        // Store material references for easy access
        (tshirtMesh as any).materialMap = materialMap;
        
        // Apply initial colors and setup for shadow casting
        tshirtMesh.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Apply initial body color to all materials as fallback
            const applyColor = (mat: any) => {
              if (mat && mat.color) {
                mat.color.set(parts.body);
                mat.needsUpdate = true;
              }
            };
            
            if (Array.isArray(child.material)) {
              child.material.forEach(applyColor);
            } else if (child.material) {
              applyColor(child.material);
            }
          }
        });
        
        // Add overlays
        tshirtMesh.add(overlayGroupRef.current);
        tshirtGroupRef.current = tshirtMesh;
        scene.add(tshirtMesh);
      },
      undefined,
      (error) => {
        console.error('Error loading GLB:', error);
      }
    );
  };

  /* ------------------------------ Init scene --------------------------- */
  useEffect(() => {
    if (!mountRef.current) return;

    /* scene, camera, renderer */
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(bgHex);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(0, 0, 8); // Zoom in a bit more for a closer view
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(600, 600);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(bgHex);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = 'grab';

    /* Professional lighting setup for fabric */
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(4, 6, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -5;
    mainLight.shadow.camera.right = 5;
    mainLight.shadow.camera.top = 5;
    mainLight.shadow.camera.bottom = -5;
    scene.add(mainLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-4, 2, 4);
    scene.add(fillLight);

    // Rim light for better definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    /* grid */
    const grid = new THREE.GridHelper(8, 16, 0x404040, 0x404040);
    grid.position.y = -2.5;
    grid.name = 'grid';
    grid.visible = show.grid;
    scene.add(grid);

    buildTShirt();

    /* Enhanced mouse controls */
    const canvas = renderer.domElement;
    const down = (e: MouseEvent) => {
      mouseRef.current.down = true;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      canvas.style.cursor = 'grabbing';
    };
    const up = () => {
      mouseRef.current.down = false;
      canvas.style.cursor = 'grab';
    };
    const move = (e: MouseEvent) => {
      if (!mouseRef.current.down) return;
      const dx = e.clientX - mouseRef.current.x;
      const dy = e.clientY - mouseRef.current.y;
      if (tshirtGroupRef.current) {
        tshirtGroupRef.current.rotation.y += dx * 0.008;
        tshirtGroupRef.current.rotation.x = THREE.MathUtils.clamp(
          tshirtGroupRef.current.rotation.x + dy * 0.008, -Math.PI / 4, Math.PI / 4
        );
      }
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const scale = e.deltaY > 0 ? 0.95 : 1.05;
      camera.position.multiplyScalar(scale);
      camera.position.clampLength(3, 12);
    };

    canvas.addEventListener('mousedown', down);
    canvas.addEventListener('mouseup', up);
    canvas.addEventListener('mouseleave', up);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('wheel', wheel);

    /* Fixed animation loop */
    const tick = () => {
      animationRef.current = requestAnimationFrame(tick);
      
      if (tshirtGroupRef.current) {
        if (animRef.current.animate) {
          // Calculate rotation speed based on the speed setting
          rotationSpeedRef.current = animRef.current.speed * 0.008;
          if (animRef.current.reverse) rotationSpeedRef.current *= -1;
          tshirtGroupRef.current.rotation.y += rotationSpeedRef.current;
        }
      }
      
      renderer.render(scene, camera);
    };
    tick();

    /* cleanup */
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener('mousedown', down);
      canvas.removeEventListener('mouseup', up);
      canvas.removeEventListener('mouseleave', up);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('wheel', wheel);
      if (mountRef.current && mountRef.current.contains(canvas)) {
        mountRef.current.removeChild(canvas);
      }
      renderer.dispose();
    };
  }, []); // only once

  /* rebuild when model changes */
  useEffect(() => {
    if (sceneRef.current && tshirtGroupRef.current) {
      buildTShirt();
    }
  }, [model]);

  /* update colours and visibility - IMPROVED VERSION */
  useEffect(() => {
    if (!tshirtGroupRef.current) return;

    // Get the material map if it exists
    const materialMap = (tshirtGroupRef.current as any).materialMap;
    
    if (materialMap && materialMap.size > 0) {
      // Only log once to avoid console spam
      if (materialMap.size > 0) {
        console.log('Applying colors to materials:', Array.from(materialMap.keys()));
      }
      
      // Map your UI colors to your actual material names
      // Based on your GLB file: Material name is "Tshirt.1001"
      const materialMappings: { [key: string]: string } = {
        'Tshirt.1001': parts.body,        // Your actual T-shirt material
        // Fallback mappings in case there are other materials
        'Material': parts.body,
        'Material.001': parts.collar,
        'Material.002': parts.sleeves,
        'Material.003': parts.cuff,
        'Material.004': parts.bottomHem,
        'Fabric': parts.body,
        'Body': parts.body,
        'Collar': parts.collar,
        'Sleeve': parts.sleeves,
        'Sleeves': parts.sleeves,
        'Hem': parts.bottomHem,
        'BottomHem': parts.bottomHem,
        'Cuff': parts.cuff,
        'Cuffs': parts.cuff,
        'Inner': parts.inner,
      };
      
      // Apply colors based on material names
      materialMap.forEach((material: any, name: string) => {
        if (materialMappings[name]) {
          material.color.set(materialMappings[name]);
          material.needsUpdate = true;
        }
      });
    } else {
      // Method 2: Fallback - apply body color to all materials
      tshirtGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          
          const updateMaterial = (mat: any) => {
            if (mat && mat.color) {
              // Apply body color to all materials as fallback
              mat.color.set(parts.body);
              mat.needsUpdate = true;
            }
          };
          
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(updateMaterial);
          } else if (mesh.material) {
            updateMaterial(mesh.material);
          }
        }
      });
    }
    
    // Update grid visibility
    if (sceneRef.current) {
      const grid = sceneRef.current.getObjectByName('grid') as THREE.GridHelper;
      if (grid) grid.visible = show.grid;
    }
  }, [parts, show.grid]);

  /* background updates */
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;
    if (bgImg) {
      new THREE.TextureLoader().load(bgImg, (texture) => {
        sceneRef.current!.background = texture;
      });
    } else {
      sceneRef.current.background = new THREE.Color(bgHex);
      rendererRef.current.setClearColor(bgHex);
    }
  }, [bgHex, bgImg]);

  /* Update animation when settings change */
  useEffect(() => {
    // This effect ensures the animation responds immediately to changes
    if (tshirtGroupRef.current && !anim.animate) {
      tshirtGroupRef.current.rotation.y = THREE.MathUtils.degToRad(angle);
    }
  }, [anim.animate, anim.speed, anim.reverse, angle]);

  /* Utility functions */
  const addOverlayPlane = (map: THREE.Texture, w: number, h: number) => {
    map.needsUpdate = true;
    map.minFilter = THREE.LinearFilter;
    const mat = new THREE.MeshBasicMaterial({ map, transparent: true });
    const geo = new THREE.PlaneGeometry(w, h);
    const plane = new THREE.Mesh(geo, mat);
    plane.position.set(0, 0.2, 1.3);
    overlayGroupRef.current.add(plane);
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev: any) => {
        new THREE.TextureLoader().load(ev.target.result, (tex) => {
          addOverlayPlane(tex, 1.2, 1.2 * tex.image.height / tex.image.width);
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const addText = () => {
    const text = prompt('Enter text for the shirt:', 'My Design');
    if (!text) return;
    const colour = prompt('Hex colour (e.g. #ff0000):', '#000000') || '#000000';
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.font = 'bold 120px "Arial Black", sans-serif';
    ctx.fillStyle = colour;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 512, 128);
    
    const tex = new THREE.CanvasTexture(canvas);
    addOverlayPlane(tex, 1.4, 0.35);
  };

  const resetDesign = () => {
    setParts({
      body: '#ffffff', collar: '#cccccc', cuff: '#cccccc',
      bottomHem: '#cccccc', background: '#ffffff',
      sleeves: '#ffffff', inner: '#ffffff'
    });
    setBgHex('#f0f0f0');
    setBgImg(null);
    setModel('men');
    setAnim({ animate: true, reverse: false, speed: 1 });
    setAngle(0);
    overlayGroupRef.current.clear();
  };

  // Debug function to help identify material names
  const logMaterialInfo = () => {
    if (!tshirtGroupRef.current) {
      console.log('No T-shirt loaded yet');
      return;
    }
    
    console.log('=== Current T-shirt Material Info ===');
    tshirtGroupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        console.log(`Mesh: ${mesh.name}`);
        
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat, idx) => {
            console.log(`  Material ${idx}: ${mat.name || 'Unnamed'}`, {
              color: (mat as any).color && typeof (mat as any).color.getHexString === 'function' ? `#${(mat as any).color.getHexString()}` : 'No color',
              type: mat.type,
              material: mat
            });
          });
        } else {
          console.log(`  Single Material: ${mesh.material.name || 'Unnamed'}`, {
            color: (mesh.material as any).color && typeof (mesh.material as any).color.getHexString === 'function' ? `#${(mesh.material as any).color.getHexString()}` : 'No color',
            type: mesh.material.type,
            material: mesh.material
          });
        }
      }
    });
  };

  const palette = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#ff8c00', '#8a2be2', '#ff1493', '#00ced1', '#32cd32', '#ffd700'];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 text-center">
        <h1 className="text-2xl font-bold">3D T-shirt Mockup Designer</h1>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          {/* Debug Button */}
          <section className="mb-4">
            <button 
              className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm transition-colors"
              onClick={logMaterialInfo}>
              🔍 Debug Materials
            </button>
            <p className="text-xs text-gray-400 mt-1">Check browser console for material names</p>
          </section>

          {/* Colors */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Colors
            </h3>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {palette.map(c => (
                <button 
                  key={c} 
                  style={{ background: c }}
                  className="w-8 h-8 rounded-lg border-2 border-gray-600 hover:scale-110 transition-transform"
                  onClick={() => setParts(p => ({ ...p, body: c }))}
                />
              ))}
            </div>

            {/* Color pickers */}
            {(['body', 'collar', 'cuff', 'bottomHem', 'sleeves'] as (keyof PartsColour)[])
              .map(k => (
                <div key={k} className="flex items-center gap-3 mb-3">
                  <input 
                    type="color" 
                    value={parts[k]}
                    onChange={e => setParts(p => ({ ...p, [k]: e.target.value }))}
                    className="w-10 h-8 rounded border border-gray-600"
                  />
                  <input 
                    type="text" 
                    value={parts[k].substring(1)}
                    onChange={e => setParts(p => ({ ...p, [k]: '#' + e.target.value }))}
                    className="w-20 text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1 font-mono"
                  />
                  <span className="text-sm capitalize flex-1">{k.replace(/([A-Z])/g, ' $1')}</span>
                </div>
              ))}
          </section>

          {/* Visibility checkboxes */}
          <section className="mb-6">
            <h4 className="text-sm font-medium mb-3">Show/Hide Parts</h4>
            {(['collar', 'cuff', 'bottomHem', 'sleeves', 'grid'] as (keyof ShowParts)[])
              .map(k => (
                <label key={k} className="flex items-center gap-2 text-sm mb-2 capitalize">
                  <input 
                    type="checkbox" 
                    checked={show[k]}
                    onChange={() => setShow(s => ({ ...s, [k]: !s[k] }))}
                    className="w-4 h-4 accent-blue-500"
                  />
                  {k.replace(/([A-Z])/g, ' $1')}
                </label>
              ))}
          </section>

          {/* Animation Controls */}
          <section className="mb-6">
            <h4 className="text-sm font-medium mb-3">Animation</h4>
            <label className="flex items-center gap-2 text-sm mb-3">
              <input 
                type="checkbox" 
                checked={anim.animate}
                onChange={() => setAnim(a => ({ ...a, animate: !a.animate }))}
                className="w-4 h-4 accent-blue-500"
              />
              Enable Animation
            </label>
            
            <div className="mb-3">
              <label className="text-xs text-gray-300 mb-1 block">Speed: {anim.speed.toFixed(1)}x</label>
              <input 
                type="range" 
                min={0.1} 
                max={5} 
                step={0.1}
                value={anim.speed}
                onChange={e => setAnim(a => ({ ...a, speed: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <label className="flex items-center gap-2 text-sm mb-3">
              <input 
                type="checkbox" 
                checked={anim.reverse}
                onChange={() => setAnim(a => ({ ...a, reverse: !a.reverse }))}
                className="w-4 h-4 accent-blue-500"
              />
              Reverse Direction
            </label>
          </section>

          {/* Static angles - show regardless of animation state */}
          <section className="mb-6">
            <h4 className="text-sm font-medium mb-3">Quick Angles</h4>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[0, 90, 180, 270].map(a => (
                <button 
                  key={a}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    angle === a && !anim.animate ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                  onClick={() => {
                    setAngle(a);
                    setAnim(prev => ({ ...prev, animate: false }));
                  }}>
                  {a}°
                </button>
              ))}
            </div>
            <div className="mb-2">
              <label className="text-xs text-gray-300 mb-1 block">Custom Angle: {angle}°</label>
              <input 
                type="range" 
                min={0} 
                max={360} 
                value={angle}
                onChange={e => {
                  setAngle(parseInt(e.target.value));
                  if (anim.animate) {
                    setAnim(prev => ({ ...prev, animate: false }));
                  }
                }}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </section>

          {/* Background */}
          <section className="mb-6">
            <h4 className="text-sm font-medium mb-3">Background</h4>
            <div className="flex gap-2 mb-3">
              <input 
                type="color" 
                value={bgHex}
                onChange={e => setBgHex(e.target.value)}
                className="w-12 h-8 rounded"
              />
              <input 
                type="text" 
                value={bgHex.substring(1)}
                onChange={e => setBgHex('#' + e.target.value)}
                className="flex-1 text-xs bg-gray-700 border border-gray-600 rounded px-2 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                className="flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 text-xs px-2 py-2 rounded border border-gray-600 transition-colors"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setBgImg(ev.target!.result as string);
                    reader.readAsDataURL(file);
                  };
                  input.click();
                }}>
                <Upload className="w-3 h-3" />
                Add Image
              </button>
              <button 
                className="bg-red-600 hover:bg-red-700 text-xs px-2 py-2 rounded transition-colors"
                onClick={() => setBgImg(null)}>
                Clear BG
              </button>
            </div>
          </section>

          {/* Model selector */}
          <section className="mb-6">
            <h4 className="text-sm font-medium mb-3">T-shirt Style</h4>
            <div className="grid grid-cols-1 gap-2">
              {(['men', 'women', 'long'] as ModelType[]).map(m => (
                <button 
                  key={m}
                  className={`text-sm px-3 py-2 rounded border transition-colors ${
                    model === m 
                      ? 'bg-blue-600 border-blue-500' 
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                  onClick={() => setModel(m)}>
                  {m === 'men' ? 'Men\'s T-shirt' : m === 'women' ? 'Women\'s T-shirt' : 'Long Sleeve'}
                </button>
              ))}
            </div>
          </section>

          {/* Actions */}
          <section className="space-y-3">
            <button 
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-3 rounded font-semibold transition-colors"
              onClick={() => alert('Cart functionality would be implemented here')}>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            <button 
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
              onClick={() => alert('Share functionality would be implemented here')}>
              <Share2 className="w-4 h-4" />
              Share Design
            </button>
            <button 
              className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded border border-gray-600 transition-colors"
              onClick={resetDesign}>
              <RotateCcw className="w-4 h-4" />
              Reset Design
            </button>
          </section>
        </aside>

        {/* Main viewer */}
        <main className="flex-1 flex flex-col items-center justify-center bg-gray-900 relative">
          <div ref={mountRef} className="w-full h-full flex items-center justify-center" />
          
          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-gray-300">
            🖱️ Drag to rotate • 🖲️ Scroll to zoom
          </div>

          {/* Bottom toolbar */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              className="flex items-center gap-1 bg-gray-800/90 hover:bg-gray-700 text-xs px-3 py-2 rounded-lg border border-gray-600 backdrop-blur-sm transition-colors"
              onClick={addImage}>
              <ImagePlus className="w-4 h-4" />
              Add Image
            </button>
            <button 
              className="flex items-center gap-1 bg-gray-800/90 hover:bg-gray-700 text-xs px-3 py-2 rounded-lg border border-gray-600 backdrop-blur-sm transition-colors"
              onClick={addText}>
              <span className="text-lg font-bold">T</span>
              Add Text
            </button>
            <button 
              className="flex items-center gap-1 bg-gray-800/90 hover:bg-gray-700 text-xs px-3 py-2 rounded-lg border border-gray-600 backdrop-blur-sm transition-colors"
              onClick={() => {
                if (rendererRef.current) {
                  rendererRef.current.render(sceneRef.current!, cameraRef.current!);
                  rendererRef.current.domElement.toBlob(blob => {
                    if (blob) {
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'tshirt_design.png';
                      link.click();
                      URL.revokeObjectURL(url);
                    }
                  });
                }
              }}>
              <Camera className="w-4 h-4" />
              Snapshot
            </button>
            <button 
              className="flex items-center gap-1 bg-gray-800/90 hover:bg-gray-700 text-xs px-3 py-2 rounded-lg border border-gray-600 backdrop-blur-sm transition-colors"
              onClick={() => alert('Layout download would be implemented here')}>
              <Download className="w-4 h-4" />
              Layout
            </button>
            <button 
              className="flex items-center gap-1 bg-gray-800/90 hover:bg-gray-700 text-xs px-3 py-2 rounded-lg border border-gray-600 backdrop-blur-sm transition-colors"
              onClick={() => alert('Video rendering would be implemented here')}>
              <Video className="w-4 h-4" />
              Video
            </button>
          </div>
        </main>
      </div>

      {/* Custom CSS for better styling */}
      <style>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        .slider::-webkit-slider-track {
          background: #374151;
          height: 8px;
          border-radius: 4px;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: #3b82f6;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          cursor: pointer;
          margin-top: -6px;
        }

        .slider::-moz-range-track {
          background: #374151;
          height: 8px;
          border-radius: 4px;
          border: none;
        }

        .slider::-moz-range-thumb {
          background: #3b82f6;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          margin-top: -6px;
        }

        .slider:focus {
          outline: none;
        }

        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        .slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

export default TShirtDesigner;