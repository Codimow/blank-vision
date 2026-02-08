'use client';

import React from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import WindowFrame from './WindowFrame';
import GitHubWindow from '@/apps/GitHubWindow';
import TerminalWindow from '@/apps/TerminalWindow';

// Registry of available apps
const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  'github': GitHubWindow,
  'terminal': TerminalWindow,
  'default': () => <div className="p-4 text-neutral-400">Content not found</div>
};

export default function WindowManager() {
  const { windows, windowOrder } = useWindowStore();

  // Sort windows based on windowOrder for proper z-index stacking visually if needed,
  // or just render them in order. 
  // Actually, standard HTML stacking order (DOM order) dictates z-index if no z-index is set.
  // We are using explicit z-index in style, but DOM order helps with tab order / accessibility.
  
  // Create a sorted array of windows based on order
  const sortedWindows = windowOrder
    .map(id => windows[id])
    .filter(Boolean); // Safety check

  return (
    <>
      {sortedWindows.map((win) => {
        const Component = COMPONENT_REGISTRY[win.component] || COMPONENT_REGISTRY['default'];
        
        return (
            <WindowFrame key={win.id} window={win}>
                <Component {...win.props} windowId={win.id} />
            </WindowFrame>
        );
      })}
    </>
  );
}
