'use client';

import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io, Socket } from 'socket.io-client';
import 'xterm/css/xterm.css';

export default function TerminalWindow() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#0a0a0a',
        foreground: '#10b981', // emerald-500
        cursor: '#10b981',
        selectionBackground: 'rgba(16, 185, 129, 0.3)',
      },
      fontSize: 13,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;

    // Connect to PTY server
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      term.writeln('\x1b[1;32mConnected to Real Shell (zsh)\x1b[0m');
    });

    socket.on('output', (data: string) => {
      term.write(data);
    });

    socket.on('connect_error', () => {
      term.writeln('\x1b[1;31mError: Could not connect to PTY server at port 3001.\x1b[0m');
      term.writeln('Make sure the PTY server is running with: node pty-server.js');
    });

    term.onData((data) => {
      socket.emit('input', data);
    });

    const handleResize = () => {
      fitAddon.fit();
      socket.emit('resize', { cols: term.cols, rows: term.rows });
    };

    window.addEventListener('resize', handleResize);
    
    // Initial fit
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.disconnect();
      term.dispose();
    };
  }, []);

  return (
    <div className="h-full w-full bg-[#0a0a0a] p-2 overflow-hidden">
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  );
}
