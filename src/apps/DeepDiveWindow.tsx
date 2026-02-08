'use client';

import React, { useState } from 'react';
import { Search, Brain, Zap, ArrowRight, BookOpen, ExternalLink } from 'lucide-react';
import { useWindowStore } from '@/store/useWindowStore';

interface Result {
  title: string;
  snippet: string;
  pageid: number;
}

export default function DeepDiveWindow({ windowId, x, y }: { windowId: string, x: number, y: number }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { openWindow, windows } = useWindowStore();

  const handleDeepDive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      // Search Wikipedia for related concepts
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
      );
      const data = await response.json();
      const results: Result[] = data.query.search.slice(0, 5);

      // Current window position
      const currentWin = windows[windowId];
      const centerX = currentWin.x;
      const centerY = currentWin.y;

      // Spawn result windows in a circle around the deep dive window
      results.forEach((result, index) => {
        const angle = (index / results.length) * Math.PI * 2;
        const radius = 500;
        const spawnX = centerX + Math.cos(angle) * radius;
        const spawnY = centerY + Math.sin(angle) * radius;

        openWindow(
          'browser', 
          { 
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`,
            width: 500,
            height: 600
          }, 
          result.title,
          { x: spawnX, y: spawnY }
        );
      });

    } catch (err) {
      console.error('Deep dive failed:', err);
    } finally {
      setIsSearching(false);
      setQuery('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-white p-6 font-sans">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
          <Brain className="text-blue-400" size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Concept Deep-Dive</h2>
          <p className="text-xs text-blue-400/60 font-medium uppercase tracking-widest">AI Research Mapper</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h3 className="text-lg font-medium text-neutral-300 mb-2">What are we exploring?</h3>
        <p className="text-sm text-neutral-500 mb-6">
          Enter a topic, and I'll map out the key concepts spatially across your canvas as interactive nodes.
        </p>

        <form onSubmit={handleDeepDive} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-lg"
              placeholder="e.g. Distributed Systems"
              autoFocus
            />
          </div>

          <button 
            type="submit"
            disabled={isSearching || !query.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/20"
          >
            {isSearching ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mapping Concepts...
              </>
            ) : (
              <>
                <Zap size={20} />
                Generate Map
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between text-neutral-500 text-xs">
        <div className="flex items-center gap-2">
          <BookOpen size={14} />
          <span>Powered by Wikipedia Knowledge Graph</span>
        </div>
      </div>
    </div>
  );
}
