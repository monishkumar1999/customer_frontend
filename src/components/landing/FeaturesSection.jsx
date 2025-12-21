import React from 'react';

const FeaturesSection = () => {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-4xl font-black text-[#111418] mb-6 tracking-tight">One Platform, Infinite Possibilities</h2>
                    <p className="text-lg text-gray-500 leading-relaxed">
                        Say goodbye to expensive photoshoots and complex 3D software. Our AI studio gives you everything you need to showcase your products professionally.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="group h-full bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                        <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">view_in_ar</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#111418] mb-3 group-hover:text-blue-600 transition-colors">3D Mock Generator</h3>
                        <p className="text-sm text-gray-500 mb-8 flex-1 leading-relaxed">
                            Instantly convert 2D designs into rotatable 3D models. Let customers inspect quality from every angle.
                        </p>
                        <div className="rounded-2xl overflow-hidden h-48 w-full bg-gray-50 relative shadow-inner">
                            <img alt="3D Mockup Example" className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5qF5-wV8QiS1-5_tTrcS8WebQPx9VllJo8RR6f3ElqnrjgIiiTFxJMCeNZEO8XOMJz_U97eNSlak8mhOMXtwn1o_aXi7K7hANZklweUnYatFetryNaL9Sgi2kviXadj2BvNVidao142U6LrPB10QyhWdnKcq4AK3rtjXgv_FdcE8ZQNa5IL0IgtL_kBqKd2IDwB4p0j6RjhfrftLbn0Zm3tZPx82whct26eQw-a3Pk2d_pxJaTN1DNwNyIKlixI-T-hWDGYBQTg" />
                            <div className="absolute bottom-3 right-3 bg-white backdrop-blur text-[10px] font-bold px-2 py-1 rounded shadow-sm text-gray-800 flex items-center gap-1 border border-gray-100">
                                <span className="material-symbols-outlined text-sm">360</span> Interactive
                            </div>
                        </div>
                    </div>
                    <div className="group h-full bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                        <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#111418] mb-3 group-hover:text-purple-600 transition-colors">AI Image Studio</h3>
                        <p className="text-sm text-gray-500 mb-8 flex-1 leading-relaxed">
                            Place products in any setting imaginable. Use simple text prompts to generate pro-level lifestyle photography.
                        </p>
                        <div className="rounded-2xl overflow-hidden h-48 w-full bg-gray-50 relative shadow-inner">
                            <img alt="AI Image Example" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl8FeZ3SbGTtQhx4WESaUkFd5e8I0qu4G7gSLl7NN2Tvb3q4Yo9chg4jrDYDbViCKYhzoi-h_R8lgIZ0-qbOZajKj7YQYI-jRcHHTNj3PcPmJuuOAKfqBbcrEi1aAq9Ey8P42ccyh0nqABjmZB71zrHtHTcO3rCOQieNU2W4Z-YM9Zc1Lo_1Vr7UMDfhLJQ3OCFA-dK5fu53BfRwYtzGbYYacAFc4VCQ0eDIUFkVDCVbSjPHmOvx5LUdSndFyq6MCcxPrtEDCusA" />
                            <div className="absolute bottom-3 right-3 bg-white backdrop-blur text-[10px] font-bold px-2 py-1 rounded shadow-sm text-gray-800 flex items-center gap-1 border border-gray-100">
                                <span className="material-symbols-outlined text-sm">magic_button</span> Generated
                            </div>
                        </div>
                    </div>
                    <div className="group h-full bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                        <div className="w-14 h-14 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">play_circle</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#111418] mb-3 group-hover:text-pink-600 transition-colors">AI Video Creator</h3>
                        <p className="text-sm text-gray-500 mb-8 flex-1 leading-relaxed">
                            Turn static mocks into viral video ads. Add cinematic camera moves, lighting effects, and animated backdrops.
                        </p>
                        <div className="rounded-2xl overflow-hidden h-48 w-full bg-gray-50 relative shadow-inner">
                            <img alt="AI Video Example" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlJYjROwC9g0M3zrCvg2LEgSyGW9j6bPmQLVN14kRvvNMHliCQh_aD-bXz3tQusJyJqKYIht7k-4FxM9oVBu-SZ0CQ6P216xJppU3QPkrEDn1B8UOwt47Tm_JepoSbbKifBEuYhKUVpj98JB0SCom3zrv3N9z04sifV_MzfLwQgSNYwsRB80XLA3ZZ4G6tk5A6bjLTCTWaJcatEHEvW-0X3FCnqofc-HIaZ8uHAXDmHhes2wLWdbbwG8ViS1_b87qZDrRaMALFtQ" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                <div className="w-10 h-10 bg-white/30 backdrop-blur rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-white text-xl fill-1">play_arrow</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
