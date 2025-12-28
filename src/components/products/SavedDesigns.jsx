import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";

const SavedDesigns = () => {
    const navigate = useNavigate();
    const { savedDesigns, deleteDesign } = useStore();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Saved Designs</h1>
                    <p className="text-slate-500 text-sm mt-1">View and manage your locally saved 3D design configurations</p>
                </div>
                <button
                    onClick={() => navigate('/products')}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    Back to Catalog
                </button>
            </div>

            {savedDesigns.length === 0 ? (
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
                            <div className="p-0 bg-slate-900 relative">
                                <div className="absolute top-2 right-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">Design JSON</div>
                                <pre className="p-6 overflow-auto max-h-[400px] text-sm font-mono text-emerald-400/90 leading-relaxed custom-scrollbar">
                                    {JSON.stringify(design, null, 2)}
                                </pre>
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
