import { useState, useRef } from 'react';

const STORAGE_KEY = 'nebula_feedback';

export default function FeedbackEntry() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setSent(false);
    setText('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
    existing.push(trimmed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    setSent(true);
    setText('');
    setTimeout(() => setOpen(false), 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="fixed bottom-8 left-8 z-10">
      {!open ? (
        <button
          onClick={handleOpen}
          className="text-white/40 text-sm hover:text-white/70 transition-colors"
        >
          意见反馈
        </button>
      ) : (
        <div className="flex items-center gap-2">
          {sent ? (
            <span className="text-white/50 text-sm">谢谢反馈 ✦</span>
          ) : (
            <>
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="说说你的想法..."
                className="w-44 h-8 px-3 rounded-lg text-sm
                           bg-white/5 border border-white/10
                           text-white/60 placeholder:text-white/20 outline-none
                           focus:border-white/20 transition-colors"
              />
              <button
                onClick={handleSubmit}
                className="text-white/40 text-sm hover:text-white/70 transition-colors"
              >
                发送
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-white/20 text-sm hover:text-white/50 transition-colors"
              >
                ×
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
