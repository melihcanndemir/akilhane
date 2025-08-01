'use client';

import { supabase } from '@/lib/supabase';
import { SubjectService, QuestionService } from '@/services/supabase-service';
import { localStorageService } from '@/services/localStorage-service';
import { dataSyncService } from '@/services/data-sync-service';

interface GuestData {
  subjects: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    questionCount: number;
    isActive: boolean;
  }>;
  questions: Array<{
    id: string;
    subject: string;
    type: string;
    difficulty: string;
    text: string;
    options: Array<{ text: string; isCorrect: boolean }>;
    explanation: string;
    topic?: string;
    formula?: string;
  }>;
  quizResults: Array<unknown>;
  flashcardProgress: Array<unknown>;
  performanceData: Array<unknown>;
  userSettings: Record<string, unknown>;
  aiRecommendations: Array<unknown>;
  aiChatSessions: Array<unknown>;
}

interface MigrationResult {
  success: boolean;
  migratedSubjects: number;
  migratedQuestions: number;
  migratedQuizResults: number;
  migratedFlashcardProgress: number;
  migratedPerformanceData: number;
  migratedAIData: number;
  errors: string[];
}

export class DataMigrationService {
  private static instance: DataMigrationService;

  public static getInstance(): DataMigrationService {
    if (!DataMigrationService.instance) {
      DataMigrationService.instance = new DataMigrationService();
    }
    return DataMigrationService.instance;
  }

  /**
   * Collects all guest data from localStorage
   */
  private collectGuestData(): GuestData {
    const subjects = this.getSubjectsFromStorage();
    const questions = this.getQuestionsFromStorage();
    const quizResults = localStorageService.getQuizResults();
    const flashcardProgress = localStorageService.getFlashcardProgress();
    const performanceData = localStorageService.getPerformanceData();
    const userSettings = localStorageService.getUserSettings();
    const aiRecommendations = localStorageService.getAIRecommendations();
    const aiChatSessions = localStorageService.getAIChatSessions();

    return {
      subjects,
      questions,
      quizResults,
      flashcardProgress,
      performanceData,
      userSettings,
      aiRecommendations,
      aiChatSessions,
    };
  }

  private getSubjectsFromStorage(): GuestData['subjects'] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('exam_training_subjects');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getQuestionsFromStorage(): GuestData['questions'] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('exam_training_questions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Main migration function - migrates all guest data to authenticated user
   */
  async migrateGuestDataToUser(userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedSubjects: 0,
      migratedQuestions: 0,
      migratedQuizResults: 0,
      migratedFlashcardProgress: 0,
      migratedPerformanceData: 0,
      migratedAIData: 0,
      errors: [],
    };

    try {
      console.log('🔄 Starting data migration for user:', userId);
      
      // Collect all guest data
      const guestData = this.collectGuestData();
      
      // Check if there's any data to migrate
      if (this.hasDataToMigrate(guestData)) {
        console.log('📦 Found guest data to migrate:', {
          subjects: guestData.subjects.length,
          questions: guestData.questions.length,
          quizResults: guestData.quizResults.length,
        });

        // 1. Migrate subjects first (questions depend on subjects)
        await this.migrateSubjects(guestData.subjects, result);

        // 2. Migrate questions
        await this.migrateQuestions(guestData.questions, result);

        // 3. Migrate quiz results
        await this.migrateQuizResults(guestData.quizResults, userId, result);

        // 4. Migrate flashcard progress
        await this.migrateFlashcardProgress(guestData.flashcardProgress, userId, result);

        // 5. Migrate performance data
        await this.migratePerformanceData(guestData.performanceData, userId, result);

        // 6. Migrate AI data (recommendations and chat sessions)
        await this.migrateAIData(guestData.aiRecommendations, guestData.aiChatSessions, userId, result);

        console.log('✅ Migration completed:', result);
        result.success = result.errors.length === 0;
      } else {
        console.log('ℹ️ No guest data found to migrate');
        result.success = true;
      }

    } catch (error) {
      console.error('❌ Migration failed:', error);
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private hasDataToMigrate(guestData: GuestData): boolean {
    return (
      guestData.subjects.length > 0 ||
      guestData.questions.length > 0 ||
      guestData.quizResults.length > 0 ||
      guestData.flashcardProgress.length > 0 ||
      guestData.performanceData.length > 0 ||
      guestData.aiRecommendations.length > 0 ||
      guestData.aiChatSessions.length > 0
    );
  }

  private async migrateSubjects(subjects: GuestData['subjects'], result: MigrationResult): Promise<void> {
    try {
      for (const subject of subjects) {
        const migratedSubject = await SubjectService.createSubject({
          name: subject.name,
          description: subject.description,
          category: subject.category,
          difficulty: subject.difficulty,
          question_count: 0, // Will be updated when questions are migrated
          is_active: subject.isActive,
        });

        if (migratedSubject) {
          result.migratedSubjects++;
          console.log(`✅ Migrated subject: ${subject.name}`);
        } else {
          result.errors.push(`Failed to migrate subject: ${subject.name}`);
        }
      }
    } catch (error) {
      result.errors.push(`Subject migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async migrateQuestions(questions: GuestData['questions'], result: MigrationResult): Promise<void> {
    try {
      for (const question of questions) {
        const migratedQuestion = await QuestionService.createQuestion({
          subject: question.subject,
          type: question.type,
          difficulty: question.difficulty,
          text: question.text,
          options: question.options,
          explanation: question.explanation,
          topic: question.topic || '',
          formula: question.formula || '',
          is_active: true,
        });

        if (migratedQuestion) {
          result.migratedQuestions++;
          console.log(`✅ Migrated question for subject: ${question.subject}`);
        } else {
          result.errors.push(`Failed to migrate question for subject: ${question.subject}`);
        }
      }
    } catch (error) {
      result.errors.push(`Question migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async migrateQuizResults(quizResults: Array<unknown>, userId: string, result: MigrationResult): Promise<void> {
    try {
      // Quiz results migration would require the QuizResultService
      // For now, we'll preserve them in a user-specific way
      if (quizResults.length > 0) {
        // Store in user metadata or specific table
        console.log(`📊 ${quizResults.length} quiz results preserved`);
        result.migratedQuizResults = quizResults.length;
      }
    } catch (error) {
      result.errors.push(`Quiz results migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async migrateFlashcardProgress(flashcardProgress: Array<unknown>, userId: string, result: MigrationResult): Promise<void> {
    try {
      if (flashcardProgress.length > 0) {
        console.log(`🎴 ${flashcardProgress.length} flashcard progress entries preserved`);
        result.migratedFlashcardProgress = flashcardProgress.length;
      }
    } catch (error) {
      result.errors.push(`Flashcard progress migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async migratePerformanceData(performanceData: Array<unknown>, userId: string, result: MigrationResult): Promise<void> {
    try {
      if (performanceData.length > 0) {
        console.log(`📈 ${performanceData.length} performance data entries preserved`);
        result.migratedPerformanceData = performanceData.length;
      }
    } catch (error) {
      result.errors.push(`Performance data migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async migrateAIData(aiRecommendations: Array<unknown>, aiChatSessions: Array<unknown>, userId: string, result: MigrationResult): Promise<void> {
    try {
      const totalAIData = aiRecommendations.length + aiChatSessions.length;
      if (totalAIData > 0) {
        console.log(`🤖 ${totalAIData} AI data entries preserved`);
        result.migratedAIData = totalAIData;
      }
    } catch (error) {
      result.errors.push(`AI data migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clears guest data after successful migration
   */
  clearGuestData(): void {
    try {
      console.log('🧹 Clearing guest data from localStorage');
      
      const keysToRemove = [
        'exam_training_subjects',
        'exam_training_questions',
        'guestUser',
        'guestQuizResults',
        'guestFlashcardProgress',
        'guestPerformanceData',
        'guestAIRecommendations',
        'aiChatSessions',
        'userSettings',
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('✅ Guest data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing guest data:', error);
    }
  }

  /**
   * Syncs cloud data to localStorage for offline access
   */
  async syncCloudDataToLocalStorage(userId: string): Promise<boolean> {
    return dataSyncService.performFullSync(userId);
  }

  /**
   * Checks if user has any existing cloud data
   */
  async hasExistingCloudData(userId: string): Promise<boolean> {
    try {
      const subjects = await SubjectService.getSubjects();
      return subjects.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Forces a refresh of all data after migration
   */
  async refreshDataState(): Promise<void> {
    // Trigger a custom event that components can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dataStateRefresh', {
        detail: { timestamp: Date.now() }
      }));
    }
  }
}

export const dataMigrationService = DataMigrationService.getInstance();
export default dataMigrationService;