import type { Question } from "@/lib/types";
import type { Subject } from "@/types/question-manager";

// Flashcard interface
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  topic: string;
  difficulty: string;
  subject: string;
  createdAt: Date;
  // Progress tracking fields for spaced repetition
  reviewCount?: number;
  confidence?: number;
  lastReviewed?: Date;
  nextReview?: Date;
}

// Unified storage service with single storage keys
export class UnifiedStorageService {
  // Single storage keys for the entire application
  private static readonly QUESTIONS_KEY = "akilhane_questions";
  private static readonly SUBJECTS_KEY = "akilhane_subjects";
  private static readonly FLASHCARDS_KEY = "akilhane_flashcards";

  // Questions storage methods
  static getQuestions(): Question[] {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.QUESTIONS_KEY);
      const questions = stored ? JSON.parse(stored) : [];
      
      // Auto-cleanup duplicates on load (safety measure)
      if (questions.length > 0) {
        const uniqueQuestions = questions.filter((question: Question, index: number, self: Question[]) => 
          index === self.findIndex((q: Question) => q.id === question.id)
        );
        
        if (uniqueQuestions.length !== questions.length) {
          console.warn(`🧹 Auto-cleanup: Removed ${questions.length - uniqueQuestions.length} duplicate questions`);
          this.saveQuestions(uniqueQuestions);
          return uniqueQuestions;
        }
      }
      
      return questions;
    } catch (error) {
      console.error("🔴 Error getting questions from localStorage:", error);
      return [];
    }
  }

  static saveQuestions(questions: Question[]): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(this.QUESTIONS_KEY, JSON.stringify(questions));
      console.log("💾 Questions saved to localStorage:", questions.length);
    } catch (error) {
      console.error("🔴 Error saving questions to localStorage:", error);
    }
  }

  static addQuestion(question: Omit<Question, "id">): Question {
    const newQuestion: Question = {
      ...question,
      id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const questions = this.getQuestions();
    
    // Prevent duplicate IDs (safety check)
    const existingQuestion = questions.find(q => q.id === newQuestion.id);
    if (existingQuestion) {
      console.warn("⚠️ Duplicate ID detected, generating new ID:", newQuestion.id);
      newQuestion.id = `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    questions.push(newQuestion);
    this.saveQuestions(questions);

    console.log("✅ Question added to localStorage:", newQuestion.id);
    return newQuestion;
  }

  static updateQuestion(id: string, updates: Partial<Question>): boolean {
    try {
      console.log("🔍 UnifiedStorageService: Updating question", { id, updates });
      
      const questions = this.getQuestions();
      console.log("🔍 UnifiedStorageService: Current questions count:", questions.length);
      
      const index = questions.findIndex((q) => q.id === id);
      console.log("🔍 UnifiedStorageService: Question index:", index);
      
      if (index === -1) {
        console.error("🔴 UnifiedStorageService: Question not found with ID:", id);
        // Debug: List all question IDs
        console.log("🔍 Available question IDs:", questions.map(q => q.id));
        return false;
      }

      const existingQuestion = questions[index];
      console.log("🔍 UnifiedStorageService: Existing question:", existingQuestion);
      
      if (existingQuestion) {
        const updatedQuestion = {
          ...existingQuestion,
          ...updates,
        };
        console.log("🔍 UnifiedStorageService: Updated question:", updatedQuestion);
        
        questions[index] = updatedQuestion;
        this.saveQuestions(questions);
        
        console.log("✅ UnifiedStorageService: Question updated successfully");
        return true;
      } else {
        console.error("🔴 UnifiedStorageService: Existing question is null/undefined");
        return false;
      }
    } catch (error) {
      console.error("🔴 UnifiedStorageService: Update error:", error);
      return false;
    }
  }

  static deleteQuestion(id: string): boolean {
    try {
      const questions = this.getQuestions();
      const initialLength = questions.length;
      const filtered = questions.filter((q) => q.id !== id);
      
      if (filtered.length === initialLength) {
        console.error("🔴 Question not found for deletion:", id);
        return false;
      }

      this.saveQuestions(filtered);
      console.log("✅ Question deleted from localStorage:", id);
      return true;
    } catch (error) {
      console.error("🔴 Error deleting question:", error);
      return false;
    }
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

    console.log(`🔍 Found ${filteredQuestions.length} questions for subject: ${subject}`);
    return filteredQuestions;
  }

  // Subjects storage methods
  static getSubjects(): Subject[] {
    if (typeof window === "undefined") {
      console.log("🔄 UnifiedStorageService: Window undefined, returning empty array");
      return [];
    }
    try {
      const stored = localStorage.getItem(this.SUBJECTS_KEY);
      console.log("🔄 UnifiedStorageService: Raw localStorage value:", stored);
      const subjects = stored ? JSON.parse(stored) : [];
      console.log("🔄 UnifiedStorageService: Parsed subjects:", subjects);
      console.log("🔄 UnifiedStorageService: Subjects length:", subjects.length);
      return subjects;
    } catch (error) {
      console.error("🔴 Error getting subjects from localStorage:", error);
      return [];
    }
  }

  static saveSubjects(subjects: Subject[]): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(this.SUBJECTS_KEY, JSON.stringify(subjects));
      console.log("💾 Subjects saved to localStorage:", subjects.length);
    } catch (error) {
      console.error("🔴 Error saving subjects to localStorage:", error);
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
    
    console.log("✅ Subject added to localStorage:", newSubject.id);
    return newSubject;
  }

  // 🚀 FIXED: Wrong filter condition
  static updateSubject(id: string, updates: Partial<Subject>): boolean {
    try {
      const subjects = this.getSubjects();
      const index = subjects.findIndex((s) => s.id === id); // FIX: was s.id !== id
      
      if (index === -1) {
        console.error("🔴 Subject not found for update:", id);
        return false;
      }

      const existingSubject = subjects[index];
      if (existingSubject) {
        subjects[index] = {
          ...existingSubject,
          ...updates,
        };
        this.saveSubjects(subjects);
        console.log("✅ Subject updated in localStorage:", id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("🔴 Error updating subject:", error);
      return false;
    }
  }

  static deleteSubject(id: string): boolean {
    try {
      const subjects = this.getSubjects();
      const initialLength = subjects.length;
      const filtered = subjects.filter((s) => s.id !== id);
      
      if (filtered.length === initialLength) {
        console.error("🔴 Subject not found for deletion:", id);
        return false;
      }

      this.saveSubjects(filtered);
      console.log("✅ Subject deleted from localStorage:", id);
      return true;
    } catch (error) {
      console.error("🔴 Error deleting subject:", error);
      return false;
    }
  }

  // 🆕 Flashcard storage methods
  static getFlashcards(): Flashcard[] {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.FLASHCARDS_KEY);
      const flashcards = stored ? JSON.parse(stored) : [];
      
      // Auto-cleanup duplicates on load (safety measure)
      if (flashcards.length > 0) {
        const uniqueFlashcards = flashcards.filter((flashcard: Flashcard, index: number, self: Flashcard[]) => 
          index === self.findIndex((f: Flashcard) => f.id === flashcard.id)
        );
        
        if (uniqueFlashcards.length !== flashcards.length) {
          console.warn(`🧹 Auto-cleanup: Removed ${flashcards.length - uniqueFlashcards.length} duplicate flashcards`);
          this.saveFlashcards(uniqueFlashcards);
          return uniqueFlashcards;
        }
      }
      
      // Ensure createdAt is a Date object for all flashcards
      const processedFlashcards = flashcards.map((flashcard: Flashcard) => ({
        ...flashcard,
        createdAt: flashcard.createdAt instanceof Date ? flashcard.createdAt : new Date(flashcard.createdAt)
      }));
      
      return processedFlashcards;
    } catch (error) {
      console.error("🔴 Error getting flashcards from localStorage:", error);
      return [];
    }
  }

  static saveFlashcards(flashcards: Flashcard[]): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(this.FLASHCARDS_KEY, JSON.stringify(flashcards));
      console.log("💾 Flashcards saved to localStorage:", flashcards.length);
    } catch (error) {
      console.error("🔴 Error saving flashcards to localStorage:", error);
    }
  }

  static addFlashcard(flashcard: Omit<Flashcard, "id">): Flashcard {
    const newFlashcard: Flashcard = {
      ...flashcard,
      id: `flashcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const flashcards = this.getFlashcards();
    
    // Prevent duplicate IDs (safety check)
    const existingFlashcard = flashcards.find(f => f.id === newFlashcard.id);
    if (existingFlashcard) {
      console.warn("⚠️ Duplicate ID detected, generating new ID:", newFlashcard.id);
      newFlashcard.id = `flashcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    flashcards.push(newFlashcard);
    this.saveFlashcards(flashcards);

    console.log("✅ Flashcard added to localStorage:", newFlashcard.id);
    return newFlashcard;
  }

  static updateFlashcard(id: string, updates: Partial<Flashcard>): boolean {
    try {
      const flashcards = this.getFlashcards();
      const index = flashcards.findIndex((f) => f.id === id);
      
      if (index === -1) {
        console.error("🔴 Flashcard not found for update:", id);
        return false;
      }

      const existingFlashcard = flashcards[index];
      if (existingFlashcard) {
        flashcards[index] = {
          ...existingFlashcard,
          ...updates,
        };
        this.saveFlashcards(flashcards);
        console.log("✅ Flashcard updated in localStorage:", id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("🔴 Error updating flashcard:", error);
      return false;
    }
  }

  static deleteFlashcard(id: string): boolean {
    try {
      const flashcards = this.getFlashcards();
      const initialLength = flashcards.length;
      const filtered = flashcards.filter((f) => f.id !== id);
      
      if (filtered.length === initialLength) {
        console.error("🔴 Flashcard not found for deletion:", id);
        return false;
      }

      this.saveFlashcards(filtered);
      console.log("✅ Flashcard deleted from localStorage:", id);
      return true;
    } catch (error) {
      console.error("🔴 Error deleting flashcard:", error);
      return false;
    }
  }

  static getFlashcardsBySubject(subject: string): Flashcard[] {
    const flashcards = this.getFlashcards();

    // Normalize subject names for better matching
    const normalizedRequestedSubject = subject.trim().toLowerCase();

    const filteredFlashcards = flashcards.filter((f) => {
      const normalizedFlashcardSubject = f.subject.trim().toLowerCase();
      const matches = normalizedFlashcardSubject === normalizedRequestedSubject;
      return matches;
    });

    // Ensure createdAt is a Date object for filtered flashcards
    const processedFlashcards = filteredFlashcards.map((flashcard: Flashcard) => ({
      ...flashcard,
      createdAt: flashcard.createdAt instanceof Date ? flashcard.createdAt : new Date(flashcard.createdAt)
    }));
    
    console.log(`🔍 Found ${processedFlashcards.length} flashcards for subject: ${subject}`);
    return processedFlashcards;
  }

  // 🆕 Update flashcard progress (for spaced repetition system)
  static updateFlashcardProgress(id: string, progress: {
    confidence?: number;
    reviewCount?: number;
    lastReviewed?: Date;
    nextReview?: Date;
  }): boolean {
    try {
      const flashcards = this.getFlashcards();
      const index = flashcards.findIndex((f) => f.id === id);
      
      if (index === -1) {
        console.error("🔴 Flashcard not found for progress update:", id);
        return false;
      }

      const existingFlashcard = flashcards[index];
      if (existingFlashcard) {
        flashcards[index] = {
          ...existingFlashcard,
          ...progress,
        };
        this.saveFlashcards(flashcards);
        console.log("✅ Flashcard progress updated:", id, progress);
        return true;
      }
      return false;
    } catch (error) {
      console.error("🔴 Error updating flashcard progress:", error);
      return false;
    }
  }

  // Clean up old storage keys (migration helper)
  static cleanupOldStorage(): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      // Remove old storage keys
      const oldKeys = [
        "exam_training_questions",
        "akilhane_questions_v2", 
        "exam_training_subjects"
      ];
      
      oldKeys.forEach(key => {
        const existed = localStorage.getItem(key) !== null;
        if (existed) {
          localStorage.removeItem(key);
          console.log(`🧹 Cleaned up old storage key: ${key}`);
        }
      });
    } catch (error) {
      console.error("🔴 Error during cleanup:", error);
    }
  }

  // Get storage info for debugging
  static getStorageInfo(): { questions: number; subjects: number; flashcards: number; totalSize: number } {
    if (typeof window === "undefined") {
      return { questions: 0, subjects: 0, flashcards: 0, totalSize: 0 };
    }
    try {
      const questions = this.getQuestions();
      const subjects = this.getSubjects();
      const flashcards = this.getFlashcards();
      const totalSize = new Blob([JSON.stringify(questions), JSON.stringify(subjects), JSON.stringify(flashcards)]).size;

      return {
        questions: questions.length,
        subjects: subjects.length,
        flashcards: flashcards.length,
        totalSize,
      };
    } catch (error) {
      console.error("🔴 Error getting storage info:", error);
      return { questions: 0, subjects: 0, flashcards: 0, totalSize: 0 };
    }
  }

  // Clean up duplicate questions by ID
  static cleanupDuplicateQuestions(): { removed: number; total: number } {
    if (typeof window === "undefined") {
      return { removed: 0, total: 0 };
    }
    
    try {
      const questions = this.getQuestions();
      const total = questions.length;
      
      // Remove duplicates by ID (keep the first occurrence)
      const uniqueQuestions = questions.filter((question, index, self) => 
        index === self.findIndex(q => q.id === question.id)
      );
      
      const removed = total - uniqueQuestions.length;
      
      if (removed > 0) {
        console.log(`🧹 Cleaned up ${removed} duplicate questions`);
        this.saveQuestions(uniqueQuestions);
      }
      
      return { removed, total: uniqueQuestions.length };
    } catch (error) {
      console.error("🔴 Error cleaning duplicates:", error);
      return { removed: 0, total: 0 };
    }
  }

  // Validate question data integrity
  static validateQuestions(): { valid: number; invalid: number; errors: string[] } {
    if (typeof window === "undefined") {
      return { valid: 0, invalid: 0, errors: [] };
    }
    
    try {
      const questions = this.getQuestions();
      const errors: string[] = [];
      let valid = 0;
      let invalid = 0;
      
      questions.forEach((question, index) => {
        if (!question.id || !question.subject || !question.text || !question.explanation) {
          invalid++;
          errors.push(`Question at index ${index}: Missing required fields`);
        } else if (!Array.isArray(question.options) || question.options.length === 0) {
          invalid++;
          errors.push(`Question at index ${index}: Invalid options array`);
        } else {
          valid++;
        }
      });
      
      return { valid, invalid, errors };
    } catch (error) {
      console.error("🔴 Error validating questions:", error);
      return { valid: 0, invalid: 0, errors: [] };
    }
  }

  // 🆕 Debug helper - find questions by partial ID
  static findQuestionsByPartialId(partialId: string): Question[] {
    const questions = this.getQuestions();
    return questions.filter(q => q.id.includes(partialId));
  }

  // 🆕 Debug helper - list all question IDs
  static getAllQuestionIds(): string[] {
    const questions = this.getQuestions();
    return questions.map(q => q.id);
  }
}