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
};

export type Subject =
  | 'Finansal Tablo Analizi'
  | 'Karar Destek Sistemleri'
  | 'Müşteri İlişkileri Yönetimi';