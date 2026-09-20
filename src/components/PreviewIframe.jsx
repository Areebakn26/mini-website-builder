import React, { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { RefreshCw, ExternalLink } from 'lucide-react';

export default function PreviewIframe() {
  const { currentCode, viewport, isGenerating } = useBuilderStore();
  const [renderedCode, setRenderedCode] = useState(currentCode);
  const iframeRef = useRef(null);

  // Inject scripts into <head>:
  // 1. Intercept <a> clicks: allow #section smooth scrolling, block parent app reloads
  // 2. Broken image fallback: if an Unsplash URL 404s, gracefully replace with a styled gradient placeholder
  const getProcessedHtml = (htmlString) => {
    if (!htmlString) return '';
    
    const injectedScripts = `<script>
      document.addEventListener('DOMContentLoaded', function() {
        // --- Anchor click interceptor ---
        document.addEventListener('click', function(e) {
          var a = e.target.closest('a');
          if (a) {
            var href = a.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
              e.preventDefault();
              var targetEl = document.querySelector(href);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
              }
            } else if (!href || href === '#' || href === '/' || href === 'index.html' || href === '' || href.startsWith(window.location.origin)) {
              e.preventDefault();
            }
          }
        }, true);

        // --- Broken image fallback ---
        document.querySelectorAll('img').forEach(function(img) {
          img.onerror = function() {
            this.onerror = null;
            this.style.background = 'linear-gradient(135deg, #1e293b 0%, #334155 100%)';
            this.style.objectFit = 'cover';
            this.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23334155" width="400" height="300"/><text fill="%2394a3b8" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">Image</text></svg>');
          };
        });
      });
    </script>`;

    if (htmlString.includes('</head>')) {
      return htmlString.replace('</head>', `${injectedScripts}\n</head>`);
    } else if (htmlString.includes('<body')) {
      return htmlString.replace(/<body/i, `${injectedScripts}\n<body`);
    }
    return injectedScripts + htmlString;
  };

  // Debounced Iframe Rendering (400ms)
  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => {
        setRenderedCode(getProcessedHtml(currentCode));
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setRenderedCode(getProcessedHtml(currentCode));
    }
  }, [currentCode, isGenerating]);

  const handleOpenNewTab = () => {
    const blob = new Blob([currentCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const getViewportDimensions = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[375px] h-[720px] rounded-[2.5rem] border-[10px] border-slate-800 shadow-2xl';
      case 'tablet':
        return 'w-[768px] h-[85%] rounded-2xl border-[8px] border-slate-800 shadow-2xl';
      case 'desktop':
      default:
        return 'w-full h-full border-none rounded-none';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 overflow-hidden relative">
      <div className="h-9 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 select-none text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-medium text-slate-300">Live Preview</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRenderedCode(getProcessedHtml(currentCode))}
            className="hover:text-white transition flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-violet-400' : ''}`} />
            <span>Reload</span>
          </button>
          <button onClick={handleOpenNewTab} className="hover:text-white transition flex items-center gap-1">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Pop Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full flex items-center justify-center p-4 bg-slate-950/60 overflow-hidden">
        <div className={`transition-all duration-300 ease-in-out relative ${getViewportDimensions()}`}>
          <iframe
            ref={iframeRef}
            srcDoc={renderedCode}
            title="Website Preview"
            sandbox="allow-scripts allow-modals"
            className="w-full h-full bg-white rounded-[inherit] overflow-auto"
          />
        </div>
      </div>
    </div>
  );
}
