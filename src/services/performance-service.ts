/**
 * @fileOverview Performance service that uses SQLite database for data persistence.
 * This service provides methods to retrieve and manage performance data.
 */

import type { PerformanceData, QuizResultDisplay, Subject } from "@/lib/types";
import { QuizRepository } from "@/lib/database/repositories/quiz-repository";

// Type for function with __setData property
type PerformanceFunction = {
  (subject: string, userId: string): Promise<QuizResultDisplay[]>;
  __setData?: (data: PerformanceData) => void;
};

/**
 * Retrieves the performance history for a given subject.
 * @param subject The subject to get data for.
 * @param userId The user ID.
 * @returns An array of quiz results for the subject, or an empty array if none exist.
 */
export async function getPerformanceHistoryForSubject(
  subject: string,
  userId: string,
): Promise<QuizResultDisplay[]> {
  try {
    const results = await QuizRepository.getQuizResults(userId, subject);
    return results;
  } catch {
    return [];
  }
}

/**
 * Get all performance data for a user
 * @param userId The user ID.
 * @returns Performance data organized by subject.
 */
export async function getAllPerformanceData(
  userId: string,
): Promise<PerformanceData> {
  try {
    const allResults = await QuizRepository.getAllQuizResults(userId);
    return allResults as PerformanceData;
  } catch {
    return {};
  }
}

/**
 * Save quiz result to database
 * @param userId The user ID.
 * @param subject The subject.
 * @param score The score achieved.
 * @param totalQuestions Total number of questions.
 * @param timeSpent Time spent in seconds.
 * @param weakTopics Weak topics identified.
 */
export async function saveQuizResult(
  userId: string,
  subject: string,
  score: number,
  totalQuestions: number,
  timeSpent: number,
  weakTopics: Record<string, number>,
): Promise<void> {
  try {
    await QuizRepository.saveQuizResult(
      userId,
      subject,
      score,
      totalQuestions,
      timeSpent,
      weakTopics,
    );
  } catch {
    throw new Error("Error saving quiz result");
  }
}

/**
 * Get performance analytics for a user and subject
 * @param userId The user ID.
 * @param subject The subject.
 * @returns Performance analytics data.
 */
export async function getPerformanceAnalytics(userId: string, subject: string) {
  try {
    return await QuizRepository.getPerformanceAnalytics(userId, subject);
  } catch {
    return null;
  }
}

/**
 * Get all performance analytics for a user
 * @param userId The user ID.
 * @returns All performance analytics data.
 */
export async function getAllPerformanceAnalytics(userId: string) {
  try {
    return await QuizRepository.getAllPerformanceAnalytics(userId);
  } catch {
    return [];
  }
}

/**
 * Get recent quiz results for a user and subject
 * @param userId The user ID.
 * @param subject The subject.
 * @param limit Number of recent results to return.
 * @returns Recent quiz results.
 */
export async function getRecentQuizResults(
  userId: string,
  subject: string,
  limit: number = 10,
): Promise<QuizResultDisplay[]> {
  try {
    return await QuizRepository.getRecentQuizResults(userId, subject, limit);
  } catch {
    return [];
  }
}

/**
 * Delete quiz results for a user and subject
 * @param userId The user ID.
 * @param subject The subject.
 */
export async function deleteQuizResults(
  userId: string,
  subject: string,
): Promise<void> {
  try {
    await QuizRepository.deleteQuizResults(userId, subject);
  } catch (error) {
    throw error;
  }
}

// Legacy support for existing mock functionality
// This is kept for backward compatibility with existing AI flows
let mockPerformanceData: PerformanceData = {};

(getPerformanceHistoryForSubject as PerformanceFunction).__setData = (
  data: PerformanceData,
) => {
  mockPerformanceData = data;
};
// Fallback function for when database is not available
export async function getPerformanceHistoryForSubjectFallback(
  subject: string,
): Promise<QuizResultDisplay[]> {
  const subjectKey = subject as Subject;
  return mockPerformanceData[subjectKey] || [];
}
