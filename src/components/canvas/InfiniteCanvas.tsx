'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useWindowStore } from '@/store/useWindowStore';
import WindowManager from './WindowManager';
import Dock from '@/components/ui/Dock';
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
      const oldScale = canvas.scale;
      // Limit zoom range
      const newScale = Math.min(Math.max(0.1, oldScale - e.deltaY * zoomSensitivity), 5);
      
      // Calculate cursor position relative to the canvas origin (top-left of the world)
      // clientX/Y is screen coordinate.
      // canvas.x/y is the translation of the world.
      // World coordinate of mouse = (screen - translation) / scale
      
      // We want the world coordinate under the mouse to remain at the same screen coordinate after zoom.
      // screen = world * scale + translation
      // translation = screen - world * scale
      
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      // The world point under the mouse currently:
      const worldX = (mouseX - canvas.x) / oldScale;
      const worldY = (mouseY - canvas.y) / oldScale;
      
      // New translation to keep that world point at the same mouse position:
      const newX = mouseX - worldX * newScale;
      const newY = mouseY - worldY * newScale;
      
      setCanvasTransform(newX, newY, newScale);
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
      
      {/* Dock */}
      <Dock />
    </div>
  );
}
