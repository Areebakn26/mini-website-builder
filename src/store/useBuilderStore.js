import { create } from 'zustand';

const DEFAULT_STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to WebCraft AI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-6">
  <div class="max-w-2xl text-center space-y-6">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium">
      <i data-lucide="sparkles" class="w-4 h-4"></i>
      <span>AI-Powered Website Builder</span>
    </div>
    
    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
      Describe your dream website & let AI build it.
    </h1>
    
    <p class="text-slate-400 text-lg max-w-xl mx-auto">
      Type a prompt in the sidebar or select a starter template to generate fully custom, responsive, interactive websites in seconds.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
      <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <i data-lucide="zap" class="w-5 h-5 text-amber-400"></i>
        <h3 class="font-semibold text-slate-200">Real-Time Streaming</h3>
        <p class="text-xs text-slate-400">Watch your site come to life token by token.</p>
      </div>
      <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <i data-lucide="code" class="w-5 h-5 text-cyan-400"></i>
        <h3 class="font-semibold text-slate-200">Monaco Code Editor</h3>
        <p class="text-xs text-slate-400">Inspect and tweak generated HTML instantly.</p>
      </div>
      <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <i data-lucide="smartphone" class="w-5 h-5 text-emerald-400"></i>
        <h3 class="font-semibold text-slate-200">Responsive Preview</h3>
        <p class="text-xs text-slate-400">Test on Desktop, Tablet, and Mobile viewports.</p>
      </div>
    </div>
  </div>

  <script>
    if (window.lucide) lucide.createIcons();
  </script>
</body>
</html>`;

export const useBuilderStore = create((set) => ({
  apiKey: localStorage.getItem('ai_api_key') || import.meta.env.VITE_AI_API_KEY || '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',
  baseUrl: localStorage.getItem('ai_base_url') || import.meta.env.VITE_AI_BASE_URL || 'https://api.groq.com/openai/v1',
  model: localStorage.getItem('ai_model') || import.meta.env.VITE_AI_MODEL || 'llama-3.3-70b-versatile',
  
  viewState: 'landing', // 'landing' | 'dashboard'
  currentCode: DEFAULT_STARTER_HTML,
  isGenerating: false,
  viewport: 'desktop',
  activeTab: 'preview',
  messages: [
    {
      id: 'init-1',
      role: 'assistant',
      content: "Hello! I'm your AI Website Builder. Describe what kind of website you'd like to create, or pick a starter template below!",
      timestamp: new Date().toISOString()
    }
  ],
  isApiKeyModalOpen: false,

  setViewState: (viewState) => set({ viewState }),

  setApiKey: (key) => {
    localStorage.setItem('ai_api_key', key);
    set({ apiKey: key });
  },

  setBaseUrl: (baseUrl) => {
    localStorage.setItem('ai_base_url', baseUrl);
    set({ baseUrl });
  },

  setModel: (model) => {
    localStorage.setItem('ai_model', model);
    set({ model });
  },

  setViewport: (viewport) => set({ viewport }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setCurrentCode: (code) => set({ currentCode: code }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setIsApiKeyModalOpen: (isOpen) => set({ isApiKeyModalOpen: isOpen }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { 
      ...message, 
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, 
      timestamp: new Date().toISOString() 
    }]
  })),

  updateLastAssistantMessage: (content) => set((state) => {
    const newMessages = [...state.messages];
    const lastIndex = newMessages.findLastIndex((m) => m.role === 'assistant');
    if (lastIndex !== -1) {
      newMessages[lastIndex] = { ...newMessages[lastIndex], content };
    }
    return { messages: newMessages };
  }),

  // Clears chat messages to [] and code to "" to prevent Context Pollution
  handleNewProject: () => set({
    currentCode: '',
    messages: []
  }),

  resetProject: () => set({
    currentCode: DEFAULT_STARTER_HTML,
    messages: [
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'assistant',
        content: "Project reset. What website should we build next?",
        timestamp: new Date().toISOString()
      }
    ]
  })
}));
