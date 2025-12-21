import React from 'react';
import { useNavigate } from 'react-router-dom';
import BenefitsSection from './BenefitsSection';
import FeaturesSection from './FeaturesSection';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="font-display bg-white text-[#111418] overflow-x-hidden">
            <div className="relative flex min-h-screen w-full flex-col">
                <header className="sticky top-0 z-50 flex flex-none items-center justify-between whitespace-nowrap border-b border-solid border-[#f0f2f4] bg-white/95 backdrop-blur-md px-6 lg:px-10 py-3">
                    <div className="flex items-center gap-4 text-[#111418]">
                        <div className="size-8 text-primary">
                            <span className="material-symbols-outlined text-3xl">deployed_code</span>
                        </div>
                        <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]">PrintCraft3D</h2>
                    </div>
                    <div className="flex flex-1 justify-end gap-8">
                        <div className="hidden md:flex items-center gap-9">
                            <a className="text-slate-600 text-sm font-medium leading-normal hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/products')}>Products</a>
                            <a className="text-slate-600 text-sm font-medium leading-normal hover:text-primary transition-colors cursor-pointer">Showcase</a>
                            <a className="text-slate-600 text-sm font-medium leading-normal hover:text-primary transition-colors cursor-pointer">Pricing</a>
                            <a className="text-primary text-sm font-bold leading-normal cursor-pointer" onClick={() => navigate('/login')}>AI Studio</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/login')} className="hidden sm:flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors shadow-glow cursor-pointer">
                                Start Creating
                            </button>
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-slate-100 shadow-sm cursor-pointer" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCPz6ESbgUdPVQ41ZNnAYafqh3ubCVtW1X-LTgMn2-fKvbkRUaGM-te4KyG6VcByptKtKsK-XIAOLIb-rCFQIuoF-VU1kJ8YOJOCfUPu82xLNWGHd4cI0276rw5hron4YhKUbWqpiGfa9alXdFK341As4wxJPGo4mpZKTZq9_ttVESLxx6vW1KZJ314wv5VV6-Xlx1QsD5eOSLsbhcCQz9QiI9oKDOjWem7Fhpx_1z1eFTotZSjTkiNv9imgrFED9zhdUS09qM76g")' }}></div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col">
                    <section className="relative pt-10 pb-24 lg:pt-12 lg:pb-10 overflow-hidden bg-white">
                        <div className="absolute inset-0 -z-10">
                            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/60 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
                        </div>
                        <div className="container mx-auto px-6 lg:px-12 relative z-10">
                            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
                                <div className="flex-1 text-left max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-primary mb-6">
                                        <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                                        <span className="text-xs font-bold uppercase tracking-wide">Multi-Product Support</span>
                                    </div>
                                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                                        Customize <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] to-[#8b5cf6]">Anything</span> in <br />
                                        Real-Time 3D.
                                    </h1>
                                    <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-xl">
                                        From t-shirts and hoodies to mugs and photo frames. Give your customers the power to personalize any product directly in their browser with our advanced AI studio.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button onClick={() => navigate('/login')} className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-base shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer">
                                            Start Creating <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-xl">arrow_forward</span>
                                        </button>
                                        <button onClick={() => navigate('/products')} className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                                            <span className="material-symbols-outlined text-xl">play_circle</span> See Demo
                                        </button>
                                    </div>
                                    <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-3 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <span className="material-symbols-outlined text-slate-400">checkroom</span>
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Apparel</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="material-symbols-outlined text-slate-400">local_cafe</span>
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Drinkware</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="material-symbols-outlined text-slate-400">chair</span>
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Home Decor</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 w-full lg:w-auto">
                                    <div className="relative rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden aspect-[4/3] group">
                                        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                            </div>
                                            <div className="flex-1 mx-4">
                                                <div className="h-8 bg-slate-50 rounded-lg flex items-center px-3 border border-slate-100 max-w-xs mx-auto text-xs text-slate-400">
                                                    <span className="material-symbols-outlined text-[16px] mr-2">lock</span> T-Shirt (Unisex)
                                                    <span className="material-symbols-outlined text-[16px] ml-auto">expand_more</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 text-slate-400">
                                                <span className="material-symbols-outlined text-[18px]">undo</span>
                                                <span className="material-symbols-outlined text-[18px]">redo</span>
                                                <button className="bg-primary text-white text-xs px-3 py-1 rounded font-medium ml-2">Export</button>
                                            </div>
                                        </div>
                                        <div className="relative w-full h-full bg-[#111418] flex">
                                            <div className="w-16 border-r border-white/10 flex flex-col items-center py-6 gap-6">
                                                <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                                                    <span className="material-symbols-outlined">person</span>
                                                </div>
                                                <div className="w-10 h-10 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                                                    <span className="material-symbols-outlined">palette</span>
                                                </div>
                                                <div className="w-10 h-10 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                                                    <span className="material-symbols-outlined">title</span>
                                                </div>
                                                <div className="w-10 h-10 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                                                    <span className="material-symbols-outlined">image</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 relative flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1e293b] to-[#0f172a]">
                                                <img alt="3D T-Shirt Model" className="h-4/5 object-contain drop-shadow-2xl scale-100 group-hover:scale-105 transition-transform duration-700 ease-out z-10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAilGHATX6-BL6ljINzwAm1_1ytogU1t1VJqBmGZPuN1PihsolqFEXvhmvZ0geWxusIPJjrk56HH7to-Fyw1NbpmvtIJH09PqfRM2usbQE49A4RGtljI2-Tdq8e68VDLYDEZd-UmBkSWheQ0YsRPcGKrG3VsLCNDWZPe3qvRxRiB7tq-hwow9V6iPCSbC7KhmNA_6heZcBw5uhUym_mZR2BxlQYgGxsIWWtp681QalVgedemcsNCXy06Mn9X1WkH9t8NcTFcu_ooA" />
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-primary border-dashed rounded px-4 py-2 bg-primary/10 text-primary text-xs font-bold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                    LOGO ZONE
                                                </div>
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1a202c]/90 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 flex items-center gap-3">
                                                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mr-1">Color</span>
                                                    <button className="w-5 h-5 rounded-full bg-white border-2 border-primary"></button>
                                                    <button className="w-5 h-5 rounded-full bg-[#1F2937] hover:scale-110 transition-transform"></button>
                                                    <button className="w-5 h-5 rounded-full bg-red-500 hover:scale-110 transition-transform"></button>
                                                    <button className="w-5 h-5 rounded-full bg-blue-500 hover:scale-110 transition-transform"></button>
                                                    <button className="w-5 h-5 rounded-full bg-amber-400 hover:scale-110 transition-transform"></button>
                                                </div>
                                            </div>
                                            <div className="w-16 border-l border-white/10 flex flex-col items-center py-6 gap-6">
                                                <div className="w-10 h-10 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                                                    <span className="material-symbols-outlined">layers</span>
                                                </div>
                                                <div className="w-10 h-10 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                                                    <span className="material-symbols-outlined">format_shapes</span>
                                                </div>
                                            </div>
                                            <div className="absolute top-6 right-6 bg-white rounded-lg p-3 shadow-xl flex items-center gap-3 animate-bounce">
                                                <div className="w-8 h-8 bg-green-100 text-green-600 rounded flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-lg">inventory_2</span>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-slate-400 uppercase font-bold">Product Library</div>
                                                    <div className="text-xs font-bold text-slate-800">50+ Items Ready</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-20 lg:mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined">360</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">360° Product View</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">Allow customers to inspect every detail of the product from any angle directly in browser.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined">layers</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">Multi-Layer Editing</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">Add text, images, and stickers in layers for complex custom designs with ease.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined">shopping_bag</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">Ready for E-commerce</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">Export print-ready files and sync orders directly to your store seamlessly.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <BenefitsSection />
                    <FeaturesSection />
                    <section className="py-24 bg-[#f9fafb]">
                        <div className="container mx-auto px-6 text-center">
                            <h2 className="text-3xl font-bold text-[#111418] mb-8">Ready to create your next bestseller?</h2>
                            <button onClick={() => navigate('/login')} className="cursor-pointer bg-[#111418] text-white px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity shadow-lg">
                                Get Started for Free
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        </div >
    );
};

export default LandingPage;
