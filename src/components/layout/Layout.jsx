import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const Header = () => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 shrink-0 z-40 flex items-center justify-between px-4 lg:px-6 shadow-subtle relative">
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-lg bg-primary group-hover:bg-primary-dark transition-colors flex items-center justify-center text-white shadow-md shadow-primary/20">
                        <span className="material-symbols-outlined text-[22px]">view_in_ar</span>
                    </div>
                    <div>
                        <span className="block font-bold text-lg tracking-tight text-slate-900 leading-none">3D Studio</span>
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Enterprise</span>
                    </div>
                </Link>
                <nav className="hidden md:flex items-center gap-1">
                    <NavLink to="/" className={({ isActive }) => `px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>Home</NavLink>
                    <NavLink to="/products" className={({ isActive }) => `px-3 py-2 text-sm font-medium rounded-md transition-colors relative ${isActive ? 'text-primary bg-primary/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                        {({ isActive }) => (
                            <>
                                Product Catalog
                                {isActive && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"></span>}
                            </>
                        )}
                    </NavLink>
                    <NavLink to="/designs" className={({ isActive }) => `px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>My Designs</NavLink>
                    <NavLink to="/studio" className={({ isActive }) => `px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>AI Studio</NavLink>
                    <NavLink to="/templates" className={({ isActive }) => `px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>Templates</NavLink>
                </nav>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative hidden lg:block group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-[18px]">search</span>
                    <input className="h-9 w-64 pl-9 pr-4 rounded-full bg-slate-100 border border-transparent focus:bg-white focus:border-primary/30 text-sm focus:ring-4 focus:ring-primary/10 text-slate-900 placeholder:text-slate-400 transition-all" placeholder="Search catalog..." type="text" />
                </div>
                <div className="h-6 w-px bg-slate-200 mx-1 hidden lg:block"></div>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors relative">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                </button>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 pl-2 rounded-full border border-transparent hover:border-slate-200 transition-all ml-1">
                    <div className="text-right hidden xl:block leading-tight mr-1">
                        <p className="text-xs font-semibold text-slate-700">Alex Morgan</p>
                        <p className="text-[10px] text-slate-400">Pro Member</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 bg-cover bg-center ring-2 ring-white shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCv4LGJNRmN6mNVbZkSOl54QwKUiMRCgRMKRgItvR9IpP-Y2flY_7f9VmfPKigCUiGPZT0Qs7uSTeSplE-ZiW268785kg9sqvvc9IJI1eFTzP0B6TsstowRni8GIdYxJ5LzlI0IPeDDeWhl6ZGTAxlnkdPQR4WpXxOhedD7457wpx25UUpGzYzRgyV6jIULL7ETIt1J92w3n-OMmO0piFItXacgTx4fx4M236IV82jngGWxCSgCghp0mFjLu7zqrTetZSWvUYWWKA')" }}></div>
                </div>
            </div>
        </header>
    );
};

const Sidebar = () => {
    const [expandedCategory, setExpandedCategory] = useState("Apparel");

    const toggleCategory = (category) => {
        setExpandedCategory(expandedCategory === category ? null : category);
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto hidden md:flex z-30">
            <div className="p-5 flex flex-col h-full">
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 mb-6 shrink-0 group">
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">add_circle</span>
                    New Project
                </button>
                <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-6">
                    <div>
                        <h3 className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Browse by Category</h3>
                        <nav className="space-y-1">
                            {/* Apparel Group */}
                            <div className="group">
                                <button
                                    onClick={() => toggleCategory("Apparel")}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${expandedCategory === "Apparel" ? "text-slate-900 bg-slate-50 border-slate-100 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-[20px] ${expandedCategory === "Apparel" ? "text-primary" : "text-slate-400 group-hover:text-primary transition-colors"}`}>checkroom</span>
                                        Apparel
                                    </div>
                                    <span className={`material-symbols-outlined text-[18px] transition-transform ${expandedCategory === "Apparel" ? "text-slate-400 rotate-180" : "text-slate-300 group-hover:text-slate-500"}`}>expand_more</span>
                                </button>
                                {expandedCategory === "Apparel" && (
                                    <div className="pl-4 pr-1 pt-1 pb-1 space-y-0.5 relative">
                                        <div className="absolute left-[21px] top-0 bottom-2 w-px bg-slate-200"></div>
                                        <a href="#" className="block px-3 py-1.5 text-sm font-medium text-primary bg-primary/5 rounded-md relative ml-4">All Apparel</a>
                                        <a href="#" className="block px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors ml-4">T-Shirts</a>
                                        <a href="#" className="block px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors ml-4">Hoodies</a>
                                        <a href="#" className="block px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors ml-4">Activewear</a>
                                    </div>
                                )}
                            </div>

                            {/* Home & Living Group */}
                            <div className="group pt-1">
                                <button
                                    onClick={() => toggleCategory("Home")}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${expandedCategory === "Home" ? "text-slate-900 bg-slate-50 border-slate-100 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-[20px] ${expandedCategory === "Home" ? "text-primary" : "text-slate-400 group-hover:text-primary transition-colors"}`}>chair</span>
                                        Home & Living
                                    </div>
                                    <span className={`material-symbols-outlined text-[18px] transition-transform ${expandedCategory === "Home" ? "text-slate-400 rotate-180" : "text-slate-300 group-hover:text-slate-500"}`}>expand_more</span>
                                </button>
                                {expandedCategory === "Home" && (
                                    <div className="pl-4 pr-1 pt-1 pb-1 space-y-0.5 relative">
                                        <div className="absolute left-[21px] top-0 bottom-2 w-px bg-slate-200"></div>
                                        <a href="#" className="block px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors ml-4">Mugs</a>
                                        <a href="#" className="block px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors ml-4">Pillows</a>
                                    </div>
                                )}
                            </div>

                            {/* Accessories Group */}
                            <div className="group pt-1">
                                <button
                                    onClick={() => toggleCategory("Accessories")}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${expandedCategory === "Accessories" ? "text-slate-900 bg-slate-50 border-slate-100 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-[20px] ${expandedCategory === "Accessories" ? "text-primary" : "text-slate-400 group-hover:text-primary transition-colors"}`}>shopping_bag</span>
                                        Accessories
                                    </div>
                                    <span className={`material-symbols-outlined text-[18px] transition-transform ${expandedCategory === "Accessories" ? "text-slate-400 rotate-180" : "text-slate-300 group-hover:text-slate-500"}`}>expand_more</span>
                                </button>
                            </div>

                            {/* Office Group */}
                            <div className="group pt-1">
                                <button
                                    onClick={() => toggleCategory("Office")}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${expandedCategory === "Office" ? "text-slate-900 bg-slate-50 border-slate-100 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-[20px] ${expandedCategory === "Office" ? "text-primary" : "text-slate-400 group-hover:text-primary transition-colors"}`}>desk</span>
                                        Office
                                    </div>
                                    <span className={`material-symbols-outlined text-[18px] transition-transform ${expandedCategory === "Office" ? "text-slate-400 rotate-180" : "text-slate-300 group-hover:text-slate-500"}`}>expand_more</span>
                                </button>
                            </div>

                        </nav>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Refine Search</h3>
                        <div className="px-2 mb-6">
                            <div className="flex items-center justify-between text-xs text-slate-700 font-semibold mb-2">
                                Price Range
                                <span className="text-primary">$0 - $100</span>
                            </div>
                            <input className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" type="range" />
                        </div>
                        <div className="px-2 space-y-2">
                            <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer group">
                                <input className="peer sr-only" type="checkbox" />
                                <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center text-white group-hover:border-primary peer-checked:bg-primary peer-checked:border-primary transition-all">
                                    <span className="material-symbols-outlined text-[14px]">check</span>
                                </div>
                                <span>New Arrivals</span>
                            </label>
                            <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer group">
                                <input className="peer sr-only" type="checkbox" />
                                <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center text-white group-hover:border-primary peer-checked:bg-primary peer-checked:border-primary transition-all">
                                    <span className="material-symbols-outlined text-[14px]">check</span>
                                </div>
                                <span>Eco-Friendly</span>
                            </label>
                            <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer group">
                                <input className="peer sr-only" type="checkbox" />
                                <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center text-white group-hover:border-primary peer-checked:bg-primary peer-checked:border-primary transition-all">
                                    <span className="material-symbols-outlined text-[14px]">check</span>
                                </div>
                                <span>Best Sellers</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="pt-4 border-t border-slate-200 mt-auto">
                    <a href="#" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">help</span>
                        Help Center
                    </a>
                </div>
            </div>
        </aside>
    );
};

const Layout = ({ children }) => {
    const location = useLocation();
    const showSidebar = location.pathname === '/products';

    return (
        <div className="bg-background-light text-slate-900 font-display h-screen flex flex-col overflow-hidden antialiased">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                {showSidebar && <Sidebar />}
                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-10 relative scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
