import { eq, and, desc } from 'drizzle-orm';
import { db } from '../connection';
import { quizResults, performanceAnalytics, users } from '../schema';
import type { QuizResult } from '@/lib/types';

export class QuizRepository {
  /**
   * Save quiz result to database
   */
  static async saveQuizResult(
    userId: string,
    subject: string,
    score: number,
    totalQuestions: number,
    timeSpent: number,
    weakTopics: Record<string, number>
  ): Promise<void> {
    try {
      // First, ensure the user exists. If not, create a guest user.
      await db
        .insert(users)
        .values({
          id: userId,
          name: 'Misafir Kullanıcı',
          email: `${userId}@guest.com`,
        })
        .onConflictDoNothing();
        
      await db.insert(quizResults).values({
        userId,
        subject,
        score,
        totalQuestions,
        timeSpent,
        weakTopics: JSON.stringify(weakTopics),
        createdAt: new Date(),
      });

      // Update performance analytics
      await this.updatePerformanceAnalytics(userId, subject);
      
      console.log(`✅ Quiz result saved for user ${userId}, subject ${subject}`);
    } catch (error) {
      console.error('❌ Error saving quiz result:', error);
      throw error;
    }
  }

  /**
   * Get quiz results for a user and subject
   */
  static async getQuizResults(userId: string, subject: string): Promise<QuizResult[]> {
    try {
      const results = await db
        .select({
          score: quizResults.score,
          totalQuestions: quizResults.totalQuestions,
          timeSpent: quizResults.timeSpent,
          weakTopics: quizResults.weakTopics,
          createdAt: quizResults.createdAt,
        })
        .from(quizResults)
        .where(
          and(
            eq(quizResults.userId, userId),
            eq(quizResults.subject, subject)
          )
        )
        .orderBy(desc(quizResults.createdAt));

      return results.map((result: any) => ({
        score: result.score,
        totalQuestions: result.totalQuestions,
        timeSpent: result.timeSpent,
        weakTopics: JSON.parse(result.weakTopics),
        date: new Date(result.createdAt).toISOString(),
      }));
    } catch (error) {
      console.error('❌ Error getting quiz results:', error);
      throw error;
    }
  }

  /**
   * Get all quiz results for a user
   */
  static async getAllQuizResults(userId: string): Promise<Record<string, QuizResult[]>> {
    try {
      const results = await db
        .select({
          subject: quizResults.subject,
          score: quizResults.score,
          totalQuestions: quizResults.totalQuestions,
          timeSpent: quizResults.timeSpent,
          weakTopics: quizResults.weakTopics,
          createdAt: quizResults.createdAt,
        })
        .from(quizResults)
        .where(eq(quizResults.userId, userId))
        .orderBy(desc(quizResults.createdAt));

      const groupedResults: Record<string, QuizResult[]> = {};
      
      results.forEach((result: any) => {
        const quizResult: QuizResult = {
          score: result.score,
          totalQuestions: result.totalQuestions,
          timeSpent: result.timeSpent,
          weakTopics: JSON.parse(result.weakTopics),
          date: new Date(result.createdAt).toISOString(),
        };

        if (!groupedResults[result.subject]) {
          groupedResults[result.subject] = [];
        }
        groupedResults[result.subject]!.push(quizResult);
      });

      return groupedResults;
    } catch (error) {
      console.error('❌ Error getting all quiz results:', error);
      throw error;
    }
  }

  /**
   * Get recent quiz results (last N tests)
   */
  static async getRecentQuizResults(
    userId: string, 
    subject: string, 
    limit: number = 10
  ): Promise<QuizResult[]> {
    try {
      const results = await db
        .select({
          score: quizResults.score,
          totalQuestions: quizResults.totalQuestions,
          timeSpent: quizResults.timeSpent,
          weakTopics: quizResults.weakTopics,
          createdAt: quizResults.createdAt,
        })
        .from(quizResults)
        .where(
          and(
            eq(quizResults.userId, userId),
            eq(quizResults.subject, subject)
          )
        )
        .orderBy(desc(quizResults.createdAt))
        .limit(limit);

      return results.map((result: any) => ({
        score: result.score,
        totalQuestions: result.totalQuestions,
        timeSpent: result.timeSpent,
        weakTopics: JSON.parse(result.weakTopics),
        date: new Date(result.createdAt).toISOString(),
      }));
    } catch (error) {
      console.error('❌ Error getting recent quiz results:', error);
      throw error;
    }
  }

  /**
   * Update performance analytics for a user and subject
   */
  private static async updatePerformanceAnalytics(userId: string, subject: string): Promise<void> {
    try {
      const results = await this.getQuizResults(userId, subject);
      
      if (results.length === 0) return;

      const totalTests = results.length;
      const averageScore = results.reduce((acc, result) => 
        acc + (result.score / result.totalQuestions) * 100, 0
      ) / totalTests;
      
      const averageTimeSpent = results.reduce((acc, result) => 
        acc + result.timeSpent, 0
      ) / totalTests / 60; // Convert to minutes

      // Aggregate weak topics
      const allWeakTopics: Record<string, number> = {};
      results.forEach(result => {
        Object.entries(result.weakTopics).forEach(([topic, count]) => {
          allWeakTopics[topic] = (allWeakTopics[topic] || 0) + count;
        });
      });

      const analyticsId = `analytics_${userId}_${subject}`;
      
      await db
        .insert(performanceAnalytics)
        .values({
          id: analyticsId,
          userId,
          subject,
          averageScore,
          totalTests,
          averageTimeSpent,
          weakTopics: JSON.stringify(allWeakTopics),
          lastUpdated: new Date(),
        })
        .onConflictDoUpdate({
          target: performanceAnalytics.id,
          set: {
            averageScore,
            totalTests,
            averageTimeSpent,
            weakTopics: JSON.stringify(allWeakTopics),
            lastUpdated: new Date(),
          },
        });

      console.log(`✅ Performance analytics updated for user ${userId}, subject ${subject}`);
    } catch (error) {
      console.error('❌ Error updating performance analytics:', error);
      throw error;
    }
  }

  /**
   * Get performance analytics for a user and subject
   */
  static async getPerformanceAnalytics(userId: string, subject: string) {
    try {
      const analytics = await db
        .select()
        .from(performanceAnalytics)
        .where(
          and(
            eq(performanceAnalytics.userId, userId),
            eq(performanceAnalytics.subject, subject)
          )
        )
        .limit(1);

      if (analytics.length === 0) {
        return null;
      }

      const result = analytics[0];
      return {
        averageScore: result.averageScore,
        totalTests: result.totalTests,
        averageTimeSpent: result.averageTimeSpent,
        weakTopics: JSON.parse(result.weakTopics),
        lastUpdated: new Date(result.lastUpdated),
      };
    } catch (error) {
      console.error('❌ Error getting performance analytics:', error);
      throw error;
    }
  }

  /**
   * Get all performance analytics for a user
   */
  static async getAllPerformanceAnalytics(userId: string) {
    try {
      const analytics = await db
        .select()
        .from(performanceAnalytics)
        .where(eq(performanceAnalytics.userId, userId));

      return analytics.map((result: any) => ({
        subject: result.subject,
        averageScore: result.averageScore,
        totalTests: result.totalTests,
        averageTimeSpent: result.averageTimeSpent,
        weakTopics: JSON.parse(result.weakTopics),
        lastUpdated: new Date(result.lastUpdated),
      }));
    } catch (error) {
      console.error('❌ Error getting all performance analytics:', error);
      throw error;
    }
  }

  /**
   * Delete quiz results for a user and subject
   */
  static async deleteQuizResults(userId: string, subject: string): Promise<void> {
    try {
      await db
        .delete(quizResults)
        .where(
          and(
            eq(quizResults.userId, userId),
            eq(quizResults.subject, subject)
          )
        );

      // Also delete performance analytics
      await db
        .delete(performanceAnalytics)
        .where(
          and(
            eq(performanceAnalytics.userId, userId),
            eq(performanceAnalytics.subject, subject)
          )
        );

      console.log(`✅ Quiz results deleted for user ${userId}, subject ${subject}`);
    } catch (error) {
      console.error('❌ Error deleting quiz results:', error);
      throw error;
    }
  }
} 