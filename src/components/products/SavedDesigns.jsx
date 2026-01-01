import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";

const SavedDesigns = () => {
    const navigate = useNavigate();
    const { savedDesigns, deleteDesign, fetchSavedDesigns, isFetching, fetchError } = useStore();

    React.useEffect(() => {
        fetchSavedDesigns();
    }, []);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Saved Designs</h1>
                    <p className="text-slate-500 text-sm mt-1">View and manage your custom 3D design configurations</p>
                </div>
                <button
                    onClick={() => navigate('/products')}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    Back to Catalog
                </button>
            </div>

            {isFetching ? (
                <div className="bg-white border border-slate-200 rounded-xl p-24 text-center shadow-sm">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium tracking-wide">Retrieving your creative designs...</p>
                </div>
            ) : fetchError ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <span className="material-symbols-outlined text-[32px]">error</span>
                    </div>
                    <h2 className="text-lg font-semibold text-red-900 mb-2">Failed to load designs</h2>
                    <p className="text-red-500 max-w-sm mx-auto mb-6">{fetchError}</p>
                    <button
                        onClick={() => fetchSavedDesigns()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-md shadow-red-200"
                    >
                        Try Again
                    </button>
                </div>
            ) : !savedDesigns || savedDesigns.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-slate-300 text-[32px]">folder_open</span>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">No saved designs yet</h2>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">Start customizing products and save them to see your design configurations here.</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
                    >
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {savedDesigns.map((design) => (
                        <div key={design.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">design_services</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{design.productName || "Unnamed Design"}</h3>
                                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                                            ID: {design.id} • {new Date(design.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            navigate(`/product/edit/${design.productId}?designId=${design.id}`);
                                        }}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm shadow-indigo-100"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                        View & Edit Design
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to delete this design?")) {
                                                deleteDesign(design.id);
                                            }
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete Design"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 flex flex-wrap gap-4 border-b border-slate-100">
                                <div className="flex-1 min-w-[200px]">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Applied Configurations</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys((design.design_data || {}).meshColors || {}).length > 0 && (
                                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Custom Colors</span>
                                        )}
                                        {Object.keys((design.design_data || {}).meshStickers || {}).length > 0 && (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">Custom Stickers</span>
                                        )}
                                        {!(design.design_data?.meshColors && Object.keys(design.design_data.meshColors).length) &&
                                            !(design.design_data?.meshStickers && Object.keys(design.design_data.meshStickers).length) && (
                                                <span className="px-2 py-1 bg-slate-200 text-slate-500 rounded text-[10px] font-bold italic">No modifications</span>
                                            )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created on</p>
                                    <p className="text-xs font-medium text-slate-600">{new Date(design.createdAt || design.timestamp).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #0f172a;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}} />
        </div>
    );
};

export default SavedDesigns;
