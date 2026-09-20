import React, { useState } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { Key, Sparkles, X, Check, ShieldCheck, Globe, Cpu } from 'lucide-react';

const PROVIDER_PRESETS = [
  {
    name: 'Groq (GPT-120B)',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'openai/gpt-oss-120b'
  },
  {
    name: 'Groq (Llama 70B)',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile'
  },
  {
    name: 'xAI Grok',
    baseUrl: 'https://api.x.ai/v1',
    model: 'grok-2-latest'
  },
  {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o'
  }
];

export default function ApiKeyModal() {
  const { 
    apiKey, 
    setApiKey, 
    baseUrl, 
    setBaseUrl, 
    model, 
    setModel, 
    isApiKeyModalOpen, 
    setIsApiKeyModalOpen 
  } = useBuilderStore();

  const [inputKey, setInputKey] = useState(apiKey);
  const [inputBaseUrl, setInputBaseUrl] = useState(baseUrl);
  const [inputModel, setInputModel] = useState(model);
  const [saved, setSaved] = useState(false);

  if (!isApiKeyModalOpen) return null;

  const applyPreset = (preset) => {
    setInputBaseUrl(preset.baseUrl);
    setInputModel(preset.model);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setApiKey(inputKey.trim());
    setBaseUrl(inputBaseUrl.trim());
    setModel(inputModel.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsApiKeyModalOpen(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsApiKeyModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Provider & Key Settings</h2>
            <p className="text-xs text-slate-400">Configure your API credentials or choose a provider</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Quick Provider Presets
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {PROVIDER_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border text-left transition flex items-center justify-between ${
                  inputBaseUrl === p.baseUrl && inputModel === p.model
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              API Key
            </label>
            <input
              type="password"
              placeholder="sk-... or gsk_... or xai-..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
            />
            <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Saved locally in browser or configured via .env.local
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-violet-400" /> API Base URL
            </label>
            <input
              type="text"
              placeholder="https://api.groq.com/openai/v1"
              value={inputBaseUrl}
              onChange={(e) => setInputBaseUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Model Name
            </label>
            <input
              type="text"
              placeholder="openai/gpt-oss-120b, llama-3.1-8b-instant, grok-2-latest"
              value={inputModel}
              onChange={(e) => setInputModel(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-violet-600/25 transition active:scale-95"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" /> Saved!
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
