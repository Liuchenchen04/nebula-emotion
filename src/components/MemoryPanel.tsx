import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useStore } from '../store/useStore';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

function formatTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return '刚刚';
  if (diff < 3600_000) return dayjs(ts).fromNow();
  if (diff < 86_400_000) return dayjs(ts).format('HH:mm');
  if (diff < 172_800_000) return '昨天 ' + dayjs(ts).format('HH:mm');
  return dayjs(ts).format('M月D日 HH:mm');
}

export default function MemoryPanel() {
  const memories = useStore((s) => s.memories);
  const open = useStore((s) => s.memoryPanelOpen);
  const toggle = useStore((s) => s.toggleMemoryPanel);
  const deleteMemory = useStore((s) => s.deleteMemory);

  return (
    <>
      {/* 遮罩层 */}
      {open && (
        <div
          className="fixed inset-0 z-20"
          onClick={toggle}
        />
      )}

      {/* 面板 */}
      <div
        className={`fixed top-0 right-0 z-30 w-[360px] h-full
                    bg-black/80 backdrop-blur-md border-l border-white/10
                    flex flex-col
                    transition-transform duration-300
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* 标题行 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <span className="text-white/70 text-base">记忆 · 星云</span>
          <button
            onClick={toggle}
            className="text-white/40 hover:text-white/70 text-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {memories.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/30 text-sm">
              还没有记忆，去对宇宙说点什么吧 ✦
            </div>
          ) : (
            memories.map((m) => (
              <div
                key={m.id}
                className="group relative py-3 border-b border-white/5 last:border-b-0"
              >
                {/* 情绪标签 + 时间 */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: m.moodColor }}
                  />
                  <span className="text-white/60 text-sm">{m.moodLabel}</span>
                  <span className="text-white/20 text-xs">{formatTime(m.timestamp)}</span>
                </div>

                {/* 文本摘要 */}
                <p className="text-white/40 text-sm truncate pr-6">
                  {m.originalText.length > 30
                    ? m.originalText.slice(0, 30) + '...'
                    : m.originalText}
                </p>

                {/* 删除按钮 */}
                <button
                  onClick={() => deleteMemory(m.id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2
                             text-white/20 hover:text-red-400/70 text-sm
                             opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
