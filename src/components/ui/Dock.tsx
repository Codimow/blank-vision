'use client';

import React from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AppWindow, Monitor, Github, Terminal, Minimize2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function Dock() {
  const { windows, windowOrder, activeWindowId, openWindow, updateWindow, focusWindow } = useWindowStore();

  // Group windows by component type or just list open apps?
  // Let's list open windows + persistent app launchers.
  
  // Get all windows
  const openWindowsList = windowOrder.map(id => windows[id]).filter(Boolean);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center px-4 gap-4 shadow-2xl z-50">
      
      {/* Launchers */}
      <DockItem 
        icon={<Github size={24} />} 
        label="GitHub" 
        onClick={() => openWindow('github', {}, 'GitHub')} 
      />
      <DockItem 
        icon={<Terminal size={24} />} 
        label="Terminal" 
        onClick={() => openWindow('default', {}, 'Terminal')} 
      />
      
      <div className="w-px h-8 bg-white/20 mx-2" />

      {/* Open Windows */}
      <AnimatePresence mode="popLayout">
        {openWindowsList.map((win) => (
          <DockItem
            key={win.id}
            icon={<AppWindow size={20} />}
            label={win.title}
            isActive={activeWindowId === win.id && !win.isMinimized}
            isMinimized={win.isMinimized}
            onClick={() => {
              if (win.isMinimized) {
                updateWindow(win.id, { isMinimized: false });
                focusWindow(win.id);
              } else if (activeWindowId === win.id) {
                updateWindow(win.id, { isMinimized: true });
              } else {
                focusWindow(win.id);
              }
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function DockItem({ 
  icon, 
  label, 
  onClick, 
  isActive,
  isMinimized 
}: { 
  icon: React.ReactNode, 
  label: string, 
  onClick: () => void,
  isActive?: boolean,
  isMinimized?: boolean
}) {
  return (
    <motion.button
      layout
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0, y: 20 }}
      whileHover={{ scale: 1.2, y: -10 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={clsx(
        "relative w-10 h-10 flex items-center justify-center rounded-xl transition-colors group",
        isActive ? "bg-white/20 text-white" : "hover:bg-white/10 text-neutral-300",
        isMinimized && "opacity-50"
      )}
      title={label}
    >
      {icon}
      {/* Active Dot */}
      {(isActive || isMinimized) && (
        <div className={clsx(
            "absolute -bottom-2 w-1 h-1 rounded-full",
            isActive ? "bg-white" : "bg-white/30"
        )} />
      )}
      
      {/* Tooltip on Hover */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {label}
      </span>
    </motion.button>
  );
}
