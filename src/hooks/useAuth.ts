'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signOut } from '@/lib/supabase';
import { localStorageService } from '@/services/localStorage-service';
import { dataPreservationService } from '@/services/data-preservation-service';

interface DataMigrationResult {
  success: boolean;
  migratedItems: {
    subjects: number;
    questions: number;
    quizResults: number;
    performanceData: number;
  };
  errors: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);

  // Data migration function
  const migrateGuestDataToUser = async (userId: string): Promise<DataMigrationResult> => {
    console.log('🔄 Starting data migration for user:', userId);
    setIsMigrating(true);
    
    const result: DataMigrationResult = {
      success: false,
      migratedItems: { subjects: 0, questions: 0, quizResults: 0, performanceData: 0 },
      errors: []
    };

    try {
      // 1. Migrate Subjects
      const localSubjects = JSON.parse(localStorage.getItem('exam_training_subjects') || '[]');
      if (localSubjects.length > 0) {
        console.log('📚 Migrating subjects:', localSubjects.length);
        
        for (const subject of localSubjects) {
          try {
            const { error } = await supabase
              .from('subjects')
              .upsert({
                name: subject.name,
                description: subject.description,
                category: subject.category,
                difficulty: subject.difficulty,
                question_count: subject.questionCount || 0,
                is_active: subject.isActive ?? true,
                created_by: userId
              });
            
            if (!error) {
              result.migratedItems.subjects++;
            } else {
              result.errors.push(`Subject migration error: ${error.message}`);
            }
          } catch (error) {
            result.errors.push(`Subject migration error: ${error}`);
          }
        }
      }

      // 2. Migrate Questions
      const localQuestions = JSON.parse(localStorage.getItem('exam_training_questions') || '[]');
      if (localQuestions.length > 0) {
        console.log('❓ Migrating questions:', localQuestions.length);
        
        for (const question of localQuestions) {
          try {
            const { error } = await supabase
              .from('questions')
              .upsert({
                subject: question.subject,
                subject_id: `migrated_${question.subject}_${Date.now()}`,
                topic: question.topic || 'General',
                type: question.type,
                difficulty: question.difficulty,
                text: question.text,
                options: JSON.stringify(question.options),
                correct_answer: JSON.stringify(question.options.find((opt: any) => opt.isCorrect)),
                explanation: question.explanation || '',
                formula: question.formula || '',
                created_by: userId,
                is_active: true
              });
            
            if (!error) {
              result.migratedItems.questions++;
            } else {
              result.errors.push(`Question migration error: ${error.message}`);
            }
          } catch (error) {
            result.errors.push(`Question migration error: ${error}`);
          }
        }
      }

      // 3. Migrate Quiz Results
      const quizResults = localStorageService.getQuizResults();
      if (quizResults.length > 0) {
        console.log('📊 Migrating quiz results:', quizResults.length);
        
        for (const result of quizResults) {
          try {
            const { error } = await supabase
              .from('quiz_results')
              .upsert({
                user_id: userId,
                subject: result.subject,
                score: result.score,
                total_questions: result.totalQuestions,
                time_spent: result.timeSpent,
                weak_topics: JSON.stringify(result.weakTopics)
              });
            
            if (!error) {
              result.migratedItems.quizResults++;
            }
          } catch (error) {
            result.errors.push(`Quiz result migration error: ${error}`);
          }
        }
      }

      // 4. Migrate Performance Data
      const performanceData = localStorageService.getPerformanceData();
      if (performanceData.length > 0) {
        console.log('📈 Migrating performance data:', performanceData.length);
        
        for (const perf of performanceData) {
          try {
            const { error } = await supabase
              .from('performance_analytics')
              .upsert({
                user_id: userId,
                subject: perf.subject,
                average_score: perf.averageScore,
                total_tests: perf.totalTests,
                average_time_spent: perf.averageTimeSpent,
                weak_topics: JSON.stringify(perf.weakTopics)
              });
            
            if (!error) {
              result.migratedItems.performanceData++;
            }
          } catch (error) {
            result.errors.push(`Performance data migration error: ${error}`);
          }
        }
      }

      // Mark migration as successful if we migrated any data
      const totalMigrated = Object.values(result.migratedItems).reduce((sum, count) => sum + count, 0);
      result.success = totalMigrated > 0 || result.errors.length === 0;

      console.log('✅ Data migration completed:', result);
      return result;

    } catch (error) {
      console.error('❌ Data migration failed:', error);
      result.errors.push(`Migration failed: ${error}`);
      return result;
    } finally {
      setIsMigrating(false);
    }
  };

  // Sync cloud data to localStorage for offline access
  const syncCloudDataToLocal = async (userId: string) => {
    try {
      console.log('🔄 Syncing cloud data to localStorage...');

      // Sync subjects
      const { data: subjects } = await supabase
        .from('subjects')
        .select('*')
        .eq('created_by', userId);

      if (subjects) {
        const mappedSubjects = subjects.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          difficulty: s.difficulty,
          questionCount: s.question_count,
          isActive: s.is_active
        }));
        localStorage.setItem('exam_training_subjects', JSON.stringify(mappedSubjects));
        console.log('📚 Synced subjects to localStorage:', mappedSubjects.length);
      }

      // Sync questions
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('created_by', userId);

      if (questions) {
        const mappedQuestions = questions.map(q => ({
          id: q.id,
          subject: q.subject,
          type: q.type,
          difficulty: q.difficulty,
          text: q.text,
          options: JSON.parse(q.options),
          explanation: q.explanation,
          topic: q.topic,
          formula: q.formula
        }));
        localStorage.setItem('exam_training_questions', JSON.stringify(mappedQuestions));
        console.log('❓ Synced questions to localStorage:', mappedQuestions.length);
      }

    } catch (error) {
      console.error('❌ Error syncing cloud data to localStorage:', error);
    }
  };

  useEffect(() => {
    // Handle auth state change and URL hash
    const handleAuthState = async () => {
      try {
        console.log('🔍 useAuth: Starting authentication check...');
        
        // Check if there's a hash in the URL (from OAuth callback)
        if (typeof window !== 'undefined' && window.location.hash) {
          console.log('🔗 useAuth: Found URL hash:', window.location.hash);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('✅ useAuth: Found tokens in URL, setting session...');
            // Set the session using the tokens from the URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('❌ useAuth: Error setting session from URL:', error);
            } else {
              console.log('✅ useAuth: Session set successfully:', data.user?.email);
              setUser(data.user);
              
              // Use enhanced migration service
              if (data.user) {
                await dataPreservationService.enhancedMigration(data.user.id);
              }
              
              // Clean up the URL
              window.history.replaceState({}, document.title, window.location.pathname);
            }
            setLoading(false);
            return;
          }
        }

        // Get initial session if no hash params
        console.log('🔍 useAuth: Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ useAuth: Error getting session:', error);
        } else if (session) {
          console.log('✅ useAuth: Found existing session:', session.user.email);
          setUser(session.user);
          // Sync existing user data
          await syncCloudDataToLocal(session.user.id);
        } else {
          console.log('ℹ️ useAuth: No existing session found');
          setUser(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ useAuth: Auth state error:', error);
        setLoading(false);
      }
    };

    handleAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 useAuth: Auth state changed:', event, session?.user?.email || 'no user');
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 useAuth: User signed out');
          setUser(null);
          // Don't clear localStorage on logout - keep data for next login
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('👋 useAuth: User signed in:', session.user.email);
          setUser(session.user);
          
          // Use enhanced migration service
          await dataPreservationService.enhancedMigration(session.user.id);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    console.log('🚪 useAuth: Logging out...');
    await signOut();
    setUser(null);
    // Keep localStorage data for next login
  };

  // Debug logging for current state
  console.log('🎯 useAuth current state:', { 
    user: user?.email || 'none', 
    loading, 
    isMigrating,
    isAuthenticated: !!user 
  });

  return {
    user,
    loading,
    isMigrating,
    logout,
    isAuthenticated: !!user,
    migrateGuestDataToUser,
    syncCloudDataToLocal
  };
} 