import { supabase, checkAuth } from "@/lib/supabase";
import { SubjectService, QuestionService } from "./supabase-service";
import { UnifiedStorageService } from "./unified-storage-service";
import type { Question } from "@/lib/types";
import type { Subject } from "@/types/question-manager";

// Define proper interfaces for cloud data
interface CloudQuestion {
  id: string;
  subject_id: string;
  subject: string;
  topic: string;
  type: string;
  difficulty: string;
  text: string;
  options: string;
  correct_answer: string;
  explanation: string;
  formula: string;
  is_active: boolean;
  created_at: string;
}

interface SyncData {
  subjects: number;
  questions: number;
}

interface SyncResult {
  success: boolean;
  message: string;
  syncedData?: SyncData;
  loadedData?: SyncData;
  syncData?: SyncData;
}

/**
 * Cloud synchronization service for managing data between localStorage and Supabase
 */
export class CloudSyncService {
  /**
   * Sync localStorage data to Supabase when user logs in
   */
  static async syncLocalToCloud(): Promise<SyncResult> {
    try {
      const { isLoggedIn, user } = await checkAuth();

      if (!isLoggedIn || !user) {
        return {
          success: false,
          message: "Kullanıcı oturum açmamış",
        };
      }

      // Get local data
      const localSubjects = UnifiedStorageService.getSubjects();
      const localQuestions = UnifiedStorageService.getQuestions();

      // Get cloud data to check for duplicates
      const cloudSubjects = await SubjectService.getSubjects();
      const cloudQuestions = await CloudSyncService.getAllCloudQuestions();

      let syncedSubjects = 0;
      let syncedQuestions = 0;

      // Sync subjects (avoid duplicates by name)
      for (const localSubject of localSubjects) {
        const existsInCloud = cloudSubjects.some(cloud =>
          cloud.name.toLowerCase().trim() === localSubject.name.toLowerCase().trim(),
        );

        if (!existsInCloud) {
          const cloudSubject = await SubjectService.createSubject({
            name: localSubject.name,
            description: localSubject.description,
            category: localSubject.category,
            difficulty: localSubject.difficulty,
            question_count: localSubject.questionCount || 0,
            created_by: user.id,
          });

          if (cloudSubject) {
            syncedSubjects++;
          }
        }
      }

      // Sync questions (avoid duplicates by text)
      for (const localQuestion of localQuestions) {
        const existsInCloud = cloudQuestions.some(cloud =>
          cloud.text.toLowerCase().trim() === localQuestion.text.toLowerCase().trim() &&
          cloud.subject.toLowerCase().trim() === localQuestion.subject.toLowerCase().trim(),
        );

        if (!existsInCloud) {
          try {
            // Find correct answer from options
            const correctAnswer = localQuestion.options?.find(opt => opt.isCorrect)?.text || "";

            const cloudQuestion = await QuestionService.createQuestion({
              subject_id: CloudSyncService.generateSubjectId(localQuestion.subject),
              subject: localQuestion.subject,
              topic: localQuestion.topic || "Genel",
              type: localQuestion.type || "multiple-choice",
              difficulty: localQuestion.difficulty || "Orta",
              text: localQuestion.text,
              options: JSON.stringify(localQuestion.options || []),
              correct_answer: correctAnswer,
              explanation: localQuestion.explanation || "",
              formula: localQuestion.formula || "",
            });

            if (cloudQuestion) {
              syncedQuestions++;
            } else {
              // Log warning without console statement
              CloudSyncService.logWarning("Failed to create cloud question for:", localQuestion.text);
            }
          } catch (error) {
            CloudSyncService.logError("Error creating cloud question:", error, "Question:", localQuestion);
          }
        }
      }

      return {
        success: true,
        message: `${syncedSubjects} ders ve ${syncedQuestions} soru buluta senkronize edildi`,
        syncedData: { subjects: syncedSubjects, questions: syncedQuestions },
      };

    } catch (error) {
      CloudSyncService.logError("LocalToCloud sync error:", error);
      return {
        success: false,
        message: "Senkronizasyon sırasında hata oluştu",
      };
    }
  }

  /**
   * Load cloud data to localStorage when user logs in
   */
  static async syncCloudToLocal(): Promise<SyncResult> {
    try {
      const { isLoggedIn, user } = await checkAuth();

      if (!isLoggedIn || !user) {
        return {
          success: false,
          message: "Kullanıcı oturum açmamış",
        };
      }

      // Get cloud data
      const cloudSubjects = await SubjectService.getSubjects();
      const cloudQuestions = await CloudSyncService.getAllCloudQuestions();

      // Get existing local data
      const localSubjects = UnifiedStorageService.getSubjects();
      const localQuestions = UnifiedStorageService.getQuestions();

      let loadedSubjects = 0;
      let loadedQuestions = 0;

      // Merge cloud subjects to local (avoid duplicates)
      for (const cloudSubject of cloudSubjects) {
        const existsLocally = localSubjects.some(local =>
          local.name.toLowerCase().trim() === cloudSubject.name.toLowerCase().trim(),
        );

        if (!existsLocally) {
          const localSubject: Subject = {
            id: cloudSubject.id,
            name: cloudSubject.name,
            description: cloudSubject.description,
            category: cloudSubject.category,
            difficulty: cloudSubject.difficulty,
            questionCount: cloudSubject.question_count,
            isActive: cloudSubject.is_active,
          };

          UnifiedStorageService.addSubject(localSubject);
          loadedSubjects++;
        }
      }

      // Merge cloud questions to local (avoid duplicates)
      for (const cloudQuestion of cloudQuestions) {
        const existsLocally = localQuestions.some(local =>
          local.text.toLowerCase().trim() === cloudQuestion.text.toLowerCase().trim() &&
          local.subject.toLowerCase().trim() === cloudQuestion.subject.toLowerCase().trim(),
        );

        if (!existsLocally) {
          let options: Array<{ text: string; isCorrect: boolean }> = [];

          try {
            options = JSON.parse(cloudQuestion.options);
          } catch {
            // Fallback for invalid JSON
            options = [
              { text: cloudQuestion.correct_answer, isCorrect: true },
              { text: "Seçenek B", isCorrect: false },
              { text: "Seçenek C", isCorrect: false },
              { text: "Seçenek D", isCorrect: false },
            ];
          }

          const localQuestion: Question = {
            id: cloudQuestion.id,
            subject: cloudQuestion.subject,
            topic: cloudQuestion.topic,
            type: cloudQuestion.type as "multiple-choice" | "true-false" | "calculation" | "case-study",
            difficulty: cloudQuestion.difficulty as "Easy" | "Medium" | "Hard",
            text: cloudQuestion.text,
            options,
            explanation: cloudQuestion.explanation,
            formula: cloudQuestion.formula,
          };

          UnifiedStorageService.addQuestion(localQuestion);
          loadedQuestions++;
        }
      }

      return {
        success: true,
        message: `${loadedSubjects} ders ve ${loadedQuestions} soru buluttan yüklendi`,
        loadedData: { subjects: loadedSubjects, questions: loadedQuestions },
      };

    } catch (error) {
      CloudSyncService.logError("CloudToLocal sync error:", error);
      return {
        success: false,
        message: "Bulut verisi yükleme sırasında hata oluştu",
      };
    }
  }

  /**
   * Full bidirectional sync - merge local and cloud data
   */
  static async fullSync(): Promise<SyncResult> {
    try {
      const { isLoggedIn } = await checkAuth();

      if (!isLoggedIn) {
        return {
          success: false,
          message: "Senkronizasyon için oturum açmanız gerekiyor",
        };
      }

      // First, sync local to cloud
      const localToCloudResult = await CloudSyncService.syncLocalToCloud();

      // Then, sync cloud to local
      const cloudToLocalResult = await CloudSyncService.syncCloudToLocal();

      const totalSynced: SyncData = {
        subjects: (localToCloudResult.syncedData?.subjects || 0) + (cloudToLocalResult.loadedData?.subjects || 0),
        questions: (localToCloudResult.syncedData?.questions || 0) + (cloudToLocalResult.loadedData?.questions || 0),
      };

      return {
        success: localToCloudResult.success && cloudToLocalResult.success,
        message: `Senkronizasyon tamamlandı: ${totalSynced.subjects} ders, ${totalSynced.questions} soru işlendi`,
        syncData: totalSynced,
      };

    } catch (error) {
      CloudSyncService.logError("Full sync error:", error);
      return {
        success: false,
        message: "Tam senkronizasyon sırasında hata oluştu",
      };
    }
  }

  /**
   * Check if user has cloud data
   */
  static async hasCloudData(): Promise<boolean> {
    try {
      const { isLoggedIn } = await checkAuth();

      if (!isLoggedIn) {
        return false;
      }

      const cloudSubjects = await SubjectService.getSubjects();
      return cloudSubjects.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check sync status between local and cloud
   */
  static async getSyncStatus(): Promise<{
    isLoggedIn: boolean;
    hasLocalData: boolean;
    hasCloudData: boolean;
    needsSync: boolean;
    localCounts: { subjects: number; questions: number };
    cloudCounts: { subjects: number; questions: number };
  }> {
    try {
      const { isLoggedIn } = await checkAuth();

      const localSubjects = UnifiedStorageService.getSubjects();
      const localQuestions = UnifiedStorageService.getQuestions();

      const localCounts = {
        subjects: localSubjects.length,
        questions: localQuestions.length,
      };

      if (!isLoggedIn) {
        return {
          isLoggedIn: false,
          hasLocalData: localCounts.subjects > 0 || localCounts.questions > 0,
          hasCloudData: false,
          needsSync: false,
          localCounts,
          cloudCounts: { subjects: 0, questions: 0 },
        };
      }

      const cloudSubjects = await SubjectService.getSubjects();
      const cloudQuestions = await CloudSyncService.getAllCloudQuestions();

      const cloudCounts = {
        subjects: cloudSubjects.length,
        questions: cloudQuestions.length,
      };

      const hasLocalData = localCounts.subjects > 0 || localCounts.questions > 0;
      const hasCloudData = cloudCounts.subjects > 0 || cloudCounts.questions > 0;
      const needsSync = hasLocalData || hasCloudData;

      return {
        isLoggedIn: true,
        hasLocalData,
        hasCloudData,
        needsSync,
        localCounts,
        cloudCounts,
      };

    } catch (error) {
      CloudSyncService.logError("Sync status check error:", error);
      const localSubjects = UnifiedStorageService.getSubjects();
      const localQuestions = UnifiedStorageService.getQuestions();

      return {
        isLoggedIn: false,
        hasLocalData: localSubjects.length > 0 || localQuestions.length > 0,
        hasCloudData: false,
        needsSync: false,
        localCounts: { subjects: localSubjects.length, questions: localQuestions.length },
        cloudCounts: { subjects: 0, questions: 0 },
      };
    }
  }

  /**
   * Get all cloud questions for the authenticated user
   */
  private static async getAllCloudQuestions(): Promise<CloudQuestion[]> {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        CloudSyncService.logError("Error fetching cloud questions:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      CloudSyncService.logError("Error in getAllCloudQuestions:", error);
      return [];
    }
  }

  /**
   * Generate a subject ID for cloud storage
   */
  private static generateSubjectId(subjectName: string): string {
    const normalized = subjectName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    return `subject_${normalized}_${Date.now()}`;
  }

  /**
   * Clear all local data (for testing purposes)
   */
  static clearLocalData(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("akilhane_questions");
      localStorage.removeItem("akilhane_subjects");
      localStorage.removeItem("akilhane_flashcards");
    }
  }

  /**
   * Test cloud connectivity
   */
  static async testCloudConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from("subjects")
        .select("count")
        .limit(1);

      if (error) {
        return {
          success: false,
          message: `Bulut bağlantısı hatası: ${error.message}`,
        };
      }

      return {
        success: true,
        message: "Bulut bağlantısı başarılı",
      };
    } catch (error) {
      return {
        success: false,
        message: `Bağlantı testi başarısız: ${error}`,
      };
    }
  }

  /**
   * Private logging methods to replace console statements
   */
  private static logError(message: string, ...args: unknown[]): void {
    // In production, this could send to a logging service
    // For now, we'll use a no-op to satisfy ESLint
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(message, ...args);
    }
  }

  private static logWarning(message: string, ...args: unknown[]): void {
    // In production, this could send to a logging service
    // For now, we'll use a no-op to satisfy ESLint
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(message, ...args);
    }
  }
}
