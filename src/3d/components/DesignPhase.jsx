import React, { useCallback, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Center, ContactShadows, Html, useProgress } from "@react-three/drei";
import { Type, Palette, Upload, Download, Image as ImageIcon, ChevronLeft, X, Save, Trash, Minus, Plus, Maximize, Settings, Layers, Wand2, Check, Droplet, Sun, Moon, Sunset, Scan, Lightbulb, Cloud, Trees, Building2, Menu, Eye, EyeOff, RotateCcw, RotateCw } from "lucide-react";
import * as THREE from "three";
import AttractiveColorPicker from "../../components/ui/AttractiveColorPicker";
import { useStore } from "../../store/useStore";

import DynamicModel from "./DynamicModel";
import PatternZone from "./PatternZone";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import api from "../../api/axios";



const PRESET_COLORS = [
    "#000000", "#FFFFFF", "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#8B5CF6"
];

const FONTS = [
    { name: "Inter", family: "Inter" },
    { name: "Roboto", family: "Roboto" },
    { name: "Lato", family: "Lato" },
    { name: "Montserrat", family: "Montserrat" },
    { name: "Poppins", family: "Poppins" },
    { name: "Open Sans", family: "Open Sans" },
    { name: "Oswald", family: "Oswald" },
    { name: "Playfair", family: "Playfair Display" },
    { name: "Merriweather", family: "Merriweather" },
    { name: "Lora", family: "Lora" },
    { name: "Cinzel", family: "Cinzel" },
    { name: "Bebas Neue", family: "Bebas Neue" },
    { name: "Anton", family: "Anton" },
    { name: "Righteous", family: "Righteous" },
    { name: "Lobster", family: "Lobster" },
    { name: "Pacifico", family: "Pacifico" },
    { name: "Dancing Script", family: "Dancing Script" },
    { name: "Satisfaction", family: "Satisfy" },
    { name: "Caveat", family: "Caveat" },
    { name: "Indie Flower", family: "Indie Flower" },
    { name: "Sacramento", family: "Sacramento" },
    { name: "Permanent Marker", family: "Permanent Marker" },
    { name: "Inconsolata", family: "Inconsolata" },
];

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

// Background Texture Helper
const BackgroundTexture = ({ url }) => {
    const { scene } = useThree();
    React.useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load(url, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            scene.background = texture;
        });
        return () => { scene.background = null; };
    }, [url, scene]);
    return null;
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
    return (
        <div className={`relative ${className}`}>
            <AttractiveColorPicker
                color={value}
                onChange={onChange}
                className="w-full"
            />
        </div>
    );
};

const DesignPhase = ({ productId, glbUrl, meshConfig, meshTextures, globalMaterial, activeStickerUrl, setGlobalMaterial, setActiveStickerUrl, onBack, onUpdateTexture }) => {
    // Targeted Selectors for Stability
    const materialSettings = useStore(state => state.materialSettings);
    const setMaterialSetting = useStore(state => state.setMaterialSetting);
    const productName = useStore(state => state.productName);
    const meshColors = useStore(state => state.meshColors);
    const setMeshColor = useStore(state => state.setMeshColor);
    const meshStickers = useStore(state => state.meshStickers);
    const setMeshStickers = useStore(state => state.setMeshStickers);

    const { undo, redo, clear } = useStore.temporal.getState();

    const [activeTab, setActiveTab] = useState('design'); // 'design', 'uploads', 'studio'
    const [selectedMesh, setSelectedMesh] = useState(null);

    // Responsive UI State
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [previewOpen, setPreviewOpen] = useState(true);

    // Text Tool State
    const [textInput, setTextInput] = useState("hello");
    const [selectedFont, setSelectedFont] = useState(FONTS[0].family);
    const [textColor, setTextColor] = useState("#000000");
    const [opacity, setOpacity] = useState(1);
    const [activeTextToPlace, setActiveTextToPlace] = useState(null);
    const [editingSelection, setEditingSelection] = useState(null); // { meshName, id, type, text, fontFamily, fill, opacity }

    const [meshNormals, setMeshNormals] = useState({}); // New state for baked normals
    const [meshList, setMeshList] = useState([]); // Missing state for mesh list

    // Environment & Background State
    const [envPreset, setEnvPreset] = useState('studio');
    const [bgType, setBgType] = useState('solid'); // 'solid' | 'image'
    const [bgColor, setBgColor] = useState('#F1F5F9');
    const [bgImage, setBgImage] = useState(null);
    // showBackground is replaced by bgType logic (solid/image vs transparent handled by removing both?)
    // Actually, user might want "Transparent" which means NO background.
    // Let's keep a "transparent" mode or just "solid" with null?
    // User requested "Light", "Dark", "Custom", "Image". 
    // Transparent is useful for export, let's keep it as a 'transparent' type.

    const [showBgPicker, setShowBgPicker] = useState(false);
    const customBgBtnRef = useRef(null);
    const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (showBgPicker && customBgBtnRef.current) {
            const rect = customBgBtnRef.current.getBoundingClientRect();
            // Position it above the button, aligned to the left
            setPickerPos({
                top: rect.top - 8, // 8px margin
                left: rect.left
            });
        }
    }, [showBgPicker]);

    // Derived: showBackground was boolean. Now we check type.
    const showBackground = bgType !== 'transparent';
    const [brightness, setBrightness] = useState(1);
    const [showAuxLights, setShowAuxLights] = useState(true);

    // Refs
    const bgImageFileInputRef = React.useRef(null);

    const handlePatternSelect = (item) => {
        if (!item) {
            setEditingSelection(null);
            return;
        }

        // If selecting a text item, open text drawer and populate
        if (item.type === 'text') {
            setActiveTab('design');
            setTextInput(item.text);
            setSelectedFont(item.fontFamily);
            setTextColor(item.fill);
            setOpacity(item.opacity ?? 1);
            setEditingSelection(item);
            setActiveTextToPlace(null);
        } else if (item.type === 'image') {
            setActiveTab('design');
            setEditingSelection(item);
            setOpacity(item.opacity ?? 1);
        }
    };

    const updateEditingItem = (key, value) => {
        if (!editingSelection) return;

        const changes = { [key]: value };
        if (key === 'color') changes.fill = value;

        const { meshName, id } = editingSelection;
        const currentStickers = meshStickers[meshName] || [];
        const nextStickers = currentStickers.map(s => s.id === id ? { ...s, ...changes } : s);

        setMeshStickers(meshName, nextStickers);
        setEditingSelection(prev => ({ ...prev, ...changes }));
    };

    const updateMeshColor = (meshName, color) => {
        setMeshColor(meshName, color);
    };

    const handleDeleteLayer = () => {
        if (!editingSelection) return;
        const { meshName, id } = editingSelection;
        const currentStickers = meshStickers[meshName] || [];
        setMeshStickers(meshName, currentStickers.filter(s => s.id !== id));
        setEditingSelection(null);
    };

    // Auto-select first mesh
    React.useEffect(() => {
        if (!selectedMesh && meshConfig && Object.keys(meshConfig).length > 0) {
            const firstMesh = Object.keys(meshConfig).find(key => meshConfig[key].maskUrl);
            if (firstMesh) setSelectedMesh(firstMesh);
        }
    }, [meshConfig, selectedMesh]);

    // Keyboard Shortcuts for Undo/Redo
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                if (e.shiftKey) redo();
                else undo();
                e.preventDefault();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                redo();
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    // Store
    const [isExporting, setIsExporting] = useState(false);
    const modelRef = React.useRef();

    const handleDownload = async () => {
        if (!modelRef.current) return;
        setIsExporting(true);

        try {
            const exporter = new GLTFExporter();
            exporter.parse(
                modelRef.current.scene,
                (gltf) => {
                    const blob = new Blob([gltf], { type: 'model/gltf-binary' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = url;
                    link.download = `${productName || 'design'}.glb`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    setIsExporting(false);
                },
                (error) => {
                    console.error('An error happened during parsing', error);
                    setIsExporting(false);
                },
                {
                    binary: true,  // Export as GLB
                }
            );

        } catch (error) {
            console.error("Export failed", error);
            setIsExporting(false);
        }
    };

    const applyNormal = useCallback((meshName, normalUri) => {
        setMeshNormals(prev => {
            if (!normalUri) {
                if (!prev[meshName]) return prev;
                const newState = { ...prev };
                delete newState[meshName];
                return newState;
            }
            if (prev[meshName] === normalUri) return prev;
            return { ...prev, [meshName]: normalUri };
        });
    }, []);

    return (
        <div className="flex w-full h-full relative bg-[#f8f9fc] overflow-hidden">
            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-xl shadow-lg border border-zinc-200"
            >
                <Menu size={20} className="text-zinc-700" />
            </button>

            {/* Mobile 3D Preview Toggle */}
            <button
                onClick={() => setPreviewOpen(!previewOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 bg-white p-3 rounded-xl shadow-lg border border-zinc-200"
            >
                {previewOpen ? <EyeOff size={20} className="text-zinc-700" /> : <Eye size={20} className="text-zinc-700" />}
            </button>

            {/* MAIN SIDEBAR PANEL (Replaces Strip + Drawer) */}
            <div className={`
                w-full sm:w-[300px] 
                bg-[#f8f9fc] border-r border-zinc-200 
                flex flex-col z-40 h-full shadow-xl
                transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* TABS HEADER */}
                <div className="flex items-center p-2 gap-1 bg-white border-b border-zinc-100 mx-4 mt-4 rounded-xl shadow-sm">
                    {['design', 'studio', 'uploads'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-white text-indigo-600 shadow-md ring-1 ring-zinc-100' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}
                        >
                            {tab === 'design' && <Layers size={14} />}
                            {tab === 'studio' && <Settings size={14} />}
                            {tab === 'uploads' && <ImageIcon size={14} />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* --- DESIGN TAB --- */}
                    {activeTab === 'design' && (
                        <>
                            {/* TEXT LAYER SECTION */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Text Layer</h3>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={textInput}
                                            onChange={(e) => {
                                                setTextInput(e.target.value);
                                                if (editingSelection) updateEditingItem('text', e.target.value);
                                                if (activeTextToPlace) setActiveTextToPlace(prev => ({ ...prev, text: e.target.value }));
                                            }}
                                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm font-medium rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            placeholder="Add text..."
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg">
                                            <Check size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            // Ensure placement mode if not editing
                                            if (!editingSelection) {
                                                setActiveTextToPlace({ text: textInput, fontFamily: selectedFont, color: textColor, opacity });
                                            } else {
                                                // If editing, maybe "Add New"?
                                                setEditingSelection(null);
                                                setActiveTextToPlace({ text: "New Text", fontFamily: selectedFont, color: textColor, opacity });
                                                setTextInput("New Text");
                                            }
                                        }}
                                        className="bg-[#3B82F6] hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        <Plus size={16} /> Add Text
                                    </button>
                                    <button className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                                        <Wand2 size={16} className="text-purple-500" /> AI Gen
                                    </button>
                                </div>
                            </div>

                            {/* MATERIAL / FABRIC SECTION */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Fabric & Material</h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Type */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-400 font-semibold">Pattern Weave</label>
                                        <select
                                            value={materialSettings.fabricType || 'plain'}
                                            onChange={(e) => setMaterialSetting("fabricType", e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                                        >
                                            <option value="plain">Plain Weave (Standard)</option>
                                            <option value="twill">Twill (Denim)</option>
                                            <option value="satin">Satin</option>
                                            <option value="knit">Knit (Jersey)</option>
                                            <option value="rib">Rib Knit</option>
                                            <option value="pique">Piqué</option>
                                            <option value="fleece">Fleece</option>
                                            <option value="velvet">Velvet</option>
                                            <option value="corduroy">Corduroy</option>
                                        </select>
                                    </div>

                                    {/* Strength */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-zinc-500 font-medium">
                                            <span>Texture Depth</span>
                                            <span>{materialSettings.fabricStrength}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={materialSettings.fabricStrength || 0}
                                            onChange={(e) => setMaterialSetting("fabricStrength", Number(e.target.value))}
                                            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none accent-indigo-600"
                                        />
                                    </div>

                                    {/* Scale */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-zinc-500 font-medium">
                                            <span>Texture Scale</span>
                                            <span>{materialSettings.fabricScale || 8}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="2"
                                            max="40"
                                            step="1"
                                            value={materialSettings.fabricScale || 8}
                                            onChange={(e) => setMaterialSetting("fabricScale", Number(e.target.value))}
                                            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none accent-indigo-600"
                                        />
                                    </div>

                                    {/* Basic Material Props (Optional but good for completeness) */}
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-2">
                                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Roughness</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={materialSettings.roughness}
                                                onChange={(e) => setMaterialSetting("roughness", Number(e.target.value))}
                                                className="w-full h-1 bg-zinc-200 rounded-lg appearance-none accent-purple-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Sheen</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={materialSettings.sheen}
                                                onChange={(e) => setMaterialSetting("sheen", Number(e.target.value))}
                                                className="w-full h-1 bg-zinc-200 rounded-lg appearance-none accent-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* REMOVE LAYER */}
                            {editingSelection && (
                                <button
                                    onClick={handleDeleteLayer}
                                    className="w-full py-3.5 border border-red-100 text-red-500 hover:bg-red-50 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all mt-4"
                                >
                                    <Trash size={16} /> Remove Layer
                                </button>
                            )}
                        </>
                    )}

                    {/* --- UPLOADS TAB --- */}
                    {activeTab === 'uploads' && (
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Uploads</label>
                            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-zinc-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group bg-zinc-50/50">
                                <Upload size={24} className="text-zinc-300 group-hover:text-blue-500 mb-2 transition-colors" />
                                <span className="text-xs font-bold text-zinc-500 group-hover:text-blue-600">Upload Image</span>
                                <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) setActiveStickerUrl(URL.createObjectURL(e.target.files[0])); }} className="hidden" />
                            </label>

                            {activeStickerUrl && (
                                <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                                            <img src={activeStickerUrl} alt="Active" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-zinc-700">Active Sticker</p>
                                            <p className="text-[10px] text-zinc-400">Ready to place</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveStickerUrl(null)} className="text-red-500 bg-red-50 p-2 rounded-lg"><Trash size={14} /></button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- STUDIO TAB (Lighting & Background) --- */}
                    {activeTab === 'studio' && (
                        <div className="space-y-6">
                            {/* Environment */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Environment & Lighting</h3>
                                    <button
                                        onClick={() => setShowAuxLights(!showAuxLights)}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${showAuxLights ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-zinc-200 text-zinc-400'}`}
                                    >
                                        <Lightbulb size={12} />
                                        {showAuxLights ? 'Aux Lights ON' : 'Aux Lights OFF'}
                                    </button>
                                </div>

                                {/* Brightness Slider */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-zinc-500 font-medium">
                                        <span>Scene Brightness</span>
                                        <span>{brightness.toFixed(1)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.2"
                                        max="3"
                                        step="0.1"
                                        value={brightness}
                                        onChange={(e) => setBrightness(Number(e.target.value))}
                                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none accent-indigo-600"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <PresetBtn
                                        label="Studio"
                                        icon={Sun}
                                        active={envPreset === 'studio'}
                                        onClick={() => setEnvPreset('studio')}
                                    />
                                    <PresetBtn
                                        label="City"
                                        icon={Building2}
                                        active={envPreset === 'city'}
                                        onClick={() => setEnvPreset('city')}
                                    />
                                    <PresetBtn
                                        label="Dawn"
                                        icon={Cloud}
                                        active={envPreset === 'dawn'}
                                        onClick={() => setEnvPreset('dawn')}
                                    />
                                    <PresetBtn
                                        label="Forest"
                                        icon={Trees}
                                        active={envPreset === 'forest'}
                                        onClick={() => setEnvPreset('forest')}
                                    />
                                    <PresetBtn
                                        label="Night"
                                        icon={Moon}
                                        active={envPreset === 'warehouse'}
                                        onClick={() => setEnvPreset('warehouse')}
                                    />
                                    <PresetBtn
                                        label="Sunset"
                                        icon={Sunset}
                                        active={envPreset === 'sunset'}
                                        onClick={() => setEnvPreset('sunset')}
                                    />
                                </div>
                            </div>

                            {/* Background */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 space-y-4">
                                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Background</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {/* Light Preset */}
                                    <button
                                        onClick={() => { setBgType('solid'); setBgColor('#FFFFFF'); }}
                                        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${bgType === 'solid' && bgColor === '#FFFFFF' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
                                    >
                                        <div className="w-4 h-4 rounded-full border border-zinc-200 bg-white" />
                                        <span className="text-[9px] font-bold uppercase">Light</span>
                                    </button>

                                    {/* Dark Preset (Ash) */}
                                    <button
                                        onClick={() => { setBgType('solid'); setBgColor('#262626'); }}
                                        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${bgType === 'solid' && bgColor === '#262626' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
                                    >
                                        <div className="w-4 h-4 rounded-full border border-zinc-200 bg-[#262626]" />
                                        <span className="text-[9px] font-bold uppercase">Dark</span>
                                    </button>

                                    {/* Custom Color Popover */}
                                    <div className="relative">
                                        <button
                                            ref={customBgBtnRef}
                                            onClick={() => { setBgType('solid'); setShowBgPicker(!showBgPicker); }}
                                            className={`relative flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${bgType === 'solid' && bgColor !== '#FFFFFF' && bgColor !== '#262626' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
                                        >
                                            <div className="w-4 h-4 rounded-full border border-zinc-200" style={{ backgroundColor: bgColor }} />
                                            <span className="text-[9px] font-bold uppercase">Custom</span>
                                        </button>
                                        {showBgPicker && createPortal(
                                            <div
                                                className="fixed z-[100] -translate-y-full mb-2"
                                                style={{
                                                    top: pickerPos.top,
                                                    left: pickerPos.left
                                                }}
                                            >
                                                <div className="relative">
                                                    <AttractiveColorPicker
                                                        color={bgColor}
                                                        onChange={(color) => { setBgColor(color); setBgType('solid'); }}
                                                        className="w-56"
                                                    />
                                                    {/* Backdrop to close when clicking outside */}
                                                    <div
                                                        className="fixed inset-0 -z-10"
                                                        onClick={() => setShowBgPicker(false)}
                                                    />
                                                </div>
                                            </div>,
                                            document.body
                                        )}
                                    </div>

                                    {/* Image Upload / Toggle */}
                                    <div
                                        onClick={() => {
                                            if (bgImage) {
                                                setBgType('image');
                                            } else {
                                                bgImageFileInputRef.current?.click();
                                            }
                                        }}
                                        className={`relative flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer group ${bgType === 'image' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
                                    >
                                        {bgImage ? (
                                            <>
                                                {/* Preview Thumbnail */}
                                                <div className="w-4 h-4 rounded-md overflow-hidden border border-zinc-200">
                                                    <img src={bgImage} alt="bg" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-[9px] font-bold uppercase">Image</span>

                                                {/* Replace Button (Small Overlay) */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent toggling logic
                                                        bgImageFileInputRef.current?.click();
                                                    }}
                                                    className="absolute -top-1 -right-1 w-4 h-4 bg-zinc-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-zinc-800 transition-colors z-10"
                                                    title="Replace Image"
                                                >
                                                    <ImageIcon size={8} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon size={16} />
                                                <span className="text-[9px] font-bold uppercase">Image</span>
                                            </>
                                        )}

                                        <input
                                            ref={bgImageFileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    setBgImage(URL.createObjectURL(e.target.files[0]));
                                                    setBgType('image');
                                                }
                                                // Reset value to allow re-uploading same file
                                                e.target.value = null;
                                            }}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setBgType('transparent'); }}
                                    className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition-all ${bgType === 'transparent' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'}`}
                                >
                                    <Scan size={14} />
                                    <span className="text-xs font-bold">Transparent BG</span>
                                </button>
                            </div>
                        </div>
                    )}




                </div>
            </div>

            {/* ... CENTER WORKSPACE ... */}
            <div className="flex-1 bg-[#f8f9fc] relative overflow-hidden ml-0 lg:ml-0">
                <div className="absolute top-8 left-8 lg:left-8 left-20 z-10 flex items-center gap-4">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white/50 inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <h1 className="font-bold text-zinc-800 text-xs">
                            <span className="hidden sm:inline">Editor Live <span className="text-zinc-300 mx-2">|</span> </span>
                            <span className="text-indigo-600">{productName || 'Untitled Project'}</span>
                        </h1>
                    </div>

                    {/* Undo/Redo Controls */}
                    <div className="flex bg-white/90 backdrop-blur-md p-1 rounded-full shadow-sm border border-white/50 pointer-events-auto">
                        <button
                            onClick={() => undo()}
                            className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-600 transition-colors"
                            title="Undo (Ctrl+Z)"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            onClick={() => redo()}
                            className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-600 transition-colors"
                            title="Redo (Ctrl+Y)"
                        >
                            <RotateCw size={16} />
                        </button>
                        <div className="w-[1px] h-4 bg-zinc-200 mx-1" />
                        <button
                            onClick={() => {
                                // Save locally (optional)
                                saveDesign(productId);
                                // No backend save
                            }}
                            className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-600 rounded-full transition-all"
                            title="Save Local"
                        >
                            <Save size={16} />
                        </button>
                    </div>
                </div>

                {/* Save Feedback Toast (Simple implementation) */}

                {/* Canvas Area - Grid Layout for Pattern Zones */}
                <div className="w-full h-full overflow-auto bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[length:32px_32px] p-4 sm:p-8 lg:p-12 lg:pr-[410px]">
                    <div className="min-h-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 content-start justify-items-center pb-20 pt-10 max-w-4xl mx-auto">
                        {Object.entries(meshConfig).filter(([_, cfg]) => cfg.maskUrl).map(([meshName, cfg]) => {
                            const isSelected = selectedMesh === meshName || (!selectedMesh && meshName === Object.keys(meshConfig)[0]);
                            return (
                                <PatternZone
                                    key={meshName}
                                    meshName={meshName}
                                    maskUrl={cfg.maskUrl}
                                    stickerUrl={activeStickerUrl}
                                    textToPlace={activeTextToPlace}
                                    onUpdateTexture={onUpdateTexture}
                                    onUpdateNormal={applyNormal} // New prop
                                    onUpdateColor={(c) => updateMeshColor(meshName, c)}
                                    onSelect={handlePatternSelect}
                                    fabricType={materialSettings.fabricType} // Pass type
                                    fabricScale={materialSettings.fabricScale} // Pass scale
                                    bgColor={meshColors[meshName] || globalMaterial.color || "#ffffff"}
                                    isSelected={isSelected}
                                    onClick={() => setSelectedMesh(meshName)}
                                    onPlaceSticker={() => setActiveStickerUrl(null)}
                                    onPlaceText={() => setActiveTextToPlace(null)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RIGHT: FLOATING 3D CARD */}
            <div className={`
                fixed lg:absolute 
                top-0 lg:top-6 
                right-0 lg:right-6 
                bottom-0 lg:bottom-6 
                w-full sm:w-[340px] lg:w-[380px] 
                pointer-events-none flex flex-col justify-start 
                z-40
                transition-transform duration-300
                ${previewOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                <div className="bg-white rounded-none lg:rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col h-full lg:h-[580px] relative transition-all border border-zinc-100">
                    {/* 3D Header */}
                    <div className="absolute top-6 left-6 z-10">
                        <span className="bg-white/80 backdrop-blur-xl px-3 py-1 rounded-lg text-[10px] font-black tracking-widest text-zinc-900 border border-white/50 shadow-sm uppercase">
                            Live Render
                        </span>
                    </div>

                    {/* Canvas Container with "Space" */}
                    <div className="p-4 flex-1 min-h-0 bg-[#1e1e1e]">
                        <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner ring-1 ring-white/10">
                            <Canvas
                                shadows
                                camera={{ position: [0, 0, 3.5], fov: 40 }}
                                gl={{
                                    preserveDrawingBuffer: true,
                                    antialias: true,
                                    toneMapping: THREE.ACESFilmicToneMapping,
                                    toneMappingExposure: brightness // Dynamic brightness
                                }}
                                dpr={[1, 2]}
                            >
                                {bgType === 'solid' && <color attach="background" args={[bgColor]} />}
                                {bgType === 'image' && bgImage && <BackgroundTexture url={bgImage} />}

                                {/* Refined Auxiliary Lighting for Product Showcase */}
                                {showAuxLights && (
                                    <>
                                        <ambientLight intensity={0.6} />
                                        <spotLight
                                            position={[10, 15, 10]} // More frontal/top-down
                                            angle={0.5}
                                            penumbra={1}
                                            intensity={1.5}
                                            castShadow
                                            shadow-mapSize={[2048, 2048]}
                                            shadow-bias={-0.0001}
                                        />
                                        {/* Fill/Rim Light */}
                                        <pointLight position={[-10, 5, -10]} intensity={0.8} color="#eef2ff" />
                                    </>
                                )}



                                <React.Suspense fallback={<Loader />}>
                                    <Environment preset={envPreset} blur={0.8} />
                                    <Center position={[0, -0.2, 0]}>
                                        <DynamicModel
                                            ref={modelRef}
                                            url={glbUrl}
                                            meshTextures={meshTextures}
                                            meshNormals={meshNormals} // Pass normals
                                            meshColors={meshColors}
                                            materialProps={{ color: globalMaterial?.color }}
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
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-6 bg-white border-t border-zinc-100 flex flex-col gap-3">
                        <div className="flex gap-4">
                            <Button
                                onClick={handleDownload}
                                disabled={isExporting}
                                variant="primary"
                                icon={isExporting ? undefined : Download}
                                className="w-full py-4 shadow-xl shadow-indigo-500/20"
                            >
                                {isExporting ? "Exporting..." : "Download GLB"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

// Helper for Environment Presets
const PresetBtn = ({ label, icon: Icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${active ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
    >
        <Icon size={16} />
        <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
    </button>
);

// Internal Tooltip Button
const TooltipButton = ({ icon: Icon, onClick, isActive }) => (
    <div className="group relative flex justify-center">
        <button onClick={onClick} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600'}`}>
            <Icon size={22} />
        </button>
    </div>
);

export default DesignPhase;
