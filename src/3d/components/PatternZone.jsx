import React, { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Image as KImage, Transformer, Rect } from "react-konva";
import { X } from "lucide-react";

const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);
    return useCallback((...args) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => { callback(...args); }, delay);
    }, [callback, delay]);
};

// Refactored to look like a "Sewing Pattern" piece
const PatternZone = ({ meshName, maskUrl, stickerUrl, onUpdateTexture, bgColor = "#ffffff" }) => {
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

        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        onUpdateTexture(meshName, uri);

        if (selectedId && trRef.current) {
            const node = stageRef.current.findOne('#' + selectedId);
            if (node) trRef.current.nodes([node]);
        }
    };
    const triggerExport = useDebounce(performExport, 200);

    useEffect(() => {
        if (maskImg) triggerExport();
    }, [bgColor, maskImg]);

    if (!maskImg) return <div className="w-[300px] h-[300px] bg-zinc-200 rounded-lg animate-pulse" />;

    const maxSize = 340;
    const ratio = Math.min(maxSize / maskImg.naturalWidth, maxSize / maskImg.naturalHeight);
    const w = maskImg.naturalWidth * ratio;
    const h = maskImg.naturalHeight * ratio;

    return (
        <div className="relative group">
            {/* Simple Mesh Name & Controls floating above */}
            <div className="absolute -top-6 left-0 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
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
            {/* Added bg-zinc-200/50 here to creates the "gray place" for the SVG to sit on, visually distinct from the white page */}
            <div className="bg-gray-800 rounded-lg overflow-hidden" style={{ width: w, height: h }}>
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
                        {/* 1. Base Fabric Color - User controls this via Global Material Color */}
                        <Rect
                            width={maskImg.naturalWidth}
                            height={maskImg.naturalHeight}
                            fill="#ffffff"
                            listening={false}
                        />

                        {/* 2. The Pattern Shape Outline/Mask */}
                        <KImage
                            image={maskImg}
                            width={maskImg.naturalWidth}
                            height={maskImg.naturalHeight}
                            opacity={1}
                            listening={false}
                            globalCompositeOperation="destination-atop"
                        />

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
