export interface Memory {
  id: string;
  originalText: string;
  moodLabel: string;
  moodColor: string;
  timestamp: number;
}

export interface EmotionResult {
  mood: string;
  color: string;
}
