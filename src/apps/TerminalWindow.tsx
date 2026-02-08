'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { clsx } from 'clsx';

interface Log {
  type: 'input' | 'output' | 'error';
  content: string;
}

export default function TerminalWindow({ windowId }: { windowId: string }) {
  const { openWindow, closeWindow, windows, setCanvasTransform } = useWindowStore();
  const [logs, setLogs] = useState<Log[]>([
    { type: 'output', content: 'Welcome to Blank Vision Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // Focus input on click anywhere in terminal
  const handleContainerClick = () => {
    // Only focus if user isn't selecting text
    if (window.getSelection()?.toString().length === 0) {
        inputRef.current?.focus();
    }
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    const newLogs: Log[] = [{ type: 'input', content: trimmed }];

    switch (command) {
      case 'help':
        newLogs.push({ 
          type: 'output', 
          content: 'Available commands:\n  help          - Show this message\n  clear         - Clear terminal\n  ls            - List open windows\n  open <app>    - Open app (github, terminal, browser)\n  close <id>    - Close window by ID\n  reset         - Reset canvas view\n  exit          - Close this terminal' 
        });
        break;
      case 'clear':
        setLogs([]);
        return; 
      case 'ls':
        const winList = Object.values(windows).map(w => `[${w.id.slice(0, 8)}] ${w.title} (${w.component})`).join('\n');
        newLogs.push({ type: 'output', content: winList || 'No open windows.' });
        break;
      case 'open':
        const app = args[0];
        if (app === 'github') {
           openWindow('github', {}, 'GitHub Explorer');
           newLogs.push({ type: 'output', content: 'Launched GitHub Explorer.' });
        } else if (app === 'terminal') {
           openWindow('terminal', {}, 'Terminal');
           newLogs.push({ type: 'output', content: 'Launched Terminal.' });
        } else if (app === 'browser') {
           const url = args[1] || 'https://www.google.com/search?igu=1';
           openWindow('browser', { url }, 'Web Browser');
           newLogs.push({ type: 'output', content: `Launched Web Browser at ${url}.` });
        } else {
           newLogs.push({ type: 'error', content: `Unknown app: ${app}. Try 'github', 'terminal', or 'browser'.` });
        }
        break;
      case 'close':
        if (args[0]) {
            const targetId = Object.keys(windows).find(id => id.startsWith(args[0]));
            if (targetId) {
                closeWindow(targetId);
                newLogs.push({ type: 'output', content: `Closed window ${targetId.slice(0, 8)}.` });
            } else {
                newLogs.push({ type: 'error', content: `Window not found: ${args[0]}` });
            }
        } else {
            newLogs.push({ type: 'error', content: 'Usage: close <id>' });
        }
        break;
      case 'reset':
        setCanvasTransform(0, 0, 1);
        newLogs.push({ type: 'output', content: 'Canvas view reset.' });
        break;
      case 'exit':
        closeWindow(windowId);
        return;
      default:
        newLogs.push({ type: 'error', content: `Command not found: ${command}` });
    }

    setLogs(prev => [...prev, ...newLogs]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div 
      className="h-full bg-black/95 text-emerald-500 font-mono text-xs p-4 overflow-hidden flex flex-col"
      onClick={handleContainerClick}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-2">
        {logs.map((log, i) => (
          <div key={i} className={clsx(
            "whitespace-pre-wrap break-words leading-relaxed",
            log.type === 'input' && "text-white font-bold",
            log.type === 'error' && "text-rose-400"
          )}>
            {log.type === 'input' ? <span className="text-emerald-700 mr-2">➜</span> : ''}{log.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 mt-4 border-t border-emerald-500/10 pt-3">
        <span className="text-emerald-700 font-bold">➜</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent focus:outline-none text-white placeholder-emerald-900"
          placeholder="Enter command..."
          autoFocus
        />
      </div>
    </div>
  );
}
