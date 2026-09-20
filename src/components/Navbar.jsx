import React from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { 
  Sparkles, 
  Eye, 
  Code, 
  Columns, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Download, 
  Copy, 
  Key,
  Check,
  PlusCircle,
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Navbar() {
  const { 
    currentCode, 
    viewport, 
    setViewport, 
    activeTab, 
    setActiveTab, 
    apiKey, 
    setIsApiKeyModalOpen,
    handleNewProject,
    setViewState
  } = useBuilderStore();

  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportHtml = () => {
    const blob = new Blob([currentCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.2 }
    });
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-20 select-none">
      {/* Brand Logo - Click returns to video landing page */}
      <button
        onClick={() => setViewState('landing')}
        title="Return to Home Landing Page"
        className="flex items-center gap-3 text-left hover:opacity-90 transition group"
      >
        <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-md shadow-violet-600/20 text-white">
          <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              WebCraft AI
            </span>
          </div>
        </div>
      </button>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'preview'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <button
          onClick={() => setActiveTab('split')}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'split'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Columns className="w-3.5 h-3.5" /> Split View
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === 'code'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" /> Code
        </button>
      </div>

      {/* Viewport Toggles */}
      {activeTab !== 'code' && (
        <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setViewport('desktop')}
            title="Desktop view (100%)"
            className={`p-1.5 rounded-lg text-xs transition ${
              viewport === 'desktop' ? 'bg-slate-800 text-violet-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            title="Tablet view (768px)"
            className={`p-1.5 rounded-lg text-xs transition ${
              viewport === 'tablet' ? 'bg-slate-800 text-violet-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            title="Mobile view (375px)"
            className={`p-1.5 rounded-lg text-xs transition ${
              viewport === 'mobile' ? 'bg-slate-800 text-violet-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewState('landing')}
          title="Return to Video Landing Page"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-medium transition active:scale-95"
        >
          <Home className="w-3.5 h-3.5 text-indigo-400" />
          <span>Home</span>
        </button>

        <button
          onClick={handleNewProject}
          title="New Project (Wipe slate clean)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-medium transition active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5 text-violet-400" />
          <span>New Project</span>
        </button>

        <button
          onClick={handleCopyCode}
          title="Copy HTML to clipboard"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-medium transition active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        <button
          onClick={handleExportHtml}
          title="Download HTML file"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export HTML</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        <button
          onClick={() => setIsApiKeyModalOpen(true)}
          title="AI API Settings"
          className="relative p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <Key className="w-4 h-4" />
          {apiKey ? (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
          ) : (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
}
