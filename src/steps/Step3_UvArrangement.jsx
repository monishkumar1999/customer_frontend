import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Stage, Layer, Image, Transformer, Rect, Group } from 'react-konva';
import { ArrowLeft, ArrowRight, LayoutGrid } from 'lucide-react';

// Helper Component for Selectable/Transformable Shapes
import useImage from 'use-image';

// Helper Component for Selectable/Transformable Shapes
const DraggableIsland = ({ island, isSelected, onSelect, onChange }) => {
    const [image] = useImage(island.previewUrl);
    const shapeRef = useRef(null);
    const trRef = useRef(null);

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <>
            <Group
                ref={shapeRef}
                x={island.layout.x}
                y={island.layout.y}
                scaleX={island.layout.scale}
                scaleY={island.layout.scale}
                rotation={island.layout.rotation}
                draggable
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) => {
                    onChange({
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onTransformEnd={(e) => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    node.scaleX(1);
                    node.scaleY(1);
                    // Update internal layout state, but we must clear cache to resize cleanly?
                    // Actually caching handles scaling usually if cache size is correct.
                    // But easier to clear cache, transform, cache again?
                    // Konva handles scale of cached group well.
                    onChange({
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        scale: island.layout.scale * scaleX,
                    });
                }}
            >
                {/* Bitmap Render: High Performance */}
                {image && (
                    <Image
                        image={image}
                        // Use original dimensions or normalized? 
                        // If we rasterized to maxSize, we should probably scale down visually if huge.
                        // But transformer handles it.
                        width={image.width}
                        height={image.height}
                        // Tint it to show selection?
                        // Or just opacity.
                        opacity={isSelected ? 0.8 : 0.6}
                    />
                )}
            </Group>
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </>
    );
};

// Main Component
const Step3_UvArrangement = () => {
    const setPhase = useStore(s => s.setPhase);
    const uvIslands = useStore(s => s.uvIslands);
    const updateUvLayout = useStore(s => s.updateUvLayout);

    // Atlas State sharing to store
    const setAtlasCanvas = useStore(s => s.setAtlasCanvas);
    const notifyAtlasUpdate = useStore(s => s.notifyAtlasUpdate);

    const [selectedId, setSelectedId] = useState(null);
    const [dimensions, setDimensions] = useState({ w: 800, h: 800 });
    const containerRef = useRef(null);
    const stageRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                w: containerRef.current.offsetWidth,
                h: containerRef.current.offsetHeight
            });
        }
    }, []);

    // Register Atlas Canvas only when we mount (or phase starts)
    useEffect(() => {
        if (stageRef.current) {
            const canvas = stageRef.current.content.querySelector('canvas');
            setAtlasCanvas(canvas);
            notifyAtlasUpdate();
        }
    }, [setAtlasCanvas, notifyAtlasUpdate]);

    return (
        <div className="flex h-full w-full bg-zinc-50">
            {/* Left Panel: Instructions */}
            <div className="w-80 bg-white border-r border-zinc-200 p-6 flex flex-col shadow-xl z-10">
                <div className="mb-6">
                    <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold uppercase tracking-wider">Step 3</span>
                    <h1 className="text-2xl font-black text-zinc-900 mt-4">Arrange UV Layout</h1>
                    <p className="text-zinc-500 text-sm mt-2">
                        Move, scale, and rotate the UV islands to create your texture atlas.
                        <br />
                        <strong className="text-zinc-900">Note:</strong> Stickers won't be visible here. This is just for setting up the workspace.
                    </p>
                </div>

                <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl mb-auto">
                    <div className="flex items-center gap-2 font-bold text-violet-900 text-sm mb-2">
                        <LayoutGrid size={16} /> Workspace
                    </div>
                    <ul className="text-xs text-violet-700 space-y-1 list-disc pl-4">
                        <li>Drag shapes to position them.</li>
                        <li>Click to select and resize/rotate.</li>
                        <li>Ensure shapes do not overlap.</li>
                    </ul>
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-100 flex gap-3">
                    <button
                        onClick={() => setPhase(2)}
                        className="w-12 h-12 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <button
                        onClick={() => setPhase(4)}
                        className="flex-1 h-12 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg"
                    >
                        Start Designing <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 bg-zinc-900 overflow-hidden relative" ref={containerRef}>
                <Stage
                    width={dimensions.w}
                    height={dimensions.h}
                    ref={stageRef}
                    onMouseDown={(e) => {
                        if (e.target === e.target.getStage()) setSelectedId(null);
                    }}
                >
                    <Layer>
                        {/* White Artboard Background (Fabric) */}
                        <Rect width={dimensions.w} height={dimensions.h} fill="white" />

                        {/* Grid */}
                        <Group listening={false} opacity={0.3}>
                            {[...Array(20)].map((_, i) => (
                                <Rect key={`v - ${i} `} x={i * 100} width={1} height={dimensions.h} fill="#ccc" />
                            ))}
                            {[...Array(20)].map((_, i) => (
                                <Rect key={`h - ${i} `} y={i * 100} width={dimensions.w} height={1} fill="#ccc" />
                            ))}
                        </Group>

                        {/* UV Islands */}
                        {uvIslands.map(island => (
                            <DraggableIsland
                                key={island.id}
                                island={island}
                                isSelected={selectedId === island.id}
                                onSelect={() => setSelectedId(island.id)}
                                onChange={(newLayout) => {
                                    updateUvLayout(island.id, newLayout);
                                    notifyAtlasUpdate();
                                }}
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
};

// Re-write loop for easier Transformer handling
// ...

export default Step3_UvArrangement;
