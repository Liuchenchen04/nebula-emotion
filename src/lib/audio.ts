import { Howl } from 'howler';

export const bgMusic = new Howl({
  src: ['/audio/ambient.mp3'],
  loop: true,
  volume: 0.3,
  preload: true,
  onloaderror: (_id, err) => {
    console.warn('音频加载失败，静音运行:', err);
  },
});

export function tryAutoplay() {
  bgMusic.play();
  if (!bgMusic.playing()) {
    const resume = () => {
      bgMusic.play();
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
    };
    document.addEventListener('click', resume);
    document.addEventListener('keydown', resume);
  }
}
