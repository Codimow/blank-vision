'use client';

import React, { useRef, useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { useWindowStore, WindowState } from '@/store/useWindowStore';
import { clsx } from 'clsx';

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

export default function WindowFrame({ window: win, children }: WindowFrameProps) {
  const { updateWindow, closeWindow, focusWindow } = useWindowStore();
  const dragControls = useDragControls();
  
  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.95, x: win.x, y: win.y }}
      animate={{ 
        opacity: win.isMinimized ? 0 : 1, 
        scale: win.isMinimized ? 0.8 : 1,
        x: win.x,
        y: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
        pointerEvents: win.isMinimized ? 'none' : 'auto' 
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      onDragEnd={(_, info) => {
        updateWindow(win.id, { x: win.x + info.offset.x, y: win.y + info.offset.y });
      }}
      onPointerDown={() => focusWindow(win.id)}
      className={clsx(
        "absolute flex flex-col bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden",
        "backdrop-blur-md bg-opacity-95",
      )}
      style={{
        position: 'absolute', 
        width: win.width,
        height: win.height,
      }}
    >
      {/* Title Bar */}
      <div 
        className="h-11 bg-white/5 border-b border-white/5 flex items-center justify-between px-4 select-none cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          dragControls.start(e);
          focusWindow(win.id);
        }}
      >
        <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">{win.title}</span>
        <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
           <button onClick={() => updateWindow(win.id, { isMinimized: true })} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
             <Minus size={14} className="text-neutral-500" />
           </button>
           <button onClick={() => updateWindow(win.id, { isMaximized: !win.isMaximized })} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
             {win.isMaximized ? <Square size={12} className="text-neutral-500"/> : <Maximize2 size={12} className="text-neutral-500" />}
           </button>
           <button onClick={() => closeWindow(win.id)} className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors group">
             <X size={14} className="text-neutral-500 group-hover:text-red-400" />
           </button>
        </div>
      </div>

      {/* Content Content */}
      <div 
        className="flex-1 overflow-auto relative"
        onWheel={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      {/* Resize Handle */}
      <div 
        className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize flex items-end justify-end p-1.5 z-50"
        onPointerDown={(e) => {
            e.stopPropagation(); 
            focusWindow(win.id);
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = win.width;
            const startHeight = win.height;
            
            const onMove = (moveEvent: PointerEvent) => {
                const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX));
                const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY));
                updateWindow(win.id, { width: newWidth, height: newHeight });
            };
            
            const onUp = () => {
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
            };
            
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
        }}
      >
         <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
      </div>
    </motion.div>
  );
}
