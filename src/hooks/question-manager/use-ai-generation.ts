import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { QuestionService } from "@/services/supabase-service";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import type { Question } from "@/lib/types";
import type { InsertTables } from "@/lib/supabase";
import type { AIGeneratedQuestion, AIGenerationResult, Subject } from "@/types/question-manager";

export const useAIGeneration = (
  isAuthenticated: boolean,
  questions: Question[],
  setAIGeneratedQuestions: (questions: AIGeneratedQuestion[]) => void,
  setAIGenerationResult: (result: AIGenerationResult | null) => void,
  setIsGeneratingAI: (loading: boolean) => void,
  setIsCreating: (creating: boolean) => void,
  loadQuestions: () => Promise<void>,
  subjects: Subject[],
  setSubjects: (subjects: Subject[]) => void,
  calculateRealQuestionCount: (subjects: Subject[]) => Promise<Subject[]>,
) => {
  const { toast } = useToast();

  // Generate AI questions
  const generateQuestions = useCallback(async (formData: {
    subject: string;
    topic: string;
    type: "multiple-choice" | "true-false" | "calculation" | "case-study";
    difficulty: "Easy" | "Medium" | "Hard";
    count: number;
    guidelines: string;
  }) => {
    try {
      setIsGeneratingAI(true);
      setAIGeneratedQuestions([]);
      setAIGenerationResult(null);

      // Import the AI question generation service
      const { generateQuestions: aiGenerateQuestions } = await import("@/ai/flows/question-generator");

      // Get existing questions to avoid duplicates
      const existingQuestions = questions
        .filter(q => q.subject === formData.subject && q.topic === formData.topic)
        .map(q => q.text);

      // Call the AI service
      const result = await aiGenerateQuestions({
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty,
        type: formData.type,
        count: formData.count,
        language: "tr", // Turkish language
        existingQuestions: existingQuestions.length > 0 ? existingQuestions : undefined,
        guidelines: formData.guidelines || undefined,
      });

      // Ensure type compatibility by handling optional formula property
      const compatibleQuestions: AIGeneratedQuestion[] = result.questions.map((q) => ({
        ...q,
        formula: q.formula || "",
      }));

      const compatibleResult: AIGenerationResult = {
        ...result,
        questions: compatibleQuestions,
      };

      setAIGeneratedQuestions(compatibleQuestions);
      setAIGenerationResult(compatibleResult);

      toast({
        title: "Başarılı",
        description: `${result.questions.length} soru başarıyla oluşturuldu.`,
      });
    } catch (error) {
      // Check if it's an API key issue
      if (error instanceof Error && error.message.includes("API key")) {
        toast({
          title: "AI Servisi Hatası",
          description: "Google AI API anahtarı bulunamadı. Lütfen GEMINI_API_KEY, GOOGLE_GENAI_API_KEY veya GOOGLE_AI_API_KEY environment variable'ını ayarlayın.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Hata",
          description: "AI soruları oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGeneratingAI(false);
    }
  }, [questions, setAIGeneratedQuestions, setAIGenerationResult, setIsGeneratingAI, toast]);

  // Approve AI questions
  const approveAIQuestions = useCallback(async (
    questionsToAdd: AIGeneratedQuestion[],
    subject: string,
  ) => {
    try {
      setIsCreating(true);

      const newQuestions: Omit<Question, "id">[] = questionsToAdd.map((q) => ({
        subject,
        type: "multiple-choice",
        difficulty: q.difficulty,
        text: q.text,
        options: q.options,
        explanation: q.explanation,
        topic: q.topic,
        formula: q.formula || "",
      }));

      for (const question of newQuestions) {
        if (isAuthenticated) {
          try {
            // Convert to database format
            const dbQuestion: InsertTables<"questions"> = {
              subject_id: subject,
              subject: question.subject,
              topic: question.topic || "",
              type: question.type,
              difficulty: question.difficulty,
              text: question.text,
              options: JSON.stringify(question.options),
              correct_answer: question.options.find(opt => opt.isCorrect)?.text || "",
              explanation: question.explanation,
              formula: question.formula || "",
            };
            await QuestionService.createQuestion(dbQuestion);
          } catch {
            // Fallback to unified storage on Supabase error
            UnifiedStorageService.addQuestion(question);
          }
        } else {
          UnifiedStorageService.addQuestion(question);
        }
      }

      // Reload questions
      await loadQuestions();

      // Recalculate question count for subjects
      const updatedSubjects = await calculateRealQuestionCount(subjects);
      setSubjects(updatedSubjects);

      toast({
        title: "Başarılı",
        description: `${questionsToAdd.length} AI sorusu başarıyla eklendi.`,
      });

      return true;
    } catch {
      toast({
        title: "Hata",
        description: "AI soruları eklenirken bir hata oluştu.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [isAuthenticated, loadQuestions, subjects, setSubjects, calculateRealQuestionCount, setIsCreating, toast]);

  return {
    generateQuestions,
    approveAIQuestions,
  };
};
