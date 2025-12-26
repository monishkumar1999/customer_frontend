import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Trash, Copy, BringToFront, SendToBack, ArrowUp, ArrowDown, Lock } from 'lucide-react';

const FloatingImageToolbar = ({
    sticker,
    onChange,
    onDuplicate,
    onDelete,
    onMoveToFront,
    onMoveForward,
    onMoveBackward,
    onMoveToBack,
    position // { top, left }
}) => {
    const [showMore, setShowMore] = useState(false);
    const toolbarRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
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
                transform: 'translate(-50%, -100%) translateY(-12px)'
            }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Toolbar Body */}
            <div className="flex items-center gap-1 p-1 bg-[#1e1e1e] rounded-full shadow-2xl border border-zinc-700/50 text-white">

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



                {/* More Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showMore ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    {/* Expanded Menu - Matching the reference image style */}
                    {showMore && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#1e1e1e] border border-zinc-700/50 rounded-xl shadow-xl p-1 z-[60] flex flex-col gap-0.5">

                            {/* Actions Group */}
                            <button onClick={() => { onDuplicate(); setShowMore(false); }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg text-left transition-colors">
                                <Copy size={14} className="text-zinc-500" /> Duplicate
                            </button>
                            <button onClick={() => { onDelete(); setShowMore(false); }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-red-400 hover:bg-red-400/10 rounded-lg text-left transition-colors">
                                <Trash size={14} /> Delete
                            </button>

                            {/* Placeholder for Lock - Just visual for now or can implement logic later */}
                            <button className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-zinc-500 hover:bg-zinc-800 rounded-lg text-left transition-colors cursor-not-allowed opacity-50">
                                <Lock size={14} /> Lock
                            </button>

                            <div className="h-px bg-zinc-700/50 my-1" />

                            {/* Layering Group */}
                            <button onClick={() => { onMoveToFront(); setShowMore(false); }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg text-left transition-colors">
                                <BringToFront size={14} className="text-zinc-500" /> Bring to front
                            </button>
                            <button onClick={() => { onMoveForward(); setShowMore(false); }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg text-left transition-colors">
                                <ArrowUp size={14} className="text-zinc-500" /> Bring forward
                            </button>
                            <button onClick={() => { onMoveBackward(); setShowMore(false); }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg text-left transition-colors">
                                <ArrowDown size={14} className="text-zinc-500" /> Send backward
                            </button>
                            <button onClick={() => { onMoveToBack(); setShowMore(false); }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg text-left transition-colors">
                                <SendToBack size={14} className="text-zinc-500" /> Send to back
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Pointer */}
            <div className="w-3 h-3 bg-[#1e1e1e] border-b border-r border-zinc-700/50 rotate-45 -mt-1.5 z-40"></div>
        </div>
    );
};

export default FloatingImageToolbar;
