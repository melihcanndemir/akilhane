"use client";

interface QuizResult {
  id: string;
  userId: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  weakTopics: string[];
  createdAt: string;
}

interface FlashcardProgress {
  id: string;
  userId: string;
  subject: string;
  cardId: string;
  isKnown: boolean;
  reviewCount: number;
  lastReviewed?: string;
  nextReview?: string;
  createdAt: string;
  updatedAt: string;
}

interface PerformanceData {
  id: string;
  userId: string;
  subject: string;
  averageScore: number;
  totalTests: number;
  averageTimeSpent: number;
  weakTopics: string[];
  lastUpdated: string;
}

interface AIRecommendation {
  id: string;
  userId: string;
  subject: string;
  recommendedDifficulty: "Easy" | "Medium" | "Hard";
  reasoning: string;
  createdAt: string;
}

interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AIChatSession {
  id: string;
  sessionId: string;
  userId: string;
  subject: string;
  title?: string;
  messages: AIChatMessage[];
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

interface UserSettings {
  studyPreferences: {
    defaultSubject: string;
    questionsPerQuiz: number;
    timeLimit: number;
    showTimer: boolean;
    autoSubmit: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
    achievements: boolean;
  };
  appearance: {
    fontSize: "small" | "medium" | "large";
    compactMode: boolean;
    theme: "light" | "dark" | "system";
  };
}

interface ExportedData {
  quizResults: QuizResult[];
  flashcardProgress: FlashcardProgress[];
  performanceData: PerformanceData[];
  aiRecommendations: AIRecommendation[];
  exportDate: string;
}

interface StorageSize {
  used: number;
  available: number;
  percentage: number;
}

class LocalStorageService {
  private static instance: LocalStorageService;

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isClient()) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isClient()) {
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silent fail for localStorage errors
    }
  }

  // Quiz Results
  getQuizResults(): QuizResult[] {
    return this.getItem("guestQuizResults", []);
  }

  saveQuizResult(result: Omit<QuizResult, "id" | "createdAt">): QuizResult {
    const results = this.getQuizResults();
    const newResult: QuizResult = {
      ...result,
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    results.push(newResult);
    this.setItem("guestQuizResults", results);

    // Update performance data
    this.updatePerformanceData(
      result.userId,
      result.subject,
      result.score,
      result.totalQuestions,
      result.timeSpent,
      result.weakTopics,
    );

    return newResult;
  }

  getQuizResultsBySubject(subject: string): QuizResult[] {
    return this.getQuizResults().filter((result) => result.subject === subject);
  }

  getQuizResultsByUser(userId: string): QuizResult[] {
    return this.getQuizResults().filter((result) => result.userId === userId);
  }

  // Flashcard Progress
  getFlashcardProgress(): FlashcardProgress[] {
    const progressMap: Record<string, FlashcardProgress> = this.getItem(
      "guestFlashcardProgress",
      {},
    );
    return Object.values(progressMap);
  }

  getFlashcardProgressByUser(userId: string): FlashcardProgress[] {
    return this.getFlashcardProgress().filter(
      (progress) => progress.userId === userId,
    );
  }

  getFlashcardProgressBySubject(
    userId: string,
    subject: string,
  ): FlashcardProgress[] {
    return this.getFlashcardProgress().filter(
      (progress) => progress.userId === userId && progress.subject === subject,
    );
  }

  saveFlashcardProgress(
    progress: Omit<FlashcardProgress, "id" | "createdAt" | "updatedAt">,
  ): FlashcardProgress {
    const progressMap: Record<string, FlashcardProgress> = this.getItem(
      "guestFlashcardProgress",
      {},
    );
    const key = `${progress.userId}_${progress.subject}_${progress.cardId}`;

    const existingProgress = progressMap[key];
    const newProgress: FlashcardProgress = {
      ...progress,
      id:
        existingProgress?.id ||
        `flashcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: existingProgress?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    progressMap[key] = newProgress;
    this.setItem("guestFlashcardProgress", progressMap);

    return newProgress;
  }

  // Performance Data
  getPerformanceData(): PerformanceData[] {
    return this.getItem("guestPerformanceData", []);
  }

  getPerformanceDataByUser(userId: string): PerformanceData[] {
    return this.getPerformanceData().filter((data) => data.userId === userId);
  }

  getPerformanceDataBySubject(
    userId: string,
    subject: string,
  ): PerformanceData | null {
    return (
      this.getPerformanceData().find(
        (data) => data.userId === userId && data.subject === subject,
      ) || null
    );
  }

  private updatePerformanceData(
    userId: string,
    subject: string,
    score: number,
    totalQuestions: number,
    timeSpent: number,
    weakTopics: string[],
  ): void {
    const performanceData = this.getPerformanceData();
    const existingIndex = performanceData.findIndex(
      (data) => data.userId === userId && data.subject === subject,
    );

    const scorePercentage = (score / totalQuestions) * 100;
    const timeSpentMinutes = timeSpent / 60;

    if (existingIndex >= 0) {
      // Update existing performance data
      const existing = performanceData[existingIndex];
      if (existing) {
        const totalTests = existing.totalTests + 1;
        const newAverageScore =
          (existing.averageScore * existing.totalTests + scorePercentage) /
          totalTests;
        const newAverageTimeSpent =
          (existing.averageTimeSpent * existing.totalTests + timeSpentMinutes) /
          totalTests;

        // Merge weak topics (simple approach - you might want more sophisticated logic)
        const combinedWeakTopics = [
          ...new Set([...existing.weakTopics, ...weakTopics]),
        ];

        performanceData[existingIndex] = {
          id: existing.id,
          userId: existing.userId,
          subject: existing.subject,
          averageScore: Math.round(newAverageScore * 100) / 100,
          totalTests,
          averageTimeSpent: Math.round(newAverageTimeSpent * 100) / 100,
          weakTopics: combinedWeakTopics,
          lastUpdated: new Date().toISOString(),
        };
      }
    } else {
      // Create new performance data
      const newPerformanceData: PerformanceData = {
        id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        subject,
        averageScore: Math.round(scorePercentage * 100) / 100,
        totalTests: 1,
        averageTimeSpent: Math.round(timeSpentMinutes * 100) / 100,
        weakTopics,
        lastUpdated: new Date().toISOString(),
      };

      performanceData.push(newPerformanceData);
    }

    this.setItem("guestPerformanceData", performanceData);
  }

  // AI Recommendations
  getAIRecommendations(): AIRecommendation[] {
    return this.getItem("guestAIRecommendations", []);
  }

  getAIRecommendationsByUser(userId: string): AIRecommendation[] {
    return this.getAIRecommendations().filter((rec) => rec.userId === userId);
  }

  saveAIRecommendation(
    recommendation: Omit<AIRecommendation, "id" | "createdAt">,
  ): AIRecommendation {
    const recommendations = this.getAIRecommendations();
    const newRecommendation: AIRecommendation = {
      ...recommendation,
      id: `ai_rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    recommendations.push(newRecommendation);

    // Keep only last 50 recommendations to prevent localStorage bloat
    if (recommendations.length > 50) {
      recommendations.splice(0, recommendations.length - 50);
    }

    this.setItem("guestAIRecommendations", recommendations);
    return newRecommendation;
  }

  // Analytics and Statistics
  getTotalStats(userId: string): {
    totalTests: number;
    averageScore: number;
    totalTimeSpent: number;
    totalSubjects: number;
  } {
    const performanceData = this.getPerformanceDataByUser(userId);

    if (performanceData.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        totalSubjects: 0,
      };
    }

    const totalTests = performanceData.reduce(
      (sum, data) => sum + data.totalTests,
      0,
    );
    const weightedScoreSum = performanceData.reduce(
      (sum, data) => sum + data.averageScore * data.totalTests,
      0,
    );
    const averageScore = totalTests > 0 ? weightedScoreSum / totalTests : 0;
    const totalTimeSpent = performanceData.reduce(
      (sum, data) => sum + data.averageTimeSpent * data.totalTests,
      0,
    );

    return {
      totalTests,
      averageScore: Math.round(averageScore * 100) / 100,
      totalTimeSpent: Math.round(totalTimeSpent * 100) / 100,
      totalSubjects: performanceData.length,
    };
  }

  getRecentResults(userId: string, limit = 10): QuizResult[] {
    return this.getQuizResultsByUser(userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  }

  // Data management
  clearAllData(): void {
    if (!this.isClient()) {
      return;
    }

    const keys = [
      "guestQuizResults",
      "guestFlashcardProgress",
      "guestPerformanceData",
      "guestAIRecommendations",
    ];

    keys.forEach((key) => localStorage.removeItem(key));
  }

  exportAllData(): ExportedData | null {
    if (!this.isClient()) {
      return null;
    }

    return {
      quizResults: this.getQuizResults(),
      flashcardProgress: this.getFlashcardProgress(),
      performanceData: this.getPerformanceData(),
      aiRecommendations: this.getAIRecommendations(),
      exportDate: new Date().toISOString(),
    };
  }

  importAllData(data: ExportedData): boolean {
    try {
      if (data.quizResults) {
        this.setItem("guestQuizResults", data.quizResults);
      }
      if (data.flashcardProgress) {
        this.setItem("guestFlashcardProgress", data.flashcardProgress);
      }
      if (data.performanceData) {
        this.setItem("guestPerformanceData", data.performanceData);
      }
      if (data.aiRecommendations) {
        this.setItem("guestAIRecommendations", data.aiRecommendations);
      }
      return true;
    } catch {
      return false;
    }
  }

  // Data size monitoring
  getStorageSize(): StorageSize {
    if (!this.isClient()) {
      return { used: 0, available: 0, percentage: 0 };
    }

    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Approximate localStorage limit (5MB in most browsers)
    const available = 5 * 1024 * 1024;
    const percentage = (used / available) * 100;

    return {
      used,
      available,
      percentage: Math.round(percentage * 100) / 100,
    };
  }

  // User Settings
  getUserSettings(): UserSettings {
    return this.getItem("userSettings", {
      studyPreferences: {
        defaultSubject: "",
        questionsPerQuiz: 10,
        timeLimit: 30,
        showTimer: true,
        autoSubmit: false,
      },
      notifications: {
        email: true,
        push: false,
        reminders: true,
        achievements: true,
      },
      appearance: {
        fontSize: "medium" as const,
        compactMode: false,
        theme: "system" as const,
      },
    });
  }

  saveUserSettings(settings: UserSettings): void {
    this.setItem("userSettings", settings);
  }

  // AI Chat Sessions
  getAIChatSessions(): AIChatSession[] {
    return this.getItem("aiChatSessions", []);
  }

  getAIChatSessionsByUser(userId: string): AIChatSession[] {
    const sessions = this.getAIChatSessions();
    return sessions.filter((session) => session.userId === userId);
  }

  getAIChatSession(sessionId: string): AIChatSession | null {
    const sessions = this.getAIChatSessions();
    return sessions.find((session) => session.sessionId === sessionId) || null;
  }

  saveAIChatSession(
    session: Omit<
      AIChatSession,
      "id" | "createdAt" | "updatedAt" | "messageCount"
    >,
  ): AIChatSession {
    const sessions = this.getAIChatSessions();
    const existingIndex = sessions.findIndex(
      (s) => s.sessionId === session.sessionId,
    );

    const newSession: AIChatSession = {
      ...session,
      id: `ai_chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      messageCount: session.messages?.length || 0,
      createdAt:
        existingIndex >= 0 && sessions[existingIndex]
          ? sessions[existingIndex].createdAt
          : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = newSession;
    } else {
      sessions.push(newSession);
    }

    this.setItem("aiChatSessions", sessions);
    return newSession;
  }

  updateAIChatSession(
    sessionId: string,
    updates: Partial<AIChatSession>,
  ): boolean {
    const sessions = this.getAIChatSessions();
    const sessionIndex = sessions.findIndex((s) => s.sessionId === sessionId);

    if (sessionIndex === -1) {
      return false;
    }

    const existingSession = sessions[sessionIndex];
    if (!existingSession) {
      return false;
    }

    sessions[sessionIndex] = {
      ...existingSession,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.setItem("aiChatSessions", sessions);
    return true;
  }

  deleteAIChatSession(sessionId: string): boolean {
    const sessions = this.getAIChatSessions();
    const filteredSessions = sessions.filter((s) => s.sessionId !== sessionId);

    if (filteredSessions.length === sessions.length) {
      return false;
    }

    this.setItem("aiChatSessions", filteredSessions);
    return true;
  }

  addMessageToSession(
    sessionId: string,
    message: Omit<AIChatMessage, "id" | "timestamp">,
  ): AIChatMessage {
    const sessions = this.getAIChatSessions();
    const sessionIndex = sessions.findIndex((s) => s.sessionId === sessionId);

    if (sessionIndex === -1) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const existingSession = sessions[sessionIndex];
    if (!existingSession) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const newMessage: AIChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    existingSession.messages.push(newMessage);
    existingSession.messageCount = existingSession.messages.length;
    existingSession.lastMessageAt = newMessage.timestamp;
    existingSession.updatedAt = new Date().toISOString();

    this.setItem("aiChatSessions", sessions);
    return newMessage;
  }

  searchAIChatSessions(userId: string, searchTerm: string): AIChatSession[] {
    const sessions = this.getAIChatSessionsByUser(userId);
    const term = searchTerm.toLowerCase();

    return sessions.filter(
      (session) =>
        session.title?.toLowerCase().includes(term) ||
        session.subject.toLowerCase().includes(term) ||
        session.messages.some((msg) =>
          msg.content.toLowerCase().includes(term),
        ),
    );
  }
}

export const localStorageService = LocalStorageService.getInstance();
export default localStorageService;
