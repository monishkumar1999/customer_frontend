import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Trash, Edit3, Eye, Clock, Box } from 'lucide-react';

const SavedDesignList = () => {
    const { savedDesigns, deleteDesign, loadDesign } = useStore();
    const navigate = useNavigate();

    const handleEdit = (design) => {
        // Load the design into the store
        loadDesign(design.id);

        // Find the product ID. If design.glbUrl exists, we might need to extract ID if possible or store it.
        // Assuming we have product name and can find ID or stored it. 
        // Let's improve the store to save productID too.
        // For now, if we don't have productID, we can navigate back to some page.
        // But usually, saved designs should know which product they belong to.

        // In the previous saveDesign implementation, I didn't save productId. 
        // I should fix that in useStore first.
    };

    return (
        <div className="p-8 bg-zinc-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900">Your Saved Designs</h1>
                        <p className="text-zinc-500 text-sm">Manage and continue editing your previous custom designs</p>
                    </div>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-white border border-zinc-200 px-4 py-2 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all flex items-center gap-2"
                    >
                        <Box size={16} /> New Design
                    </button>
                </div>

                {savedDesigns.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-zinc-200 border-dashed p-20 text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-400">
                            <Box size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 mb-2">No Saved Designs</h2>
                        <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-8">
                            You haven't saved any designs yet. Start customizing a product to see it here.
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                        >
                            Explore Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedDesigns.map((design) => (
                            <div key={design.id} className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all overflow-hidden group">
                                {/* Simple Placeholder for 3D Preview (Full preview in Editor) */}
                                <div className="aspect-square bg-zinc-100 relative flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                                    <Box size={40} className="text-zinc-300 relative z-10" />
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-1">
                                        {Object.values(design.meshColors || {}).slice(0, 5).map((color, i) => (
                                            <div key={i} className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-wide">
                                                {design.productName || 'Custom Project'}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold mt-1">
                                                <Clock size={12} />
                                                {new Date(design.timestamp).toLocaleDateString()} at {new Date(design.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                // We'll need the productId to navigate back to the editor
                                                if (design.productId) {
                                                    navigate(`/product/edit/${design.productId}?designId=${design.id}`);
                                                } else {
                                                    alert("Product ID not found in saved design. Cannot edit.");
                                                }
                                            }}
                                            className="flex-1 bg-zinc-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Edit3 size={14} /> Continue Editing
                                        </button>
                                        <button
                                            onClick={() => deleteDesign(design.id)}
                                            className="w-12 h-12 border border-zinc-200 flex items-center justify-center rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedDesignList;
