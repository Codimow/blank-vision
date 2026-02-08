'use client';

import React, { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, ExternalLink } from 'lucide-react';

interface BrowserWindowProps {
  url?: string;
}

export default function BrowserWindow({ url: initialUrl = 'https://www.google.com/search?igu=1' }: BrowserWindowProps) {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(true);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = inputUrl;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }
    setUrl(targetUrl);
    setInputUrl(targetUrl);
  };

  return (
    <div className="h-full flex flex-col bg-white text-black">
      {/* Browser Toolbar */}
      <div className="bg-neutral-100 border-b border-neutral-300 p-2 flex items-center gap-2">
        <div className="flex gap-1">
          <button className="p-1 hover:bg-neutral-200 rounded text-neutral-600">
            <ArrowLeft size={16} />
          </button>
          <button className="p-1 hover:bg-neutral-200 rounded text-neutral-600">
            <ArrowRight size={16} />
          </button>
          <button onClick={() => setUrl(url + '')} className="p-1 hover:bg-neutral-200 rounded text-neutral-600">
            <RotateCw size={16} />
          </button>
        </div>
        
        <form onSubmit={handleNavigate} className="flex-1 flex items-center bg-white border border-neutral-300 rounded px-3 py-1 gap-2 focus-within:ring-2 focus-within:ring-blue-500/50">
          <Globe size={14} className="text-neutral-400" />
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 text-sm outline-none"
            placeholder="Enter URL or search..."
          />
        </form>

        <a href={url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-neutral-200 rounded text-neutral-600">
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Iframe Content */}
      <div className="flex-1 bg-neutral-50 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-neutral-500 font-medium">Loading...</span>
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
      </div>
      
      {/* Privacy Warning */}
      <div className="bg-amber-50 border-t border-amber-100 px-3 py-1 text-[10px] text-amber-700 flex justify-between items-center">
        <span>Note: Some sites may block embedding (X-Frame-Options).</span>
      </div>
    </div>
  );
}
