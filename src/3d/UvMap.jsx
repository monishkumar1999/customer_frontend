import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Center } from "@react-three/drei";
import * as THREE from "three";
import { Stage, Layer, Image as KImage, Transformer, Rect } from "react-konva";

/* =========================================================
   UTILS & HELPERS
   ========================================================= */
const dotGridStyle = {
  backgroundColor: "#121212",
  backgroundImage: "radial-gradient(#333 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};

// Simple debounce to stop toDataURL from freezing the UI
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  return debouncedCallback;
};

const ToolButton = ({ icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-4 gap-1 transition-colors border-l-2
      ${isActive 
        ? "bg-[#1e1e1e] text-blue-400 border-blue-500" 
        : "text-zinc-500 hover:text-zinc-200 border-transparent hover:bg-[#1e1e1e]"
      }`}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

/* =========================================================
   2. 3D PREVIEW COMPONENT
   ========================================================= */
function DynamicModel({ url, activeMesh, meshTextures, setMeshList }) {
  const { scene } = useGLTF(url);
  
  // Clone scene only once to avoid mutating the original cached GLTF
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    const meshes = [];

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        meshes.push(child.name);
        
        // Only update if we have a texture for this specific mesh
        if (meshTextures[child.name]) {
          const newMap = meshTextures[child.name];

          // Dispose old material map to free memory
          if (child.material.map && child.material.map.uuid !== newMap.uuid) {
             child.material.map.dispose();
          }

          // Create new material to avoid side-effects on shared materials
          if (!child.userData.originalMat) child.userData.originalMat = child.material.clone();
          
          child.material = child.userData.originalMat.clone();
          child.material.map = newMap;
          child.material.map.flipY = false; 
          child.material.map.colorSpace = THREE.SRGBColorSpace;
          child.material.metalness = 0.1;       
          child.material.roughness = 0.8;
          child.material.needsUpdate = true;
        }
      }
    });

    setMeshList((prev) => (prev.length === meshes.length ? prev : [...new Set(meshes)]));
  }, [clonedScene, meshTextures, setMeshList]);

  return (
    <Center>
        <primitive object={clonedScene} />
    </Center>
  );
}

/* =========================================================
   3. 2D EDITOR (OPTIMIZED)
   ========================================================= */
function WorkspaceEditor({ uvUrl, stickerUrl, backgroundUrl, fabricColor, onExport }) {
  const [uvImage, setUvImage] = useState(null);
  const [bgTexture, setBgTexture] = useState(null);
  
  const [stickersList, setStickersList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const stageRef = useRef(null);
  const trRef = useRef(null);
  const containerRef = useRef(null);

  const [stageSpec, setStageSpec] = useState({ 
      width: 0, height: 0, scale: 1, naturalWidth: 1, naturalHeight: 1, ready: false
  });

  const loadImage = (url, callback) => {
    if (!url) return;
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => callback(img);
  };

  // 1. Setup Canvas Dimensions (Optimized ResizeObserver)
  useEffect(() => {
    if (!containerRef.current || !uvUrl) return;
    
    const updateDimensions = () => {
        if (!containerRef.current) return;
        loadImage(uvUrl, (img) => {
            setUvImage(img);
            const containerW = containerRef.current.clientWidth || 800;
            const containerH = containerRef.current.clientHeight || 600;
            const imgW = img.naturalWidth || 1000;
            const imgH = img.naturalHeight || 1000;
            const scaleW = (containerW - 40) / imgW;
            const scaleH = (containerH - 40) / imgH;
            const finalScale = Math.min(scaleW, scaleH);

            setStageSpec({
                width: imgW * finalScale,
                height: imgH * finalScale,
                scale: finalScale,
                naturalWidth: imgW,
                naturalHeight: imgH,
                ready: true
            });
        });
    };

    const observer = new ResizeObserver(() => {
        // Debounce resize slightly
        window.requestAnimationFrame(updateDimensions);
    });
    
    observer.observe(containerRef.current);
    updateDimensions();
    
    return () => observer.disconnect();
  }, [uvUrl]);

  // 2. Load Images
  useEffect(() => { if (backgroundUrl) loadImage(backgroundUrl, (img) => setBgTexture(img)); }, [backgroundUrl]);

  useEffect(() => {
    if (!stickerUrl) return;
    loadImage(stickerUrl, (img) => {
        const newSticker = {
            id: Date.now().toString(),
            image: img,
            x: (stageSpec.naturalWidth / 2) - 100,
            y: (stageSpec.naturalHeight / 2) - 100,
            width: 200,
            height: 200,
            rotation: 0
        };
        setStickersList(prev => [...prev, newSticker]);
        setSelectedId(newSticker.id);
        triggerExport(); // Trigger export on new sticker
    });
  }, [stickerUrl]);

  // 3. Update Transformer
  useEffect(() => {
    if (selectedId && trRef.current && stageRef.current) {
        const node = stageRef.current.findOne('#' + selectedId);
        if (node) {
            trRef.current.nodes([node]);
            trRef.current.getLayer().batchDraw();
        }
    } else if (trRef.current) {
        trRef.current.nodes([]);
    }
  }, [selectedId, stickersList]);

  // 4. Handle Delete
  useEffect(() => {
      const handleKeyDown = (e) => {
          if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
              setStickersList(prev => prev.filter(s => s.id !== selectedId));
              setSelectedId(null);
              triggerExport();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  /* ==========================================
     OPTIMIZED EXPORT LOGIC (DEBOUNCED)
     ========================================== */
  const performExport = () => {
    if (!stageRef.current) return;
    
    // Hide UI elements before snap
    if (trRef.current) trRef.current.nodes([]);
    const uvNode = stageRef.current.findOne('#uv-overlay');
    if (uvNode) uvNode.visible(false);

    stageRef.current.batchDraw();

    // Export
    const pixelRatio = Math.min(1 / stageSpec.scale, 2); // Limit resolution multiplier to 2x max
    const uri = stageRef.current.toDataURL({ pixelRatio: pixelRatio });
    
    onExport(uri);
    
    // Restore UI
    if (uvNode) uvNode.visible(true);
    if (selectedId && trRef.current) {
         const node = stageRef.current.findOne('#' + selectedId);
         if (node) trRef.current.nodes([node]);
    }
    stageRef.current.batchDraw();
  };

  // Wait 500ms after user stops interacting to generate texture
  const triggerExport = useDebounce(performExport, 500);

  // Trigger on color change
  useEffect(() => {
      if(stageSpec.ready) triggerExport();
  }, [fabricColor]);

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.attrs.id === 'bg-layer' || e.target.attrs.id === 'uv-overlay';
    if (clickedOnEmpty) setSelectedId(null);
  };

  if (!uvUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#1e1e1e] flex items-center justify-center text-4xl shadow-inner animate-pulse">📂</div>
        <p className="font-medium">Upload a UV Map to Start</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col relative">
      <div ref={containerRef} className="flex-1 w-full flex items-center justify-center overflow-hidden p-8">
        {stageSpec.ready && (
            <div className="relative shadow-2xl" style={{ width: stageSpec.width, height: stageSpec.height }}>
                <Stage 
                    width={stageSpec.width} 
                    height={stageSpec.height} 
                    scaleX={stageSpec.scale}
                    scaleY={stageSpec.scale}
                    ref={stageRef}
                    onMouseDown={checkDeselect}
                    onTouchStart={checkDeselect}
                    onMouseUp={triggerExport} // Use debounced export
                    onTouchEnd={triggerExport}
                >
                    <Layer>
                        {/* 1. SOLID FABRIC COLOR */}
                        <Rect 
                            width={stageSpec.naturalWidth} 
                            height={stageSpec.naturalHeight} 
                            fill={fabricColor || "#ffffff"}
                            id="bg-layer" 
                        />

                        {/* 2. USER BACKGROUND IMAGE */}
                        {bgTexture && (
                            <KImage 
                                image={bgTexture}
                                width={stageSpec.naturalWidth} 
                                height={stageSpec.naturalHeight}
                                listening={false}
                            />
                        )}

                        {/* 3. MULTIPLE STICKERS */}
                        {stickersList.map((sticker) => (
                            <KImage
                                key={sticker.id}
                                id={sticker.id}
                                image={sticker.image}
                                x={sticker.x}
                                y={sticker.y}
                                width={sticker.width}
                                height={sticker.height}
                                draggable
                                onClick={() => setSelectedId(sticker.id)}
                                onTap={() => setSelectedId(sticker.id)}
                                onDragMove={null} // Don't export on drag move, too heavy
                                onDragEnd={(e) => {
                                    const idx = stickersList.findIndex(s => s.id === sticker.id);
                                    const newStickers = [...stickersList];
                                    newStickers[idx] = { ...newStickers[idx], x: e.target.x(), y: e.target.y() };
                                    setStickersList(newStickers);
                                    triggerExport(); // Export on drop
                                }}
                                onTransformEnd={triggerExport} // Export on scale/rotate end
                            />
                        ))}

                        {/* 4. UV WIREFRAME */}
                        <KImage 
                            id="uv-overlay"
                            image={uvImage} 
                            opacity={0.4} 
                            listening={false} 
                        />
                    </Layer>

                    <Layer>
                        <Transformer
                            ref={trRef}
                            borderStroke="#0099ff"
                            anchorStroke="#0099ff"
                            anchorFill="#ffffff"
                            anchorSize={10}
                            borderDash={[4, 4]}
                        />
                    </Layer>
                </Stage>
            </div>
        )}
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
         {selectedId && (
             <button 
                onClick={() => {
                    setStickersList(prev => prev.filter(s => s.id !== selectedId));
                    setSelectedId(null);
                    triggerExport();
                }}
                className="bg-red-500/80 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-bold shadow-lg"
             >
                 Delete Selected
             </button>
         )}
      </div>
    </div>
  );
}

/* =========================================================
   4. MAIN APP COMPONENT
   ========================================================= */
export default function UvMap() {
  const [glbUrl, setGlbUrl] = useState(null);
  const [meshList, setMeshList] = useState([]);
  const [activeMesh, setActiveMesh] = useState("ALL");
  const [activeTool, setActiveTool] = useState("uploads");
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [uvMap, setUvMap] = useState({});
  const [stickers, setStickers] = useState({}); 
  const [backgrounds, setBackgrounds] = useState({}); 
  const [fabricColors, setFabricColors] = useState({});
  const [meshTextures, setMeshTextures] = useState({}); 

  const handleGLBUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        if(glbUrl) URL.revokeObjectURL(glbUrl); // Cleanup old URL
        setGlbUrl(URL.createObjectURL(file));
        setMeshList([]); setActiveMesh("ALL");
        setUvMap({}); setStickers({}); setBackgrounds({}); setFabricColors({}); setMeshTextures({});
    }
  };

  const handleAssetUpload = (type, e) => {
    const file = e.target.files[0];
    if (!file || activeMesh === "ALL") return;
    const url = URL.createObjectURL(file);
    if (type === 'uv') setUvMap(prev => ({ ...prev, [activeMesh]: url }));
    if (type === 'sticker') setStickers(prev => ({ ...prev, [activeMesh]: url })); 
    if (type === 'background') setBackgrounds(prev => ({ ...prev, [activeMesh]: url }));
  };

  const handleColorChange = (e) => {
      const color = e.target.value;
      setFabricColors(prev => ({ ...prev, [activeMesh]: color }));
  };

  const applyTexture = useCallback((meshName, dataUrl) => {
    // Basic texture loader without complex callback nesting
    const loader = new THREE.TextureLoader();
    const tex = loader.load(dataUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    
    setMeshTextures(prev => ({ ...prev, [meshName]: tex }));
  }, []);

  return (
    <div className="flex h-screen bg-[#0e0e0e] text-white font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR */}
      <div className="w-20 bg-[#121212] border-r border-white/5 flex flex-col z-20 shadow-xl">
         <div className="p-4 mb-4"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-lg">3D</div></div>
         <div className="flex-1 space-y-2">
             <ToolButton icon="📂" label="Project" isActive={activeTool === 'project'} onClick={() => setActiveTool('project')} />
             <ToolButton icon="☁️" label="Uploads" isActive={activeTool === 'uploads'} onClick={() => setActiveTool('uploads')} />
             <ToolButton icon="🎨" label="Colors" isActive={activeTool === 'colors'} onClick={() => setActiveTool('colors')} />
         </div>
      </div>

      {/* 2. ASSET SIDEBAR */}
      <div className="w-72 bg-[#18181b] border-r border-white/5 flex flex-col z-10">
          <div className="p-6 border-b border-white/5"><h2 className="text-lg font-bold tracking-tight text-zinc-100">{activeTool === 'uploads' ? 'Library' : (activeTool === 'colors' ? 'Materials' : 'Project')}</h2></div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Context: PROJECT */}
              {activeTool === 'project' && (
                  <>
                     {!glbUrl && <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-zinc-700 rounded-xl hover:border-blue-500 cursor-pointer"><span className="text-2xl mb-2">📥</span><span className="text-xs font-bold uppercase text-zinc-400">Import GLB</span><input type="file" accept=".glb" onChange={handleGLBUpload} className="hidden" /></label>}
                     {glbUrl && <div className="space-y-1"><button onClick={() => setActiveMesh("ALL")} className={`w-full text-left px-3 py-3 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 border transition-all ${activeMesh === "ALL" ? "bg-white text-black border-white" : "bg-black border-zinc-800 text-zinc-400"}`}>Overview</button>{meshList.map(mesh => (<button key={mesh} onClick={() => setActiveMesh(mesh)} className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition-all border ${activeMesh === mesh ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-800/30 border-transparent text-zinc-400'}`}><span className="truncate">{mesh}</span></button>))}</div>}
                  </>
              )}

              {/* Context: UPLOADS */}
              {activeTool === 'uploads' && (
                  <>
                    {activeMesh === "ALL" ? <div className="text-center mt-10 opacity-50"><p className="text-sm">Select a layer first.</p></div> : (
                        <div className="space-y-4">
                            <div className="bg-[#121212] p-4 rounded-xl border border-white/5"><h3 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase">1. UV Guide</h3><label className="flex items-center gap-3 w-full p-3 bg-zinc-900 rounded-lg cursor-pointer hover:bg-zinc-800 border border-zinc-700"><span className="text-xl">📐</span><div className="text-xs font-bold text-zinc-200">Upload UV Map</div><input type="file" accept="image/*" onChange={(e) => handleAssetUpload('uv', e)} className="hidden" /></label></div>
                            <div className="bg-[#121212] p-4 rounded-xl border border-white/5"><h3 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase">2. Background Img</h3><label className="flex items-center gap-3 w-full p-3 bg-zinc-900 rounded-lg cursor-pointer hover:bg-zinc-800 border border-zinc-700"><span className="text-xl">🌄</span><div className="text-xs font-bold text-zinc-200">Upload Image</div><input type="file" accept="image/*" onChange={(e) => handleAssetUpload('background', e)} className="hidden" /></label></div>
                            <div className="bg-[#121212] p-4 rounded-xl border border-white/5"><h3 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase">3. Stickers</h3><label className="flex items-center gap-3 w-full p-3 bg-zinc-900 rounded-lg cursor-pointer hover:bg-zinc-800 border border-zinc-700"><span className="text-xl">🖼️</span><div className="text-xs font-bold text-zinc-200">Add Sticker</div><input type="file" accept="image/*" onChange={(e) => handleAssetUpload('sticker', e)} className="hidden" /></label></div>
                        </div>
                    )}
                  </>
              )}

              {/* Context: COLORS */}
              {activeTool === 'colors' && (
                  <>
                    {activeMesh === "ALL" ? <div className="text-center mt-10 opacity-50"><p className="text-sm">Select a layer first.</p></div> : (
                        <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
                            <h3 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase">Base Material Color</h3>
                            <div className="flex gap-4 items-center mt-2">
                                <input 
                                    type="color" 
                                    value={fabricColors[activeMesh] || "#ffffff"} 
                                    onChange={handleColorChange}
                                    className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent"
                                />
                                <div className="text-xs text-zinc-400 font-mono uppercase">
                                    {fabricColors[activeMesh] || "#ffffff"}
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-5 gap-2">
                                {["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#808080", "#1a1a1a"].map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => handleColorChange({target: {value: c}})}
                                        className="w-8 h-8 rounded-full border border-white/10 shadow-sm"
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                  </>
              )}
          </div>
      </div>

      {/* 3. CENTER EDITOR */}
      <div className="flex-1 relative flex flex-col bg-[#121212]" style={dotGridStyle}>
          <div className="h-16 border-b border-white/5 bg-[#121212]/80 backdrop-blur-md flex items-center justify-between px-6 z-10"><h1 className="font-bold text-lg text-white/90">{activeMesh === "ALL" ? "3D Overview" : `Editing: ${activeMesh}`}</h1></div>
          <div className="flex-1 relative overflow-hidden">
            {activeMesh !== "ALL" ? 
                <WorkspaceEditor 
                    uvUrl={uvMap[activeMesh]} 
                    stickerUrl={stickers[activeMesh]} 
                    backgroundUrl={backgrounds[activeMesh]}
                    fabricColor={fabricColors[activeMesh]} 
                    onExport={(uri) => applyTexture(activeMesh, uri)} 
                /> 
                : 
                <div className="w-full h-full flex items-center justify-center opacity-20"><h1 className="text-9xl font-black text-white">3D</h1></div>
            }
          </div>
      </div>

      {/* 4. FLOATING 3D PREVIEW */}
      {glbUrl && (
          <div className={`
              transition-all duration-300 ease-in-out bg-[#18181b] shadow-2xl border border-white/10 overflow-hidden z-50
              ${isFullScreen 
                ? "fixed inset-0 w-full h-full rounded-none"
                : "absolute top-20 right-6 w-80 h-96 rounded-2xl hover:scale-[1.02]"
              }
          `}>
              <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                  <span className="text-[10px] font-bold bg-black/50 backdrop-blur px-2 py-1 rounded text-white border border-white/10 pointer-events-auto">
                      LIVE PREVIEW
                  </span>
                  <button 
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="pointer-events-auto bg-black/50 hover:bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-lg backdrop-blur transition-colors border border-white/10"
                  >
                      {isFullScreen ? "✕" : "⛶"}
                  </button>
              </div>

              {/* CRITICAL OPTIMIZATION: frameloop="demand" + lowered dpr */}
              <Canvas 
                frameloop="demand" 
                dpr={[1, 2]} 
                camera={{ position: [0, 0, 3.5], fov: 45 }}
                gl={{ preserveDrawingBuffer: true }}
              >
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[5, 5, 5]} intensity={1.5} />
                  <Environment preset="city" />
                  <DynamicModel url={glbUrl} activeMesh={activeMesh} meshTextures={meshTextures} setMeshList={setMeshList} />
                  {/* Removed autoRotate which forces 60fps re-renders */}
                  <OrbitControls makeDefault minDistance={1.5} maxDistance={10} />
              </Canvas>
          </div>
      )}
    </div>
  );
}