import React, { useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Center, ContactShadows, Html, useProgress } from "@react-three/drei";
import { Type, Palette, Upload, Download, Image as ImageIcon, ChevronLeft, X, Save, Trash, Minus, Plus, Maximize, Settings, Layers, Wand2, Check, Droplet } from "lucide-react";
import * as THREE from "three";
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
    const { materialSettings, setMaterialSetting, saveMaterialConfiguration, productName, subcategory } = useStore();
    const [activeTab, setActiveTab] = useState('design'); // 'design', 'uploads', 'studio'
    const [selectedMesh, setSelectedMesh] = useState(null);
    const [meshColors, setMeshColors] = useState({});

    // Text Tool State
    const [textInput, setTextInput] = useState("hello");
    const [selectedFont, setSelectedFont] = useState(FONTS[0].family);
    const [textColor, setTextColor] = useState("#000000");
    const [opacity, setOpacity] = useState(1);
    const [activeTextToPlace, setActiveTextToPlace] = useState(null);
    const [editingSelection, setEditingSelection] = useState(null); // { meshName, id, type, text, fontFamily, fill, opacity }
    const [stickerUpdate, setStickerUpdate] = useState(null); // { meshName, id, changes: {} }

    const [meshNormals, setMeshNormals] = useState({}); // New state for baked normals
    const [meshList, setMeshList] = useState([]); // Missing state for mesh list

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

        setStickerUpdate({
            meshName: editingSelection.meshName,
            id: editingSelection.id,
            changes
        });
        setEditingSelection(prev => ({ ...prev, ...changes }));
    };

    const handleDeleteLayer = () => {
        if (!editingSelection) return;
        // Optimization: We could pass a "delete" command via stickerUpdate, 
        // but currently PatternZone manages deletion internally via UI.
        // For now, let's implement a specific delete signal or just use the update mechanism with a flag?
        // Actually PatternZone doesn't listen for delete. 
        // Simpler: Just setStickerUpdate with a "deleted: true" flag if we handle it there, 
        // OR, better, we need a way to tell pattern zone to delete.
        // Let's defer exact delete logic or assume PatternZone can handle a special update?
        // No, let's just use the trash button on the Canvas for now, or implement a clean delete signal.
        // For this task, I'll add a 'delete' signal to changes.
        setStickerUpdate({
            meshName: editingSelection.meshName,
            id: editingSelection.id,
            changes: { _deleted: true } // Need to handle this in PatternZone
        });
        setEditingSelection(null);
    };

    // Auto-select first mesh
    React.useEffect(() => {
        if (!selectedMesh && meshConfig && Object.keys(meshConfig).length > 0) {
            const firstMesh = Object.keys(meshConfig).find(key => meshConfig[key].maskUrl);
            if (firstMesh) setSelectedMesh(firstMesh);
        }
    }, [meshConfig, selectedMesh]);

    // Store
    const [isExporting, setIsExporting] = useState(false);
    const [hdrUrl] = useState(`/hdr/studio_soft.hdr?v=${Date.now()}`);
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

            {/* MAIN SIDEBAR PANEL (Replaces Strip + Drawer) */}
            <div className="w-[380px] bg-[#f8f9fc] border-r border-zinc-200 flex flex-col z-40 h-full shadow-xl">
                {/* TABS HEADER */}
                <div className="flex items-center p-2 gap-1 bg-white border-b border-zinc-100 mx-4 mt-4 rounded-xl shadow-sm">
                    {['design', 'uploads'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-white text-indigo-600 shadow-md ring-1 ring-zinc-100' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}
                        >
                            {tab === 'design' && <Layers size={14} />}
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

                            {/* TYPOGRAPHY SECTION */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Typography</h3>
                                    </div>
                                    <button className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100">View all</button>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {FONTS.map(font => (
                                        <button
                                            key={font.family}
                                            onClick={() => {
                                                setSelectedFont(font.family);
                                                if (editingSelection) updateEditingItem('fontFamily', font.family);
                                                if (activeTextToPlace) setActiveTextToPlace(prev => ({ ...prev, fontFamily: font.family }));
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${selectedFont === font.family ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}
                                        >
                                            <span style={{ fontFamily: font.family }} className="text-sm">{font.name}</span>
                                            {selectedFont === font.family && <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center"><Check size={10} /></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* COLOR CONTENT */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Color</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => {
                                                setTextColor(c);
                                                if (editingSelection) updateEditingItem('color', c);
                                                if (activeTextToPlace) setActiveTextToPlace(prev => ({ ...prev, color: c }));
                                            }}
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${textColor === c ? 'border-blue-500 scale-110' : 'border-zinc-100 hover:border-zinc-300'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <label className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:border-blue-400 cursor-pointer transition-all">
                                        <Plus size={18} />
                                        <input type="color" className="hidden"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setTextColor(val);
                                                if (editingSelection) updateEditingItem('color', val);
                                                if (activeTextToPlace) setActiveTextToPlace(prev => ({ ...prev, color: val }));
                                            }}
                                        />
                                    </label>
                                </div>

                                <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 p-2 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg border border-zinc-200" style={{ backgroundColor: textColor }}></div>
                                    <span className="text-xs font-mono text-zinc-500 uppercase flex-1">{textColor}</span>
                                    <div className="text-zinc-400"><Droplet size={16} /></div>
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

                            {/* ADJUSTMENTS (Opacity) */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Adjustments</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-zinc-700">Opacity</span>
                                        <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md">{(opacity * 100).toFixed(0)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={opacity}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setOpacity(val);
                                            if (editingSelection) updateEditingItem('opacity', val);
                                            if (activeTextToPlace) setActiveTextToPlace(prev => ({ ...prev, opacity: val }));
                                        }}
                                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none accent-blue-500"
                                    />

                                    {/* Texture Integration Toggle */}
                                    <div className="flex items-center justify-between pt-2 border-t border-zinc-50 mt-2">
                                        <span className="text-xs font-semibold text-zinc-700">Apply Fabric Texture</span>
                                        <button
                                            onClick={() => {
                                                if (editingSelection) updateEditingItem('isFlat', !editingSelection.isFlat);
                                                // Note: We don't track isFlat for new text globally here yet, defaults to false
                                            }}
                                            className={`w-10 h-5 rounded-full flex items-center transition-colors px-1 ${editingSelection?.isFlat ? 'bg-zinc-200' : 'bg-green-500'}`}
                                            title={editingSelection?.isFlat ? "Flat (No Texture)" : "Textured (Fabric Bumps)"}
                                        >
                                            <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${editingSelection?.isFlat ? 'translate-x-0' : 'translate-x-5'}`} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 leading-tight">
                                        {editingSelection?.isFlat ? "Sticker renders flat on top of fabric." : "Sticker blends with fabric texture depth."}
                                    </p>
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
                                    textToPlace={activeTextToPlace}
                                    onUpdateTexture={onUpdateTexture}
                                    onUpdateNormal={applyNormal} // New prop
                                    onSelect={handlePatternSelect}
                                    externalUpdate={stickerUpdate}
                                    fabricType={materialSettings.fabricType} // Pass type
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
                                        ref={modelRef}
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

// Internal Tooltip Button
const TooltipButton = ({ icon: Icon, onClick, isActive }) => (
    <div className="group relative flex justify-center">
        <button onClick={onClick} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600'}`}>
            <Icon size={22} />
        </button>
    </div>
);

export default DesignPhase;
