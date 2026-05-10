import type { EmotionResult, Memory } from '../types';
import { localClassify } from './emotion-color';

const LLM_CONFIG = {
  deepseek: {
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
  },
  siliconflow: {
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'Qwen/Qwen2.5-7B-Instruct',
  },
} as const;

const FALLBACK_TIMEOUT = 3000;

function getApiKey(): string {
  const envKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (envKey) return envKey;
  return localStorage.getItem('nebula_deepseek_key') || '';
}

function getConfig() {
  const provider = import.meta.env.VITE_LLM_PROVIDER || 'deepseek';
  return { ...LLM_CONFIG[provider as keyof typeof LLM_CONFIG], key: getApiKey() };
}

const ECHO_FALLBACKS: Record<string, string[]> = {
  '激动': ['心跳加速的感觉真好，宇宙也在为你加速旋转 ✦', '这份能量像超新星爆发一样耀眼！'],
  '很激动': ['哇！！整个星云都被你的能量点燃了 ✦', '这么热烈的时刻，宇宙都跟着沸腾了。'],
  '幸福': ['粉色的星云最适合此刻的你，温暖又柔软 ✦', '被幸福包裹的感觉，像星云里最温柔的那团光。'],
  '很幸福': ['这份甜蜜浓得化不开，连星星都嫉妒了 ✦', '满溢的幸福感，把整个宇宙都染成了粉色。'],
  '开心': ['你笑起来的时候，整个宇宙都亮了一点 ✦', '这份快乐值得被记住，像星星一样发光。'],
  '特别开心': ['哇，这光芒连星云都羡慕了 ✦', '这么灿烂的心情，整个宇宙都在为你闪烁。'],
  '疲惫': ['辛苦了。那些重担不会永远压着你，先歇一歇。', '疲惫是身体在说真话，倾听它本身就是一种温柔。'],
  '很疲惫': ['你已经撑了很久了，这片星云会替你保管这份累。', '想倒下也没关系，宇宙会接住你的。'],
  '愤怒': ['怒火也是火，它证明你在意。让它烧完，你会更轻。', '那些让你生气的事，到星云里会慢慢变淡的。'],
  '很愤怒': ['火很大，我知道。先让它烧一会儿，我陪着你。', '这么强烈的愤怒背后，一定有很重要的事。'],
  '孤独': ['一个人也没关系，你看，整个宇宙都是独自旋转的。', '孤独感像深空一样广阔，但你不是唯一漂浮的星。'],
  '很孤独': ['这份安静沉得很深，但它也是你和自己最靠近的时刻。', '在无边宇宙里，总有一颗星和你以相同的频率闪烁。'],
  '焦虑': ['不安像云一样飘过来，但它们总会飘走的。', '担心很多事，说明你在乎很多事，这本身就很珍贵。'],
  '很焦虑': ['心跳太快的时候，试试深呼吸——你看星云也是慢慢旋转的。', '那些在脑子里打转的念头，暂时交给宇宙保管吧。'],
  '伤心': ['眼泪是情绪流出来的方式，让它流完，你会更清澈。', '难过的时候不用坚强，这片星云会轻轻抱着你。'],
  '很伤心': ['心碎的感觉是真实的，痛也是。但你也会慢慢好起来的。', '这么深的悲伤，说明你爱得同样深。'],
  '失望': ['期待落空的感觉确实不好受。但下一次光会从不同的方向来。', '失望是转弯的信号，不是终点。'],
  '很失望': ['太失望的时候，什么都不想说是正常的。宇宙安静地听着。', '期望越大失望越深，但这份期待本身也很勇敢。'],
  '平静': ['这份宁静很珍贵，像深空里最稳定的星光。', '平静不是无聊，是内心在重新充电。'],
};

function getFallbackEcho(mood: string): string {
  const list = ECHO_FALLBACKS[mood] || ECHO_FALLBACKS['平静'];
  return list[Math.floor(Math.random() * list.length)];
}

export async function analyzeEmotion(text: string): Promise<EmotionResult> {
  try {
    const cfg = getConfig();
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          {
            role: 'system',
            content:
              '你是一个温柔的情绪观察者。分析用户输入的情绪，只返回一个JSON对象：{"mood":"情绪标签","color":"#十六进制颜色"}。情绪标签可选：激动、幸福、开心、疲惫、愤怒、孤独、焦虑、失望、伤心、平静。要体现情绪强度（如"开心"→"特别开心"，"激动"→"很激动"）。颜色用柔和的梦幻色调：激动→暖橙、幸福→柔粉、开心→暖金，消极情绪偏深沉但保持通透（柔紫、深海蓝、灰紫）。不同情绪和不同强度之间颜色要有明显区分。不要返回其他内容。',
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 50,
      }),
      signal: AbortSignal.timeout(FALLBACK_TIMEOUT),
    });

    if (!res.ok) throw new Error(`LLM API ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    if (!parsed.mood || !parsed.color) throw new Error('Missing mood or color field');
    return { mood: parsed.mood, color: parsed.color };
  } catch (err) {
    console.warn('LLM 调用失败，使用本地降级:', err);
    return localClassify(text);
  }
}

export async function generateEcho(memory: Memory): Promise<string> {
  try {
    const cfg = getConfig();
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          {
            role: 'system',
            content:
              '你是"星云"，一个温柔、非评判的宇宙观察者。你说话方式像一位陪伴多年的老友，简洁、温暖，不带说教。用户曾经向你倾诉过一段情绪，现在需要你的回应。',
          },
          {
            role: 'user',
            content: `用户曾说过："${memory.originalText}"\n当时的情绪是：${memory.moodLabel}\n\n请给出一句治愈的回应（不超过40字），让用户感到被理解和接纳。`,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error(`LLM API ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || getFallbackEcho(memory.moodLabel);
  } catch (err) {
    console.warn('LLM 治愈回应生成失败，使用降级文案:', err);
    return getFallbackEcho(memory.moodLabel);
  }
}
