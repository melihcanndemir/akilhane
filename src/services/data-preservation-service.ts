'use client';

import { supabase } from '@/lib/supabase';
import { localStorageService } from './localStorage-service';

export interface DataPreservationResult {
  success: boolean;
  preserved: {
    subjects: number;
    questions: number;
    quizResults: number;
    performanceData: number;
    settings: boolean;
  };
  errors: string[];
  timestamp: string;
}

class DataPreservationService {
  private static instance: DataPreservationService;

  public static getInstance(): DataPreservationService {
    if (!DataPreservationService.instance) {
      DataPreservationService.instance = new DataPreservationService();
    }
    return DataPreservationService.instance;
  }

  // Create backup before any authentication changes
  public async createPreAuthBackup(): Promise<string> {
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const backup = {
        id: backupId,
        timestamp: new Date().toISOString(),
        subjects: JSON.parse(localStorage.getItem('exam_training_subjects') || '[]'),
        questions: JSON.parse(localStorage.getItem('exam_training_questions') || '[]'),
        quizResults: localStorageService.getQuizResults(),
        performanceData: localStorageService.getPerformanceData(),
        settings: localStorageService.getUserSettings(),
        flashcardProgress: localStorageService.getFlashcardProgress(),
        aiRecommendations: localStorageService.getAIRecommendations()
      };

      localStorage.setItem(`auth_backup_${backupId}`, JSON.stringify(backup));
      console.log('📦 Created pre-auth backup:', backupId);
      return backupId;
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
      throw error;
    }
  }

  // Restore from backup if needed
  public async restoreFromBackup(backupId: string): Promise<DataPreservationResult> {
    const result: DataPreservationResult = {
      success: false,
      preserved: { subjects: 0, questions: 0, quizResults: 0, performanceData: 0, settings: false },
      errors: [],
      timestamp: new Date().toISOString()
    };

    try {
      const backupData = localStorage.getItem(`auth_backup_${backupId}`);
      if (!backupData) {
        result.errors.push('Backup not found');
        return result;
      }

      const backup = JSON.parse(backupData);

      // Restore subjects
      if (backup.subjects && backup.subjects.length > 0) {
        localStorage.setItem('exam_training_subjects', JSON.stringify(backup.subjects));
        result.preserved.subjects = backup.subjects.length;
      }

      // Restore questions
      if (backup.questions && backup.questions.length > 0) {
        localStorage.setItem('exam_training_questions', JSON.stringify(backup.questions));
        result.preserved.questions = backup.questions.length;
      }

      // Restore other data
      if (backup.quizResults && backup.quizResults.length > 0) {
        localStorage.setItem('guestQuizResults', JSON.stringify(backup.quizResults));
        result.preserved.quizResults = backup.quizResults.length;
      }

      if (backup.performanceData && backup.performanceData.length > 0) {
        localStorage.setItem('guestPerformanceData', JSON.stringify(backup.performanceData));
        result.preserved.performanceData = backup.performanceData.length;
      }

      if (backup.settings) {
        localStorage.setItem('userSettings', JSON.stringify(backup.settings));
        result.preserved.settings = true;
      }

      result.success = true;
      console.log('✅ Restored from backup:', backupId, result);
      return result;

    } catch (error) {
      console.error('❌ Failed to restore backup:', error);
      result.errors.push(`Restore failed: ${error}`);
      return result;
    }
  }

  // Smart merge function that preserves all data
  public async smartMergeData(userId: string): Promise<DataPreservationResult> {
    const result: DataPreservationResult = {
      success: false,
      preserved: { subjects: 0, questions: 0, quizResults: 0, performanceData: 0, settings: false },
      errors: [],
      timestamp: new Date().toISOString()
    };

    try {
      console.log('🔄 Starting smart merge for user:', userId);

      // Get local data
      const localSubjects = JSON.parse(localStorage.getItem('exam_training_subjects') || '[]');
      const localQuestions = JSON.parse(localStorage.getItem('exam_training_questions') || '[]');

      // Get cloud data
      const { data: cloudSubjects } = await supabase
        .from('subjects')
        .select('*')
        .eq('created_by', userId);

      const { data: cloudQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('created_by', userId);

      // Merge subjects (cloud + unique local)
      const mergedSubjects = [...(cloudSubjects || [])];
      localSubjects.forEach((localSubject: any) => {
        if (!mergedSubjects.find((cs: any) => cs.name === localSubject.name)) {
          mergedSubjects.push({
            ...localSubject,
            created_by: userId,
            id: localSubject.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
        }
      });

      // Merge questions (cloud + unique local)
      const mergedQuestions = [...(cloudQuestions || [])];
      localQuestions.forEach((localQuestion: any) => {
        if (!mergedQuestions.find((cq: any) => cq.text === localQuestion.text && cq.subject === localQuestion.subject)) {
          mergedQuestions.push({
            ...localQuestion,
            created_by: userId,
            id: localQuestion.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
        }
      });

      // Update localStorage with merged data
      const formattedSubjects = mergedSubjects.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        difficulty: s.difficulty,
        questionCount: s.question_count || s.questionCount || 0,
        isActive: s.is_active ?? s.isActive ?? true
      }));

      const formattedQuestions = mergedQuestions.map((q: any) => ({
        id: q.id,
        subject: q.subject,
        type: q.type,
        difficulty: q.difficulty,
        text: q.text,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        explanation: q.explanation,
        topic: q.topic,
        formula: q.formula || ''
      }));

      localStorage.setItem('exam_training_subjects', JSON.stringify(formattedSubjects));
      localStorage.setItem('exam_training_questions', JSON.stringify(formattedQuestions));

      result.preserved.subjects = formattedSubjects.length;
      result.preserved.questions = formattedQuestions.length;
      result.success = true;

      console.log('✅ Smart merge completed:', result);
      return result;

    } catch (error) {
      console.error('❌ Smart merge failed:', error);
      result.errors.push(`Smart merge failed: ${error}`);
      return result;
    }
  }

  // Ensure UI reflects current data state
  public triggerUIRefresh(): void {
    try {
      // Dispatch custom events to trigger component re-renders
      const events = [
        new CustomEvent('data-preservation-refresh', { detail: { timestamp: Date.now() } }),
        new CustomEvent('localStorage-update', { detail: { timestamp: Date.now() } }),
        new CustomEvent('subjects-updated', { detail: { timestamp: Date.now() } }),
        new CustomEvent('questions-updated', { detail: { timestamp: Date.now() } })
      ];

      events.forEach(event => {
        window.dispatchEvent(event);
      });

      console.log('📡 Triggered UI refresh events');
    } catch (error) {
      console.error('❌ Failed to trigger UI refresh:', error);
    }
  }

  // Clean up old backups
  public cleanupOldBackups(): void {
    try {
      const keysToRemove: string[] = [];
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('auth_backup_')) {
          try {
            const backupData = localStorage.getItem(key);
            if (backupData) {
              const backup = JSON.parse(backupData);
              const backupAge = Date.now() - new Date(backup.timestamp).getTime();
              
              if (backupAge > maxAge) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            // Invalid backup, mark for removal
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      if (keysToRemove.length > 0) {
        console.log(`🧹 Cleaned up ${keysToRemove.length} old backups`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup backups:', error);
    }
  }

  // Enhanced migration with fallback protection
  public async enhancedMigration(userId: string): Promise<DataPreservationResult> {
    console.log('🚀 Starting enhanced migration for user:', userId);
    
    // Create backup first
    const backupId = await this.createPreAuthBackup();
    
    try {
      // Perform smart merge
      const mergeResult = await this.smartMergeData(userId);
      
      if (mergeResult.success) {
        // Trigger UI refresh
        this.triggerUIRefresh();
        
        // Clean up old backups
        this.cleanupOldBackups();
        
        console.log('✅ Enhanced migration completed successfully');
        return mergeResult;
      } else {
        // If merge failed, restore from backup
        console.log('⚠️ Migration failed, restoring from backup');
        const restoreResult = await this.restoreFromBackup(backupId);
        this.triggerUIRefresh();
        return restoreResult;
      }
    } catch (error) {
      console.error('❌ Enhanced migration failed, attempting restore');
      const restoreResult = await this.restoreFromBackup(backupId);
      this.triggerUIRefresh();
      return restoreResult;
    }
  }
}

export const dataPreservationService = DataPreservationService.getInstance();
export default dataPreservationService;