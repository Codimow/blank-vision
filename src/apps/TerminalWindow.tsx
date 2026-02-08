'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { clsx } from 'clsx';

interface Log {
  type: 'input' | 'output' | 'error';
  content: string;
}

export default function TerminalWindow({ windowId }: { windowId: string }) {
  const { openWindow, closeWindow, windows, resetCanvas } = useWindowStore();
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
          content: 'Available commands:\n  help          - Show this message\n  clear         - Clear terminal\n  ls            - List open windows\n  open <app>    - Open app (github, terminal)\n  close <id>    - Close window by ID\n  reset         - Reset canvas view\n  exit          - Close this terminal' 
        });
        break;
      case 'clear':
        setLogs([]);
        return; // Early return to avoid adding more logs
      case 'ls':
        const winList = Object.values(windows).map(w => `[${w.id.slice(0, 8)}] ${w.title} (${w.component})`).join('\n');
        newLogs.push({ type: 'output', content: winList || 'No open windows.' });
        break;
      case 'open':
        if (args[0] === 'github') {
           openWindow('github', {}, 'GitHub');
           newLogs.push({ type: 'output', content: 'Launched GitHub.' });
        } else if (args[0] === 'terminal') {
           openWindow('terminal', {}, 'Terminal');
           newLogs.push({ type: 'output', content: 'Launched Terminal.' });
        } else {
           newLogs.push({ type: 'error', content: `Unknown app: ${args[0]}. Try 'github' or 'terminal'.` });
        }
        break;
      case 'close':
        if (args[0]) {
            // Find window by partial ID match for convenience
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
        resetCanvas();
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
      className="h-full bg-black/90 text-green-500 font-mono text-sm p-4 overflow-hidden flex flex-col"
      onClick={handleContainerClick}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
        {logs.map((log, i) => (
          <div key={i} className={clsx(
            "whitespace-pre-wrap break-words",
            log.type === 'input' && "text-white font-bold opacity-80",
            log.type === 'error' && "text-red-400"
          )}>
            {log.type === 'input' ? '> ' : ''}{log.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 mt-2 border-t border-green-500/20 pt-2">
        <span className="text-green-500 font-bold">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent focus:outline-none text-white placeholder-green-500/30"
          placeholder="Enter command..."
          autoFocus
        />
      </div>
    </div>
  );
}
