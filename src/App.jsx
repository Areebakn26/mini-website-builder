import React, { useEffect } from 'react';
import { useBuilderStore } from './store/useBuilderStore';
import Navbar from './components/Navbar';
import ChatSidebar from './components/ChatSidebar';
import PreviewIframe from './components/PreviewIframe';
import CodeEditor from './components/CodeEditor';
import ApiKeyModal from './components/ApiKeyModal';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';

export default function App() {
  const { activeTab, viewState, initAuth } = useBuilderStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // If viewState is 'landing', show full-viewport video landing page
  if (viewState === 'landing') {
    return (
      <>
        <LandingPage />
        <ApiKeyModal />
        <AuthModal />
      </>
    );
  }

  // Builder Workspace Dashboard
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left AI Chat & Starter Sidebar */}
        <ChatSidebar />

        {/* Main Preview / Editor Display */}
        <main className="flex-1 h-full overflow-hidden relative">
          {activeTab === 'preview' && <PreviewIframe />}

          {activeTab === 'code' && <CodeEditor />}

          {activeTab === 'split' && (
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-800">
              <CodeEditor />
              <PreviewIframe />
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ApiKeyModal />
      <AuthModal />
    </div>
  );
}
