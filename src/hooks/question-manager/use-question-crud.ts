import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { QuestionService } from "@/services/supabase-service";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import type { Question } from "@/lib/types";
import type { InsertTables, UpdateTables } from "@/lib/supabase";
import type { Subject, QuestionFormData } from "@/types/question-manager";

export const useQuestionCRUD = (
  isAuthenticated: boolean,
  setQuestions: (questions: Question[] | ((prev: Question[]) => Question[])) => void,
  subjects: Subject[],
  setSubjects: (subjects: Subject[]) => void,
  calculateRealQuestionCount: (subjects: Subject[]) => Promise<Subject[]>,
) => {
  const { toast } = useToast();

  // Load questions
  const loadQuestions = useCallback(async (selectedSubject: string) => {
    try {
      let loadedQuestions: Question[] = [];

      if (isAuthenticated) {
        try {
          if (selectedSubject && selectedSubject.trim() !== "") {
            // Load questions for specific subject from Supabase
            const dbQuestions = await QuestionService.getQuestionsBySubject(selectedSubject);
            loadedQuestions = dbQuestions.map(question => ({
              id: question.id,
              subject: question.subject,
              type: question.type as "multiple-choice" | "true-false" | "calculation" | "case-study",
              difficulty: question.difficulty as "Easy" | "Medium" | "Hard",
              text: question.text,
              options: JSON.parse(question.options || "[]"),
              explanation: question.explanation,
              topic: question.topic || "",
              formula: question.formula || "",
            }));
          } else {
            // Load all questions from unified storage (no getQuestions method in Supabase)
            loadedQuestions = UnifiedStorageService.getQuestions();
          }
        } catch {
          // Fallback to unified storage on Supabase error
          if (selectedSubject && selectedSubject.trim() !== "") {
            loadedQuestions = UnifiedStorageService.getQuestionsBySubject(selectedSubject);
          } else {
            loadedQuestions = UnifiedStorageService.getQuestions();
          }
        }
      } else {
        // Load from unified storage if not authenticated
        if (selectedSubject && selectedSubject.trim() !== "") {
          loadedQuestions = UnifiedStorageService.getQuestionsBySubject(selectedSubject);
        } else {
          loadedQuestions = UnifiedStorageService.getQuestions();
        }
      }

      setQuestions(loadedQuestions);
    } catch {
      toast({
        title: "Hata",
        description: "Sorular yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, setQuestions, toast]);

  // Create question
  const createQuestion = useCallback(async (formData: QuestionFormData) => {
    if (!formData.subject || !formData.text || !formData.explanation) {
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.type === "Çoktan Seçmeli" && formData.options.length < 2) {
      toast({
        title: "Hata",
        description: "Çoktan seçmeli sorular için en az 2 seçenek gerekli.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const newQuestion: Omit<Question, "id"> = {
        subject: formData.subject,
        type: formData.type === "Çoktan Seçmeli" ? "multiple-choice" :
              formData.type === "Doğru/Yanlış" ? "true-false" :
              formData.type === "Hesaplama" ? "calculation" : "case-study",
        difficulty: formData.difficulty === "Kolay" ? "Easy" :
                  formData.difficulty === "Orta" ? "Medium" : "Hard",
        text: formData.text,
        options: formData.options,
        explanation: formData.explanation,
        topic: formData.topic,
        formula: formData.formula,
      };

      let createdQuestion: Question;

      if (isAuthenticated) {
        try {
          // Convert to database format
          const dbQuestion: InsertTables<"questions"> = {
            subject_id: formData.subject,
            subject: formData.subject,
            topic: formData.topic || "",
            type: newQuestion.type,
            difficulty: newQuestion.difficulty,
            text: newQuestion.text,
            options: JSON.stringify(newQuestion.options),
            correct_answer: newQuestion.options.find(opt => opt.isCorrect)?.text || "",
            explanation: newQuestion.explanation,
            formula: newQuestion.formula || "",
          };

          const result = await QuestionService.createQuestion(dbQuestion);

          if (result) {
            // Convert database result to local Question type
            createdQuestion = {
              id: result.id,
              subject: result.subject,
              type: result.type as "multiple-choice" | "true-false" | "calculation" | "case-study",
              difficulty: result.difficulty as "Easy" | "Medium" | "Hard",
              text: result.text,
              options: JSON.parse(result.options || "[]"),
              explanation: result.explanation,
              topic: result.topic || "",
              formula: result.formula || "",
            };
          } else {
            createdQuestion = UnifiedStorageService.addQuestion(newQuestion);
          }
        } catch {
          // Fallback to unified storage on Supabase error
          createdQuestion = UnifiedStorageService.addQuestion(newQuestion);
        }
      } else {
        createdQuestion = UnifiedStorageService.addQuestion(newQuestion);
      }

            setQuestions((prev: Question[]) => [...prev, createdQuestion]);

      // Recalculate question count for subjects
      const updatedSubjects = await calculateRealQuestionCount(subjects);
      setSubjects(updatedSubjects);
        
      toast({
        title: "Başarılı",
        description: "Soru başarıyla oluşturuldu.",
      });

      return true;
    } catch {
      toast({
        title: "Hata",
        description: "Soru oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
      return false;
    }
  }, [isAuthenticated, setQuestions, subjects, setSubjects, calculateRealQuestionCount, toast]);

  // Update question
  const updateQuestion = useCallback(async (editingQuestion: Question) => {
    if (!editingQuestion) {
      console.error("🔴 No question provided for update");
      return false;
    }

    console.log("🔍 Starting question update:", editingQuestion.id);

    try {
      let updateSuccess = false;

      if (isAuthenticated) {
        try {
          const updateData: UpdateTables<"questions"> = {
            subject_id: editingQuestion.subject,
            subject: editingQuestion.subject,
            topic: editingQuestion.topic || "",
            type: editingQuestion.type,
            difficulty: editingQuestion.difficulty,
            text: editingQuestion.text,
            options: JSON.stringify(editingQuestion.options),
            correct_answer: editingQuestion.options.find(opt => opt.isCorrect)?.text || "",
            explanation: editingQuestion.explanation,
            formula: editingQuestion.formula || "",
          };
          
                    console.log("🔍 Attempting to update question in Supabase:", {
            id: editingQuestion.id,
            updateData
          });
          
          console.log("🔍 Calling QuestionService.updateQuestion...");
          const result = await QuestionService.updateQuestion(editingQuestion.id, updateData);
          console.log("🔍 QuestionService.updateQuestion returned:", result);
          
          if (result) {
            console.log("✅ Supabase update successful");
            updateSuccess = true;
          } else {
            console.warn("⚠️ Supabase update returned null, falling back to localStorage");
            const localUpdateSuccess = UnifiedStorageService.updateQuestion(editingQuestion.id, editingQuestion);
            console.log("🔍 localStorage update result:", localUpdateSuccess);
            updateSuccess = localUpdateSuccess;
          }
        } catch (error) {
          console.error("🔴 Supabase update error:", error);
          // Fallback to unified storage on Supabase error
          const localUpdateSuccess = UnifiedStorageService.updateQuestion(editingQuestion.id, editingQuestion);
          updateSuccess = localUpdateSuccess;
        }
      } else {
        // Not authenticated, use localStorage only
        const localUpdateSuccess = UnifiedStorageService.updateQuestion(editingQuestion.id, editingQuestion);
        updateSuccess = localUpdateSuccess;
      }

      // Always update state if any storage method succeeded
      if (updateSuccess) {
        console.log("🔄 Updating local state");
        setQuestions((prev: Question[]) =>
          prev.map((q: Question) => q.id === editingQuestion.id ? editingQuestion : q)
        );

        // Recalculate question count for subjects
        try {
          const updatedSubjects = await calculateRealQuestionCount(subjects);
          setSubjects(updatedSubjects);
        } catch (subjectError) {
          console.warn("⚠️ Failed to recalculate subject counts:", subjectError);
        }

        toast({
          title: "Başarılı",
          description: "Soru başarıyla güncellendi.",
        });

        return true;
      } else {
        console.error("🔴 All update methods failed");
        toast({
          title: "Hata",
          description: "Soru güncellenirken bir hata oluştu. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("🔴 Update question error:", error);
      toast({
        title: "Hata",
        description: "Soru güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
      return false;
    }
  }, [isAuthenticated, setQuestions, subjects, setSubjects, calculateRealQuestionCount, toast]);

  // Delete question
  const deleteQuestion = useCallback(async (questionId: string) => {
    try {
      if (isAuthenticated) {
        try {
          await QuestionService.deleteQuestion(questionId);
        } catch {
          // Fallback to unified storage on Supabase error
          UnifiedStorageService.deleteQuestion(questionId);
        }
      } else {
        UnifiedStorageService.deleteQuestion(questionId);
      }

      setQuestions((prev: Question[]) => prev.filter((q: Question) => q.id !== questionId));

      // Recalculate question count for subjects
      const updatedSubjects = await calculateRealQuestionCount(subjects);
      setSubjects(updatedSubjects);

      toast({
        title: "Başarılı",
        description: "Soru başarıyla silindi.",
      });

      return true;
    } catch {
      toast({
        title: "Hata",
        description: "Soru silinirken bir hata oluştu.",
        variant: "destructive",
      });
      return false;
    }
  }, [isAuthenticated, setQuestions, subjects, setSubjects, calculateRealQuestionCount, toast]);

  return {
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    UnifiedStorageService,
  };
};
