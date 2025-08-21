import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { SubjectService, QuestionService } from "@/services/supabase-service";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import { shouldUseDemoData, demoSubjects } from "@/data/demo-data";
import type { Subject } from "@/types/question-manager";
import type { Question } from "@/lib/types";

export const useSubjectManagement = (
  isAuthenticated: boolean,
  setSubjects: (subjects: Subject[]) => void,
  setIsLoadingSubjects: (loading: boolean) => void,
) => {
  const { toast } = useToast();

  // Function to calculate real question count for subjects
  const calculateRealQuestionCount = async (subjects: Subject[]): Promise<Subject[]> => {
    try {
      // Load questions from both localStorage and Supabase (like Quiz page does)
      let allQuestions: Question[] = [];

      if (isAuthenticated) {
        try {
          // Try to load from Supabase first
          const dbQuestions = await QuestionService.getQuestions();
          const cloudQuestions = dbQuestions.map(question => ({
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
          allQuestions = [...cloudQuestions];
        } catch {
          //do nothing
        }
      }

      // Also get local questions and merge
      const localQuestions = UnifiedStorageService.getQuestions();
      localQuestions.forEach(localQ => {
        if (!allQuestions.find(cloudQ => cloudQ.id === localQ.id)) {
          allQuestions.push(localQ);
        }
      });
      const updatedSubjects = subjects.map(subject => {
        const subjectQuestions = allQuestions.filter(q => {
          const normalizedQuestionSubject = q.subject.trim().toLowerCase();
          const normalizedSubjectName = subject.name.trim().toLowerCase();
          return normalizedQuestionSubject === normalizedSubjectName;
        });
        return {
          ...subject,
          questionCount: subjectQuestions.length,
        };
      });

      return updatedSubjects;
    } catch {
      // If calculation fails, return subjects with original counts
      return subjects;
    }
  };

  // Load subjects - Use same simple logic as Subject Manager
  const loadSubjects = useCallback(async () => {
    try {
      console.log("🔄 useSubjectManagement: loadSubjects started");
      console.log("🔄 useSubjectManagement: isAuthenticated:", isAuthenticated);
      
      setIsLoadingSubjects(true);
      let loadedSubjects: Subject[] = [];

      // Check if demo mode is active
      const isDemoMode = shouldUseDemoData();
      if (isDemoMode) {
        // Load demo subjects
        loadedSubjects = demoSubjects.map(demoSubject => ({
          id: demoSubject.id,
          name: demoSubject.name,
          description: demoSubject.description,
          category: demoSubject.category,
          difficulty: demoSubject.difficulty,
          questionCount: demoSubject.questionCount,
          isActive: demoSubject.isActive,
        }));
      } else if (isAuthenticated) {
        try {
          const dbSubjects = await SubjectService.getSubjects();
          console.log("🔄 useSubjectManagement: dbSubjects from Supabase:", dbSubjects);
          if (dbSubjects && dbSubjects.length > 0) {
            // Convert Supabase format to local format
            loadedSubjects = dbSubjects.map(subject => ({
              id: subject.id,
              name: subject.name,
              description: subject.description,
              category: subject.category,
              difficulty: subject.difficulty,
              questionCount: subject.question_count,
              isActive: subject.is_active,
            }));
            
            // Save to localStorage for future use
            localStorage.setItem("akilhane_subjects", JSON.stringify(loadedSubjects));
            console.log("🔄 useSubjectManagement: Saved to localStorage:", loadedSubjects);
          }
        } catch (error) {
          console.error("🔄 useSubjectManagement: Supabase error:", error);
          // Silent fail - continue with empty subjects
        }
      }
      // Calculate real question count for all subjects (skip in demo mode)
      if (isDemoMode) {
        // In demo mode, use the predefined question counts
        setSubjects(loadedSubjects);
      } else {
        const subjectsWithRealCounts = await calculateRealQuestionCount(loadedSubjects);
        setSubjects(subjectsWithRealCounts);
      }
    } catch {
      toast({
        title: "Hata",
        description: "Dersler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSubjects(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, toast]); // Removed stable setter functions

  return {
    loadSubjects,
    calculateRealQuestionCount,
    UnifiedStorageService,
  };
};
