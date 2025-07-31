export type Answer = {
  text: string;
  isCorrect: boolean;
};

export type QuestionType = 'multiple-choice' | 'true-false' | 'calculation' | 'case-study';

export type Question = {
  id: string;
  subject: string;
  type: QuestionType;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
  options: Answer[];
  explanation: string;
  formula?: string | null; // For calculation questions - match database schema
  topic?: string; // e.g. 'Lever Ratios'
};

// Database result types (what comes from database)
export type QuestionResult = {
  id: string;
  subjectId: string;
  subject: string;
  topic: string;
  type: string;
  difficulty: string;
  text: string;
  options: string; // JSON string from database
  correctAnswer: string;
  explanation: string;
  formula: string | null;
  createdBy: string | null;
  isActive: boolean;
  createdAt: Date; // Database returns Date objects
  updatedAt: Date;
};

export type Subject =
  | 'Finansal Tablo Analizi'
  | 'Karar Destek Sistemleri'
  | 'Müşteri İlişkileri Yönetimi';

// Match database schema exactly
export type QuizResult = {
  id?: string;
  userId?: string;
  subject?: string;
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  weakTopics: string; // JSON string from database
  createdAt: Date; // Database returns Date objects
};

// Database result type for quiz results
export type QuizResultRecord = {
  id: string;
  userId: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  weakTopics: string;
  createdAt: Date;
};

// Frontend-friendly type
export type QuizResultDisplay = {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  date: string; // Formatted date string for display
  weakTopics: Record<string, number>;
};

export type PerformanceData = {
  [key in Subject]?: QuizResultDisplay[];
};

// Subject database types
export type SubjectRecord = {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  questionCount: number;
  isActive: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SubjectDisplay = {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Orta' | 'Başlangıç' | 'İleri';
  questionCount: number;
  isActive: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};
