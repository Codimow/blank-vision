'use client';

import React from 'react';
import { useWindowStore } from '@/store/useWindowStore';

export default function ConnectionLines() {
  const { windows, windowOrder } = useWindowStore();
  
  // We only draw lines for windows that have a "parentId" in their props
  // and are currently visible (not minimized)
  
  const connections = Object.values(windows).filter(win => 
    win.props?.parentId && 
    windows[win.props.parentId] && 
    !win.isMinimized && 
    !windows[win.props.parentId].isMinimized
  );

  if (connections.length === 0) return null;

  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible"
      style={{ zIndex: 1 }} // Under windows, above background
    >
      <defs>
        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {connections.map(win => {
        const parent = windows[win.props.parentId!];
        
        // Calculate centers
        const x1 = parent.x + parent.width / 2;
        const y1 = parent.y + parent.height / 2;
        const x2 = win.x + win.width / 2;
        const y2 = win.y + win.height / 2;

        // Curved path (Cubic Bezier)
        const dx = Math.abs(x1 - x2) * 0.5;
        const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        return (
          <g key={`${win.id}-link`}>
            <path 
              d={path} 
              stroke="url(#line-gradient)" 
              strokeWidth="2" 
              fill="none" 
              strokeDasharray="8 4"
              className="animate-[dash_30s_linear_infinite]"
            />
            <circle cx={x1} cy={y1} r="4" fill="#3b82f6" filter="url(#glow)" />
            <circle cx={x2} cy={y2} r="4" fill="#3b82f6" filter="url(#glow)" />
          </g>
        );
      })}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </svg>
  );
}
