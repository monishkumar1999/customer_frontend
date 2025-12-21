import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock login - in a real app this would call an API
        console.log("Logging in with", email, password);
        navigate('/');
    };

    return (
        <div className="bg-white text-slate-900 font-sans h-screen overflow-hidden flex w-full">
            {/* Left Side - Abstract 3D Background */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-end bg-slate-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        alt="3D Creative Abstract"
                        className="w-full h-full object-cover opacity-90 scale-105"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBztnsajR4Q0TEQnXXSqrfLyNOq76qgMEe6a3ScR-tH_J_z_M0LC5r6NgTYiSWDT9muCrDVCPXWRhMMMsZ8iCsjKdAWrzcL714GnGrKPPdcrduFVKDpmoXq_2F37Lr9s16YgzuAWbWojWMDcNCV2CJnXFIKjlmiND94uUDsT6lVttZS0zBMMDKFJ5kAXVxCTr1qfP62PZPuAAHmEGfzloJDwMOUhSoLdNU0UbHpsPmjIn4bIzWOwcrXdEgxfqN4XSGVIDret_SHsw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-[#137fec]/20 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                </div>
                <div className="relative z-10 p-16 w-full max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-semibold mb-6 shadow-lg">
                        <span className="material-symbols-outlined text-[16px] text-green-400">verified</span>
                        <span>Trusted by 10,000+ top designers</span>
                    </div>
                    <h1 className="font-display text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight drop-shadow-sm">
                        Turn your imagination <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">into reality.</span>
                    </h1>
                    <p className="text-lg text-slate-300 mb-10 max-w-lg leading-relaxed">
                        Join a community of creators designing custom 3D shirts and unique gifts with our powerful, award-winning editor.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-4">
                            <img alt="User" className="w-12 h-12 rounded-full border-2 border-slate-900 ring-2 ring-white/20 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDegKGiULgJqTQ0FdbYMkWFp1ReTp2_II0DApt2QAPuYkLe44cHEAVXWu4cwMYNYwkK8PA7Jj5elCgAWCZtFg3b8M3sBwGL17xXvuXochSQWxGeu-eKoENJDdoY7kbffReme-eeAQTIFGtHNKR1BXUcvpMVbLXkGAL6UuAzCWSiqojzZ-7yqJSFaXGfLYvChf8pL1npvN-JNLLAj0rPv4b8bFniDubQ35tuH1kMyRimGgm5AozPngR5X-uLOQ3u9FEIOKjdabLOuQ" />
                            <img alt="User" className="w-12 h-12 rounded-full border-2 border-slate-900 ring-2 ring-white/20 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlLDg1ibjBg_h2Kg6jGf_YskNZnr_jqUjxREHqczgTYWjbg1OwzKRUIxhw3KGD8oZBCSst6CyLhd7k6z6PEKzboMybdFnVC2vBpYRspQqg3liH1VegBaZBvnpZuMeVxR9jAjFxecsL__XWzGHnuJnQ7jklhipD4GkKaABKdaTMRgpKaAid1lQRBkdVHJZUexqQ1KM_Nv-m2jueLKS3tus1Gm8HBIoMGTjR0ki46q_aCmDJTvWW7k0o9aWQPx4oQDhRRTwg07vWqA" />
                            <img alt="User" className="w-12 h-12 rounded-full border-2 border-slate-900 ring-2 ring-white/20 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA43I3uCirA-V9DOQEgz9P9FQRT6Qk_MadIsAUJ9buGP08xevKGmaVRXntbpHn03ieVVBNSolJjQ8EXJOpOZlzNPsEGaVBHp0Gl-OBMxuyXJl62R3kxKElAWkbovYKwKZUywsYecJAzjkGkx2QDOuJQqOH3_JBjEE4HVMX37lTsZDHxmuj9Sc-1Zaw9s6tHoE9E-eNGZ6YhEne3RRo5LRJLOV7xKi7Uw_P9OKGbl2OzuxB4sSFjbdUqIJL6t0dY7jy95IPCCd95mg" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex text-yellow-400 text-[18px]">
                                <span className="material-symbols-outlined fill-1">star</span>
                                <span className="material-symbols-outlined fill-1">star</span>
                                <span className="material-symbols-outlined fill-1">star</span>
                                <span className="material-symbols-outlined fill-1">star</span>
                                <span className="material-symbols-outlined fill-1">star</span>
                            </div>
                            <span className="text-white text-sm font-medium">4.9/5 from 2,400 reviews</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col relative bg-white overflow-y-auto">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <header className="w-full px-8 py-6 flex justify-between items-center relative z-20">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="size-9 bg-gradient-to-br from-[#137fec] to-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-[#137fec]/30">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-slate-800">3D Editor</span>
                    </div>
                    <div className="hidden sm:block text-sm font-medium">
                        <span className="text-slate-500">Don't have an account?</span>
                        <a className="text-[#137fec] hover:text-[#0b63c1] ml-1 font-semibold transition-colors cursor-pointer" onClick={() => navigate('/signup')}>Sign up now</a>
                    </div>
                </header>

                <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 relative z-10">
                    <div className="w-full max-w-[440px] space-y-8">
                        <div className="text-center sm:text-left">
                            <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                            <p className="text-slate-500 text-base">Please enter your details to access your creative space.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 h-12 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm cursor-pointer">
                                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuChld1ZeDo5TMHGBkb7vZH5DZTx6L6FSVwXlkIlVPiRrsZl5gWLXt4aXIM2qS4OO1ZbfIgzMWkIS2zHDmaqW1Rt7efXswTWi5FpFJG0-RFP20EmnVHaEhE5p1gdlollyh5KKQ92pD8ZQcRbl5PNZUKUxO3xuK6fehqG1kAjZBFlQMPuNRmDinOxuqs9sbdXpCXE8h-sohKo0sQ-qjODWJTOSwUJ0Rx-aI6Dzv3mxePdQ40CB05XtEAFTmr7lmvOYZzshxm-0YAQCg" />
                                <span className="text-sm">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 h-12 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm cursor-pointer">
                                <img alt="Facebook" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9rXTOXnf5eNcifT7agNKsVqXKnSV60lodEYyMpp70rM9wQWYQiTFhoziqOfNO8yhQYOikwe8MKs7hSdcpHowGXqQIxqoupwexXYkxuSzXk2ClNVaoG0TSsJnDEoTNluiL-SbzlbzkvtaN-ngPDuJWQ-B2Chn-0rOX86I0HEl0M9WgidQg4syD8fKqs6Nnsc5DJX9EWJUEzM-lNYpL8nBt_bUVRcplAT5OzfOjM-4QAMYzcFg6hBVx1IPsZAt41OhE8KQZeOcdlA" />
                                <span className="text-sm">Facebook</span>
                            </button>
                        </div>
                        <div className="relative flex items-center gap-4">
                            <div className="h-px bg-slate-200 w-full"></div>
                            <span className="text-xs uppercase font-semibold text-slate-400 whitespace-nowrap">Or sign in with</span>
                            <div className="h-px bg-slate-200 w-full"></div>
                        </div>
                        <form className="space-y-5" onSubmit={handleLogin}>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700" htmlFor="email">Email Address</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#137fec] transition-colors">mail</span>
                                    <input
                                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#137fec] focus:ring-4 focus:ring-[#137fec]/10 transition-all duration-200 shadow-input font-medium"
                                        id="email"
                                        placeholder="name@company.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                                    <a className="text-sm font-semibold text-[#137fec] hover:text-[#0b63c1] transition-colors cursor-pointer">Forgot Password?</a>
                                </div>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#137fec] transition-colors">lock</span>
                                    <input
                                        className="w-full h-12 pl-11 pr-11 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#137fec] focus:ring-4 focus:ring-[#137fec]/10 transition-all duration-200 shadow-input font-medium"
                                        id="password"
                                        placeholder="••••••••"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600">visibility_off</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                                <div className="relative flex items-center">
                                    <input className="w-5 h-5 rounded border-slate-300 text-[#137fec] focus:ring-[#137fec]/20 cursor-pointer" id="remember" type="checkbox" />
                                </div>
                                <label className="text-sm font-medium text-slate-600 cursor-pointer select-none" htmlFor="remember">Remember me for 30 days</label>
                            </div>
                            <button className="w-full h-12 bg-gradient-to-r from-[#137fec] to-blue-600 hover:from-[#0b63c1] hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-base cursor-pointer" type="submit">
                                Log In
                            </button>
                        </form>
                        <div className="sm:hidden text-center text-sm font-medium">
                            <span className="text-slate-500">Don't have an account?</span>
                            <a className="text-[#137fec] hover:text-[#0b63c1] ml-1 font-bold cursor-pointer" onClick={() => navigate('/signup')}>Sign up</a>
                        </div>
                    </div>
                </div>
                <footer className="py-6 text-center relative z-20">
                    <p className="text-xs text-slate-400">
                        By logging in, you agree to our
                        <a className="underline hover:text-slate-600 transition-colors ml-1 cursor-pointer">Terms of Service</a> and
                        <a className="underline hover:text-slate-600 transition-colors ml-1 cursor-pointer">Privacy Policy</a>.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default LoginPage;
