// Question Manager Types - Consolidated interfaces for all question manager components

export interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  questionCount: number;
  isActive: boolean;
}

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface AIGeneratedQuestion {
  text: string;
  options: QuestionOption[];
  explanation: string;
  topic: string;
  formula?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  keywords: string[];
  learningObjective: string;
}

export interface AIGenerationResult {
  questions: AIGeneratedQuestion[];
  metadata: {
    totalGenerated: number;
    subject: string;
    topic: string;
    averageDifficulty: string;
    generationTimestamp: string;
  };
  qualityScore: number;
  suggestions: string[];
}

export interface QuestionFormData {
  subject: string;
  topic: string;
  type: string;
  difficulty: string;
  text: string;
  options: QuestionOption[];
  explanation: string;
  formula: string;
}

// Constants
export const QUESTION_TYPES = [
  "Çoktan Seçmeli",
  "Doğru/Yanlış",
  "Hesaplama",
  "Vaka Çalışması",
] as const;

export const DIFFICULTIES = ["Kolay", "Orta", "Zor"] as const;

export type QuestionType = typeof QUESTION_TYPES[number];
export type Difficulty = typeof DIFFICULTIES[number];
