import React, { useState, useEffect, useRef } from 'react';
import { Type, Palette, AlignLeft, AlignCenter, AlignRight, MoreHorizontal, Trash, Copy, Check, ChevronDown, MoveHorizontal, Scaling, BringToFront, SendToBack, Droplet } from 'lucide-react';
import AttractiveColorPicker from "../../components/ui/AttractiveColorPicker";

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

const PRESET_COLORS = [
    "#000000", "#FFFFFF", "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899"
];

const FloatingTextToolbar = ({
    sticker,
    onChange,
    onDuplicate,
    onDelete,
    onMoveForward,
    onMoveBackward,
    position // { top, left } usually
}) => {
    const [showFonts, setShowFonts] = useState(false);
    const [showColors, setShowColors] = useState(false);
    const [showOpacity, setShowOpacity] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const toolbarRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
                setShowFonts(false);
                setShowColors(false);
                setShowMore(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateSticker = (key, value) => {
        onChange({ [key]: value });
    };

    if (!sticker) return null;

    return (
        <div
            ref={toolbarRef}
            className="absolute z-50 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200"
            style={{
                left: position.left,
                top: position.top,
                transform: 'translate(-50%, -100%) translateY(-12px)' // Center horizontally above the target
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent dragging the stage when clicking toolbar
        >
            {/* Toolbar Body */}
            <div className="flex items-center gap-1 p-1 bg-[#1e1e1e] rounded-full shadow-2xl border border-zinc-700/50 text-white">

                {/* Font Selector */}
                <div className="relative">
                    <button
                        onClick={() => { setShowFonts(!showFonts); setShowColors(false); setShowMore(false); }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 rounded-full transition-colors text-xs font-medium"
                        title="Font Family"
                    >
                        <span className="max-w-[80px] truncate" style={{ fontFamily: sticker.fontFamily }}>
                            {FONTS.find(f => f.family === sticker.fontFamily)?.name || 'Font'}
                        </span>
                        <ChevronDown size={12} className="text-zinc-500" />
                    </button>

                    {showFonts && (
                        <div className="absolute top-full left-0 mt-2 w-48 max-h-60 overflow-y-auto bg-[#1e1e1e] border border-zinc-700/50 rounded-xl shadow-xl p-1 z-[60] custom-scrollbar">
                            {FONTS.map(font => (
                                <button
                                    key={font.family}
                                    onClick={() => { updateSticker('fontFamily', font.family); setShowFonts(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${sticker.fontFamily === font.family ? 'bg-indigo-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}
                                >
                                    <span style={{ fontFamily: font.family }}>{font.name}</span>
                                    {sticker.fontFamily === font.family && <Check size={10} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-px h-4 bg-zinc-700 mx-1" />

                {/* Font Size */}
                <div className="flex items-center gap-1 px-2 group">
                    <span className="text-zinc-500"><Scaling size={12} /></span>
                    <input
                        type="number"
                        min="10"
                        max="200"
                        value={Math.round(sticker.fontSize)}
                        onChange={(e) => updateSticker('fontSize', Number(e.target.value))}
                        className="w-10 bg-transparent text-center text-xs font-medium focus:outline-none focus:bg-zinc-800 rounded px-0 py-1"
                    />
                </div>

                <div className="w-px h-4 bg-zinc-700 mx-1" />

                {/* Color Picker */}
                <div className="relative">
                    <button
                        onClick={() => { setShowColors(!showColors); setShowFonts(false); setShowMore(false); }}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors"
                        title="Text Color"
                    >
                        <div
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: sticker.fill }}
                        />
                    </button>
                    {showColors && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-[#1e1e1e] border border-zinc-700/50 rounded-2xl shadow-xl z-[60] w-56">
                            <div className="flex flex-wrap gap-1.5 justify-center mb-3 p-1">
                                {PRESET_COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => { updateSticker('fill', c); }}
                                        className={`w-6 h-6 rounded-full border-2 transition-all ${sticker.fill === c ? 'border-white scale-110 shadow-lg shadow-white/20' : 'border-transparent hover:scale-110'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>

                            <div className="border-t border-zinc-800 pt-3">
                                <AttractiveColorPicker
                                    color={sticker.fill}
                                    onChange={(color) => updateSticker('fill', color)}
                                    className="border-none shadow-none p-0 bg-transparent"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-px h-4 bg-zinc-700 mx-1" />

                {/* Opacity Selector */}
                <div className="relative">
                    <button
                        onClick={() => { setShowOpacity(!showOpacity); setShowFonts(false); setShowColors(false); setShowMore(false); }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showOpacity ? 'bg-zinc-800' : 'hover:bg-zinc-800 text-zinc-300'}`}
                        title="Opacity"
                    >
                        <div className="relative">
                            <Droplet size={16} />
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-zinc-500" style={{ width: '12px', opacity: (sticker.opacity ?? 1) }} />
                        </div>
                    </button>

                    {showOpacity && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#1e1e1e] border border-zinc-700/50 rounded-xl shadow-xl p-4 z-[60] flex flex-col gap-2">
                            <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                <span>Opacity</span>
                                <span>{Math.round((sticker.opacity ?? 1) * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={sticker.opacity ?? 1}
                                onChange={(e) => updateSticker('opacity', parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
                            />
                        </div>
                    )}
                </div>

                <div className="w-px h-4 bg-zinc-700 mx-1" />

                {/* Texture/Fabric Toggle */}
                <button
                    onClick={() => updateSticker('isFlat', !sticker.isFlat)}
                    className={`nav-button w-8 h-8 rounded-full flex items-center justify-center transition-colors ${!sticker.isFlat ? 'bg-indigo-600 text-white' : 'hover:bg-zinc-800 text-zinc-500'}`}
                    title={!sticker.isFlat ? "Fabric Texture Applied" : "Apply Fabric Texture"}
                >
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] font-bold">TX</span>
                    </div>
                </button>

                <div className="w-px h-4 bg-zinc-700 mx-1" />

                {/* Alignment - Simple Toggle for now, or Cycle */}
                {/* Not fully implemented in PatternZone's Text yet (Konva Text has align prop: left, center, right) 
                     Assuming Konva Text nodes support 'align' prop usage.
                 */}
                {/* <button
                    onClick={() => {
                        const nextAlign = sticker.align === 'center' ? 'right' : sticker.align === 'right' ? 'left' : 'center';
                        updateSticker('align', nextAlign);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                    title="Alignment"
                >
                     {sticker.align === 'left' && <AlignLeft size={14} />}
                     {sticker.align === 'right' && <AlignRight size={14} />}
                     {(sticker.align === 'center' || !sticker.align) && <AlignCenter size={14} />}
                </button> 

                <div className="w-px h-4 bg-zinc-700 mx-1" /> */}

                {/* More Menu */}
                <div className="relative">
                    <button
                        onClick={() => { setShowMore(!showMore); setShowFonts(false); setShowColors(false); }}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                    >
                        <MoreHorizontal size={16} />
                    </button>
                    {showMore && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[#1e1e1e] border border-zinc-700/50 rounded-xl shadow-xl p-1 z-[60] flex flex-col gap-0.5">
                            <button onClick={() => { onDuplicate(); setShowMore(false); }} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg text-left">
                                <Copy size={13} /> Duplicate
                            </button>
                            <button onClick={() => { onMoveForward(); setShowMore(false); }} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg text-left">
                                <BringToFront size={13} /> Bring Forward
                            </button>
                            <button onClick={() => { onMoveBackward(); setShowMore(false); }} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg text-left">
                                <SendToBack size={13} /> Send Backward
                            </button>
                            <div className="h-px bg-zinc-700 my-1" />
                            <button onClick={() => { onDelete(); setShowMore(false); }} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-400/10 rounded-lg text-left">
                                <Trash size={13} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Arrow/Pointer (Optional visual flair) */}
            <div className="w-3 h-3 bg-[#1e1e1e] border-b border-r border-zinc-700/50 rotate-45 -mt-1.5 z-40"></div>
        </div>
    );
};

export default FloatingTextToolbar;
