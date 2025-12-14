import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Stage, Layer, Group, Image as KonvaImage, Rect } from 'react-konva';
import { ArrowLeft, Image as ImageIcon, Type, Trash2 } from 'lucide-react';
import useImage from 'use-image';
import DynamicModel from '../3d/components/DynamicModel'; // Reuse existing logic initially
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage as ThreeStage } from '@react-three/drei';

const DesignZone = ({ island, isSelected, onSelect, stickers, onStickerChange, onStickerSelect, selectedStickerId }) => {
    const [image] = useImage(island.previewUrl);
    const groupRef = useRef();

    return (
        <Group
            x={island.layout.x}
            y={island.layout.y}
            scaleX={island.layout.scale}
            scaleY={island.layout.scale}
            rotation={island.layout.rotation}
            onClick={(e) => {
                const stage = e.target.getStage();
                // Get pointer relative to the page (client coords)
                // This is robust for DOM overlays
                const pointer = stage.getPointerPosition();
                // However, pointer is relative to stage container usually?
                // Let's use the event's raw clientX/Y to be safe and independent of Konva stage scaling/offsets
                const rawX = e.evt.clientX;
                const rawY = e.evt.clientY;

                // We need coordinates relative to the "Middle: Canvas" container div (div.flex-1)
                // because the popup is absolute inside that div.
                // Or we can make popup fixed. Fixed is easier? No, absolute relative to container is standard.
                // But let's pass both and let parent decide.
                onSelect({ x: pointer.x, y: pointer.y, clientX: rawX, clientY: rawY });

                // transform pointer to absolute client calculation later or just pass stage pointer?
                // actually better to pass the shape's absolute position for the popup
                onSelect(pointer);
                e.cancelBubble = true;
            }}
            onTap={(e) => {
                const stage = e.target.getStage();
                const pointer = stage.getPointerPosition();
                onSelect(pointer);
                e.cancelBubble = true;
            }}
        >
            {/* 1. Base Color (Clipped by Mask) */}
            <Group>
                {/* Background Color Rect */}
                <Rect
                    width={image ? image.width : 100}
                    height={image ? image.height : 100}
                    fill={island.color || '#ffffff'}
                />

                {/* Stickers belonging to this Island */}
                {stickers.map(sticker => (
                    <Sticker
                        key={sticker.id}
                        element={sticker}
                        isSelected={selectedStickerId === sticker.id}
                        onSelect={() => onStickerSelect(sticker.id)}
                        onChange={onStickerChange}
                    />
                ))}

                {/* The Mask - Applied using destination-in to cut everything to shape */}
                {image && (
                    <KonvaImage
                        image={image}
                        width={image.width}
                        height={image.height}
                        globalCompositeOperation="destination-in"
                    />
                )}
            </Group>

            {/* Selection Outline for the Island */}
            {isSelected && image && (
                <Rect
                    width={image.width}
                    height={image.height}
                    stroke="#8b5cf6"
                    strokeWidth={2 / island.layout.scale} // Counter-scale stroke
                    listening={false}
                />
            )}
        </Group>
    );
};

const Sticker = ({ element, isSelected, onSelect, onChange }) => {
    const [image] = useImage(element.url);
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <>
            <KonvaImage
                ref={shapeRef}
                image={image}
                x={element.transform.x}
                y={element.transform.y}
                width={100 * element.transform.scale}
                height={100 * element.transform.scale}
                rotation={element.transform.rotation}
                draggable
                onClick={(e) => {
                    onSelect();
                    e.cancelBubble = true;
                }}
                onDragEnd={(e) => {
                    onChange({ x: e.target.x(), y: e.target.y() });
                }}
                onTransformEnd={(e) => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        rotation: node.rotation(),
                        scale: Math.max(0.1, element.transform.scale * scaleX), // store scale, or width/height? Store uses uniform scale usually or w/h
                        // For simplicity, let's just update scale or w/h. Sticker logic in pattern board does w/h.
                        // Here in Step4 previous code used 'scale: 1' in addDesignElement.
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) return oldBox;
                        return newBox;
                    }}
                />
            )}
        </>
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

    const updateUvIsland = useStore(s => s.updateUvIsland);
    const meshes = useStore(s => s.meshes);

    // Atlas State
    const setAtlasCanvas = useStore(s => s.setAtlasCanvas);
    const notifyAtlasUpdate = useStore(s => s.notifyAtlasUpdate);
    const atlasCanvas = useStore(s => s.atlasCanvas);
    const atlasVersion = useStore(s => s.atlasVersion);

    const [selectedIslandId, setSelectedIslandId] = useState(null);
    const [selectedStickerId, setSelectedStickerId] = useState(null);
    const [popupPos, setPopupPos] = useState(null); // { x, y } screen coords

    const [dimensions, setDimensions] = useState({ w: 800, h: 800 });
    const containerRef = useRef(null);
    const stageRef = useRef(null);

    // Create a texture from the canvas whenever it updates
    const [canvasTexture, setCanvasTexture] = useState(null);

    useEffect(() => {
        if (atlasCanvas && atlasVersion > 0) {
            const tex = new THREE.CanvasTexture(atlasCanvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.flipY = false;
            setCanvasTexture(tex);
        }
    }, [atlasCanvas, atlasVersion]);


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
    }, [setAtlasCanvas, notifyAtlasUpdate]);

    const handleStickerUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!selectedIslandId) {
                alert("Please select a pattern piece (UV Island) to place the sticker on.");
                return;
            }

            const url = URL.createObjectURL(file);
            addDesignElement({
                id: Date.now(),
                type: 'sticker',
                url,
                transform: { x: 50, y: 50, rotation: 0, scale: 1 },
                uvIslandId: selectedIslandId
            });
            notifyAtlasUpdate();
        }
    };

    // Group stickers by island
    const stickersByIsland = designElements.reduce((acc, el) => {
        if (el.uvIslandId) {
            if (!acc[el.uvIslandId]) acc[el.uvIslandId] = [];
            acc[el.uvIslandId].push(el);
        }
        return acc;
    }, {});

    const selectedIsland = uvIslands.find(i => i.id === selectedIslandId);

    // Prepare meshTextures map for DynamicModel
    // Assuming all meshes share the same atlas for now, or we map explicitly if we knew which mesh is which island.
    // But since the atlas is one big canvas, we apply it to ALL meshes.
    const meshTextures = React.useMemo(() => {
        if (!canvasTexture) return {};
        const map = {};
        meshes.forEach(m => {
            map[m.name] = canvasTexture; // Apply same atlas to all
            // Wait, DynamicModel expects map.uuid check. CanvasTexture is new every time? No, we state it.
        });
        return map;
    }, [canvasTexture, meshes]);


    return (
        <div className="flex h-full w-full bg-zinc-50">
            {/* Left Panel: Tools */}
            <div className="w-64 bg-white border-r border-zinc-200 flex flex-col py-6 px-4 shadow-xl z-20 space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setPhase(3)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="font-bold text-lg text-zinc-800">Design</h2>
                </div>

                {/* UV Parts List */}
                <div className="flex-1 overflow-y-auto w-full space-y-2 px-2">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Pattern Pieces</h3>
                    {uvIslands.map(island => (
                        <div
                            key={island.id}
                            onClick={() => {
                                // Manual selection from sidebar
                                setSelectedIslandId(island.id);
                                // Center popup? Or just no popup on sidebar click?
                                // User says: "here i will click the svg open model show the color pick"
                                // If they click sidebar, maybe open popup at center?
                                // Let's set a default popup pos at center of canvas for sidebar clicks
                                setPopupPos({ x: dimensions.w / 2, y: dimensions.h / 2 });
                            }}
                            className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${selectedIslandId === island.id
                                ? 'bg-violet-50 border-violet-200 shadow-sm'
                                : 'bg-zinc-50 border-transparent hover:bg-zinc-100'
                                }`}
                        >
                            <div
                                className="w-8 h-8 rounded-full border border-zinc-200 shadow-sm"
                                style={{ backgroundColor: island.color || '#ffffff' }}
                            />
                            <span className="text-sm font-medium text-zinc-700 truncate">
                                {/* Try to guess name or use ID */}
                                {island.id.slice(0, 8)}...
                            </span>
                        </div>
                    ))}
                </div>

                {/* Upload Section */}
                <div className="pt-4 border-t border-zinc-100 w-full">
                    <label className="flex flex-col items-center justify-center h-24 bg-violet-50 border-2 border-dashed border-violet-200 rounded-xl cursor-pointer hover:bg-violet-100 transition-all group">
                        <ImageIcon size={24} className="text-violet-400 group-hover:text-violet-600 mb-2" />
                        <span className="text-xs text-violet-600 font-medium">Upload Sticker</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleStickerUpload} />
                    </label>
                    {!selectedIslandId && (
                        <p className="text-[10px] text-zinc-400 mt-2 text-center">Select a part to add stickers</p>
                    )}
                </div>

            </div>

            {/* Middle: Canvas */}
            <div className="flex-1 bg-zinc-800 relative overflow-hidden flex items-center justify-center" ref={containerRef}>
                <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur font-mono">
                    2D Pattern Editor
                </div>
                <Stage
                    width={dimensions.w}
                    height={dimensions.h}
                    ref={stageRef}
                    onMouseDown={(e) => {
                        const clickedStart = e.target === e.target.getStage();
                        if (clickedStart) {
                            setSelectedIslandId(null);
                            setSelectedStickerId(null);
                            setPopupPos(null);
                        }
                    }}
                >
                    <Layer>
                        {uvIslands.map(island => (
                            <DesignZone
                                key={island.id}
                                island={island}
                                isSelected={selectedIslandId === island.id}
                                onSelect={(pointer) => {
                                    setSelectedIslandId(island.id);
                                    // Calculate popup position (relative to screen/container)
                                    // Pointer is relative to stage top-left.
                                    // We need to add container offset? 
                                    // Pointer is {x, y} relative to stage.
                                    // Assuming stage is top-left of container.
                                    // Container might have padding/margin? No, it's relative?
                                    // Actually pointer from getPointerPosition is relative to stage.
                                    // Robust positioning using container bounds
                                    const container = containerRef.current;
                                    if (pointer && container) {
                                        // The popup is inside containerRef, which is relative.
                                        // pointer.x/y from Konva are relative to Stage Top-Left.
                                        // Stage is 0,0 inside Container correctly?
                                        // Yes, Stage fills dimensions set by container.
                                        // So pointer.x is correct relative to container.

                                        // Add a small offset so it doesn't appear under cursor immediately
                                        let x = pointer.x + 20;
                                        let y = pointer.y;

                                        // Boundary checks to keep it on screen
                                        if (x > dimensions.w - 200) x = pointer.x - 220; // Flip to left if too far right
                                        if (y > dimensions.h - 200) y = dimensions.h - 220;

                                        setPopupPos({ x, y });
                                    }
                                }}
                                stickers={stickersByIsland[island.id] || []}
                                selectedStickerId={selectedStickerId}
                                onStickerSelect={setSelectedStickerId}
                                onStickerChange={(newTransform) => {
                                    if (selectedStickerId) {
                                        const sticker = stickersByIsland[island.id].find(s => s.id === selectedStickerId);
                                        if (sticker) {
                                            updateDesignElement(selectedStickerId, { transform: { ...sticker.transform, ...newTransform } });
                                            notifyAtlasUpdate();
                                        }
                                    }
                                }}
                            />
                        ))}
                    </Layer>
                </Stage>

                {/* Popup Color Picker Overlay */}
                {selectedIsland && popupPos && (
                    <div
                        className="absolute z-50 bg-white p-3 rounded-xl shadow-2xl border border-zinc-200"
                        style={{
                            left: popupPos.x,
                            top: popupPos.y,
                            transform: 'translate(0, 0)'
                        }}
                    >
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Color</span>
                            <div className="flex gap-2">
                                {/* Preset Colors */}
                                {['#ffffff', '#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308'].map(c => (
                                    <button
                                        key={c}
                                        className="w-6 h-6 rounded-full border border-zinc-200 transition-transform hover:scale-110"
                                        style={{ backgroundColor: c }}
                                        onClick={() => {
                                            updateUvIsland(selectedIsland.id, { color: c });
                                            notifyAtlasUpdate();
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-100">
                                <span className="text-[10px] text-zinc-400">Custom</span>
                                <input
                                    type="color"
                                    value={selectedIsland.color || '#ffffff'}
                                    onChange={(e) => {
                                        updateUvIsland(selectedIsland.id, { color: e.target.value });
                                        notifyAtlasUpdate();
                                    }}
                                    className="w-full h-6 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                )}
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
                            meshTextures={meshTextures}
                        />
                    </ThreeStage>
                    <OrbitControls makeDefault />
                </Canvas>
            </div>
        </div >
    );
};

export default Step4_DesignEditor;
