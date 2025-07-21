/**
 * @fileOverview A mock service to retrieve performance data.
 * In a real application, this would fetch data from a database.
 * For this demo, it retrieves data passed from the client-side,
 * which originally comes from localStorage.
 */

import type { PerformanceData, QuizResult, Subject } from '@/lib/types';

// This is a "mock" database. We'll store the data here in memory
// so the Genkit tool can access it.
let performanceData: PerformanceData = {};

/**
 * A special function to set the data for our mock service.
 * The AI flow will call this before running the tool.
 * @param data The performance data to set.
 */
(getPerformanceHistoryForSubject as any).__setData = (data: PerformanceData) => {
    performanceData = data;
};


/**
 * Retrieves the performance history for a given subject.
 * @param subject The subject to get data for.
 * @param userId The user ID (currently unused in this mock).
 * @returns An array of quiz results for the subject, or an empty array if none exist.
 */
export async function getPerformanceHistoryForSubject(subject: string, userId: string): Promise<QuizResult[]> {
    console.log(`[Service] Getting performance history for subject: ${subject} and user: ${userId}`);
    // The userId parameter is included to match the tool's schema, but we don't use it
    // in this mock since all data is for the current local user.
    const subjectKey = subject as Subject;
    return performanceData[subjectKey] || [];
}
