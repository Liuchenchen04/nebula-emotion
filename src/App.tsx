import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { useEmitPipeline } from './hooks/useEmitPipeline';
import { tryAutoplay } from './lib/audio';
import NebulaCanvas from './components/NebulaCanvas';
import InputConsole from './components/InputConsole';
import MemoryPanel from './components/MemoryPanel';
import EchoModal from './components/EchoModal';
import AudioControl from './components/AudioControl';
import FeedbackEntry from './components/FeedbackEntry';
import KeyInputModal from './components/KeyInputModal';

function App() {
  const loadMemories = useStore((s) => s.loadMemories);
  const toggleEchoModal = useStore((s) => s.toggleEchoModal);
  const toggleMemoryPanel = useStore((s) => s.toggleMemoryPanel);

  useEffect(() => {
    loadMemories();
    tryAutoplay();
  }, [loadMemories]);

  useEmitPipeline();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <NebulaCanvas />
      <InputConsole />

      {/* 底部控制栏 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
        <div className="group relative">
          <span className="absolute -top-7 left-1/2 -translate-x-1/2
                           text-white/40 text-xs whitespace-nowrap
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200
                           pointer-events-none">
            回忆
          </span>
          <button
            onClick={toggleEchoModal}
            className="w-10 h-10 rounded-full border border-white/20
                       flex items-center justify-center
                       text-white/50 text-lg
                       hover:scale-110 hover:border-white/30 hover:text-white/70
                       hover:shadow-[0_0_16px_rgba(255,255,255,0.12)]
                       transition-all duration-200"
            aria-label="回忆"
          >
            ✦
          </button>
        </div>
        <div className="group relative">
          <span className="absolute -top-7 left-1/2 -translate-x-1/2
                           text-white/40 text-xs whitespace-nowrap
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200
                           pointer-events-none">
            记忆
          </span>
          <button
            onClick={toggleMemoryPanel}
            className="w-10 h-10 rounded-full border border-white/20
                       flex items-center justify-center
                       text-white/50 text-lg
                       hover:scale-110 hover:border-white/30 hover:text-white/70
                       hover:shadow-[0_0_16px_rgba(255,255,255,0.12)]
                       transition-all duration-200"
            aria-label="记忆"
          >
            ☰
          </button>
        </div>
      </div>

      <AudioControl />
      <FeedbackEntry />
      <MemoryPanel />
      <EchoModal />
      <KeyInputModal />
    </div>
  );
}

export default App;
