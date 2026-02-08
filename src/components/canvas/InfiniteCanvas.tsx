'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useWindowStore } from '@/store/useWindowStore';
import WindowManager from './WindowManager';
import { clsx } from 'clsx';

export default function InfiniteCanvas() {
  const { canvas, setCanvasTransform, openWindow } = useWindowStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Local motion values for smooth performance, synced to store periodically or on end
  // For now, we will drive state directly to keep it simple, or use motion values for the render loop.
  // Let's use React state (via store) for the "truth" but motion values for the immediate frame if needed.
  // Given "high-performance", direct ref manipulation or useSpring is better.
  
  // Let's use standard event listeners for Pan/Zoom
  
  const handleWheel = (e: React.WheelEvent) => {
    // If Ctrl/Meta is pressed, zoom
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const newScale = Math.min(Math.max(0.1, canvas.scale - e.deltaY * zoomSensitivity), 5);
      
      // Calculate zoom toward pointer could be complex, let's just zoom center for MVP 
      // or simple scale update. 
      // To zoom toward pointer: need to adjust x/y based on mouse offset relative to canvas origin.
      
      setCanvasTransform(canvas.x, canvas.y, newScale);
    } else {
      // Pan
      setCanvasTransform(canvas.x - e.deltaX, canvas.y - e.deltaY, canvas.scale);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag if clicking purely on the background
    if (e.target === containerRef.current) {
        // Start dragging logic could go here if we want drag-to-pan
        // For now, rely on wheel/touchpad for navigation to allow selection behavior later
    }
  };

  // Middle mouse or Space+Drag is classic infinite canvas interaction.
  // Let's implement Space+Drag or just Drag on background.
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
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
      className="w-screen h-screen overflow-hidden bg-neutral-900 text-white relative select-none"
      onWheel={handleWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        backgroundImage: `radial-gradient(circle, #333 1px, transparent 1px)`,
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
      <div className="absolute bottom-4 left-4 p-4 bg-black/50 backdrop-blur rounded-lg border border-white/10"
           onPointerDown={(e) => e.stopPropagation()} // Prevent panning when clicking UI
      >
         <div className="flex gap-2">
           <button 
             className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500"
             onClick={() => openWindow('github', {}, 'My Repositories')}
           >
             + GitHub Window
           </button>
           <button 
             className="px-3 py-1 bg-neutral-700 rounded hover:bg-neutral-600"
             onClick={() => setCanvasTransform(0, 0, 1)}
           >
             Reset View
           </button>
         </div>
      </div>
    </div>
  );
}
