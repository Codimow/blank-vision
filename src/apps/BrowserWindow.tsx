'use client';

import React, { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, ExternalLink, ShieldAlert } from 'lucide-react';

interface BrowserWindowProps {
  url?: string;
}

export default function BrowserWindow({ url: initialUrl = '' }: BrowserWindowProps) {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = inputUrl.trim();
    if (!targetUrl) return;

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }
    
    setIsLoading(true);
    setUrl(targetUrl);
    setInputUrl(targetUrl);
  };

  return (
    <div className="h-full flex flex-col bg-white text-black font-sans">
      {/* Browser Toolbar */}
      <div className="bg-neutral-100 border-b border-neutral-200 p-2 flex items-center gap-2">
        <div className="flex gap-0.5">
          <button className="p-1.5 hover:bg-neutral-200 rounded-md text-neutral-500 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <button className="p-1.5 hover:bg-neutral-200 rounded-md text-neutral-500 transition-colors">
            <ArrowRight size={16} />
          </button>
          <button onClick={() => setUrl(url + '')} className="p-1.5 hover:bg-neutral-200 rounded-md text-neutral-500 transition-colors">
            <RotateCw size={16} />
          </button>
        </div>
        
        <form onSubmit={handleNavigate} className="flex-1 flex items-center bg-white border border-neutral-300 rounded-lg px-3 py-1.5 gap-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <Globe size={14} className="text-neutral-400" />
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
            placeholder="Paste URL (e.g. vercel.com)"
          />
        </form>

        <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-neutral-200 rounded-md text-neutral-500 transition-colors">
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Iframe Content */}
      <div className="flex-1 bg-neutral-50 relative overflow-hidden">
        {!url ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white">
             <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Globe className="text-blue-500" size={32} />
             </div>
             <h3 className="text-lg font-bold text-neutral-900 mb-2">Web Viewer</h3>
             <p className="text-sm text-neutral-500 max-w-xs">
                Enter a URL in the address bar above to load a website directly on the canvas.
             </p>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 transition-opacity">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Loading</span>
                </div>
              </div>
            )}
            <iframe 
              src={url}
              className="w-full h-full border-none"
              onLoad={() => setIsLoading(false)}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              title="Browser Window"
            />
          </>
        )}
      </div>
      
      {/* Privacy Warning */}
      <div className="bg-neutral-50 border-t border-neutral-200 px-3 py-1.5 text-[10px] text-neutral-500 flex justify-between items-center">
        <div className="flex items-center gap-1.5 font-medium">
            <ShieldAlert size={10} className="text-amber-500" />
            <span>X-Frame-Options applies. Some sites may block embedding.</span>
        </div>
      </div>
    </div>
  );
}
