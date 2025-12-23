import React, { useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Center, ContactShadows, Html, useProgress } from "@react-three/drei";
import { Type, Palette, Upload, Download, Image as ImageIcon, ChevronLeft, X, Save, Trash, Minus, Plus, Maximize } from "lucide-react";
import * as THREE from "three";
import { useStore } from "../../store/useStore";

import DynamicModel from "./DynamicModel";
import PatternZone from "./PatternZone";
import api from "../../api/axios";
import { processWireframeToSolid } from "../utils/maskProcessor";



// Helper Button
const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, icon: Icon }) => {
    const baseStyle = "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40",
        secondary: "bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 shadow-sm",
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
            {Icon && <Icon size={18} />}
            {children}
        </button>
    );
};

// Simple Loading Screen
const Loader = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-indigo-600">{progress.toFixed(0)}%</p>
            </div>
        </Html>
    );
};

const DebouncedColorPicker = ({ value, onChange, className }) => {
    const [localColor, setLocalColor] = useState(value);

    React.useEffect(() => {
        setLocalColor(value);
    }, [value]);

    const handleChange = (e) => {
        const newVal = e.target.value;
        setLocalColor(newVal);
        // Debounce update to parent
        const timeoutId = setTimeout(() => onChange(newVal), 200);
        return () => clearTimeout(timeoutId);
    };

    return (
        <input
            type="color"
            value={localColor}
            onChange={handleChange}
            className={className}
        />
    );
};

const DesignPhase = ({ productId, glbUrl, meshConfig, meshTextures, globalMaterial, activeStickerUrl, setGlobalMaterial, setActiveStickerUrl, onBack, onUpdateTexture }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedMesh, setSelectedMesh] = useState(null);
    const [meshColors, setMeshColors] = useState({});
    const [meshNormals, setMeshNormals] = useState({}); // New state for baked normals
    const [meshList, setMeshList] = useState([]); // Missing state for mesh list

    // Auto-select first mesh
    React.useEffect(() => {
        if (!selectedMesh && meshConfig && Object.keys(meshConfig).length > 0) {
            const firstMesh = Object.keys(meshConfig).find(key => meshConfig[key].maskUrl);
            if (firstMesh) setSelectedMesh(firstMesh);
        }
    }, [meshConfig, selectedMesh]);

    // Store
    const { materialSettings, setMaterialSetting, saveMaterialConfiguration, productName, subcategory } = useStore();
    const [isSaving, setIsSaving] = useState(false);
    const [hdrUrl] = useState(`/hdr/studio_soft.hdr?v=${Date.now()}`);

    const handleSaveProduct = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();

            // Product Details
            formData.append('product_details[name]', productName || 'Untitled Product');
            formData.append('product_details[subcategory]', subcategory);

            // 1. Fetch GLB Blob
            const glbRes = await fetch(glbUrl);
            const glbBlob = await glbRes.blob();
            formData.append('product_details[glb]', glbBlob, 'model.glb');

            // 2. Process Masks
            // Iterate over active masks and map them to indexed svgdetails
            let maskIndex = 0;
            const processingPromises = Object.entries(meshConfig)
                .filter(([_, cfg]) => cfg.maskUrl)
                .map(async ([meshName, cfg]) => {
                    try {
                        const currentIndex = maskIndex++; // Capture current index and increment

                        // Mesh Name
                        formData.append(`svgdetails[${currentIndex}][mesh_name]`, meshName);

                        // Processed White Mask
                        const solidDataUrl = await processWireframeToSolid(cfg.maskUrl);
                        const res = await fetch(solidDataUrl);
                        const blob = await res.blob();
                        formData.append(`svgdetails[${currentIndex}][white]`, blob, `${meshName}_white.png`);

                        // Original Wireframe
                        const origRes = await fetch(cfg.maskUrl);
                        const origBlob = await origRes.blob();
                        formData.append(`svgdetails[${currentIndex}][original]`, origBlob, `${meshName}_original.svg`);

                    } catch (err) {
                        console.error(`Failed to process mask for ${meshName}`, err);
                    }
                });

            await Promise.all(processingPromises);

            // 3. Send API Request
            if (productId) {
                // UPDATE Mode
                await api.put(`/product/update/${productId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Product Updated Successfully!');
            } else {
                // CREATE Mode
                await api.post('/product/create', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Product Saved Successfully!');
            }

        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save product. Check console.");
        } finally {
            setIsSaving(false);
        }
    };

    const applyNormal = (meshName, normalUri) => {
        setMeshNormals(prev => {
            if (!normalUri) {
                const newState = { ...prev };
                delete newState[meshName];
                return newState;
            }
            return { ...prev, [meshName]: normalUri };
        });
    };

    return (
        <div className="flex w-full h-full relative bg-[#f8f9fc] overflow-hidden">

            {/* LEFT SIDEBAR: STRIP ONLY */}
            <div className="w-20 bg-white border-r border-zinc-200 flex flex-col items-center py-6 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 mb-8">
                    P
                </div>

                <div className="flex flex-col gap-6 w-full px-2">
                    <TooltipButton icon={ImageIcon} label="Assets" onClick={() => setSidebarOpen(prev => !prev)} isActive={sidebarOpen} />
                    <TooltipButton icon={Type} label="Text" />
                    <TooltipButton icon={Palette} label="Color" />
                </div>

                <div className="mt-auto">
                    {/* ... Back button ... */}
                </div>
            </div>

            {/* FLOATING DRAWER */}
            <div className={`w-80 bg-white/90 backdrop-blur-3xl border-r border-zinc-200/50 flex flex-col z-40 absolute left-20 top-0 bottom-0 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 mb-1">Assets Library</h2>
                        <p className="text-xs text-zinc-400">Manage your visuals & materials</p>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-zinc-600"><X size={20} /></button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-8">
                    {/* Existing Assets Content */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Uploads</label>
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-zinc-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group bg-zinc-50/50">
                            <Upload size={24} className="text-zinc-300 group-hover:text-indigo-500 mb-2 transition-colors" />
                            <span className="text-xs font-bold text-zinc-500 group-hover:text-indigo-600">Upload Image</span>
                            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) setActiveStickerUrl(URL.createObjectURL(e.target.files[0])); }} className="hidden" />
                        </label>
                    </div>

                    {/* Active Sticker Control */}
                    {activeStickerUrl && (
                        <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                                    <img src={activeStickerUrl} alt="Active" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-700">Active Sticker</p>
                                    <p className="text-[10px] text-zinc-400">Ready to place</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveStickerUrl(null)}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                                title="Remove Sticker"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    )}

                    {/* Selected Part Color Control */}
                    {selectedMesh && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <label className="text-xs font-bold text-indigo-500 uppercase tracking-widest block">
                                Selected: {selectedMesh}
                            </label>
                            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-indigo-900">Pattern Color</span>
                                    <div className="flex gap-2 items-center">
                                        <DebouncedColorPicker
                                            value={meshColors[selectedMesh] || globalMaterial.color || "#ffffff"}
                                            onChange={(val) => setMeshColors(prev => ({ ...prev, [selectedMesh]: val }))}
                                            className="w-8 h-8 rounded-full border border-indigo-200 cursor-pointer overflow-hidden p-0 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Studio Settings (Admin)</label>
                            <button onClick={saveMaterialConfiguration} className="text-indigo-600 hover:text-indigo-800 transition-colors" title="Save Preset">
                                <Save size={14} />
                            </button>
                        </div>
                        {/* ... Material Sliders ... */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-5">
                            {/* Roughness */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>Roughness</span>
                                    <span>{materialSettings.roughness}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={materialSettings.roughness}
                                    onChange={(e) => setMaterialSetting("roughness", Number(e.target.value))}
                                    className="w-full h-1 bg-zinc-200 rounded-lg appearance-none accent-indigo-600"
                                />
                            </div>
                            {/* Sheen */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>Sheen (Velvet)</span>
                                    <span>{materialSettings.sheen}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={materialSettings.sheen}
                                    onChange={(e) => setMaterialSetting("sheen", Number(e.target.value))}
                                    className="w-full h-1 bg-zinc-200 rounded-lg appearance-none accent-indigo-600"
                                />
                            </div>
                            {/* Sheen Roughness */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>Sheen Spread</span>
                                    <span>{materialSettings.sheenRoughness}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={materialSettings.sheenRoughness}
                                    onChange={(e) => setMaterialSetting("sheenRoughness", Number(e.target.value))}
                                    className="w-full h-1 bg-zinc-200 rounded-lg appearance-none accent-indigo-600"
                                />
                            </div>
                            {/* Metalness */}
                            <div className="space-y-1 pt-4 border-t border-zinc-100">
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>Metalness</span>
                                    <span>{materialSettings.metalness}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={materialSettings.metalness}
                                    onChange={(e) => setMaterialSetting("metalness", Number(e.target.value))}
                                    className="w-full h-1 bg-zinc-200 rounded-lg appearance-none accent-indigo-600"
                                />
                            </div>
                        </div>
                        {/* Fabric Texture */}
                        <div className="space-y-3 pt-4 border-t border-zinc-100">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>Fabric Texture</span>
                                    <span>{materialSettings.fabricStrength}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={materialSettings.fabricStrength || 0}
                                    onChange={(e) => setMaterialSetting("fabricStrength", Number(e.target.value))}
                                    className="w-full h-1 bg-zinc-200 rounded-lg appearance-none accent-indigo-600"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400">Pattern Type</label>
                                <select
                                    value={materialSettings.fabricType || 'plain'}
                                    onChange={(e) => setMaterialSetting("fabricType", e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 outline-none focus:border-indigo-500"
                                >
                                    <option value="plain">Plain Weave</option>
                                    <option value="twill">Twill (Denim)</option>
                                    <option value="knit">Knit</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ... CENTER WORKSPACE ... */}
            <div className="flex-1 bg-[#f8f9fc] relative overflow-hidden ml-0">
                {/* Top Bar */}
                <div className="absolute top-8 left-8 z-10 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white/50 pointer-events-auto inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <h1 className="font-bold text-zinc-800 text-xs">Editor Live <span className="text-zinc-300 mx-2">|</span> <span className="text-indigo-600">{productName || 'Untitled Project'}</span></h1>
                    </div>
                </div>

                {/* Canvas Area - Grid Layout for Pattern Zones */}
                <div className="w-full h-full overflow-auto bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[length:32px_32px] p-12 pr-[480px]">
                    <div className="min-h-full grid grid-cols-2 gap-10 content-start justify-items-center pb-20 pt-10 max-w-5xl mx-auto">
                        {Object.entries(meshConfig).filter(([_, cfg]) => cfg.maskUrl).map(([meshName, cfg]) => {
                            const isSelected = selectedMesh === meshName || (!selectedMesh && meshName === Object.keys(meshConfig)[0]);
                            return (
                                <PatternZone
                                    key={meshName}
                                    meshName={meshName}
                                    maskUrl={cfg.maskUrl}
                                    stickerUrl={activeStickerUrl}
                                    onUpdateTexture={onUpdateTexture}
                                    onUpdateNormal={applyNormal} // New prop
                                    fabricType={materialSettings.fabricType} // Pass type
                                    bgColor={meshColors[meshName] || globalMaterial.color || "#ffffff"}
                                    isSelected={isSelected}
                                    onClick={() => setSelectedMesh(meshName)}
                                    onPlaceSticker={() => setActiveStickerUrl(null)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RIGHT: FLOATING 3D CARD */}
            <div className="absolute top-6 right-6 bottom-6 w-[450px] pointer-events-none flex flex-col justify-center z-40">
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col h-[700px] relative transition-all border border-zinc-100">
                    {/* 3D Header */}
                    <div className="absolute top-6 left-6 z-10">
                        <span className="bg-white/80 backdrop-blur-xl px-3 py-1 rounded-lg text-[10px] font-black tracking-widest text-zinc-900 border border-white/50 shadow-sm uppercase">
                            Live Render
                        </span>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 bg-[#F1F5F9] relative">
                        <Canvas
                            shadows
                            camera={{ position: [0, 0, 3.5], fov: 40 }}
                            gl={{
                                preserveDrawingBuffer: true,
                                antialias: true,
                                toneMapping: THREE.ACESFilmicToneMapping,
                                toneMappingExposure: 1.2
                            }}
                            dpr={[1, 2]}
                        >
                            <color attach="background" args={['#F1F5F9']} />

                            <ambientLight intensity={0.5} />

                            <spotLight
                                position={[5, 10, 5]}
                                angle={0.4}
                                penumbra={0.5}
                                intensity={1.2}
                                castShadow
                                shadow-mapSize={[2048, 2048]}
                                shadow-bias={-0.0001}
                            />

                            <pointLight position={[-10, 5, -5]} intensity={0.5} color="#eef2ff" />

                            <Environment preset="city" blur={1} />

                            <React.Suspense fallback={<Loader />}>
                                <Center position={[0, -0.2, 0]}>
                                    <DynamicModel
                                        url={glbUrl}
                                        meshTextures={meshTextures}
                                        meshNormals={meshNormals} // Pass normals
                                        materialProps={{ color: globalMaterial.color }}
                                        setMeshList={setMeshList}
                                    />
                                </Center>
                                <ContactShadows
                                    position={[0, -1.4, 0]}
                                    opacity={0.4}
                                    scale={20}
                                    blur={2.5}
                                    color="#000000"
                                />
                            </React.Suspense>
                            <OrbitControls
                                makeDefault
                                minDistance={1.5}
                                maxDistance={10}
                                enablePan={false}
                                enableDamping
                                dampingFactor={0.05}
                                minPolarAngle={Math.PI / 4}
                                maxPolarAngle={Math.PI / 1.8}
                            />
                        </Canvas>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-6 bg-white border-t border-zinc-100 flex flex-col gap-3">
                        <div className="flex gap-4">
                            <Button
                                onClick={handleSaveProduct}
                                disabled={isSaving}
                                variant="primary"
                                icon={isSaving ? undefined : Save}
                                className="w-full py-4 shadow-xl shadow-indigo-500/20"
                            >
                                {isSaving ? "Saving..." : "Save Product"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal Tooltip Button
const TooltipButton = ({ icon: Icon, onClick, isActive }) => (
    <div className="group relative flex justify-center">
        <button onClick={onClick} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600'}`}>
            <Icon size={22} />
        </button>
    </div>
);

export default DesignPhase;
