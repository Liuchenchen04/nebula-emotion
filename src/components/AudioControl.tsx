import { useStore } from '../store/useStore';
import { bgMusic } from '../lib/audio';

export default function AudioControl() {
  const playing = useStore((s) => s.audioPlaying);
  const toggle = useStore((s) => s.toggleAudio);

  const handleClick = () => {
    toggle();
    if (playing) {
      bgMusic.pause();
    } else {
      bgMusic.play();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-10 group">
      <span className="absolute -top-7 left-1/2 -translate-x-1/2
                       text-white/40 text-xs whitespace-nowrap
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200
                       pointer-events-none">
        {playing ? '暂停' : '播放'}
      </span>
      <button
        onClick={handleClick}
        className="w-10 h-10 rounded-full border border-white/20
                   flex items-center justify-center
                   text-white/50 text-base
                   hover:scale-110 hover:border-white/30 hover:text-white/70
                   hover:shadow-[0_0_16px_rgba(255,255,255,0.12)]
                   transition-all duration-200"
        aria-label={playing ? '暂停' : '播放'}
      >
        {playing ? '⏸' : '♪'}
      </button>
    </div>
  );
}
