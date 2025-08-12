import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { QuestionService } from '@/services/supabase-service';
import type { Question } from '@/lib/types';
import { shouldUseDemoData } from '@/data/demo-data';
import { UnifiedStorageService } from '@/services/unified-storage-service';
import { logError } from '@/lib/error-logger';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeQuestionsProps {
  selectedSubject: string;
  isAuthenticated: boolean | null;
}

interface UseRealtimeQuestionsReturn {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Record<string, unknown>;
  old?: Record<string, unknown>;
}

interface SupabaseQuestionRecord {
  id: string;
  subject: string;
  type: string;
  difficulty: string;
  text: string;
  options: string;
  explanation: string;
  topic?: string;
  formula?: string;
}

export function useRealtimeQuestions({
  selectedSubject,
  isAuthenticated,
}: UseRealtimeQuestionsProps): UseRealtimeQuestionsReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Realtime change handler
  const handleRealtimeChange = useCallback((payload: RealtimePayload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        if (newRecord && typeof newRecord === 'object' && 'subject' in newRecord && newRecord.subject === selectedSubject) {
          const newQuestion = mapSupabaseToQuestion(newRecord as unknown as SupabaseQuestionRecord);
          setQuestions((prev) => {
            // Duplicate check
            if (prev.find((q) => q.id === newQuestion.id)) {
              return prev;
            }
            return [newQuestion, ...prev];
          });
        }
        break;

      case 'UPDATE':
        if (newRecord && typeof newRecord === 'object') {
          const updatedQuestion = mapSupabaseToQuestion(newRecord as unknown as SupabaseQuestionRecord);
          setQuestions((prev) => {
            // Update existing question
            const updated = prev.map((q) =>
              q.id === updatedQuestion.id ? updatedQuestion : q,
            );

            // If subject changed and no longer matches selected subject, remove it
            if (newRecord.subject !== selectedSubject) {
              return updated.filter((q) => q.id !== updatedQuestion.id);
            }

            // If subject changed TO selected subject, add it
            if (
              oldRecord?.subject !== selectedSubject &&
              newRecord.subject === selectedSubject
            ) {
              if (!prev.find((q) => q.id === updatedQuestion.id)) {
                return [updatedQuestion, ...prev];
              }
            }

            return updated;
          });
        }
        break;

      case 'DELETE':
        if (oldRecord) {
          setQuestions((prev) => prev.filter((q) => q.id !== oldRecord.id));
        }
        break;
    }
  }, [selectedSubject]);

  // Realtime subscription
  useEffect(() => {
    let subscription: RealtimeChannel | null = null;

    const setupRealtime = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || !isAuthenticated) {
          return;
        }

        // Realtime subscription
        subscription = supabase
          .channel(`questions-${session.user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'questions',
              filter: `created_by=eq.${session.user.id}`,
            },
            (payload) => {
              handleRealtimeChange(payload);
            },
          )
          .subscribe();
      } catch (err) {
        logError('Realtime setup error:', err);
        setError('Realtime connection failed');
      }
    };

    if (isAuthenticated && selectedSubject) {
      setupRealtime();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [isAuthenticated, selectedSubject, handleRealtimeChange]);

  // Initial data fetch
  const fetchQuestions = useCallback(async () => {
    if (!selectedSubject) {
      setQuestions([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Demo mode: merge demo questions with localStorage
      if (shouldUseDemoData()) {
        const allDemoQuestions: Question[] = [
          {
            id: 'demo_q_1',
            subject: 'Matematik',
            type: 'multiple-choice',
            difficulty: 'Medium',
            text: '2x + 5 = 13 denkleminin çözümü nedir?',
            options: [
              { text: 'x = 4', isCorrect: true },
              { text: 'x = 3', isCorrect: false },
              { text: 'x = 5', isCorrect: false },
              { text: 'x = 6', isCorrect: false },
            ],
            explanation: '2x + 5 = 13 → 2x = 8 → x = 4',
            topic: 'Cebir',
          },
          {
            id: 'demo_q_2',
            subject: 'Fizik',
            type: 'multiple-choice',
            difficulty: 'Medium',
            text: 'Hangi kuvvet türü temas gerektirmez?',
            options: [
              { text: 'Sürtünme kuvveti', isCorrect: false },
              { text: 'Yerçekimi kuvveti', isCorrect: true },
              { text: 'Normal kuvvet', isCorrect: false },
              { text: 'Tepki kuvveti', isCorrect: false },
            ],
            explanation: 'Yerçekimi kuvveti uzaktan etki eden bir kuvvettir.',
            topic: 'Mekanik',
          },
        ];

        const demoQuestions = allDemoQuestions.filter(
          (q) => q.subject === selectedSubject,
        );
        const localQuestions = UnifiedStorageService.getQuestionsBySubject(
          selectedSubject,
        );

        setQuestions([...demoQuestions, ...localQuestions]);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // LocalStorage fallback
        const localQuestions = UnifiedStorageService.getQuestionsBySubject(
          selectedSubject,
        );
        setQuestions(localQuestions);
        return;
      }

      const supabaseQuestions =
        await QuestionService.getQuestionsBySubject(selectedSubject);
      const mappedQuestions = supabaseQuestions.map(mapSupabaseToQuestion);

      setQuestions(mappedQuestions);
    } catch (err) {
      logError('Error fetching questions:', err);
      setError('Failed to fetch questions');

      // Fallback to localStorage
      const localQuestions = UnifiedStorageService.getQuestionsBySubject(
        selectedSubject,
      );
      setQuestions(localQuestions);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject]);

  // Load questions when subject changes
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setQuestions([]);
      } else if (event === 'SIGNED_IN') {
        fetchQuestions();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchQuestions]);

  return {
    questions,
    isLoading,
    error,
    refetch: fetchQuestions,
  };
}

// Helper function
function mapSupabaseToQuestion(record: SupabaseQuestionRecord): Question {
  // Type conversion with validation
  const questionType = record.type as "multiple-choice" | "true-false" | "calculation" | "case-study";
  const questionDifficulty = record.difficulty as "Easy" | "Medium" | "Hard";

  return {
    id: record.id,
    subject: record.subject,
    type: questionType,
    difficulty: questionDifficulty,
    text: record.text,
    options: JSON.parse(record.options || '[]'),
    explanation: record.explanation,
    topic: record.topic || "",
    formula: record.formula || "",
  };
}
