"use client";

import type { Question, QuestionType } from "@/lib/types";
import { logError } from "@/lib/error-logger";

// Enhanced Question interface for localStorage
export interface LocalStorageQuestion extends Omit<Question, 'id'> {
  id: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  createdBy?: string;
  version: number; // For data migration
}

// Service configuration
const STORAGE_CONFIG = {
  QUESTIONS_KEY: "akilhane_questions_v2",
  SUBJECTS_KEY: "akilhane_subjects_v2",
  MIGRATION_KEY: "akilhane_migration_status",
  MAX_QUESTIONS_PER_SUBJECT: 1000,
  MAX_STORAGE_SIZE: 4.5 * 1024 * 1024, // 4.5MB limit
} as const;

// Error types
export class LocalStorageError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "LocalStorageError";
  }
}

// Migration utilities
class DataMigrationService {
  private static readonly MIGRATION_VERSION = 2;

  static async migrateIfNeeded(): Promise<void> {
    try {
      const currentVersion = this.getCurrentVersion();
      if (currentVersion < this.MIGRATION_VERSION) {
        await this.performMigration(currentVersion);
        this.setMigrationVersion(this.MIGRATION_VERSION);
      }
    } catch (error) {
      logError("Migration failed:", error);
    }
  }

  private static getCurrentVersion(): number {
    if (typeof window === "undefined") {return 0;}
    try {
      const stored = localStorage.getItem(STORAGE_CONFIG.MIGRATION_KEY);
      return stored ? JSON.parse(stored).version : 0;
    } catch {
      return 0;
    }
  }

  private static setMigrationVersion(version: number): void {
    if (typeof window === "undefined") {return;}
    try {
      localStorage.setItem(STORAGE_CONFIG.MIGRATION_KEY, JSON.stringify({
        version,
        migratedAt: new Date().toISOString(),
      }));
    } catch {
      // Silent fail
    }
  }

  private static async performMigration(fromVersion: number): Promise<void> {
    // Migrate from v1 to v2
    if (fromVersion === 1) {
      await this.migrateV1ToV2();
    }
  }

  private static async migrateV1ToV2(): Promise<void> {
    try {
      // Check for old storage keys
      const oldKeys = ["exam_training_questions", "exam_training_subjects"];

      for (const oldKey of oldKeys) {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          // Parse and migrate old data
          const parsed = JSON.parse(oldData);
          if (Array.isArray(parsed)) {
            // Migrate questions
            if (oldKey === "exam_training_questions") {
              const migratedQuestions = parsed.map((q: Record<string, unknown>) => this.migrateQuestionV1ToV2(q));
              localStorage.setItem(STORAGE_CONFIG.QUESTIONS_KEY, JSON.stringify(migratedQuestions));
            }
            // Migrate subjects
            else if (oldKey === "exam_training_subjects") {
              const migratedSubjects = parsed.map((s: Record<string, unknown>) => this.migrateSubjectV1ToV2(s));
              localStorage.setItem(STORAGE_CONFIG.SUBJECTS_KEY, JSON.stringify(migratedSubjects));
            }
          }
          // Remove old data
          localStorage.removeItem(oldKey);
        }
      }
    } catch (error) {
      logError("V1 to V2 migration failed:", error);
    }
  }

  private static migrateQuestionV1ToV2(oldQuestion: Record<string, unknown>): LocalStorageQuestion {
    return {
      id: (oldQuestion.id as string) || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subject: (oldQuestion.subject as string) || "",
      type: ((oldQuestion.type as string) || "multiple-choice") as "multiple-choice" | "true-false" | "calculation" | "case-study",
      difficulty: ((oldQuestion.difficulty as string) || "Medium") as "Easy" | "Medium" | "Hard",
      text: (oldQuestion.text as string) || "",
      options: Array.isArray(oldQuestion.options) ? oldQuestion.options : [],
      explanation: (oldQuestion.explanation as string) || "",
      formula: (oldQuestion.formula as string) || "",
      topic: (oldQuestion.topic as string) || "",
      createdAt: (oldQuestion.createdAt as string) || new Date().toISOString(),
      updatedAt: (oldQuestion.updatedAt as string) || new Date().toISOString(),
      isActive: oldQuestion.isActive !== false,
      createdBy: (oldQuestion.createdBy as string) || "legacy",
      version: 2,
    };
  }

  private static migrateSubjectV1ToV2(oldSubject: Record<string, unknown>): Record<string, unknown> {
    return {
      ...oldSubject,
      version: 2,
      updatedAt: new Date().toISOString(),
    };
  }
}

// Storage utilities
class StorageUtils {
  static isClient(): boolean {
    return typeof window !== "undefined";
  }

  static getStorageSize(): number {
    if (!this.isClient()) {return 0;}
    let size = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return size;
  }

  static isStorageFull(): boolean {
    return this.getStorageSize() > STORAGE_CONFIG.MAX_STORAGE_SIZE;
  }

  static cleanupStorage(): void {
    if (!this.isClient()) {return;}
    try {
      // Remove old migration data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith("akilhane_") &&
            key !== STORAGE_CONFIG.QUESTIONS_KEY &&
            key !== STORAGE_CONFIG.SUBJECTS_KEY) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Silent fail
    }
  }
}

// Main Question LocalStorage Service
export class QuestionLocalStorageService {
  private static instance: QuestionLocalStorageService;
  private questionsCache: Map<string, LocalStorageQuestion[]> = new Map();
  private lastSync: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): QuestionLocalStorageService {
    if (!QuestionLocalStorageService.instance) {
      QuestionLocalStorageService.instance = new QuestionLocalStorageService();
    }
    return QuestionLocalStorageService.instance;
  }

  private constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await DataMigrationService.migrateIfNeeded();
      this.loadQuestionsFromStorage();
    } catch (error) {
      logError("QuestionLocalStorageService initialization failed:", error);
    }
  }

  // CRUD Operations
  async createQuestion(questionData: Omit<LocalStorageQuestion, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<LocalStorageQuestion> {
    try {
      this.validateQuestionData(questionData);

      const newQuestion: LocalStorageQuestion = {
        ...questionData,
        id: this.generateId('q'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 2,
      };

      const questions = await this.getAllQuestions();

      // Check storage limits
      const subjectQuestions = await this.getQuestionsBySubject(questionData.subject);
      if (subjectQuestions.length >= STORAGE_CONFIG.MAX_QUESTIONS_PER_SUBJECT) {
        throw new LocalStorageError(
          `Maximum questions limit (${STORAGE_CONFIG.MAX_QUESTIONS_PER_SUBJECT}) reached for subject: ${questionData.subject}`,
          "STORAGE_LIMIT_EXCEEDED",
        );
      }

      questions.push(newQuestion);
      await this.saveQuestionsToStorage(questions);

      // Update cache
      this.updateCache(questionData.subject, questions);

      return newQuestion;
    } catch (error) {
      if (error instanceof LocalStorageError) {
        throw error;
      }
      throw new LocalStorageError(
        `Failed to create question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "CREATE_FAILED",
      );
    }
  }

  async getQuestionById(id: string): Promise<LocalStorageQuestion | null> {
    try {
      const questions = await this.getAllQuestions();
      return questions.find(q => q.id === id) || null;
    } catch {
      return null;
    }
  }

  async getQuestionsBySubject(subject: string): Promise<LocalStorageQuestion[]> {
    try {
      // Check cache first
      if (this.isCacheValid(subject)) {
        return this.questionsCache.get(subject) || [];
      }

      const questions = await this.getAllQuestions();
      const subjectQuestions = questions.filter(q => q.subject === subject && q.isActive);

      // Update cache
      this.updateCache(subject, subjectQuestions);

      return subjectQuestions;
    } catch {
      return [];
    }
  }

  async getAllQuestions(): Promise<LocalStorageQuestion[]> {
    try {
      if (this.isCacheValid('all')) {
        return this.questionsCache.get('all') || [];
      }

      const questions = this.loadQuestionsFromStorage();
      this.updateCache('all', questions);

      return questions;
    } catch {
      return [];
    }
  }

  async updateQuestion(id: string, updates: Partial<Omit<LocalStorageQuestion, 'id' | 'createdAt' | 'version'>>): Promise<LocalStorageQuestion | null> {
    try {
      const questions = await this.getAllQuestions();
      const questionIndex = questions.findIndex(q => q.id === id);

      if (questionIndex === -1) {
        throw new LocalStorageError(`Question with id ${id} not found`, "QUESTION_NOT_FOUND");
      }

      const existingQuestion = questions[questionIndex];
      if (!existingQuestion) {
        throw new LocalStorageError(`Question with id ${id} not found`, "QUESTION_NOT_FOUND");
      }

      // Validate updates if subject is being changed
      if (updates.subject && updates.subject !== existingQuestion.subject) {
        const newSubjectQuestions = await this.getQuestionsBySubject(updates.subject);
        if (newSubjectQuestions.length >= STORAGE_CONFIG.MAX_QUESTIONS_PER_SUBJECT) {
          throw new LocalStorageError(
            `Maximum questions limit (${STORAGE_CONFIG.MAX_QUESTIONS_PER_SUBJECT}) reached for subject: ${updates.subject}`,
            "STORAGE_LIMIT_EXCEEDED",
          );
        }
      }

      const updatedQuestion: LocalStorageQuestion = {
        ...existingQuestion,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      questions[questionIndex] = updatedQuestion;
      await this.saveQuestionsToStorage(questions);

      // Update cache for both old and new subjects
      this.updateCache(existingQuestion.subject, questions);
      if (updates.subject && updates.subject !== existingQuestion.subject) {
        this.updateCache(updates.subject, questions);
      }

      return updatedQuestion;
    } catch (error) {
      if (error instanceof LocalStorageError) {
        throw error;
      }
      throw new LocalStorageError(
        `Failed to update question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "UPDATE_FAILED",
      );
    }
  }

  async deleteQuestion(id: string): Promise<boolean> {
    try {
      const questions = await this.getAllQuestions();
      const questionToDelete = questions.find(q => q.id === id);

      if (!questionToDelete) {
        return false;
      }

      const filteredQuestions = questions.filter(q => q.id !== id);
      await this.saveQuestionsToStorage(filteredQuestions);

      // Update cache
      this.updateCache(questionToDelete.subject, filteredQuestions);
      this.updateCache('all', filteredQuestions);

      return true;
    } catch {
      return false;
    }
  }

  async softDeleteQuestion(id: string): Promise<boolean> {
    try {
      const result = await this.updateQuestion(id, { isActive: false });
      return result !== null;
    } catch {
      return false;
    }
  }

  // Search and Filter Operations
  async searchQuestions(query: string, subject?: string): Promise<LocalStorageQuestion[]> {
    try {
      const questions = subject
        ? await this.getQuestionsBySubject(subject)
        : await this.getAllQuestions();

      const searchTerm = query.toLowerCase();
      return questions.filter(q =>
        q.text.toLowerCase().includes(searchTerm) ||
        (q.topic?.toLowerCase().includes(searchTerm)) ||
        q.explanation.toLowerCase().includes(searchTerm) ||
        q.options.some(opt => opt.text.toLowerCase().includes(searchTerm)),
      );
    } catch {
      return [];
    }
  }

  async getQuestionsByDifficulty(difficulty: string, subject?: string): Promise<LocalStorageQuestion[]> {
    try {
      const questions = subject
        ? await this.getQuestionsBySubject(subject)
        : await this.getAllQuestions();

      return questions.filter(q => q.difficulty === difficulty);
    } catch {
      return [];
    }
  }

  async getQuestionsByType(type: QuestionType, subject?: string): Promise<LocalStorageQuestion[]> {
    try {
      const questions = subject
        ? await this.getQuestionsBySubject(subject)
        : await this.getAllQuestions();

      return questions.filter(q => q.type === type);
    } catch {
      return [];
    }
  }

  // Bulk Operations
  async bulkCreateQuestions(questionsData: Omit<LocalStorageQuestion, 'id' | 'createdAt' | 'updatedAt' | 'version'>[]): Promise<LocalStorageQuestion[]> {
    try {
      const createdQuestions: LocalStorageQuestion[] = [];

      for (const questionData of questionsData) {
        try {
          const question = await this.createQuestion(questionData);
          createdQuestions.push(question);
        } catch (error) {
          logError(`Failed to create question: ${questionData.text}`, error);
        }
      }

      return createdQuestions;
    } catch (error) {
      throw new LocalStorageError(
        `Bulk create failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "BULK_CREATE_FAILED",
      );
    }
  }

  async bulkDeleteQuestions(ids: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await this.deleteQuestion(id);
        if (result) {
          success++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return { success, failed };
  }

  // Data Management
  async exportQuestions(subject?: string): Promise<LocalStorageQuestion[]> {
    try {
      return subject
        ? await this.getQuestionsBySubject(subject)
        : await this.getAllQuestions();
    } catch {
      return [];
    }
  }

  async importQuestions(questions: LocalStorageQuestion[], mergeStrategy: 'replace' | 'merge' = 'merge'): Promise<{ success: number; failed: number }> {
    try {
      let success = 0;
      let failed = 0;

      if (mergeStrategy === 'replace') {
        // Clear existing questions
        await this.saveQuestionsToStorage([]);
        this.clearCache();
      }

      for (const question of questions) {
        try {
          // Remove id, createdAt, updatedAt to create new question
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, createdAt, updatedAt, version, ...questionData } = question;
          await this.createQuestion(questionData);
          success++;
        } catch {
          failed++;
        }
      }

      return { success, failed };
    } catch (error) {
      throw new LocalStorageError(
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "IMPORT_FAILED",
      );
    }
  }

  async clearAllQuestions(): Promise<void> {
    try {
      await this.saveQuestionsToStorage([]);
      this.clearCache();
    } catch (error) {
      throw new LocalStorageError(
        `Clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "CLEAR_FAILED",
      );
    }
  }

  // Statistics
  async getQuestionStats(): Promise<{
    total: number;
    bySubject: Record<string, number>;
    byDifficulty: Record<string, number>;
    byType: Record<string, number>;
    storageSize: number;
  }> {
    try {
      const questions = await this.getAllQuestions();
      const activeQuestions = questions.filter(q => q.isActive);

      const bySubject: Record<string, number> = {};
      const byDifficulty: Record<string, number> = {};
      const byType: Record<string, number> = {};

      activeQuestions.forEach(q => {
        bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
        byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
        byType[q.type] = (byType[q.type] || 0) + 1;
      });

      return {
        total: activeQuestions.length,
        bySubject,
        byDifficulty,
        byType,
        storageSize: StorageUtils.getStorageSize(),
      };
    } catch {
      return {
        total: 0,
        bySubject: {},
        byDifficulty: {},
        byType: {},
        storageSize: 0,
      };
    }
  }

  // Private helper methods
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateQuestionData(data: {
    text: string;
    subject: string;
    explanation: string;
    type: string;
    options?: Array<{ isCorrect: boolean }>;
  }): void {
    if (!data.text || data.text.trim().length === 0) {
      throw new LocalStorageError("Question text is required", "VALIDATION_ERROR");
    }
    if (!data.subject || data.subject.trim().length === 0) {
      throw new LocalStorageError("Subject is required", "VALIDATION_ERROR");
    }
    if (!data.explanation || data.explanation.trim().length === 0) {
      throw new LocalStorageError("Explanation is required", "VALIDATION_ERROR");
    }
    if (data.type === "multiple-choice" && (!Array.isArray(data.options) || data.options.length < 2)) {
      throw new LocalStorageError("Multiple choice questions must have at least 2 options", "VALIDATION_ERROR");
    }
    if (data.type === "multiple-choice") {
      const correctOptions = data.options?.filter((opt) => opt.isCorrect) || [];
      if (correctOptions.length !== 1) {
        throw new LocalStorageError("Multiple choice questions must have exactly 1 correct answer", "VALIDATION_ERROR");
      }
    }
  }

  private loadQuestionsFromStorage(): LocalStorageQuestion[] {
    if (!StorageUtils.isClient()) {return [];}

    try {
      const stored = localStorage.getItem(STORAGE_CONFIG.QUESTIONS_KEY);
      if (!stored) {return [];}

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async saveQuestionsToStorage(questions: LocalStorageQuestion[]): Promise<void> {
    if (!StorageUtils.isClient()) {return;}

    try {
      // Check storage size before saving
      if (StorageUtils.isStorageFull()) {
        StorageUtils.cleanupStorage();
      }

      localStorage.setItem(STORAGE_CONFIG.QUESTIONS_KEY, JSON.stringify(questions));
    } catch (error) {
      throw new LocalStorageError(
        `Failed to save to storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "STORAGE_SAVE_FAILED",
      );
    }
  }

  private updateCache(key: string, questions: LocalStorageQuestion[]): void {
    this.questionsCache.set(key, questions);
    this.lastSync = Date.now();
  }

  private isCacheValid(key: string): boolean {
    const cached = this.questionsCache.get(key);
    return cached !== undefined && (Date.now() - this.lastSync) < this.CACHE_TTL;
  }

  private clearCache(): void {
    this.questionsCache.clear();
    this.lastSync = 0;
  }
}

// Export singleton instance
export const questionLocalStorageService = QuestionLocalStorageService.getInstance();
export default questionLocalStorageService;
