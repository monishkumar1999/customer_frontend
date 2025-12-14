import React, { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Image as KImage, Transformer, Rect, Group } from "react-konva";
import { X } from "lucide-react";

const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);
    return useCallback((...args) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => { callback(...args); }, delay);
    }, [callback, delay]);
};

// Refactored to look like a "Sewing Pattern" piece
const PatternZone = ({ meshName, maskUrl, stickerUrl, onUpdateTexture, bgColor = "#ffffff", isSelected, onClick }) => {
    const stageRef = useRef(null);
    const [maskImg, setMaskImg] = useState(null);
    const [stickers, setStickers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const trRef = useRef(null);

    useEffect(() => {
        if (!maskUrl) return;

        // Dynamic import to avoid SSR issues if any, though likely fine here.
        import('../utils/maskProcessor').then(({ processWireframeToSolid }) => {
            processWireframeToSolid(maskUrl)
                .then(solidDataUrl => {
                    const img = new window.Image();
                    img.src = solidDataUrl;
                    img.onload = () => setMaskImg(img);
                })
                .catch(err => {
                    // Fallback to original if processing fails
                    console.error("Auto-fill failed, using original", err);
                    const img = new window.Image();
                    img.src = maskUrl;
                    img.onload = () => setMaskImg(img);
                });
        });
    }, [maskUrl]);

    useEffect(() => {
        if (!stickerUrl) return;
        const img = new window.Image();
        img.src = stickerUrl;
        img.onload = () => {
            const newSticker = { id: Date.now().toString(), image: img, x: 50, y: 50, width: 80, height: 80, rotation: 0 };
            setStickers(prev => [...prev, newSticker]);
            setSelectedId(newSticker.id);
            setTimeout(() => triggerExport(), 100);
        };
    }, [stickerUrl]);

    useEffect(() => {
        if (selectedId && trRef.current && stageRef.current) {
            const node = stageRef.current.findOne('#' + selectedId);
            if (node) { trRef.current.nodes([node]); trRef.current.getLayer().batchDraw(); }
        } else if (trRef.current) { trRef.current.nodes([]); }
    }, [selectedId, stickers]);

    const performExport = () => {
        if (!stageRef.current) return;
        if (trRef.current) trRef.current.nodes([]);

        // OPTIMIZATION: Reduced pixelRatio from 2 to 1.
        // High resolution is great but causes "browser stuck" issues on frequent updates.
        // 1.0 is sufficient for 3D textures in this editor context.
        const uri = stageRef.current.toDataURL({ pixelRatio: 1 });
        onUpdateTexture(meshName, uri);

        if (selectedId && trRef.current) {
            const node = stageRef.current.findOne('#' + selectedId);
            if (node) trRef.current.nodes([node]);
        }
    };
    // OPTIMIZATION: Increased debounce from 200ms to 300ms to allow smoother dragging.
    const triggerExport = useDebounce(performExport, 300);

    useEffect(() => {
        if (maskImg) triggerExport();
    }, [bgColor, maskImg]);

    if (!maskImg) return <div className="w-[300px] h-[300px] bg-zinc-200 rounded-lg animate-pulse" />;

    const maxSize = 340;
    const ratio = Math.min(maxSize / maskImg.naturalWidth, maxSize / maskImg.naturalHeight);
    const w = maskImg.naturalWidth * ratio;
    const h = maskImg.naturalHeight * ratio;

    return (
        <div
            className="relative group transition-all duration-300 p-2 z-10"
            onClick={onClick}
        >
            {/* Simple Mesh Name & Controls floating above */}
            <div className="absolute -top-6 left-0 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-indigo-600' : 'text-zinc-500'}`}>
                    {meshName}
                </span>
                {stickers.length > 0 && (
                    <button
                        onClick={() => { setStickers([]); onUpdateTexture(meshName, null); }}
                        className="p-1 hover:bg-red-50 text-red-400 rounded-full"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* CANVAS CONTAINER */}
            <div
                className={`rounded-lg overflow-hidden transition-all duration-300 bg-gray-800 ${isSelected ? 'ring-4 ring-indigo-500 shadow-xl scale-[1.02]' : ''}`}
                style={{ width: w, height: h }}
            >
                <Stage
                    width={w} height={h}
                    scaleX={ratio} scaleY={ratio}
                    ref={stageRef}
                    onMouseDown={(e) => {
                        if (e.target === e.target.getStage()) setSelectedId(null);
                    }}
                    onMouseUp={triggerExport}
                    onDragEnd={triggerExport}
                >
                    <Layer>
                        {/* 2. The Pattern Shape Outline/Mask
                            User wants the UV SVG/Pattern to be WHITE.
                            We use the mask to cut out a shape from the bgColor (White).
                            We leave the background TRANSPARENT so it shows up as "Gray" in the editor (due to CSS bg-gray-800).
                            This ensures the White Shirt is visible against the Dark Editor.
                            NOTE: On the 3D model, transparent pixels may render as black depending on the material,
                            but this is the only way to have "White Shirt on Dark Editor" without complex composting.
                        */}
                        <Group>
                            {/* This Rect provides the fabric color (White) */}
                            <Rect
                                width={maskImg.naturalWidth}
                                height={maskImg.naturalHeight}
                                fill={bgColor}
                                listening={false}
                            />
                            {/* This KImage uses the maskImg (white shape on transparent) to cut out the declared Rect */}
                            <KImage
                                image={maskImg}
                                width={maskImg.naturalWidth}
                                height={maskImg.naturalHeight}
                                listening={false}
                                globalCompositeOperation="destination-in"
                            />
                        </Group>

                        {/* Stickers */}
                        {stickers.map((s, i) => (
                            <KImage
                                key={s.id} id={s.id} image={s.image} x={s.x} y={s.y} width={s.width} height={s.height} rotation={s.rotation} draggable
                                onClick={() => setSelectedId(s.id)}
                                onTransformEnd={(e) => {
                                    const node = e.target;
                                    const newStickers = [...stickers];
                                    newStickers[i] = { ...newStickers[i], x: node.x(), y: node.y(), width: Math.max(5, node.width() * node.scaleX()), height: Math.max(5, node.height() * node.scaleY()), rotation: node.rotation() };
                                    node.scaleX(1); node.scaleY(1);
                                    setStickers(newStickers);
                                    triggerExport();
                                }}
                            />
                        ))}

                        {/* Selection Guide */}
                        <Transformer ref={trRef} borderStroke="#4f46e5" anchorStroke="#4f46e5" anchorFill="#ffffff" anchorSize={8} borderDash={[2, 2]} />
                    </Layer>
                </Stage>
            </div>
        </div>
    );
};

export default PatternZone;
