import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { parseSvgPaths } from '../utils/svgParser';
import { Upload, CheckCircle, ArrowRight, ArrowLeft, FileDigit, Trash2, AlertCircle } from 'lucide-react';

const Step2_UvUpload = () => {
    const setPhase = useStore(s => s.setPhase);
    const meshes = useStore(s => s.meshes);
    const uvIslands = useStore(s => s.uvIslands);
    const setUvIslands = useStore(s => s.setUvIslands);

    // Rasterize SVG to standard PNG Data URL
    const rasterizeSvg = (file) => {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Limit max resolution for performance (e.g. 2048px)
                const maxDim = 2048;
                let w = img.width;
                let h = img.height;
                const aspect = w / h;

                if (w > maxDim || h > maxDim) {
                    if (w > h) { w = maxDim; h = w / aspect; }
                    else { h = maxDim; w = h * aspect; }
                }

                // Default to at least 1024 if tiny (like 0-1 coords)
                if (w < 100) { w = 1024; h = 1024; } // Assumption for normalized UVs

                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                const dataUrl = canvas.toDataURL('image/png');
                URL.revokeObjectURL(url);
                resolve({ dataUrl, width: w, height: h });
            };
            img.onerror = reject;
            img.src = url;
        });
    };

    // Keep track of which mesh we are uploading for
    const handleMeshUpload = async (meshId, file) => {
        console.log("Step2: Uploading file for mesh ID:", meshId, file);

        const isSvg = file && (
            file.type.includes('svg') ||
            file.name.toLowerCase().endsWith('.svg')
        );

        if (isSvg) {
            try {
                // Rasterize!
                const { dataUrl, width, height } = await rasterizeSvg(file);

                const newIsland = {
                    id: meshId,
                    // We DO NOT store pathData anymore.
                    // pathData: null,
                    previewUrl: dataUrl, // The Rasterized Image
                    width: width, // STORED
                    height: height, // STORED
                    meshId: meshId,
                    // Default to Fullscreen coverage (Aspect fit logic is in Step 3 rendering if needed)
                    // But here we assume the SVG is "The Map".
                    layout: { x: 0, y: 0, scale: 1, rotation: 0 }
                };

                // Remove existing
                const otherIslands = uvIslands.filter(i => i.meshId !== meshId);
                setUvIslands([...otherIslands, newIsland]);

            } catch (err) {
                console.error("Error rasterizing SVG:", err);
                alert("Failed to process SVG file.");
            }
        } else {
            alert("Please upload a valid .svg file.");
        }
    };

    // Calculate completion
    // A mesh is "ready" if it has at least one UV island linked to it?
    // Or maybe we treat it as optional? 
    // Let's say all detected meshes SHOULD have a layout.
    const completedMeshIds = new Set(uvIslands.map(i => i.meshId));
    const allMeshesCovered = meshes.length > 0 && meshes.every(m => completedMeshIds.has(m.id));

    return (
        <div className="flex h-full w-full bg-zinc-50">
            {/* Left Panel: Mesh List */}
            <div className="w-1/3 bg-white border-r border-zinc-200 p-8 flex flex-col shadow-xl z-10">
                <div className="mb-8">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">Step 2</span>
                    <h1 className="text-3xl font-black text-zinc-900 mt-4">Assign UV Layouts</h1>
                    <p className="text-zinc-500 mt-2">
                        For each mesh detected in your model, upload the corresponding UV SVG file (exported from Blender).
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {meshes.length === 0 ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
                            No meshes detected. Please go back to Step 1.
                        </div>
                    ) : (
                        meshes.map((mesh) => {
                            const isDone = completedMeshIds.has(mesh.id);
                            // Find islands for preview
                            const meshIslands = uvIslands.filter(i => i.meshId === mesh.id);

                            return (
                                <div key={mesh.id} className={`p-4 border rounded-xl transition-all ${isDone ? 'bg-green-50 border-green-200' : 'bg-white border-zinc-200 hover:border-amber-400'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-green-200 text-green-800' : 'bg-zinc-100 text-zinc-500'}`}>
                                                {isDone ? <CheckCircle size={16} /> : (mesh.name[0] || '?').toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-zinc-800 text-sm">{mesh.name}</h4>
                                                <p className="text-xs text-zinc-400">ID: {mesh.id.slice(0, 6)}...</p>
                                            </div>
                                        </div>

                                        <label className="cursor-pointer px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-700 flex items-center gap-2">
                                            <Upload size={12} /> {isDone ? 'Replace' : 'Upload'}
                                            <input
                                                type="file"
                                                accept=".svg"
                                                className="hidden"
                                                onChange={(e) => handleMeshUpload(mesh.id, e.target.files[0])}
                                            />
                                        </label>
                                    </div>

                                    {/* Mini Preview of paths */}
                                    {meshIslands.length > 0 && (
                                        <div className="w-full h-24 bg-white rounded-lg border border-dashed border-green-200 relative overflow-hidden flex items-center justify-center p-2">
                                            {meshIslands[0].previewUrl ? (
                                                <img
                                                    src={meshIslands[0].previewUrl}
                                                    className="max-w-full max-h-full opacity-80"
                                                    alt="UV Preview"
                                                />
                                            ) : (
                                                <span className="text-xs text-red-400">Error loading preview</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 flex gap-3">
                    <button
                        onClick={() => setPhase(1)}
                        className="w-14 h-14 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <button
                        disabled={uvIslands.length === 0}
                        onClick={() => {
                            if (!allMeshesCovered) {
                                if (!confirm("Some meshes do not have UV layouts assigned. They will not be customizable. Continue?")) return;
                            }
                            setPhase(3);
                        }}
                        className="flex-1 h-14 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                        Next: Arrange Layout <ArrowRight size={18} />
                    </button>
                    {/* Dev Reset */}
                    <button
                        onClick={() => { if (confirm('Clear all uploads?')) setUvIslands([]); }}
                        className="w-14 h-14 rounded-xl border border-red-100 text-red-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                        title="Clear All"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Right Panel: Combined Preview */}
            <div className="flex-1 bg-zinc-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
                {uvIslands.length > 0 ? (
                    <div className="w-full max-w-2xl aspect-square bg-white shadow-2xl rounded-2xl p-12 relative overflow-hidden">
                        <div className="absolute top-4 left-6">
                            <h3 className="font-bold text-zinc-400 uppercase tracking-widest text-sm">Atlas Preview</h3>
                        </div>

                        {/* We scatter them for visualization, but usually this step is just Check-box */}
                        <div className="w-full h-full border border-dashed border-zinc-200 rounded relative">
                            {uvIslands.map((island, i) => (
                                <img
                                    key={island.id || i}
                                    src={island.previewUrl}
                                    className="absolute w-24 h-24 object-contain opacity-50 border border-zinc-300 pointer-events-none"
                                    style={{
                                        top: `${10 + Math.floor(i / 5) * 20}%`,
                                        left: `${10 + (i % 5) * 20}%`
                                    }}
                                    alt="island"
                                />
                            ))}
                            <div className="absolute bottom-4 left-6 text-xs text-zinc-400">
                                *Positions here are temporary. Arrange them in the next step.
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-400">
                        <FileDigit size={64} className="mb-4 opacity-50" />
                        <span className="font-medium">Upload UVs to see preview</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Step2_UvUpload;
