import React, { useState, useRef, useEffect, useCallback } from "react";

import { Stage, Layer, Image as KImage, Transformer, Rect, Group } from "react-konva";
import useImage from 'use-image';
import { X, Copy, Trash, Layers } from 'lucide-react'; // Added Layers icon
import { generateFabricNormalMap } from '../utils/textureUtils';

const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);
    return useCallback((...args) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => { callback(...args); }, delay);
    }, [callback, delay]);
};

// Refactored to look like a "Sewing Pattern" piece
const PatternZone = ({ meshName, maskUrl, stickerUrl, onUpdateTexture, onUpdateNormal, fabricType = 'plain', bgColor = "#ffffff", isSelected, onClick, onPlaceSticker }) => {
    const stageRef = useRef(null);
    const normalStageRef = useRef(null); // Parallel stage for normal map
    const [maskImg, setMaskImg] = useState(null);
    const [stickers, setStickers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const trRef = useRef(null);

    // Normal map resources
    const [fabricNormalImg, setFabricNormalImg] = useState(null); // The tiled background pattern

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

    // Generate/Update Fabric Normal Pattern when fabricType changes
    useEffect(() => {
        const dataUrl = generateFabricNormalMap(512, 512, 8, fabricType);
        const img = new window.Image();
        img.src = dataUrl;
        img.onload = () => {
            console.log("Fabric Normal Pattern Loaded");
            setFabricNormalImg(img);
        };
    }, [fabricType]);

    const addSticker = () => {
        // ...
        console.log("Adding sticker...", { stickerUrl });
        if (!stickerUrl) return;
        const img = new window.Image();
        img.src = stickerUrl;
        img.onload = () => {
            console.log("Sticker image loaded", img.naturalWidth, img.naturalHeight);

            // Center the sticker
            const startX = maskImg ? (maskImg.naturalWidth / 2) - 40 : 50;
            const startY = maskImg ? (maskImg.naturalHeight / 2) - 40 : 50;

            const newSticker = {
                id: Date.now().toString(),
                image: img,
                x: startX,
                y: startY,
                width: 80,
                height: 80,
                rotation: 0,
                isFlat: false // Default: blend with fabric (false)
            };
            setStickers(prev => [...prev, newSticker]);
            setSelectedId(newSticker.id);
            setTimeout(() => triggerExport(), 100);

            // Notify parent that sticker was placed (to clear active tool)
            // Delay slightly to ensure render cycle catches the new sticker
            setTimeout(() => {
                if (onPlaceSticker) onPlaceSticker();
            }, 100);
        };
        img.onerror = (err) => console.error("Failed to load sticker image", err);
    };

    // Auto-add sticker if this zone is selected when a new sticker is uploaded
    useEffect(() => {
        if (stickerUrl && isSelected) {
            addSticker();
        }
    }, [stickerUrl, isSelected]);

    useEffect(() => {
        if (selectedId && trRef.current && stageRef.current) {
            const node = stageRef.current.findOne('#' + selectedId);
            if (node) { trRef.current.nodes([node]); trRef.current.getLayer().batchDraw(); }
        } else if (trRef.current) { trRef.current.nodes([]); }
    }, [selectedId, stickers]);

    const performExport = () => {
        if (!stageRef.current) return;
        if (trRef.current) trRef.current.nodes([]);

        // OPTIMIZATION: Dynamically calculate ratio to match ORIGINAL resolution
        // The stage is displayed small (w, h), but we want the texture to vary 
        // to match the maskImg.naturalWidth exactly.
        const exportRatio = ratio > 0 ? (1 / ratio) : 2;

        // 1. Export Color Map
        const uri = stageRef.current.toDataURL({ pixelRatio: exportRatio });
        onUpdateTexture(meshName, uri);

        // 2. Export Normal Map (if support enabled)
        if (normalStageRef.current && onUpdateNormal) {
            console.log("Exporting Normal Map for", meshName, "Has FabricImg:", !!fabricNormalImg);
            const normUri = normalStageRef.current.toDataURL({ pixelRatio: exportRatio });
            onUpdateNormal(meshName, normUri);
        }

        if (selectedId && trRef.current) {
            const node = stageRef.current.findOne('#' + selectedId);
            if (node) trRef.current.nodes([node]);
        }
    };
    // OPTIMIZATION: Increased debounce from 200ms to 300ms to allow smoother dragging.
    const triggerExport = useDebounce(performExport, 300);

    useEffect(() => {
        if (maskImg) triggerExport();
    }, [bgColor, maskImg, fabricNormalImg]); // Re-export if fabric pattern changes

    const deleteSelected = (e) => {
        e.stopPropagation();
        if (!selectedId) return;
        setStickers(prev => prev.filter(s => s.id !== selectedId));
        setSelectedId(null);
        setTimeout(triggerExport, 100);
    };

    const duplicateSticker = (s) => {
        const newSticker = { ...s, id: Date.now().toString(), x: s.x + 20, y: s.y + 20 };
        setStickers(prev => [...prev, newSticker]);
        setSelectedId(newSticker.id);
        setTimeout(() => triggerExport(), 100);
    };

    // Toggle between "Fabric Blend" (isFlat=false) and "Patch/Print" (isFlat=true)
    const toggleStickerMaterial = (s) => {
        const newStickers = stickers.map(sticker =>
            sticker.id === s.id ? { ...sticker, isFlat: !sticker.isFlat } : sticker
        );
        setStickers(newStickers);
        setTimeout(() => triggerExport(), 100);
    };

    if (!maskImg) return <div className="w-[300px] h-[300px] bg-zinc-200 rounded-lg animate-pulse" />;

    const maxSize = 340;
    const ratio = Math.min(maxSize / maskImg.naturalWidth, maxSize / maskImg.naturalHeight);
    const w = maskImg.naturalWidth * ratio;
    const h = maskImg.naturalHeight * ratio;

    return (
        <div
            className={`relative group transition-all duration-300 p-2 z-10 ${stickerUrl ? 'cursor-crosshair' : ''}`}
            onClick={onClick}
        >
            {/* Simple Mesh Name & Controls floating above */}
            <div className="absolute -top-6 left-0 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-indigo-600' : 'text-zinc-500'}`}>
                    {meshName}
                </span>
                {/* Clear All Button - Only if multiple stickers or just global clear */}
                {stickers.length > 0 && !selectedId && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setStickers([]);
                            onUpdateTexture(meshName, null);
                            if (onUpdateNormal) onUpdateNormal(meshName, null);
                        }}
                        className="p-1 hover:bg-red-50 text-red-400 rounded-full"
                        title="Clear All"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* Context Menu Overlay - Floating "like the image" */}
            {selectedId && (() => {
                const s = stickers.find(st => st.id === selectedId);
                if (!s) return null;
                const menuLeft = (s.x * ratio) + (s.width * ratio) + 12;
                const menuTop = (s.y * ratio);

                return (
                    <div
                        className="absolute z-50 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-zinc-100 p-1.5 flex flex-col gap-1 w-36 animate-in fade-in zoom-in-95 duration-200"
                        style={{ left: Math.min(menuLeft, w - 80), top: Math.max(0, Math.min(menuTop, h - 80)) }}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleStickerMaterial(s); }}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors w-full text-left"
                        >
                            {/* If isFlat is TRUE, it is "Patch" (No Fabric). If FALSE, it is Fabric. */}
                            {/* We want to show a CHECK if Fabric is Applied (!isFlat) */}
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${!s.isFlat ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300'}`}>
                                {!s.isFlat && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                            </div>
                            Apply Fabric Texture
                        </button>
                        <div className="h-px bg-zinc-100 my-0.5" />
                        <button
                            onClick={(e) => { e.stopPropagation(); duplicateSticker(s); }}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors w-full text-left"
                        >
                            <Copy size={13} /> Duplicate
                        </button>
                        <div className="h-px bg-zinc-100 my-0.5" />
                        <button
                            onClick={deleteSelected}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                        >
                            <Trash size={13} /> Delete
                        </button>
                    </div>
                );
            })()}

            {/* CANVAS CONTAINER */}
            <div
                className={`rounded-lg overflow-hidden transition-all duration-300 bg-gray-800 ${isSelected ? 'ring-4 ring-indigo-500 shadow-xl scale-[1.02]' : ''}`}
                style={{ width: w, height: h, position: 'relative' }}
            >
                {/* PRIMARY COLOR STAGE */}
                <Stage
                    width={w} height={h}
                    scaleX={ratio} scaleY={ratio}
                    ref={stageRef}
                    onMouseDown={(e) => {
                        const clickedStage = e.target === e.target.getStage();
                        if (clickedStage) {
                            setSelectedId(null);
                        }
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
                                listening={true}
                                onClick={() => { if (stickerUrl) addSticker(); setSelectedId(null); }}
                                onTap={() => { if (stickerUrl) addSticker(); setSelectedId(null); }}
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
                                onClick={(e) => { e.cancelBubble = true; setSelectedId(s.id); }}

                                onTransformEnd={(e) => {
                                    const node = e.target;
                                    const newStickers = [...stickers];
                                    newStickers[i] = {
                                        ...newStickers[i],
                                        x: node.x(), y: node.y(),
                                        rotation: node.rotation(),
                                        width: node.width() * node.scaleX(),
                                        height: node.height() * node.scaleY()
                                    };
                                    node.scaleX(1); node.scaleY(1);
                                    setStickers(newStickers);
                                    triggerExport();
                                }}
                                onDragEnd={(e) => {
                                    const node = e.target;
                                    const newStickers = [...stickers];
                                    newStickers[i] = { ...newStickers[i], x: node.x(), y: node.y() };
                                    setStickers(newStickers);
                                    triggerExport();
                                }}
                            />
                        ))}

                        {/* Selection Guide */}
                        <Transformer
                            ref={trRef}
                            borderStroke="#4f46e5" anchorStroke="#4f46e5" anchorFill="#ffffff" anchorSize={8} borderDash={[2, 2]}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                                return newBox;
                            }}
                        />
                    </Layer>
                </Stage>

                {/* HIDDEN NORMAL MAP STAGE */}
                {/* We render this to perform the "bake" but show it hidden via CSS */}
                <div style={{ position: 'absolute', top: 0, left: 0, visibility: 'hidden', pointerEvents: 'none' }}>
                    <Stage
                        width={w} height={h}
                        scaleX={ratio} scaleY={ratio}
                        ref={normalStageRef}
                    >
                        <Layer>
                            <Group>
                                {/* 1. The Fabric Background Pattern */}
                                {/* We fill the shape with the normal map pattern */}
                                <Rect
                                    width={maskImg.naturalWidth}
                                    height={maskImg.naturalHeight}
                                    fill={fabricNormalImg ? null : "#8080ff"} // Fallback to flat normal if loading
                                    fillPatternImage={fabricNormalImg}
                                    fillPatternRepeat="repeat"
                                    listening={false}
                                />
                                {/* Cut out mask shape */}
                                <KImage
                                    image={maskImg}
                                    width={maskImg.naturalWidth}
                                    height={maskImg.naturalHeight}
                                    listening={false}
                                    globalCompositeOperation="destination-in"
                                />
                            </Group>

                            {/* 2. The Stickers (ONLY IF isFlat is TRUE) */}
                            {/* If isFlat is false, we don't render them here, so the background fabric shows through (blend) */}
                            {/* If isFlat is true, we render a solid "Neutral Normal" or "Flat Normal" shape to mask the fabric */}
                            {stickers.map((s) => {
                                if (!s.isFlat) return null;
                                return (
                                    <Group key={s.id + "_flat"} x={s.x} y={s.y} rotation={s.rotation} width={s.width} height={s.height} offset={{ x: 0, y: 0 }}>
                                        {/* Note: s.x/y is top-left. Transforming needs care. */}
                                        {/* Actually, KImage above uses x,y directly. */}
                                        <Group
                                            x={0} y={0}
                                        >
                                            {/* 1. Draw Image */}
                                            <KImage
                                                image={s.image}
                                                width={s.width}
                                                height={s.height}
                                            />
                                            {/* 2. Composite Blue atop it */}
                                            <Rect
                                                width={s.width}
                                                height={s.height}
                                                fill="rgb(128,128,255)"
                                                globalCompositeOperation="source-in"
                                            />
                                        </Group>
                                    </Group>
                                );
                            })}
                        </Layer>
                    </Stage>
                </div>
            </div>
        </div>
    );
};

export default PatternZone;
