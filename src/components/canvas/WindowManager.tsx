'use client';

import React from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import WindowFrame from './WindowFrame';
import GitHubWindow from '@/apps/GitHubWindow';
import BrowserWindow from '@/apps/BrowserWindow';
import TerminalWindow from '@/apps/TerminalWindow';

// Registry of available apps
const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  'github': GitHubWindow,
  'browser': BrowserWindow,
  'terminal': TerminalWindow,
  'default': () => <div className="p-4 text-neutral-400">Content not found</div>
};

export default function WindowManager() {
  const { windows, windowOrder } = useWindowStore();

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
