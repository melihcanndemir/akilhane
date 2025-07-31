import { supabase } from '@/lib/supabase';
import {
  SubjectService,
  QuizResultService,
  PerformanceAnalyticsService,
  AIRecommendationService,
  FlashcardProgressService,
  type Subject,
  type Question,
  type QuizResult,
  type PerformanceAnalytics,
  type AIRecommendation,
  type FlashcardProgress,
} from './supabase-service';
import { AiChatRepository, type AiChatMessage, type AiChatSession } from '@/lib/database/repositories/ai-chat-repository';

export interface UserBackupData {
  timestamp: string;
  userId: string;
  userEmail: string;
  data: {
    // Supabase Database Data (Only for authenticated users)
    subjects: Subject[];
    questions: Question[];
    quizResults: QuizResult[];
    performanceAnalytics: PerformanceAnalytics[];
    aiRecommendations: AIRecommendation[];
    flashcardProgress: FlashcardProgress[];
    aiChatSessions: AiChatSession[];
    aiChatMessages: AiChatMessage[];
  };
}

export class DataBackupService {
  /**
   * Create a complete backup of user's data
   */
  static async createBackup(): Promise<UserBackupData | null> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch all user data in parallel for better performance
      const [
        subjects,
        allQuestions,
        quizResults,
        performanceAnalytics,
        aiRecommendations,
        flashcardProgress,
        aiChatSessions,
        aiChatMessages,
      ] = await Promise.all([
        SubjectService.getSubjects(),
        DataBackupService.getAllUserQuestions(user.id),
        QuizResultService.getQuizResultsByUser(user.id),
        PerformanceAnalyticsService.getAnalyticsByUser(user.id),
        AIRecommendationService.getRecommendationsByUser(user.id),
        FlashcardProgressService.getProgressByUser(user.id),
        AiChatRepository.getSessionsByUser(user.id),
        DataBackupService.getAllMessagesByUser(user.id),
      ]);

      const backupData: UserBackupData = {
        timestamp: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email || '',
        data: {
          // Only backup Supabase data for authenticated users
          subjects,
          questions: allQuestions,
          quizResults,
          performanceAnalytics,
          aiRecommendations,
          flashcardProgress,
          aiChatSessions,
          aiChatMessages,
        },
      };

      // Store backup in Supabase Storage
      const backupFileName = `backup_${user.id}_${Date.now()}.json`;
      const { error: uploadError } = await supabase.storage
        .from('user-backups')
        .upload(`${user.id}/${backupFileName}`, JSON.stringify(backupData), {
          contentType: 'application/json',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Update user's last backup timestamp in metadata
      await DataBackupService.updateLastBackupTimestamp(user.id);
      return backupData;

          } catch (error) {
        return null;
      }
  }

  /**
   * Get all questions created by the user
   */
  private static async getAllUserQuestions(userId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('created_by', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  /**
   * Get all AI chat messages for a user
   */
  private static async getAllMessagesByUser(userId: string): Promise<AiChatMessage[]> {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error) {
      return [];
    }

    return data.map(message => ({
      id: message.id,
      userId: message.user_id,
      sessionId: message.session_id,
      subject: message.subject,
      role: message.role as 'user' | 'assistant',
      content: message.content,
      timestamp: message.timestamp,
      createdAt: message.created_at,
    }));
  }

  /**
   * Get user's last backup timestamp
   */
  static async getLastBackupTimestamp(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_backup_metadata')
        .select('last_backup_at')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        return null;
      }

      return data?.last_backup_at || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update user's last backup timestamp
   */
  private static async updateLastBackupTimestamp(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_backup_metadata')
        .upsert({
          user_id: userId,
          last_backup_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      // Ignore errors in timestamp update
    } catch (error) {
      // Ignore errors in timestamp update
    }
  }

  /**
   * Restore user data from backup
   */
  static async restoreFromBackup(): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the latest backup file
      const { data: files, error: listError } = await supabase.storage
        .from('user-backups')
        .list(`${user.id}/`, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (listError || !files || files.length === 0) {
        throw new Error('No backup files found');
      }

      const latestBackup = files[0];
      if (!latestBackup) {
        throw new Error('No backup files found');
      }

      // Download backup file
      const { data: backupBlob, error: downloadError } = await supabase.storage
        .from('user-backups')
        .download(`${user.id}/${latestBackup.name}`);

      if (downloadError || !backupBlob) {
        throw new Error('Failed to download backup file');
      }

      // Parse backup data
      const backupText = await backupBlob.text();
      const backupData: UserBackupData = JSON.parse(backupText);

      // Verify backup belongs to current user
      if (backupData.userId !== user.id) {
        throw new Error('Backup file does not belong to current user');
      }

      // Clear existing data first (in transaction-like manner)
      await DataBackupService.clearUserData(user.id);

      // Restore data in correct order (subjects first, then questions, etc.)
      await DataBackupService.restoreUserData(user.id, backupData);
      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Clear all user data before restoration
   */
  private static async clearUserData(userId: string): Promise<void> {
    try {
      // Delete in reverse dependency order
      await Promise.all([
        // Delete AI chat messages first
        supabase.from('ai_chat_history').delete().eq('user_id', userId),

        // Delete AI chat sessions
        supabase.from('ai_chat_sessions').delete().eq('user_id', userId),

        // Delete flashcard progress
        supabase.from('flashcard_progress').delete().eq('user_id', userId),

        // Delete AI recommendations
        supabase.from('ai_recommendations').delete().eq('user_id', userId),

        // Delete performance analytics
        supabase.from('performance_analytics').delete().eq('user_id', userId),

        // Delete quiz results
        supabase.from('quiz_results').delete().eq('user_id', userId),

        // Delete questions
        supabase.from('questions').delete().eq('created_by', userId),

        // Delete subjects
        supabase.from('subjects').delete().eq('created_by', userId),
      ]);

    } catch (error) {
      throw error;
    }
  }

  /**
   * Restore user data from backup
   */
  private static async restoreUserData(_userId: string, backupData: UserBackupData): Promise<void> {
    try {
      const { data } = backupData;

      // Restore subjects first
      if (data.subjects.length > 0) {
        const { error: subjectsError } = await supabase
          .from('subjects')
          .insert(data.subjects);

        if (subjectsError) {
          throw subjectsError;
        }
      }

      // Restore questions
      if (data.questions.length > 0) {
        const { error: questionsError } = await supabase
          .from('questions')
          .insert(data.questions);

        if (questionsError) {
          throw questionsError;
        }
      }

      // Restore quiz results
      if (data.quizResults.length > 0) {
        const { error: quizError } = await supabase
          .from('quiz_results')
          .insert(data.quizResults);

        if (quizError) {
          throw quizError;
        }
      }

      // Restore performance analytics
      if (data.performanceAnalytics.length > 0) {
        const { error: analyticsError } = await supabase
          .from('performance_analytics')
          .insert(data.performanceAnalytics);

        if (analyticsError) {
          throw analyticsError;
        }
      }

      // Restore AI recommendations
      if (data.aiRecommendations.length > 0) {
        const { error: recommendationsError } = await supabase
          .from('ai_recommendations')
          .insert(data.aiRecommendations);

        if (recommendationsError) {
          throw recommendationsError;
        }
      }

      // Restore flashcard progress
      if (data.flashcardProgress.length > 0) {
        const { error: flashcardError } = await supabase
          .from('flashcard_progress')
          .insert(data.flashcardProgress);

        if (flashcardError) {
          throw flashcardError;
        }
      }

      // Restore AI chat sessions
      if (data.aiChatSessions.length > 0) {
        const { error: sessionsError } = await supabase
          .from('ai_chat_sessions')
          .insert(data.aiChatSessions.map(session => ({
            id: session.id,
            user_id: session.userId,
            session_id: session.sessionId,
            subject: session.subject,
            title: session.title,
            message_count: session.messageCount,
            last_message_at: session.lastMessageAt,
            created_at: session.createdAt,
            updated_at: session.updatedAt,
          })));

        if (sessionsError) {
          throw sessionsError;
        }
      }

      // Restore AI chat messages
      if (data.aiChatMessages.length > 0) {
        const { error: messagesError } = await supabase
          .from('ai_chat_history')
          .insert(data.aiChatMessages.map(message => ({
            id: message.id,
            user_id: message.userId,
            session_id: message.sessionId,
            subject: message.subject,
            role: message.role,
            content: message.content,
            timestamp: message.timestamp,
            created_at: message.createdAt,
          })));

        if (messagesError) {
          throw messagesError;
        }
      }

      // For authenticated users, we only restore Supabase data
      // LocalStorage data (guest data) is not restored for authenticated users
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear all cloud data for a user
   */
  static async clearAllCloudData(): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Clear all user data
      await DataBackupService.clearUserData(user.id);

      // Clear backup files from storage
      const { data: files, error: listError } = await supabase.storage
        .from('user-backups')
        .list(`${user.id}/`);

      if (!listError && files && files.length > 0) {
        const filePaths = files.map(file => `${user.id}/${file.name}`);
        await supabase.storage
          .from('user-backups')
          .remove(filePaths);
      }

      // Clear backup metadata
      await supabase
        .from('user_backup_metadata')
        .delete()
        .eq('user_id', user.id);

      // For authenticated users, we only clear Supabase data
      // LocalStorage data remains untouched (user might have guest data they want to keep)
      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Delete user account and all associated data using Edge Function
   */
  static async deleteAccount(): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current session with refresh
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      const activeSession = session || (await supabase.auth.refreshSession()).data.session;

      if (!activeSession) {
        throw new Error('No active session and refresh failed');
      }

      // Call the Edge Function to delete the account
      const { data, error } = await supabase.functions.invoke('delete_account', {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmEmail: user.email,
          timestamp: new Date().toISOString(),
        }),
      });

      if (error) {
        throw new Error(`Account deletion failed: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(`Account deletion failed: ${data?.error || 'Unknown error'}`);
      }

      // Force sign out and redirect since user is deleted
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        // Expected error since user is deleted
      }

      // Clear any local storage data
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 500);

      return true;

    } catch (error) {
      return false;
    }
  }
}
