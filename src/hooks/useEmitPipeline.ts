import { useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import { useStore } from '../store/useStore';
import { analyzeEmotion } from '../lib/llm';
import { localClassify } from '../lib/emotion-color';
import type { Memory } from '../types';

export function useEmitPipeline() {
  const emitTrigger = useStore((s) => s.emitTrigger);
  const addMemory = useStore((s) => s.addMemory);
  const setCurrentColor = useStore((s) => s.setCurrentColor);
  const currentColor = useStore((s) => s.currentColor);
  const lastTimestamp = useRef(0);

  useEffect(() => {
    if (!emitTrigger) return;
    if (emitTrigger.timestamp === lastTimestamp.current) return;
    lastTimestamp.current = emitTrigger.timestamp;

    const id = nanoid();
    const memory: Memory = {
      id,
      originalText: emitTrigger.text,
      moodLabel: '',
      moodColor: currentColor,
      timestamp: Date.now(),
    };

    analyzeEmotion(emitTrigger.text)
      .then((result) => {
        memory.moodLabel = result.mood;
        memory.moodColor = result.color;
        setCurrentColor(result.color);
      })
      .catch(() => {
        const fallback = localClassify(emitTrigger.text);
        memory.moodLabel = fallback.mood;
        memory.moodColor = fallback.color;
        setCurrentColor(fallback.color);
      })
      .finally(() => {
        addMemory(memory);
      });
  }, [emitTrigger]); // eslint-disable-line react-hooks/exhaustive-deps
}
