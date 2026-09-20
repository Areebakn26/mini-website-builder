import React from 'react';
import { useBuilderStore } from '../store/useBuilderStore';

export default function LandingPage() {
  const { setViewState } = useBuilderStore();

  const handleEnterDashboard = (e) => {
    if (e) e.preventDefault();
    setViewState('dashboard');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#02060f] text-white font-['Sora',sans-serif] select-none">
      {/* Sora Variable Font */}
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@100..900&display=swap" rel="stylesheet" />

      {/* 1. Background Video */}
      <video
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none bg-[#03060c]"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/130837c4-0244-4f37-9c61-8d801d93fd29.jpg"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104303_0c6d60b2-9353-408e-9449-585108a22fb5.mp4"
      />

      {/* 2. Veil Scrim Gradient Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(140%_60%_at_50%_40%,rgba(6,10,18,0.16)_0%,rgba(6,10,18,0.057)_50%,rgba(6,10,18,0)_100%),linear-gradient(180deg,rgba(6,10,18,0)_45%,rgba(6,10,18,0.10)_100%)]" />

      {/* 3. Header Navbar */}
      <header className="fixed top-0 left-0 right-0 z-10 px-6 sm:px-12 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <button onClick={handleEnterDashboard} className="flex items-center gap-2 text-left group">
          <svg className="w-6 h-4 text-white fill-current group-hover:scale-105 transition" viewBox="0 0 23 17">
            <path d="M8.15 0.9 L4.55 0.9 L0.5 9.3 L4.1 9.3 Z" />
            <path d="M17.0 0 L13.4 0 L6.15 16.4 L9.75 16.4 Z" />
            <path d="M22.9 0 L19.3 0 L15.0 7.6 L18.6 7.6 Z" />
            <path d="M22.6 6.9 L19.0 6.9 L14.05 16.4 L17.65 16.4 Z" />
          </svg>
          <span className="font-semibold text-lg tracking-[0.2em] text-white font-['Sora']">
            WEBCRAFT AI
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button onClick={handleEnterDashboard} className="hover:text-white transition">About</button>
          <button onClick={handleEnterDashboard} className="hover:text-white transition">Templates</button>
          <button onClick={handleEnterDashboard} className="hover:text-white transition">Features</button>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={handleEnterDashboard}
            className="hidden sm:inline-flex text-xs font-medium text-slate-300 hover:text-white transition"
          >
            Log in / Access
          </button>

          <button
            onClick={handleEnterDashboard}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md transition shadow-lg hover:shadow-violet-500/20 active:scale-95"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* 4. Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 max-w-4xl mx-auto pt-16">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[1.1] text-white space-y-2">
          <span className="block font-light">AI-Powered Website Builder</span>
          <span className="block font-normal bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Build Fast, Right on Target.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl font-light leading-relaxed">
          We build extraordinary web applications for ambitious creators.
        </p>

        {/* Glassmorphic Call to Action Button */}
        <div className="mt-8">
          <button
            onClick={handleEnterDashboard}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white bg-gradient-to-r from-violet-600/30 via-indigo-500/20 to-violet-600/30 hover:from-violet-600/50 hover:to-indigo-600/50 border border-white/40 shadow-2xl backdrop-blur-xl transition-all duration-300 active:scale-95 hover:shadow-violet-500/30"
          >
            <span>Start building today</span>
            <svg className="w-4 h-3 stroke-white fill-none stroke-[2] transition-transform group-hover:translate-x-1" viewBox="0 0 16 11">
              <path d="M0 5.5 H14.6 M10.3 1.2 L14.9 5.5 L10.3 9.8" />
            </svg>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-300 max-w-3xl">
          <div className="flex items-center gap-2 justify-center">
            <svg className="w-3 h-5 stroke-violet-400 fill-none stroke-[2]" viewBox="0 0 11 20"><path d="M1.15 1.15 L9.6 10 L1.15 18.85"/></svg>
            <span>Real-time streaming</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <svg className="w-3 h-5 stroke-violet-400 fill-none stroke-[2]" viewBox="0 0 11 20"><path d="M1.15 1.15 L9.6 10 L1.15 18.85"/></svg>
            <span>Monaco code editor</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <svg className="w-3 h-5 stroke-violet-400 fill-none stroke-[2]" viewBox="0 0 11 20"><path d="M1.15 1.15 L9.6 10 L1.15 18.85"/></svg>
            <span>Responsive preview</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <svg className="w-3 h-5 stroke-violet-400 fill-none stroke-[2]" viewBox="0 0 11 20"><path d="M1.15 1.15 L9.6 10 L1.15 18.85"/></svg>
            <span>One-click export</span>
          </div>
        </div>

        <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent mt-12 mx-auto" />
      </main>

      {/* 5. Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 px-6 py-6 text-center text-xs text-slate-400 font-light flex items-center justify-between max-w-7xl mx-auto">
        <span>Trusted by innovative developers around the world.</span>
        <span>2026</span>
      </footer>
    </div>
  );
}
