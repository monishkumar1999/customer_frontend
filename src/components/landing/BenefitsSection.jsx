import React from 'react';

const BenefitsSection = () => {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-primary font-bold tracking-wider text-xs uppercase mb-2 block">Why Choose Us</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#111418] mb-4">Unleash the full potential of 3D</h2>
                    <p className="text-slate-500">Our editor isn't just a tool; it's a sales engine designed to give your customers the confidence to click "Buy".</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">visibility</span>
                        </div>
                        <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">Real-time Visualization</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">See changes instantly. Rotate and inspect products from every angle before buying to eliminate surprises.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">verified</span>
                        </div>
                        <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">Enhanced Accuracy</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">What you see is what you get. High-fidelity rendering ensures digital proofs match the physical reality perfectly.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">rocket_launch</span>
                        </div>
                        <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">Unlimited Creativity</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">Upload, resize, and place artwork anywhere on the product canvas without technical restrictions.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">timer</span>
                        </div>
                        <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">Faster Decisions</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">Remove the guesswork. Interactive previews help customers decide 3x faster, significantly shortening sales cycles.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;
