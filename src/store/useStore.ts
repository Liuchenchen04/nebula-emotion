import { create } from 'zustand';
import type { Memory } from '../types';
import { getMemories, saveMemories, deleteMemoryById } from '../lib/storage';

interface AppState {
  emitTrigger: { text: string; timestamp: number } | null;
  currentColor: string;
  memories: Memory[];
  memoryPanelOpen: boolean;
  echoModalOpen: boolean;
  audioPlaying: boolean;

  emit: (text: string) => void;
  setCurrentColor: (color: string) => void;
  loadMemories: () => void;
  addMemory: (m: Memory) => void;
  deleteMemory: (id: string) => void;
  pickRandom: () => Memory | null;
  toggleMemoryPanel: () => void;
  toggleEchoModal: () => void;
  toggleAudio: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  emitTrigger: null,
  currentColor: '#B8B8C4',
  memories: [],
  memoryPanelOpen: false,
  echoModalOpen: false,
  audioPlaying: false,

  emit: (text) => set({ emitTrigger: { text, timestamp: Date.now() } }),

  setCurrentColor: (color) => set({ currentColor: color }),

  loadMemories: () => set({ memories: getMemories() }),

  addMemory: (m) => {
    const next = [m, ...get().memories];
    saveMemories(next);
    set({ memories: next });
  },

  deleteMemory: (id) => {
    deleteMemoryById(id);
    set({ memories: get().memories.filter((m) => m.id !== id) });
  },

  pickRandom: () => {
    const list = get().memories;
    if (list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  },

  toggleMemoryPanel: () => set((s) => ({ memoryPanelOpen: !s.memoryPanelOpen })),

  toggleEchoModal: () => set((s) => ({ echoModalOpen: !s.echoModalOpen })),

  toggleAudio: () => set((s) => ({ audioPlaying: !s.audioPlaying })),
}));
