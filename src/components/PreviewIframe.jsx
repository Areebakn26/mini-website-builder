import React, { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { RefreshCw, ExternalLink, Loader2 } from 'lucide-react';

export default function PreviewIframe() {
  const { currentCode, viewport, isGenerating, isProjectLoading } = useBuilderStore();
  const [renderedCode, setRenderedCode] = useState(currentCode);
  const iframeRef = useRef(null);

  // Inject scripts into <head>:
  // 1. Intercept <a> clicks: allow #section smooth scrolling, block parent app reloads
  const getProcessedHtml = (htmlString) => {
    if (!htmlString) return '';
    
    const injectedScripts = `<style>
      html {
        scroll-behavior: smooth !important;
        scroll-padding-top: 5rem !important;
      }
      body {
        overflow-y: auto !important;
      }
    </style>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // --- Anchor click interceptor for smooth section navigation ---
        document.addEventListener('click', function(e) {
          var a = e.target.closest('a');
          if (!a) return;
          var href = a.getAttribute('href');
          if (href && href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            var id = href.substring(1).trim();
            var targetEl = null;

            // 1. Exact match by ID or selector
            try {
              targetEl = document.getElementById(id) || document.querySelector(href);
            } catch (err) {}

            // 2. Fuzzy match by ID (e.g. href="#menu" matching id="our-menu" or id="menu-section")
            if (!targetEl) {
              var cleanId = id.toLowerCase().replace(/[-_]/g, '');
              var allElems = document.querySelectorAll('[id]');
              for (var i = 0; i < allElems.length; i++) {
                var elId = (allElems[i].id || '').toLowerCase().replace(/[-_]/g, '');
                if (elId && (elId === cleanId || elId.includes(cleanId) || cleanId.includes(elId))) {
                  targetEl = allElems[i];
                  break;
                }
              }
            }

            // 3. Match section by heading or text content
            if (!targetEl) {
              var linkText = (a.textContent || id).trim().toLowerCase();
              var sections = document.querySelectorAll('section, main > div, article');
              for (var j = 0; j < sections.length; j++) {
                var secText = (sections[j].textContent || '').toLowerCase();
                if (secText.includes(linkText) || secText.includes(id.toLowerCase())) {
                  targetEl = sections[j];
                  break;
                }
              }
            }

            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else if (!href || href === '#' || href === '/' || href === 'index.html' || href === '' || href.startsWith(window.location.origin)) {
            e.preventDefault();
          }
        }, true);
      });
    </script>`;

    if (htmlString.includes('</head>')) {
      return htmlString.replace('</head>', `${injectedScripts}\n</head>`);
    } else if (htmlString.includes('<body')) {
      return htmlString.replace(/<body/i, `${injectedScripts}\n<body`);
    }
    return injectedScripts + htmlString;
  };

  // Throttled / Instant Iframe Rendering for Live Streaming
  const lastRenderTimeRef = useRef(0);

  useEffect(() => {
    if (isProjectLoading) return;

    const processed = getProcessedHtml(currentCode);
    if (!processed) return;

    if (!isGenerating) {
      setRenderedCode(processed);
      lastRenderTimeRef.current = Date.now();
      return;
    }

    const now = Date.now();
    if (!renderedCode || now - lastRenderTimeRef.current > 300) {
      setRenderedCode(processed);
      lastRenderTimeRef.current = now;
    } else {
      const timer = setTimeout(() => {
        setRenderedCode(getProcessedHtml(currentCode));
        lastRenderTimeRef.current = Date.now();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentCode, isGenerating, isProjectLoading]);

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
            disabled={isProjectLoading}
            onClick={() => setRenderedCode(getProcessedHtml(currentCode))}
            className="hover:text-white transition flex items-center gap-1 disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating || isProjectLoading ? 'animate-spin text-violet-400' : ''}`} />
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
          {isProjectLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-300 gap-3 rounded-[inherit]">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              <span className="text-xs font-semibold tracking-wide">Loading project data & chat history...</span>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              srcDoc={renderedCode}
              title="Website Preview"
              sandbox="allow-scripts allow-modals"
              className="w-full h-full bg-white rounded-[inherit] overflow-auto"
            />
          )}
        </div>
      </div>
    </div>
  );
}
