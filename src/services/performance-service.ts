/**
 * @fileOverview Performance service that uses SQLite database for data persistence.
 * This service provides methods to retrieve and manage performance data.
 */

import type { PerformanceData, QuizResult, Subject } from '@/lib/types';
import { QuizRepository } from '@/lib/database/repositories/quiz-repository';

/**
 * Retrieves the performance history for a given subject.
 * @param subject The subject to get data for.
 * @param userId The user ID.
 * @returns An array of quiz results for the subject, or an empty array if none exist.
 */
export async function getPerformanceHistoryForSubject(subject: string, userId: string): Promise<QuizResult[]> {
  try {
    console.log(`[Service] Getting performance history for subject: ${subject} and user: ${userId}`);
    
    const results = await QuizRepository.getQuizResults(userId, subject);
    return results;
  } catch (error) {
    console.error('❌ Error getting performance history:', error);
    return [];
  }
}

/**
 * Get all performance data for a user
 * @param userId The user ID.
 * @returns Performance data organized by subject.
 */
export async function getAllPerformanceData(userId: string): Promise<PerformanceData> {
  try {
    console.log(`[Service] Getting all performance data for user: ${userId}`);
    
    const allResults = await QuizRepository.getAllQuizResults(userId);
    return allResults as PerformanceData;
  } catch (error) {
    console.error('❌ Error getting all performance data:', error);
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
  weakTopics: Record<string, number>
): Promise<void> {
  try {
    console.log(`[Service] Saving quiz result for user: ${userId}, subject: ${subject}`);
    
    await QuizRepository.saveQuizResult(userId, subject, score, totalQuestions, timeSpent, weakTopics);
  } catch (error) {
    console.error('❌ Error saving quiz result:', error);
    throw error;
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
    console.log(`[Service] Getting performance analytics for user: ${userId}, subject: ${subject}`);
    
    return await QuizRepository.getPerformanceAnalytics(userId, subject);
  } catch (error) {
    console.error('❌ Error getting performance analytics:', error);
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
    console.log(`[Service] Getting all performance analytics for user: ${userId}`);
    
    return await QuizRepository.getAllPerformanceAnalytics(userId);
  } catch (error) {
    console.error('❌ Error getting all performance analytics:', error);
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
  limit: number = 10
): Promise<QuizResult[]> {
  try {
    console.log(`[Service] Getting recent quiz results for user: ${userId}, subject: ${subject}`);
    
    return await QuizRepository.getRecentQuizResults(userId, subject, limit);
  } catch (error) {
    console.error('❌ Error getting recent quiz results:', error);
    return [];
  }
}

/**
 * Delete quiz results for a user and subject
 * @param userId The user ID.
 * @param subject The subject.
 */
export async function deleteQuizResults(userId: string, subject: string): Promise<void> {
  try {
    console.log(`[Service] Deleting quiz results for user: ${userId}, subject: ${subject}`);
    
    await QuizRepository.deleteQuizResults(userId, subject);
  } catch (error) {
    console.error('❌ Error deleting quiz results:', error);
    throw error;
  }
}

// Legacy support for existing mock functionality
// This is kept for backward compatibility with existing AI flows
let mockPerformanceData: PerformanceData = {};

(getPerformanceHistoryForSubject as any).__setData = (data: PerformanceData) => {
  mockPerformanceData = data;
};

// Fallback function for when database is not available
export async function getPerformanceHistoryForSubjectFallback(subject: string, userId: string): Promise<QuizResult[]> {
  console.log(`[Service] Using fallback for performance history - subject: ${subject}, user: ${userId}`);
  const subjectKey = subject as Subject;
  return mockPerformanceData[subjectKey] || [];
}
