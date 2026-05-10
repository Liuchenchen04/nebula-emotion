import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';

export default function InputConsole() {
  const [text, setText] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emit = useStore((s) => s.emit);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    emit(trimmed);
    setText('');
    setDisabled(true);
    setPulsing(true);
    setTimeout(() => {
      setDisabled(false);
      setPulsing(false);
    }, 500);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 flex items-center gap-3">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="今天想对宇宙说些什么..."
        className="w-[480px] h-12 px-5 rounded-2xl text-base placeholder:text-white/30
                   bg-white/5 backdrop-blur-xl border border-white/10
                   text-white/70 outline-none
                   transition-shadow duration-200
                   focus:border-white/20 focus:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      />
      <div className="group relative shrink-0">
        <span className="absolute -top-7 left-1/2 -translate-x-1/2
                         text-white/40 text-xs whitespace-nowrap
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         pointer-events-none">
          发送
        </span>
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className={`w-12 h-12 rounded-full border border-white/20
                     flex items-center justify-center
                     text-white/50 text-lg
                     hover:shadow-[0_0_16px_rgba(255,255,255,0.15)]
                     hover:border-white/30 hover:text-white/70
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all duration-200
                     ${pulsing ? 'animate-pulse-once' : ''}`}
          aria-label="发射"
        >
          ✦
        </button>
      </div>
    </div>
  );
}
