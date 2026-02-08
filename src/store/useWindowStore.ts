import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  component: string; // ID of the component to render (e.g., 'github', 'terminal')
  props?: Record<string, any>;
}

interface CanvasState {
  x: number;
  y: number;
  scale: number;
}

interface StoreState {
  canvas: CanvasState;
  windows: Record<string, WindowState>;
  activeWindowId: string | null;
  windowOrder: string[]; // Array of IDs to manage z-index stacking order

  // Actions
  setCanvasTransform: (x: number, y: number, scale: number) => void;
  openWindow: (component: string, props?: any, title?: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  resetCanvas: () => void;
}

export const useWindowStore = create<StoreState>()(
  persist(
    (set, get) => ({
      canvas: { x: 0, y: 0, scale: 1 },
      windows: {},
      activeWindowId: null,
      windowOrder: [],

      setCanvasTransform: (x, y, scale) =>
        set((state) => ({ canvas: { ...state.canvas, x, y, scale } })),

      resetCanvas: () => set({ canvas: { x: 0, y: 0, scale: 1 } }),

      openWindow: (component, props = {}, title = 'New Window') => {
        const id = uuidv4();
        const { canvas } = get();
        
        // Center new window relative to current canvas view, somewhat
        // Simple logic: center of screen - offset by canvas position
        // We use a fallback for window dimensions if not available (SSR)
        const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const winHeight = typeof window !== 'undefined' ? window.innerHeight : 768;

        const startX = -canvas.x + (winWidth / 2) - 300; 
        const startY = -canvas.y + (winHeight / 2) - 200;

        const newWindow: WindowState = {
          id,
          title,
          x: startX + (Math.random() * 50), // slight scatter
          y: startY + (Math.random() * 50),
          width: 600,
          height: 400,
          zIndex: 10, // Initial base
          isMinimized: false,
          isMaximized: false,
          component,
          props,
        };

        set((state) => ({
          windows: { ...state.windows, [id]: newWindow },
          windowOrder: [...state.windowOrder, id],
          activeWindowId: id,
        }));
      },

      closeWindow: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.windows;
          return {
            windows: rest,
            windowOrder: state.windowOrder.filter((wId) => wId !== id),
            activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
          };
        }),

      focusWindow: (id) =>
        set((state) => {
          // Move id to the end of windowOrder to make it render on top (conceptually)
          // We will map index in windowOrder to zIndex in the component
          const newOrder = state.windowOrder.filter((wId) => wId !== id);
          newOrder.push(id);
          return {
            activeWindowId: id,
            windowOrder: newOrder,
          };
        }),

      updateWindow: (id, updates) =>
        set((state) => ({
          windows: {
            ...state.windows,
            [id]: { ...state.windows[id], ...updates },
          },
        })),
    }),
    {
      name: 'blank-vision-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist windows and canvas, but maybe not ephemeral UI states if we wanted to restrict
        canvas: state.canvas,
        windows: state.windows,
        windowOrder: state.windowOrder,
        activeWindowId: state.activeWindowId
      }),
    }
  )
);
