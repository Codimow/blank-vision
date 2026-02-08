'use client';

import React, { useState, useEffect } from 'react';
import { Folder, Star, GitFork, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';

interface Repo {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  language: string;
}

export default function GitHubWindow() {
  const [username, setUsername] = useState('vercel'); // Default to something cool
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = async (user: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=10`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setRepos(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos(username);
  }, []); // Initial load

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-white p-4">
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchRepos(username)}
          className="flex-1 bg-[#21262d] border border-[#30363d] rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
          placeholder="GitHub Username"
        />
        <button 
          onClick={() => fetchRepos(username)}
          className="bg-[#238636] px-3 py-1 rounded text-sm font-medium hover:bg-[#2ea043]"
        >
          Load
        </button>
      </div>

      {loading && <div className="text-center py-8 text-neutral-500">Loading repositories...</div>}
      {error && <div className="text-center py-8 text-red-400">Error: {error}</div>}

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {!loading && !error && repos.map((repo) => (
          <div 
            key={repo.id} 
            className="p-3 rounded border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] transition-colors group"
          >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-blue-400">
                    <Folder size={16} />
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {repo.name}
                    </a>
                </div>
                <div className="flex gap-3 text-xs text-neutral-400">
                    {repo.stargazers_count > 0 && (
                        <span className="flex items-center gap-1"><Star size={12}/> {repo.stargazers_count}</span>
                    )}
                    {repo.forks_count > 0 && (
                        <span className="flex items-center gap-1"><GitFork size={12}/> {repo.forks_count}</span>
                    )}
                </div>
            </div>
            <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{repo.description}</p>
            {repo.language && (
                <div className="mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"/>
                    <span className="text-xs text-neutral-500">{repo.language}</span>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
