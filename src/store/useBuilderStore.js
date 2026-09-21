import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

// Helper: Title from initial prompt (3-4 clean words)
function titleFromPrompt(prompt) {
  if (!prompt) return 'Untitled Project';
  const words = prompt
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['create', 'build', 'make', 'with', 'and', 'for', 'the', 'page', 'landing'].includes(w.toLowerCase()));
  
  if (words.length === 0) return 'New Project';
  return words.slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

let autoSaveTimer = null;

export const useBuilderStore = create((set, get) => ({
  apiKey: localStorage.getItem('ai_api_key') || import.meta.env.VITE_AI_API_KEY || '',
  baseUrl: localStorage.getItem('ai_base_url') || import.meta.env.VITE_AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/',
  model: localStorage.getItem('ai_model') || import.meta.env.VITE_AI_MODEL || 'gemini-2.0-flash',

  session: null,
  user: null,
  userProjects: [],
  currentProjectId: null,
  isAuthModalOpen: false,
  isProjectLoading: false,

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
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setIsApiKeyModalOpen: (isOpen) => set({ isApiKeyModalOpen: isOpen }),
  setIsAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),

  setCurrentCode: (code) => {
    set({ currentCode: code });

    const { currentProjectId, user, isProjectLoading } = get();

    // Update in-memory userProjects array so switching is instantaneous
    if (currentProjectId) {
      set((state) => ({
        userProjects: state.userProjects.map((p) =>
          p.id === currentProjectId ? { ...p, current_code: code, updated_at: new Date().toISOString() } : p
        )
      }));
    }

    // Debounced Auto-Save Guard: DO NOT save if loading project data, or if code is empty string right after reload
    if (currentProjectId && user && isSupabaseConfigured && !isProjectLoading && code.trim().length > 0) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(async () => {
        try {
          const currentState = get();
          if (currentState.isProjectLoading || !currentState.currentCode.trim()) return;

          await supabase
            .from('projects')
            .update({ current_code: code, updated_at: new Date().toISOString() })
            .eq('id', currentProjectId);
        } catch (err) {
          if (import.meta.env.DEV) console.error('Auto-save failed:', err);
        }
      }, 2000);
    }
  },

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

  // Persist Message to Supabase Table (with select to confirm write)
  persistMessage: async (projectId, role, content) => {
    const { user } = get();
    if (!user || !isSupabaseConfigured || !projectId) return;

    try {
      const { data, error } = await supabase.from('messages').insert([
        {
          project_id: projectId,
          role: role,
          content: content
        }
      ]).select();
      
      if (error && import.meta.env.DEV) {
        console.error('Persist message error:', error);
      }
      return data;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Persist message failed:', err);
    }
  },

  // Auth Initialization Listener
  initAuth: async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user || null });

      if (session?.user) {
        await get().loadUserProjects();
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ session, user: session?.user || null });
        if (session?.user) {
          await get().loadUserProjects();
        } else {
          set({
            userProjects: [],
            currentProjectId: null,
            currentCode: DEFAULT_STARTER_HTML,
            messages: [
              {
                id: 'init-1',
                role: 'assistant',
                content: "Hello! I'm your AI Website Builder. Describe what kind of website you'd like to create, or pick a starter template below!",
                timestamp: new Date().toISOString()
              }
            ]
          });
        }
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error('Auth initialization error:', err);
    }
  },

  // Load user projects from Supabase & Hydrate most recent project
  loadUserProjects: async () => {
    const { user, currentProjectId } = get();
    if (!user || !isSupabaseConfigured) return;

    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && projects) {
        set({ userProjects: projects });

        // On initial page load, auto-select and hydrate the most recent project
        if (!currentProjectId && projects.length > 0) {
          await get().switchProject(projects[0].id);
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Load projects failed:', err);
    }
  },

  // Create Project & Persist to Supabase
  createProject: async (prompt) => {
    const { user, userProjects } = get();
    const title = titleFromPrompt(prompt);

    if (user && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert([
            {
              user_id: user.id,
              title: title,
              current_code: '',
            }
          ])
          .select();

        if (!error && data && data.length > 0) {
          const newProj = data[0];
          set({
            userProjects: [newProj, ...userProjects],
            currentProjectId: newProj.id,
            currentCode: '',
            messages: []
          });
          return newProj.id;
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('Create project failed:', err);
      }
    }

    // Local Storage fallback
    const tempId = `local-${Date.now()}`;
    set({
      currentProjectId: tempId,
      currentCode: '',
      messages: []
    });
    return tempId;
  },

  // Switch Active Project & Hydrate Code + Chat History from Supabase
  switchProject: async (projectId) => {
    if (!projectId) return;
    const { user } = get();

    set({ isProjectLoading: true, currentProjectId: projectId });

    try {
      let codeToSet = '';
      let messagesToSet = [];

      if (user && isSupabaseConfigured) {
        // 1. Fetch latest project record (current_code)
        const { data: projData, error: projError } = await supabase
          .from('projects')
          .select('current_code, title')
          .eq('id', projectId)
          .single();

        if (!projError && projData) {
          codeToSet = projData.current_code || '';
        }

        // 2. Fetch all stored messages for project ordered by created_at ascending
        const { data: msgData, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });

        if (!msgError && msgData && msgData.length > 0) {
          messagesToSet = msgData.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.created_at
          }));
        }
      } else {
        const localProj = get().userProjects.find((p) => p.id === projectId);
        if (localProj) codeToSet = localProj.current_code || '';
      }

      if (messagesToSet.length === 0) {
        messagesToSet = [
          {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: codeToSet ? "Loaded project code. How would you like to edit or improve it?" : "Describe what kind of website you'd like to create!",
            timestamp: new Date().toISOString()
          }
        ];
      }

      // Atomically set project code, chat history messages, and clear loading lock
      set({
        currentCode: codeToSet,
        messages: messagesToSet,
        isProjectLoading: false
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error switching project:', err);
      set({ isProjectLoading: false });
    }
  },

  // Delete Project
  deleteProject: async (projectId) => {
    const { user, userProjects, currentProjectId } = get();

    if (user && isSupabaseConfigured) {
      try {
        await supabase.from('projects').delete().eq('id', projectId);
      } catch (err) {
        if (import.meta.env.DEV) console.error('Delete project failed:', err);
      }
    }

    const updated = userProjects.filter((p) => p.id !== projectId);
    const isDeletingCurrent = currentProjectId === projectId;

    set({
      userProjects: updated,
      currentProjectId: isDeletingCurrent ? null : currentProjectId,
      currentCode: isDeletingCurrent ? DEFAULT_STARTER_HTML : get().currentCode
    });
  },

  // Wipe slate clean for new project
  handleNewProject: () => set({
    currentProjectId: null,
    currentCode: '',
    messages: []
  }),

  resetProject: () => set({
    currentProjectId: null,
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
