import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Canvas } from '@react-three/fiber';
import { Stage, OrbitControls, useGLTF } from '@react-three/drei';
import { Upload, CheckCircle, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Helper to extract meshes
const MeshExtractor = ({ url, onMeshesFound }) => {
    const { scene } = useGLTF(url);
    const hasReported = useRef(false);

    if (!hasReported.current && scene) {
        const meshList = [];
        scene.traverse((child) => {
            if (child.isMesh) {
                console.log("Step1: Found mesh:", child.name, "ID->", child.name);
                meshList.push({
                    // CRITICAL FIX: Use NAME as ID because UUID changes on every load
                    id: child.name,
                    name: child.name,
                    materialName: child.material.name,
                    // geometry info for stats?
                });
            }
        });

        if (meshList.length === 0) {
            alert("No meshes found in this GLB!");
            return;
        }

        console.log("Step1: Can we proceed? Meshes:", meshList.length);
        onMeshesFound(meshList);
        hasReported.current = true;
    }

    return <primitive object={scene} />;
};

const Step1_ModelUpload = () => {
    const setPhase = useStore(s => s.setPhase);
    const setGlbUrl = useStore(s => s.setGlbUrl);
    const glbUrl = useStore(s => s.glbUrl);
    const setMeshes = useStore(s => s.setMeshes);
    const meshes = useStore(s => s.meshes);

    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file) => {
        if (file && file.name.endsWith('.glb')) {
            const url = URL.createObjectURL(file);
            setGlbUrl(url);
        }
    };

    return (
        <div className="flex h-full w-full bg-zinc-50">
            {/* Left Panel: Upload & Info */}
            <div className="w-1/3 bg-white border-r border-zinc-200 p-8 flex flex-col shadow-xl z-10">
                <div className="mb-8">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">Step 1</span>
                    <h1 className="text-3xl font-black text-zinc-900 mt-4">Upload 3D Model</h1>
                    <p className="text-zinc-500 mt-2">Start by uploading your .glb file. We'll verify the geometry and extract the meshes.</p>
                </div>

                {!glbUrl ? (
                    <div
                        className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-zinc-300 bg-zinc-50 hover:border-zinc-400'}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            handleFile(e.dataTransfer.files[0]);
                        }}
                    >
                        <Upload size={48} className="text-zinc-400 mb-4" />
                        <p className="font-bold text-zinc-700">Drag & Drop GLB</p>
                        <p className="text-xs text-zinc-400 mt-1">or click to browse</p>
                        <input
                            type="file"
                            accept=".glb"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleFile(e.target.files[0])}
                        />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 mb-6">
                            <CheckCircle className="text-green-600" size={24} />
                            <div>
                                <h4 className="font-bold text-green-900">Model Loaded</h4>
                                <p className="text-xs text-green-700">Ready for processing</p>
                            </div>
                        </div>

                        {meshes.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Detected Meshes ({meshes.length})</h3>
                                {meshes.map((mesh) => (
                                    <div key={mesh.id} className="p-3 bg-zinc-100 rounded-lg text-sm text-zinc-700 font-medium flex justify-between">
                                        <span>{mesh.name}</span>
                                        <span className="text-zinc-400 text-xs">ID: {mesh.id.slice(0, 4)}...</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-zinc-100">
                    <button
                        disabled={!glbUrl || meshes.length === 0}
                        onClick={() => setPhase(2)}
                        className="w-full h-14 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                        Next: Upload UV Layout <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* Right Panel: 3D Preview */}
            <div className="flex-1 bg-zinc-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
                {glbUrl ? (
                    <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
                        <Stage environment="city" intensity={0.6}>
                            <MeshExtractor url={glbUrl} onMeshesFound={setMeshes} />
                        </Stage>
                        <OrbitControls makeDefault />
                    </Canvas>
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-400 font-medium">
                        Preview Area
                    </div>
                )}
            </div>
        </div>
    );
};

export default Step1_ModelUpload;
