import type { EmotionResult } from '../types';

export const EMOTION_COLORS: Record<string, string> = {
  '激动': '#FF9858',
  '很激动': '#FFB070',
  '幸福': '#F5B8D8',
  '很幸福': '#F8A0C8',
  '开心': '#FFD860',
  '特别开心': '#FFEC98',
  '疲惫': '#A098F0',
  '很疲惫': '#8878E0',
  '愤怒': '#F07D6B',
  '很愤怒': '#E05540',
  '孤独': '#7098E0',
  '很孤独': '#5880D0',
  '焦虑': '#C0A0E0',
  '很焦虑': '#A888D8',
  '伤心': '#7898E0',
  '很伤心': '#5C80D0',
  '失望': '#8898C8',
  '很失望': '#7080B8',
  '平静': '#78E0D0',
  '未知的情绪': '#B0B4C0',
};

const INTENSIFIERS = ['特别', '非常', '超级', '极其', '极度', '太', '很', '好'];

interface Rule {
  keywords: string[];
  normal: EmotionResult;
  intense: EmotionResult;
}

const RULES: Rule[] = [
  { keywords: ['激动', '兴奋', '刺激'], normal: { mood: '激动', color: '#FF9858' }, intense: { mood: '很激动', color: '#FFB070' } },
  { keywords: ['幸福', '甜蜜', '温暖'], normal: { mood: '幸福', color: '#F5B8D8' }, intense: { mood: '很幸福', color: '#F8A0C8' } },
  { keywords: ['开心', '高兴', '快乐', '太好了', '真好', '哈哈', '嘻嘻', '乐观'], normal: { mood: '开心', color: '#FFD860' }, intense: { mood: '特别开心', color: '#FFEC98' } },
  { keywords: ['累', '困', '忙', '倦', '疲惫'], normal: { mood: '疲惫', color: '#A098F0' }, intense: { mood: '很疲惫', color: '#8878E0' } },
  { keywords: ['生气', '怒', '恨', '讨厌', '烦死了', '火大', '恼怒', '气愤', '烦躁', '恶心'], normal: { mood: '愤怒', color: '#F07D6B' }, intense: { mood: '很愤怒', color: '#E05540' } },
  { keywords: ['一个人', '孤单', '寂寞', '孤独'], normal: { mood: '孤独', color: '#7098E0' }, intense: { mood: '很孤独', color: '#5880D0' } },
  { keywords: ['怕', '担心', '紧张', '焦虑', '不安', '害怕'], normal: { mood: '焦虑', color: '#C0A0E0' }, intense: { mood: '很焦虑', color: '#A888D8' } },
  { keywords: ['糟糕', '失望', '遗憾', '可惜', '没希望', '灰心', '丧'], normal: { mood: '失望', color: '#8898C8' }, intense: { mood: '很失望', color: '#7080B8' } },
  { keywords: ['难过', '伤心', '哭', '心碎', '难受', '眼泪', '悲伤'], normal: { mood: '伤心', color: '#7898E0' }, intense: { mood: '很伤心', color: '#5C80D0' } },
  { keywords: ['平静', '放松', '舒服', '满足', '安心', '惬意', '淡定'], normal: { mood: '平静', color: '#78E0D0' }, intense: { mood: '平静', color: '#78E0D0' } },
];

export function localClassify(text: string): EmotionResult {
  const hasIntensifier = INTENSIFIERS.some((w) => text.includes(w));
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return hasIntensifier ? rule.intense : rule.normal;
    }
  }
  return { mood: '未知的情绪', color: '#B0B4C0' };
}
