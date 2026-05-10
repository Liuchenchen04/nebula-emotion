import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { generateEcho } from '../lib/llm';
import type { Memory } from '../types';

type Phase = 'idle' | 'loading' | 'displaying' | 'done';

export default function EchoModal() {
  const open = useStore((s) => s.echoModalOpen);
  const toggle = useStore((s) => s.toggleEchoModal);
  const pickRandom = useStore((s) => s.pickRandom);

  const [phase, setPhase] = useState<Phase>('idle');
  const [memory, setMemory] = useState<Memory | null>(null);
  const [displayText, setDisplayText] = useState('');
  const [visible, setVisible] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const close = useCallback(() => {
    abortRef.current?.abort();
    toggle();
  }, [toggle]);

  // 弹窗打开时：选取记忆 → 调 LLM → 打字机
  useEffect(() => {
    if (!open) {
      setVisible(false);
      setPhase('idle');
      setMemory(null);
      setDisplayText('');
      return;
    }
    requestAnimationFrame(() => setVisible(true));

    const picked = pickRandom();
    if (!picked) {
      setMemory(null);
      setPhase('done');
      return;
    }

    setMemory(picked);
    setPhase('loading');
    setDisplayText('');

    const controller = new AbortController();
    abortRef.current = controller;

    generateEcho(picked)
      .then((text) => {
        if (controller.signal.aborted) return;
        setPhase('displaying');
        typewriter(text, controller.signal);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setPhase('displaying');
        typewriter('那些情绪像星星一样真实，它们值得被看见。', controller.signal);
      });

    return () => {
      controller.abort();
    };
  }, [open, pickRandom]);

  function typewriter(fullText: string, signal: AbortSignal) {
    let i = 0;
    const timer = setInterval(() => {
      if (signal.aborted) {
        clearInterval(timer);
        return;
      }
      i++;
      setDisplayText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(timer);
        setPhase('done');
      }
    }, 40);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* 遮罩 */}
      <div
        className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-200
                    ${visible ? 'bg-black/60 opacity-100' : 'bg-black/0 opacity-0'}`}
        onClick={close}
      />

      {/* 卡片 */}
      <div className={`relative z-10 w-full max-w-[420px] mx-6
                      bg-neutral-900/90 border border-white/10 rounded-2xl p-8
                      transition-all duration-200 ease-out
                      ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {!memory ? (
          <p className="text-white/30 text-sm text-center py-8">
            还没有记忆，去对宇宙说点什么吧 ✦
          </p>
        ) : (
          <>
            {/* 记忆片段 */}
            <div className="border-l-2 border-white/10 pl-4 mb-6">
              <p className="text-white/40 text-sm italic">
                {memory.originalText}
              </p>
              <p className="text-white/20 text-xs mt-1">
                {memory.moodLabel}
              </p>
            </div>

            {/* 回应区域 */}
            <div className="min-h-[60px]">
              {phase === 'loading' && (
                <span className="text-white/30 animate-pulse">···</span>
              )}
              {(phase === 'displaying' || phase === 'done') && (
                <p className="text-white/70 text-sm leading-relaxed">
                  {displayText}
                  {phase === 'displaying' && (
                    <span className="inline-block w-[1px] h-4 bg-white/50 ml-0.5 animate-pulse" />
                  )}
                </p>
              )}
            </div>
          </>
        )}

        {/* 关闭按钮 */}
        <div className="mt-6 text-center">
          <button
            onClick={close}
            className="text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            谢谢 ✦
          </button>
        </div>
      </div>
    </div>
  );
}
