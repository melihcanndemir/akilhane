export type Answer = {
  text: string;
  isCorrect: boolean;
};

export type QuestionType = 'multiple-choice' | 'true-false' | 'calculation' | 'case-study';

export type Question = {
  id: string;
  subject: Subject;
  type: QuestionType;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
  options: Answer[];
  explanation: string;
  formula?: string; // For calculation questions
  topic?: string; // e.g. 'Kaldıraç Oranları'
};

export type Subject =
  | 'Finansal Tablo Analizi'
  | 'Karar Destek Sistemleri'
  | 'Müşteri İlişkileri Yönetimi';

export type QuizResult = {
    score: number;
    totalQuestions: number;
    timeSpent: number; // in seconds
    date: string;
    weakTopics: Record<string, number>; // Tracks how many times a topic was answered incorrectly
};

export type PerformanceData = {
    [key in Subject]?: QuizResult[];
};

// git
