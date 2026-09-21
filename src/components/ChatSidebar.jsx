import React, { useState, useRef, useEffect } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { streamWebsiteGeneration, extractHtml, hydrateImages } from '../services/grok';
import { 
  Send, 
  Rocket, 
  Briefcase, 
  ShoppingBag, 
  Utensils, 
  MessageSquare,
  PlusCircle,
  Video,
  Mic,
  MicOff,
  FolderKanban,
  Trash2,
  ChevronRight
} from 'lucide-react';

const STARTER_TEMPLATES = [
  {
    icon: Video,
    title: 'Neural Video Hero',
    prompt: 'Build a dark studio landing page for WebCraft AI with looping background video (https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104303_0c6d60b2-9353-408e-9449-585108a22fb5.mp4), poster (https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/130837c4-0244-4f37-9c61-8d801d93fd29.jpg), Sora font, brand logo, glassmorphic CTA, and features list.'
  },
  {
    icon: Utensils,
    title: 'Artisanal Cafe',
    prompt: "Create a warm, dark-mode artisanal bakery & cafe landing page for 'L'Étoile Bakery'. Include: 1) Header navbar with logo and links (href='#menu', href='#story', href='#reservation'), 2) Cozy hero section with background pastry photo and CTA buttons, 3) Interactive menu section (id='menu') with working Alpine.js category tabs (Coffee, Pastries, Brunch) and bakery photos, 4) Our Story section (id='story') with images, 5) Embedded table reservation section (id='reservation') with input fields (NOT a blocking modal overlay), 6) Footer."
  },
  {
    icon: Rocket,
    title: 'AI SaaS Landing',
    prompt: "Create a dark-mode AI SaaS landing page for 'Nexus AI'. Include: 1) Header navbar with logo and links (href='#features', href='#pricing', href='#faq'), 2) Glowing gradient hero with CTA, 3) Feature grid (id='features'), 4) Pricing plans table (id='pricing') with Monthly/Annual toggle, 5) FAQ accordion (id='faq'), 6) Footer."
  },
  {
    icon: Briefcase,
    title: 'Dev Portfolio',
    prompt: "Create a sleek dark-mode developer portfolio for 'Alex Rivera'. Include: 1) Header navbar (href='#projects', href='#experience', href='#contact'), 2) Hero section with avatar picture and tech stack tags, 3) Projects grid (id='projects') with filter tabs (All, Fullstack, AI), 4) Experience timeline (id='experience'), 5) Contact form section (id='contact'), 6) Footer."
  },
  {
    icon: ShoppingBag,
    title: 'Minimalist Store',
    prompt: "Create a luxury sneaker store landing page for 'KICKS CLUB'. Include: 1) Header navbar (href='#products', href='#reviews'), 2) Hero section, 3) Product grid (id='products') with category filter tabs (All, Sneakers, Apparel) and sneaker images, 4) Customer reviews (id='reviews'), 5) Newsletter banner, 6) Footer."
  }
];

export default function ChatSidebar() {
  const { 
    apiKey, 
    baseUrl,
    model,
    currentCode, 
    setCurrentCode, 
    isGenerating, 
    setIsGenerating, 
    messages, 
    addMessage, 
    updateLastAssistantMessage,
    handleNewProject,
    userProjects,
    currentProjectId,
    createProject,
    switchProject,
    deleteProject
  } = useBuilderStore();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showProjectsDrawer, setShowProjectsDrawer] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle Starter Template Click
  const handleTemplateClick = async (prompt) => {
    if (isGenerating) return;
    
    handleNewProject();
    
    setTimeout(() => {
      handleSend(prompt, true);
    }, 50);
  };

  // Voice Input Speech Recognition Handler
  const handleToggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setInputPrompt(transcript);
      };

      recognition.onerror = (event) => {
        if (import.meta.env.DEV) console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      if (import.meta.env.DEV) console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleSend = async (customPrompt, isNewSite = false) => {
    const promptToSubmit = customPrompt || inputPrompt;
    if (!promptToSubmit.trim() || isGenerating) return;

    const activeKey = apiKey && !apiKey.includes('your_groq_api_key') 
      ? apiKey 
      : 'AQ.Ab8RN6J568hi1sMsb4Nu7kf1_TxrmKLXVvsNJGvaDXQFhyF1iQ';

    const userText = promptToSubmit.trim();
    setInputPrompt('');

    // If new project or no current project ID, auto-create project title in database
    if (isNewSite || !currentProjectId) {
      await createProject(userText);
    }

    // Add User message
    addMessage({ role: 'user', content: userText });

    // Add empty Assistant placeholder
    addMessage({ role: 'assistant', content: 'Crafting website code...' });
    setIsGenerating(true);

    const previousCodeBackup = isNewSite ? '' : currentCode;

    try {
      const streamedText = await streamWebsiteGeneration({
        apiKey: activeKey,
        baseUrl,
        model,
        prompt: userText,
        currentCode: isNewSite ? '' : currentCode,
        onChunk: (rawStreamedText) => {
          updateLastAssistantMessage("Building HTML code structure...");
          
          const cleanHtml = extractHtml(rawStreamedText);
          if (cleanHtml && cleanHtml.length > 50) {
            setCurrentCode(cleanHtml);
          }
        },
        onError: async (err) => {
          let errorMsg = err.message || 'Failed to generate code.';
          if (errorMsg.includes('401') || errorMsg.includes('invalid_api_key')) {
            errorMsg = `⚠️ Invalid API Key (401): Please verify your API key in Settings (🔑).`;
          } else if (errorMsg.includes('413') || errorMsg.includes('too large')) {
            errorMsg = `⚠️ Rate Limit (413): Exceeded TPM limit. Retrying with optimized prompt...`;
          } else if (errorMsg.includes('404')) {
            errorMsg = `⚠️ Model Error (404): Please check Settings (🔑).`;
          }
          
          if (previousCodeBackup) setCurrentCode(previousCodeBackup);
          updateLastAssistantMessage(errorMsg);
        }
      });

      // Stream successfully completed! Extract final HTML and hydrate images
      const finalHtml = extractHtml(streamedText);
      if (finalHtml && finalHtml.length > 50) {
        updateLastAssistantMessage("Finding perfect HD photos...");
        const hydratedHtml = await hydrateImages(finalHtml);
        setCurrentCode(hydratedHtml);
        updateLastAssistantMessage("Website complete!");
      } else {
        updateLastAssistantMessage("Website complete!");
      }
    } catch (err) {
      console.error(err);
      if (previousCodeBackup) setCurrentCode(previousCodeBackup);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-slate-900/95 border-r border-slate-800 flex flex-col h-[calc(100vh-3.5rem)] z-10 shrink-0 relative">
      {/* Sidebar Header with Projects & New Project Buttons */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <MessageSquare className="w-4 h-4 text-violet-400" />
          <span>AI Chat</span>
        </div>

        <div className="flex items-center gap-1.5">
          {userProjects.length > 0 && (
            <button
              onClick={() => setShowProjectsDrawer(!showProjectsDrawer)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-xl border border-slate-700 transition"
            >
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
              <span>Projects ({userProjects.length})</span>
            </button>
          )}

          <button
            onClick={handleNewProject}
            title="Start New Project (Clear Chat & Code)"
            className="flex items-center gap-1 text-[11px] font-semibold text-violet-300 bg-violet-600/20 hover:bg-violet-600/30 px-2.5 py-1 rounded-xl border border-violet-500/30 transition active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Projects History Drawer Overlay */}
      {showProjectsDrawer && (
        <div className="absolute top-12 left-0 right-0 z-30 bg-slate-900/98 border-b border-slate-800 shadow-2xl p-3 max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Saved Cloud Projects
            </span>
            <button onClick={() => setShowProjectsDrawer(false)} className="text-xs text-slate-500 hover:text-white">
              Close
            </button>
          </div>
          <div className="space-y-1">
            {userProjects.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition ${
                  p.id === currentProjectId ? 'bg-violet-600/20 text-violet-200 border border-violet-500/30' : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <button
                  onClick={() => { switchProject(p.id); setShowProjectsDrawer(false); }}
                  className="flex-1 text-left truncate flex items-center gap-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{p.title}</span>
                </button>
                <button
                  onClick={() => deleteProject(p.id)}
                  title="Delete project"
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Starter Templates (Quick Prompts) */}
      <div className="p-3 border-b border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Starter Templates
          </span>
          <span className="text-[10px] text-slate-500">Wipes Slate Clean</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {STARTER_TEMPLATES.map((tpl, i) => {
            const Icon = tpl.icon;
            return (
              <button
                key={i}
                disabled={isGenerating}
                onClick={() => handleTemplateClick(tpl.prompt)}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left transition text-slate-300 hover:text-white"
              >
                <Icon className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-medium truncate">{tpl.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl ${msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isGenerating && <div className="text-xs text-violet-400 p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 animate-pulse">Building website...</div>}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form with Voice Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-900">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
          <textarea
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isListening ? "Listening to your voice..." : "Describe your site or requested edits..."}
            className={`w-full pl-3 pr-16 py-2.5 bg-slate-950 border rounded-xl text-xs text-slate-200 focus:outline-none resize-none transition ${
              isListening ? 'border-rose-500 ring-1 ring-rose-500/40' : 'border-slate-800 focus:border-violet-500'
            }`}
          />
          
          <div className="absolute right-2 flex items-center gap-1">
            {/* Microphone Voice Button */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              title={isListening ? "Stop Listening" : "Speak Prompt (Voice Input)"}
              className={`p-1.5 rounded-lg transition ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse ring-1 ring-rose-500/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isGenerating}
              className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
}
