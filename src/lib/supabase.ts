import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on your existing schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          difficulty: string;
          question_count: number;
          is_active: boolean;
          created_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: string;
          difficulty: string;
          question_count?: number;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          difficulty?: string;
          question_count?: number;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
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
          formula?: string;
          created_by?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          subject: string;
          topic: string;
          type: string;
          difficulty: string;
          text: string;
          options: string;
          correct_answer: string;
          explanation: string;
          formula?: string;
          created_by?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          subject?: string;
          topic?: string;
          type?: string;
          difficulty?: string;
          text?: string;
          options?: string;
          correct_answer?: string;
          explanation?: string;
          formula?: string;
          created_by?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_results: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          score: number;
          total_questions: number;
          time_spent: number;
          weak_topics: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          score: number;
          total_questions: number;
          time_spent: number;
          weak_topics: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          score?: number;
          total_questions?: number;
          time_spent?: number;
          weak_topics?: string;
          created_at?: string;
        };
      };
      performance_analytics: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          average_score: number;
          total_tests: number;
          average_time_spent: number;
          weak_topics: string;
          last_updated: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          average_score: number;
          total_tests: number;
          average_time_spent: number;
          weak_topics: string;
          last_updated?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          average_score?: number;
          total_tests?: number;
          average_time_spent?: number;
          weak_topics?: string;
          last_updated?: string;
        };
      };
      ai_recommendations: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          recommended_difficulty: string;
          reasoning: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          recommended_difficulty: string;
          reasoning: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          recommended_difficulty?: string;
          reasoning?: string;
          created_at?: string;
        };
      };
      flashcard_progress: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          card_id: string;
          is_known: boolean;
          review_count: number;
          last_reviewed?: string;
          next_review?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          card_id: string;
          is_known?: boolean;
          review_count?: number;
          last_reviewed?: string;
          next_review?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          card_id?: string;
          is_known?: boolean;
          review_count?: number;
          last_reviewed?: string;
          next_review?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// 🔍 BASIC AUTH CHECK FUNCTION
export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth kontrol hatası:', error);
      return { isLoggedIn: false, user: null, error };
    }

    return {
      isLoggedIn: !!session,
      user: session?.user || null,
      error: null
    };
  } catch (error) {
    console.error('Auth kontrol hatası:', error);
    return { isLoggedIn: false, user: null, error };
  }
};

// 🚨 IF NOT LOGGED IN, DO NOT PROCESS
export const requireAuth = async <T>(
  operation: () => Promise<T>
): Promise<{ success: boolean; data?: T; message: string }> => {
  const { isLoggedIn } = await checkAuth();
  
  if (!isLoggedIn) {
    return {
      success: false,
      message: 'Oturum açmanız gerekiyor!'
    };
  }

  try {
    const data = await operation();
    return {
      success: true,
      data,
      message: 'İşlem başarılı'
    };
  } catch (error) {
    return {
      success: false,
      message: 'İşlem başarısız: ' + error
    };
  }
};

// Auth helper functions
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};