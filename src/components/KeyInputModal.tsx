import { useState, useEffect } from 'react';

const STORAGE_KEY = 'nebula_deepseek_key';

export function getStoredKey(): string {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function storeKey(key: string) {
  localStorage.setItem(STORAGE_KEY, key);
}

export default function KeyInputModal() {
  const [show, setShow] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    // 如果 env 里的 key 也为空，且 localStorage 也无 key，则显示弹窗
    if (!getStoredKey()) {
      setShow(true);
    }
  }, []);

  const handleSave = () => {
    const trimmed = input.trim();
    if (trimmed) {
      storeKey(trimmed);
    }
    setShow(false);
  };

  const handleSkip = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-[380px] mx-6 bg-neutral-900/95 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white/70 text-sm mb-3">星云需要你的 DeepSeek API Key</h2>
        <p className="text-white/30 text-xs mb-4 leading-relaxed">
          用于情绪分析和治愈回应。Key 只保存在你的浏览器中，不上传任何服务器。
          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-nebula-blue hover:underline ml-1"
          >
            获取 Key →
          </a>
        </p>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="sk-..."
          className="w-full h-10 px-4 rounded-xl text-sm
                     bg-white/5 border border-white/10
                     text-white/70 placeholder:text-white/20 outline-none
                     focus:border-white/20 transition-colors mb-4"
          autoFocus
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleSkip}
            className="text-white/20 text-sm hover:text-white/50 transition-colors"
          >
            跳过，使用基础模式
          </button>
          <button
            onClick={handleSave}
            className="text-white/60 text-sm hover:text-white/90 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
