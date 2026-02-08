'use client';

import React, { useState } from 'react';
import { Search, Brain, Zap, ArrowRight, BookOpen, Sparkles, Orbit, Network } from 'lucide-react';
import { useWindowStore } from '@/store/useWindowStore';
import { clsx } from 'clsx';

interface Result {
  title: string;
  snippet: string;
  pageid: number;
}

export default function DeepDiveWindow({ windowId }: { windowId: string }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { openWindow, windows } = useWindowStore();

  const handleDeepDive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
      );
      const data = await response.json();
      const results: Result[] = data.query.search.slice(0, 6);

      const currentWin = windows[windowId];
      const centerX = currentWin.x;
      const centerY = currentWin.y;

      results.forEach((result, index) => {
        const angle = (index / results.length) * Math.PI * 2;
        const radius = 600;
        const spawnX = centerX + Math.cos(angle) * radius;
        const spawnY = centerY + Math.sin(angle) * radius;

        openWindow(
          'browser', 
          { 
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`,
            width: 450,
            height: 550,
            parentId: windowId // Tag for visual connection
          }, 
          result.title,
          { x: spawnX, y: spawnY }
        );
      });

      setRecentSearches(prev => [query, ...prev].slice(0, 3));

    } catch (err) {
      console.error('Deep dive failed:', err);
    } finally {
      setIsSearching(false);
      setQuery('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] text-neutral-200 overflow-hidden font-sans border-t border-white/5">
      {/* Dynamic Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
                    <Brain className="text-white" size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-white leading-none mb-1">DEEP DIVE</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Spatial Intelligence Engine</p>
                    </div>
                </div>
            </div>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                v1.0.4-beta
            </div>
        </div>

        {/* Search Experience */}
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
            <div className="mb-10 text-center">
                <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Expand your horizon.</h3>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mx-auto">
                    Transform a single concept into a spatial ecosystem of knowledge nodes across your canvas.
                </p>
            </div>

            <form onSubmit={handleDeepDive} className="relative group">
                <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                
                <div className="relative bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex items-center gap-2 shadow-2xl transition-all duration-300 group-focus-within:border-blue-500/50 group-focus-within:bg-neutral-900/80">
                    <div className="pl-4 text-neutral-500">
                        {isSearching ? <Orbit size={24} className="animate-spin text-blue-500" /> : <Search size={24} />}
                    </div>
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent py-4 px-2 outline-none text-lg text-white placeholder-neutral-600 font-medium"
                        placeholder="What should we map?"
                        autoFocus
                        disabled={isSearching}
                    />
                    <button 
                        type="submit"
                        disabled={isSearching || !query.trim()}
                        className={clsx(
                            "p-4 rounded-2xl transition-all duration-300 shadow-xl flex items-center justify-center",
                            query.trim() ? "bg-blue-600 text-white scale-100 opacity-100" : "bg-neutral-800 text-neutral-500 scale-95 opacity-50"
                        )}
                    >
                        <Zap size={24} fill={query.trim() ? "currentColor" : "none"} />
                    </button>
                </div>
            </form>

            {/* Micro-Features / Suggestions */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
                {recentSearches.length > 0 ? (
                    recentSearches.map((s, i) => (
                        <button 
                            key={i} 
                            onClick={() => setQuery(s)}
                            className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-xl text-xs font-medium text-neutral-400 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                        >
                            <Sparkles size={12} className="text-blue-500" />
                            {s}
                        </button>
                    ))
                ) : (
                    <>
                        <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider block w-full text-center mb-2">Try searching for</span>
                        {['Systems Design', 'Quantum Computing', 'WebAssembly'].map(s => (
                             <button 
                                key={s} 
                                onClick={() => setQuery(s)}
                                className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-xl text-xs font-medium text-neutral-500 hover:bg-white/10 hover:text-blue-400 transition-all"
                            >
                                {s}
                            </button>
                        ))}
                    </>
                )}
            </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-auto pt-8 flex items-center justify-between border-t border-white/5">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    <Network size={14} className="text-blue-500/50" />
                    <span>6 Nodes / Cluster</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    <BookOpen size={14} className="text-blue-500/50" />
                    <span>Wiki-Graph Enabled</span>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
        </div>
      </div>
    </div>
  );
}
