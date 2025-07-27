import { supabase } from '@/lib/supabase';
import type { Tables, InsertTables, UpdateTables } from '@/lib/supabase';

// Types
export type User = Tables<'users'>;
export type Subject = Tables<'subjects'>;
export type Question = Tables<'questions'>;
export type QuizResult = Tables<'quiz_results'>;
export type PerformanceAnalytics = Tables<'performance_analytics'>;
export type AIRecommendation = Tables<'ai_recommendations'>;
export type FlashcardProgress = Tables<'flashcard_progress'>;

// User Service
export class UserService {
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async createUser(email: string, name: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }
}

// Subject Service
export class SubjectService {
  static async getSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }

    return data || [];
  }

  static async createSubject(subject: InsertTables<'subjects'>): Promise<Subject | null> {
    console.log('🎯 SubjectService.createSubject - Input:', subject);
    
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        ...subject,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    console.log('🎯 SubjectService.createSubject - Response data:', data);
    console.log('🎯 SubjectService.createSubject - Response error:', error);

    if (error) {
      console.error('Error creating subject:', error);
      return null;
    }

    return data;
  }

  static async updateSubject(id: string, updates: UpdateTables<'subjects'>): Promise<Subject | null> {
    const { data, error } = await supabase
      .from('subjects')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subject:', error);
      return null;
    }

    return data;
  }

  static async deleteSubject(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subject:', error);
      return false;
    }

    return true;
  }

  static async toggleActive(id: string, isActive: boolean): Promise<Subject | null> {
    return this.updateSubject(id, { is_active: isActive });
  }
}

// Question Service
export class QuestionService {
  static async getQuestionsBySubject(subject: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }

    return data || [];
  }

  static async createQuestion(question: InsertTables<'questions'>): Promise<Question | null> {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        ...question,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      return null;
    }

    return data;
  }

  static async updateQuestion(id: string, updates: UpdateTables<'questions'>): Promise<Question | null> {
    const { data, error } = await supabase
      .from('questions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating question:', error);
      return null;
    }

    return data;
  }

  static async deleteQuestion(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      return false;
    }

    return true;
  }
}

// Quiz Result Service
export class QuizResultService {
  static async saveQuizResult(result: InsertTables<'quiz_results'>): Promise<QuizResult | null> {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        ...result,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving quiz result:', error);
      return null;
    }

    return data;
  }

  static async getQuizResultsByUser(userId: string): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz results:', error);
      return [];
    }

    return data || [];
  }

  static async getQuizResultsBySubject(subject: string): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('subject', subject)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz results:', error);
      return [];
    }

    return data || [];
  }
}

// Performance Analytics Service
export class PerformanceAnalyticsService {
  static async saveAnalytics(analytics: InsertTables<'performance_analytics'>): Promise<PerformanceAnalytics | null> {
    const { data, error } = await supabase
      .from('performance_analytics')
      .upsert({
        ...analytics,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving analytics:', error);
      return null;
    }

    return data;
  }

  static async getAnalyticsByUser(userId: string): Promise<PerformanceAnalytics[]> {
    const { data, error } = await supabase
      .from('performance_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('last_updated', { ascending: false });

    if (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }

    return data || [];
  }
}

// AI Recommendation Service
export class AIRecommendationService {
  static async saveRecommendation(recommendation: InsertTables<'ai_recommendations'>): Promise<AIRecommendation | null> {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .insert({
        ...recommendation,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving AI recommendation:', error);
      return null;
    }

    return data;
  }

  static async getRecommendationsByUser(userId: string): Promise<AIRecommendation[]> {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching AI recommendations:', error);
      return [];
    }

    return data || [];
  }
}

// Flashcard Progress Service
export class FlashcardProgressService {
  static async saveProgress(progress: InsertTables<'flashcard_progress'>): Promise<FlashcardProgress | null> {
    const { data, error } = await supabase
      .from('flashcard_progress')
      .upsert({
        ...progress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving flashcard progress:', error);
      return null;
    }

    return data;
  }

  static async getProgressByUser(userId: string): Promise<FlashcardProgress[]> {
    const { data, error } = await supabase
      .from('flashcard_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching flashcard progress:', error);
      return [];
    }

    return data || [];
  }

  static async getProgressBySubject(userId: string, subject: string): Promise<FlashcardProgress[]> {
    const { data, error } = await supabase
      .from('flashcard_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('subject', subject)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching flashcard progress:', error);
      return [];
    }

    return data || [];
  }
} 