import type { Question } from "@/lib/types";
import type { Subject } from "@/types/question-manager";

// Unified storage service with single storage keys
export class UnifiedStorageService {
  // Single storage keys for the entire application
  private static readonly QUESTIONS_KEY = "akilhane_questions";
  private static readonly SUBJECTS_KEY = "akilhane_subjects";

  // Questions storage methods
  static getQuestions(): Question[] {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.QUESTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveQuestions(questions: Question[]): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(this.QUESTIONS_KEY, JSON.stringify(questions));
    } catch {
      // Silent fail for localStorage errors
    }
  }

  static addQuestion(question: Omit<Question, "id">): Question {
    const newQuestion: Question = {
      ...question,
      id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const questions = this.getQuestions();
    questions.push(newQuestion);
    this.saveQuestions(questions);

    return newQuestion;
  }

  static updateQuestion(id: string, updates: Partial<Question>): boolean {
    const questions = this.getQuestions();
    const index = questions.findIndex((q) => q.id === id);
    if (index === -1) {
      return false;
    }

    const existingQuestion = questions[index];
    if (existingQuestion) {
      questions[index] = {
        ...existingQuestion,
        ...updates,
      };
    }
    this.saveQuestions(questions);
    return true;
  }

  static deleteQuestion(id: string): boolean {
    const questions = this.getQuestions();
    const filtered = questions.filter((q) => q.id !== id);
    if (filtered.length === questions.length) {
      return false;
    }

    this.saveQuestions(filtered);
    return true;
  }

  static getQuestionsBySubject(subject: string): Question[] {
    const questions = this.getQuestions();

    // Normalize subject names for better matching
    const normalizedRequestedSubject = subject.trim().toLowerCase();

    const filteredQuestions = questions.filter((q) => {
      const normalizedQuestionSubject = q.subject.trim().toLowerCase();
      const matches = normalizedQuestionSubject === normalizedRequestedSubject;

      return matches;
    });

    return filteredQuestions;
  }

  // Subjects storage methods
  static getSubjects(): Subject[] {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.SUBJECTS_KEY);
      const subjects = stored ? JSON.parse(stored) : [];
      return subjects;
    } catch {
      return [];
    }
  }

  static saveSubjects(subjects: Subject[]): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(this.SUBJECTS_KEY, JSON.stringify(subjects));
    } catch {
      // Silent fail for localStorage errors
    }
  }

  static addSubject(subject: Omit<Subject, "id">): Subject {
    const newSubject: Subject = {
      ...subject,
      id: `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const subjects = this.getSubjects();
    subjects.push(newSubject);
    this.saveSubjects(subjects);
    return newSubject;
  }

  static updateSubject(id: string, updates: Partial<Subject>): boolean {
    const subjects = this.getSubjects();
    const index = subjects.findIndex((s) => s.id !== id);
    if (index === -1) {
      return false;
    }

    const existingSubject = subjects[index];
    if (existingSubject) {
      subjects[index] = {
        ...existingSubject,
        ...updates,
      };
      this.saveSubjects(subjects);
      return true;
    }
    return false;
  }

  static deleteSubject(id: string): boolean {
    const subjects = this.getSubjects();
    const filtered = subjects.filter((s) => s.id !== id);
    if (filtered.length === subjects.length) {
      return false;
    }

    this.saveSubjects(filtered);
    return true;
  }

  // Clean up old storage keys (migration helper)
  static cleanupOldStorage(): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      // Remove old storage keys
      localStorage.removeItem("exam_training_questions");
      localStorage.removeItem("akilhane_questions_v2");
      localStorage.removeItem("exam_training_subjects");
    } catch {
      // Silent fail for cleanup errors
    }
  }

  // Get storage info for debugging
  static getStorageInfo(): { questions: number; subjects: number; totalSize: number } {
    if (typeof window === "undefined") {
      return { questions: 0, subjects: 0, totalSize: 0 };
    }
    try {
      const questions = this.getQuestions();
      const subjects = this.getSubjects();
      const totalSize = new Blob([JSON.stringify(questions), JSON.stringify(subjects)]).size;

      return {
        questions: questions.length,
        subjects: subjects.length,
        totalSize,
      };
    } catch {
      return { questions: 0, subjects: 0, totalSize: 0 };
    }
  }
}
