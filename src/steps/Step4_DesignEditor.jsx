import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Stage, Layer, Group, Image as KonvaImage, Rect } from 'react-konva';
import { ArrowLeft, Image as ImageIcon, Type, Trash2 } from 'lucide-react';
import useImage from 'use-image';
import DynamicModel from '../3d/components/DynamicModel'; // Reuse existing logic initially
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage as ThreeStage } from '@react-three/drei';

const UvGuideImage = ({ island }) => {
    const [image] = useImage(island.previewUrl);
    return (
        <Group
            x={island.layout.x}
            y={island.layout.y}
            scaleX={island.layout.scale}
            scaleY={island.layout.scale}
            rotation={island.layout.rotation}
            listening={false}
        >
            {image && <KonvaImage image={image} width={image.width} height={image.height} opacity={1} />}
        </Group>
    );
};

const Sticker = ({ element, isSelected, onSelect, onChange }) => {
    const [image] = useImage(element.url);
    const shapeRef = useRef();

    return (
        <KonvaImage
            image={image}
            x={element.transform.x}
            y={element.transform.y}
            width={100} // Default or from store
            height={100}
            draggable
            onClick={onSelect}
            onDragEnd={(e) => {
                onChange({ x: e.target.x(), y: e.target.y() });
            }}
        />
    );
};

const Step4_DesignEditor = () => {
    const setPhase = useStore(s => s.setPhase);
    const uvIslands = useStore(s => s.uvIslands);
    const designElements = useStore(s => s.designElements);
    const addDesignElement = useStore(s => s.addDesignElement);
    const updateDesignElement = useStore(s => s.updateDesignElement);
    const glbUrl = useStore(s => s.glbUrl);

    // Atlas State
    const setAtlasCanvas = useStore(s => s.setAtlasCanvas);
    const notifyAtlasUpdate = useStore(s => s.notifyAtlasUpdate);

    const [selectedId, setSelectedId] = useState(null);
    const [dimensions, setDimensions] = useState({ w: 800, h: 800 });
    const containerRef = useRef(null);
    const stageRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({ w: containerRef.current.offsetWidth, h: containerRef.current.offsetHeight });
        }
    }, []);

    useEffect(() => {
        if (stageRef.current) {
            const canvas = stageRef.current.content.querySelector('canvas');
            setAtlasCanvas(canvas);
            notifyAtlasUpdate();
        }
    }, [setAtlasCanvas, notifyAtlasUpdate]); // Add designElements dependency if needed later

    const handleStickerUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            addDesignElement({
                id: Date.now(), // Simple ID
                type: 'sticker',
                url,
                transform: { x: 100, y: 100, rotation: 0, scale: 1 },
                uvIslandId: null // Global for now, or detect intersection
            });
            notifyAtlasUpdate();
        }
    };

    return (
        <div className="flex h-full w-full bg-zinc-50">
            {/* Left Panel: Tools */}
            <div className="w-20 bg-white border-r border-zinc-200 flex flex-col items-center py-6 shadow-xl z-20">
                <button onClick={() => setPhase(3)} className="mb-8 p-3 hover:bg-zinc-100 rounded-xl text-zinc-400">
                    <ArrowLeft size={24} />
                </button>

                <div className="space-y-4">
                    <label className="w-12 h-12 flex items-center justify-center bg-violet-100 text-violet-700 rounded-xl cursor-pointer hover:bg-violet-200 transition-colors">
                        <ImageIcon size={24} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleStickerUpload} />
                    </label>
                    <button className="w-12 h-12 flex items-center justify-center bg-zinc-100 text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors">
                        <Type size={24} />
                    </button>
                </div>
            </div>

            {/* Middle: Canvas */}
            <div className="flex-1 bg-zinc-800 relative overflow-hidden flex items-center justify-center" ref={containerRef}>
                <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur font-mono">
                    2D Design Canvas
                </div>
                <Stage
                    width={dimensions.w}
                    height={dimensions.h}
                    ref={stageRef}
                    onMouseDown={(e) => {
                        if (e.target === e.target.getStage()) setSelectedId(null);
                    }}
                >
                    <Layer>
                        {/* Transparent Background - Let CSS show through */}

                        {/* Render UV Layout as MASKS/GUIDES */}
                        {/* In Design Phase, these are LOCKED */}
                        {/* Render UV Layout as MASKS/GUIDES (Bitmap) */}
                        {uvIslands.map(island => (
                            <UvGuideImage key={island.id} island={island} />
                        ))}

                        {/* Design Elements */}
                        {designElements.map(el => (
                            <Sticker
                                key={el.id}
                                element={el}
                                isSelected={selectedId === el.id}
                                onSelect={() => setSelectedId(el.id)}
                                onChange={(newTransform) => {
                                    updateDesignElement(el.id, { transform: { ...el.transform, ...newTransform } });
                                    notifyAtlasUpdate();
                                }}
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>

            {/* Right: 3D Preview */}
            <div className="w-1/3 bg-zinc-100 relative border-l border-zinc-200">
                <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur font-mono">
                    3D Preview
                </div>
                <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
                    <ThreeStage environment="city" intensity={0.6}>
                        {/* We reuse DynamicModel but need to adapt it to the new Phase logic if needed. 
                            For now, assume DynamicModel reads 'atlasCanvas' from store. 
                        */}
                        <DynamicModel
                            url={glbUrl}
                        // Pass empty maps since we use atlasCanvas via store inside logic
                        />
                    </ThreeStage>
                    <OrbitControls makeDefault />
                </Canvas>
            </div>
        </div>
    );
};

export default Step4_DesignEditor;
