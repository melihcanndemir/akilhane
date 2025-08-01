'use client';

import { SubjectService, QuestionService } from '@/services/supabase-service';

interface SyncStatus {
  lastSyncTimestamp: string;
  pendingChanges: number;
  cloudDataCount: number;
  localDataCount: number;
}

export class DataSyncService {
  private static instance: DataSyncService;
  private syncInProgress = false;

  public static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  /**
   * Performs a full bidirectional sync between cloud and localStorage
   */
  async performFullSync(userId: string): Promise<boolean> {
    if (this.syncInProgress) {
      console.log('⏳ Sync already in progress, skipping');
      return false;
    }

    try {
      this.syncInProgress = true;
      console.log('🔄 Starting full data synchronization for user:', userId);

      // 1. Sync subjects from cloud to localStorage
      await this.syncSubjectsFromCloud();

      // 2. Sync questions from cloud to localStorage
      await this.syncQuestionsFromCloud();

      // 3. Update last sync timestamp
      this.updateLastSyncTimestamp();

      console.log('✅ Full synchronization completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Sync failed:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Syncs subjects from cloud to localStorage
   */
  private async syncSubjectsFromCloud(): Promise<void> {
    try {
      console.log('📚 Syncing subjects from cloud');

      const cloudSubjects = await SubjectService.getSubjects();
      console.log(`🔍 Found ${cloudSubjects.length} subjects in cloud`);

      if (cloudSubjects.length > 0) {
        const mappedSubjects = cloudSubjects.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          difficulty: s.difficulty,
          questionCount: s.question_count,
          isActive: s.is_active,
        }));

        localStorage.setItem('exam_training_subjects', JSON.stringify(mappedSubjects));
        console.log(`✅ Synced ${mappedSubjects.length} subjects to localStorage`);
      } else {
        console.log('ℹ️ No subjects found in cloud to sync');
        // Clear local subjects if no cloud data exists
        localStorage.setItem('exam_training_subjects', JSON.stringify([]));
      }
    } catch (error) {
      console.error('❌ Error syncing subjects:', error);
      throw error; // Re-throw to be caught by the calling function
    }
  }

  /**
   * Syncs questions from cloud to localStorage
   */
  private async syncQuestionsFromCloud(): Promise<void> {
    try {
      console.log('❓ Syncing questions from cloud');

      // Get all subjects first
      const cloudSubjects = await SubjectService.getSubjects();
      const allQuestions = [];

      // Fetch questions for each subject
      for (const subject of cloudSubjects) {
        console.log(`🔍 Fetching questions for subject: ${subject.name}`);
        const questions = await QuestionService.getQuestionsBySubject(subject.name);
        console.log(`📋 Found ${questions.length} questions for ${subject.name}`);
        allQuestions.push(...questions);
      }

      console.log(`📊 Total questions found: ${allQuestions.length}`);

      if (allQuestions.length > 0) {
        localStorage.setItem('exam_training_questions', JSON.stringify(allQuestions));
        console.log(`✅ Synced ${allQuestions.length} questions to localStorage`);
      } else {
        console.log('ℹ️ No questions found in cloud to sync');
        // Clear local questions if no cloud data exists
        localStorage.setItem('exam_training_questions', JSON.stringify([]));
      }
    } catch (error) {
      console.error('❌ Error syncing questions:', error);
      throw error; // Re-throw to be caught by the calling function
    }
  }

  /**
   * Gets the current sync status
   */
  getSyncStatus(): SyncStatus {
    const lastSync = localStorage.getItem('lastSyncTimestamp') || '';

    // Count local data
    const localSubjects = this.getLocalSubjects();
    const localQuestions = this.getLocalQuestions();
    const localDataCount = localSubjects.length + localQuestions.length;

    return {
      lastSyncTimestamp: lastSync,
      pendingChanges: 0, // TODO: Implement change tracking
      cloudDataCount: 0, // TODO: Get from API
      localDataCount,
    };
  }

  /**
   * Checks if sync is needed based on timestamp
   */
  isSyncNeeded(maxAgeMinutes = 30): boolean {
    const lastSync = localStorage.getItem('lastSyncTimestamp');

    if (!lastSync) {
      return true;
    }

    const lastSyncTime = new Date(lastSync);
    const now = new Date();
    const ageMinutes = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60);

    return ageMinutes > maxAgeMinutes;
  }

  /**
   * Forces a sync regardless of timestamp
   */
  async forceSync(userId: string): Promise<boolean> {
    // eslint-disable-next-line no-console
    console.log('🔄 Force sync requested');
    return this.performFullSync(userId);
  }

  /**
   * Syncs on app startup if needed
   */
  async syncOnStartup(userId: string): Promise<boolean> {
    if (this.isSyncNeeded()) {
      // eslint-disable-next-line no-console
      console.log('🚀 Startup sync needed');
      return this.performFullSync(userId);
    }

    // eslint-disable-next-line no-console
    console.log('ℹ️ Startup sync not needed');
    return true;
  }

  /**
   * Syncs specific subject data
   */
  async syncSubject(subjectName: string): Promise<boolean> {
    try {
      // eslint-disable-next-line no-console
      console.log(`🔄 Syncing specific subject: ${subjectName}`);

      // Get questions for this subject from cloud
      const questions = await QuestionService.getQuestionsBySubject(subjectName);

      // Update localStorage with new questions
      const allLocalQuestions = this.getLocalQuestions();
      const filteredQuestions = allLocalQuestions.filter((q: any) => q.subject !== subjectName);
      const updatedQuestions = [...filteredQuestions, ...questions];
      localStorage.setItem('exam_training_questions', JSON.stringify(updatedQuestions));

      // eslint-disable-next-line no-console
      console.log(`✅ Synced ${questions.length} questions for subject: ${subjectName}`);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`❌ Error syncing subject ${subjectName}:`, error);
      return false;
    }
  }

  /**
   * Clears sync data and forces fresh sync
   */
  async resetAndSync(userId: string): Promise<boolean> {
    // eslint-disable-next-line no-console
    console.log('🔄 Reset and sync requested');

    // Clear localStorage data
    localStorage.removeItem('exam_training_subjects');
    localStorage.removeItem('exam_training_questions');
    localStorage.removeItem('lastSyncTimestamp');

    // Perform fresh sync
    return this.performFullSync(userId);
  }

  private getLocalSubjects(): Array<unknown> {
    try {
      const stored = localStorage.getItem('exam_training_subjects');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getLocalQuestions(): Array<unknown> {
    try {
      const stored = localStorage.getItem('exam_training_questions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private updateLastSyncTimestamp(): void {
    localStorage.setItem('lastSyncTimestamp', new Date().toISOString());
  }

  /**
   * Validates data integrity between cloud and local
   */
  async validateDataIntegrity(_userId: string): Promise<{
    isValid: boolean;
    issues: string[];
    cloudCount: number;
    localCount: number;
  }> {
    const issues: string[] = [];

    try {
      // Check subjects
      const cloudSubjects = await SubjectService.getSubjects();
      const localSubjects = this.getLocalSubjects();

      if (cloudSubjects.length !== localSubjects.length) {
        issues.push(`Subject count mismatch: Cloud(${cloudSubjects.length}) vs Local(${localSubjects.length})`);
      }

      // Check questions total count
      const allCloudQuestions = [];
      for (const subject of cloudSubjects) {
        const questions = await QuestionService.getQuestionsBySubject(subject.name);
        allCloudQuestions.push(...questions);
      }

      const localQuestions = this.getLocalQuestions();

      if (allCloudQuestions.length !== localQuestions.length) {
        issues.push(`Question count mismatch: Cloud(${allCloudQuestions.length}) vs Local(${localQuestions.length})`);
      }

      return {
        isValid: issues.length === 0,
        issues,
        cloudCount: cloudSubjects.length + allCloudQuestions.length,
        localCount: localSubjects.length + localQuestions.length,
      };
    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isValid: false,
        issues,
        cloudCount: 0,
        localCount: 0,
      };
    }
  }
}

export const dataSyncService = DataSyncService.getInstance();
export default dataSyncService;
