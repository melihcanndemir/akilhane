import { eq, and, desc, sql, like } from 'drizzle-orm';
import { db } from '../connection';
import { questions, subjects } from '../schema';
import type { Question } from '@/lib/types';

export class QuestionRepository {
  /**
   * Create a new question
   */
  static async createQuestion(
    subject: string,
    topic: string,
    type: string,
    difficulty: string,
    text: string,
    options: Array<{ text: string; isCorrect: boolean }>,
    correctAnswer: string,
    explanation: string,
    formula?: string,
    createdBy?: string
  ): Promise<string> {
    try {
      const id = `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get subject ID from subject name
      const subjectResult = await db.select({ id: subjects.id }).from(subjects).where(eq(subjects.name, subject)).limit(1);
      
      if (subjectResult.length === 0) {
        throw new Error(`Subject not found: ${subject}`);
      }
      
      const subjectId = subjectResult[0].id;
      
      await db.insert(questions).values({
        id,
        subjectId,
        subject,
        topic,
        type,
        difficulty,
        text,
        options: JSON.stringify(options),
        correctAnswer,
        explanation,
        formula,
        createdBy,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Question created: ${id}`);
      return id;
    } catch (error) {
      console.error('❌ Error creating question:', error);
      throw error;
    }
  }

  /**
   * Get questions by subject
   */
  static async getQuestionsBySubject(subject: string, limit?: number, userId?: string): Promise<Question[]> {
    try {
      const conditions = [
        eq(questions.subject, subject),
        eq(questions.isActive, true)
      ];

      // Add user filter if userId is provided
      if (userId) {
        conditions.push(eq(questions.createdBy, userId));
      }

      const query = db
        .select()
        .from(questions)
        .where(and(...conditions))
        .orderBy(desc(questions.createdAt));

      if (limit) {
        query.limit(limit);
      }

      const results = await query;

      return results.map((result: any) => ({
        id: result.id,
        subject: result.subject,
        type: result.type as any,
        difficulty: result.difficulty as any,
        text: result.text,
        topic: result.topic,
        options: JSON.parse(result.options),
        explanation: result.explanation,
        formula: result.formula,
      }));
    } catch (error) {
      console.error('❌ Error getting questions by subject:', error);
      throw error;
    }
  }

  /**
   * Get questions by topic
   */
  static async getQuestionsByTopic(subject: string, topic: string, limit?: number, userId?: string): Promise<Question[]> {
    try {
      const conditions = [
        eq(questions.subject, subject),
        eq(questions.topic, topic),
        eq(questions.isActive, true)
      ];

      // Add user filter if userId is provided
      if (userId) {
        conditions.push(eq(questions.createdBy, userId));
      }

      const query = db
        .select()
        .from(questions)
        .where(and(...conditions))
        .orderBy(desc(questions.createdAt));

      if (limit) {
        query.limit(limit);
      }

      const results = await query;

      return results.map((result: any) => ({
        id: result.id,
        subject: result.subject,
        type: result.type as any,
        difficulty: result.difficulty as any,
        text: result.text,
        topic: result.topic,
        options: JSON.parse(result.options),
        explanation: result.explanation,
        formula: result.formula,
      }));
    } catch (error) {
      console.error('❌ Error getting questions by topic:', error);
      throw error;
    }
  }

  /**
   * Get questions by difficulty
   */
  static async getQuestionsByDifficulty(
    subject: string, 
    difficulty: 'Easy' | 'Medium' | 'Hard', 
    limit?: number,
    userId?: string
  ): Promise<Question[]> {
    try {
      const conditions = [
        eq(questions.subject, subject),
        eq(questions.difficulty, difficulty),
        eq(questions.isActive, true)
      ];

      // Add user filter if userId is provided
      if (userId) {
        conditions.push(eq(questions.createdBy, userId));
      }

      const query = db
        .select()
        .from(questions)
        .where(and(...conditions))
        .orderBy(desc(questions.createdAt));

      if (limit) {
        query.limit(limit);
      }

      const results = await query;

      return results.map((result: any) => ({
        id: result.id,
        subject: result.subject,
        type: result.type as any,
        difficulty: result.difficulty as any,
        text: result.text,
        topic: result.topic,
        options: JSON.parse(result.options),
        explanation: result.explanation,
        formula: result.formula,
      }));
    } catch (error) {
      console.error('❌ Error getting questions by difficulty:', error);
      throw error;
    }
  }

  /**
   * Get random questions for quiz
   */
  static async getRandomQuestions(
    subject: string, 
    count: number, 
    difficulty?: 'Easy' | 'Medium' | 'Hard',
    userId?: string
  ): Promise<Question[]> {
    try {
      const conditions = [
        eq(questions.subject, subject),
        eq(questions.isActive, true)
      ];

      // Add user filter if userId is provided
      if (userId) {
        conditions.push(eq(questions.createdBy, userId));
      }

      let query = db
        .select()
        .from(questions)
        .where(and(...conditions));

      if (difficulty) {
        query = query.where(eq(questions.difficulty, difficulty));
      }

      const results = await query.limit(count);

      // Shuffle results
      const shuffled = results.sort(() => Math.random() - 0.5);

      return shuffled.map((result: any) => ({
        id: result.id,
        subject: result.subject,
        type: result.type as any,
        difficulty: result.difficulty as any,
        text: result.text,
        topic: result.topic,
        options: JSON.parse(result.options),
        explanation: result.explanation,
        formula: result.formula,
      }));
    } catch (error) {
      console.error('❌ Error getting random questions:', error);
      throw error;
    }
  }

  /**
   * Search questions by text
   */
  static async searchQuestions(
    subject: string, 
    searchTerm: string, 
    limit?: number,
    userId?: string
  ): Promise<Question[]> {
    try {
      const conditions = [
        eq(questions.subject, subject),
        eq(questions.isActive, true),
        like(questions.text, `%${searchTerm}%`)
      ];

      // Add user filter if userId is provided
      if (userId) {
        conditions.push(eq(questions.createdBy, userId));
      }

      const query = db
        .select()
        .from(questions)
        .where(and(...conditions))
        .orderBy(desc(questions.createdAt));

      if (limit) {
        query.limit(limit);
      }

      const results = await query;

      return results.map((result: any) => ({
        id: result.id,
        subject: result.subject,
        type: result.type as any,
        difficulty: result.difficulty as any,
        text: result.text,
        topic: result.topic,
        options: JSON.parse(result.options),
        explanation: result.explanation,
        formula: result.formula,
      }));
    } catch (error) {
      console.error('❌ Error searching questions:', error);
      throw error;
    }
  }

  /**
   * Update a question
   */
  static async updateQuestion(
    id: string,
    updates: Partial<{
      subject: string;
      topic: string;
      type: string;
      difficulty: string;
      text: string;
      options: Array<{ text: string; isCorrect: boolean }>;
      correctAnswer: string;
      explanation: string;
      formula: string;
    }>
  ): Promise<void> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (updates.subject) updateData.subject = updates.subject;
      if (updates.topic) updateData.topic = updates.topic;
      if (updates.type) updateData.type = updates.type;
      if (updates.difficulty) updateData.difficulty = updates.difficulty;
      if (updates.text) updateData.text = updates.text;
      if (updates.options) updateData.options = JSON.stringify(updates.options);
      if (updates.correctAnswer) updateData.correctAnswer = updates.correctAnswer;
      if (updates.explanation) updateData.explanation = updates.explanation;
      if (updates.formula !== undefined) updateData.formula = updates.formula;

      await db
        .update(questions)
        .set(updateData)
        .where(eq(questions.id, id));

      console.log(`✅ Question updated: ${id}`);
    } catch (error) {
      console.error('❌ Error updating question:', error);
      throw error;
    }
  }

  /**
   * Delete a question (soft delete)
   */
  static async deleteQuestion(id: string): Promise<void> {
    try {
      await db
        .update(questions)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(questions.id, id));

      console.log(`✅ Question deleted: ${id}`);
    } catch (error) {
      console.error('❌ Error deleting question:', error);
      throw error;
    }
  }

  /**
   * Get question statistics
   */
  static async getQuestionStats(subject: string, userId?: string) {
    try {
      const conditions = [
        eq(questions.subject, subject),
        eq(questions.isActive, true)
      ];

      // Add user filter if userId is provided
      if (userId) {
        conditions.push(eq(questions.createdBy, userId));
      }

      const stats = await db
        .select({
          total: sql<number>`count(*)`,
          easy: sql<number>`count(case when difficulty = 'Easy' then 1 end)`,
          medium: sql<number>`count(case when difficulty = 'Medium' then 1 end)`,
          hard: sql<number>`count(case when difficulty = 'Hard' then 1 end)`,
        })
        .from(questions)
        .where(and(...conditions));

      return stats[0];
    } catch (error) {
      console.error('❌ Error getting question stats:', error);
      throw error;
    }
  }

  /**
   * Get all topics for a subject
   */
  static async getTopicsBySubject(subject: string, userId?: string): Promise<string[]> {
    try {
      const conditions = [
        eq(questions.subject, subject),
        eq(questions.isActive, true)
      ];

      // Add user filter if userId is provided
      if (userId) {
        conditions.push(eq(questions.createdBy, userId));
      }

      const results = await db
        .selectDistinct({ topic: questions.topic })
        .from(questions)
        .where(and(...conditions));

      return results.map((result: any) => result.topic);
    } catch (error) {
      console.error('❌ Error getting topics by subject:', error);
      throw error;
    }
  }
} 