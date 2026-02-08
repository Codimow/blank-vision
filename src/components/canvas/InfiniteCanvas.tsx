'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useWindowStore } from '@/store/useWindowStore';
import WindowManager from './WindowManager';
import { clsx } from 'clsx';

export default function InfiniteCanvas() {
  const { canvas, setCanvasTransform, openWindow } = useWindowStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleWheel = (e: React.WheelEvent) => {
    // If Ctrl/Meta is pressed, zoom
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const newScale = Math.min(Math.max(0.1, canvas.scale - e.deltaY * zoomSensitivity), 5);
      setCanvasTransform(canvas.x, canvas.y, newScale);
    } else {
      // Pan
      setCanvasTransform(canvas.x - e.deltaX, canvas.y - e.deltaY, canvas.scale);
    }
  };

  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    // Only drag on background
    if (e.target !== containerRef.current) return;

    if (e.button === 0 || e.button === 1) { // Left or Middle
       isDragging.current = true;
       lastPos.current = { x: e.clientX, y: e.clientY };
       (e.target as HTMLElement).setPointerCapture(e.pointerId);
       document.body.style.cursor = 'grabbing';
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    
    lastPos.current = { x: e.clientX, y: e.clientY };
    setCanvasTransform(canvas.x + dx, canvas.y + dy, canvas.scale);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    document.body.style.cursor = 'default';
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Background Grid
  const gridSize = 50 * canvas.scale;
  const backgroundPosition = `${canvas.x}px ${canvas.y}px`;
  
  return (
    <div 
      ref={containerRef}
      className="w-screen h-screen overflow-hidden bg-[#0a0a0a] text-white relative select-none touch-none"
      onWheel={handleWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        backgroundImage: `radial-gradient(circle, #222 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: backgroundPosition,
      }}
    >
      {/* World Container */}
      <motion.div
        className="absolute top-0 left-0 origin-top-left will-change-transform"
        style={{
          x: canvas.x,
          y: canvas.y,
          scale: canvas.scale,
        }}
        initial={false}
      >
        <WindowManager />
      </motion.div>
      
      {/* HUD / Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 p-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex gap-2 items-center"
           onPointerDown={(e) => e.stopPropagation()} 
           onWheel={(e) => e.stopPropagation()}
      >
         <div className="flex gap-1">
           <button 
             className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
             onClick={() => openWindow('github', {}, 'GitHub Explorer')}
           >
             <span className="w-2 h-2 rounded-full bg-blue-500" />
             GitHub
           </button>
           <button 
             className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
             onClick={() => openWindow('browser', { url: 'https://www.google.com/search?igu=1' }, 'Web Browser')}
           >
             <span className="w-2 h-2 rounded-full bg-emerald-500" />
             Web
           </button>
           <div className="w-[1px] h-6 bg-white/10 mx-1 self-center" />
           <button 
             className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
             onClick={() => setCanvasTransform(0, 0, 1)}
           >
             Reset View
           </button>
         </div>
      </div>
    </div>
  );
}
