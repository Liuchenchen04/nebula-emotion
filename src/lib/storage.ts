import type { Memory } from '../types';

const STORAGE_KEY = 'nebula_memories';

export function getMemories(): Memory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    console.warn('localStorage 数据解析失败，返回空列表');
    return [];
  }
}

export function saveMemories(memories: Memory[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
}

export function deleteMemoryById(id: string): void {
  const memories = getMemories().filter((m) => m.id !== id);
  saveMemories(memories);
}
