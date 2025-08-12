import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { SubjectService } from "@/services/supabase-service";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import type { Subject } from "@/types/question-manager";

export const useSubjectManagement = (
  isAuthenticated: boolean,
  setSubjects: (subjects: Subject[]) => void,
  setIsLoadingSubjects: (loading: boolean) => void,
) => {
  const { toast } = useToast();

  // Function to calculate real question count for subjects
  const calculateRealQuestionCount = async (subjects: Subject[]): Promise<Subject[]> => {
    try {
      // Get all questions from unified storage to calculate real counts
      const allQuestions = UnifiedStorageService.getQuestions();

      const updatedSubjects = subjects.map(subject => ({
        ...subject,
        questionCount: allQuestions.filter((q: { subject: string }) => q.subject === subject.name).length,
      }));

      return updatedSubjects;
    } catch {
      // If calculation fails, return subjects with original counts
      return subjects;
    }
  };

  // Sync localStorage subjects to Supabase
  const syncLocalStorageSubjectsToSupabase = async (localSubjects: Subject[]) => {
    try {
      for (const subject of localSubjects) {
        try {
          // Add subject to Supabase
          const dbSubject = {
            name: subject.name,
            description: subject.description,
            category: subject.category,
            difficulty: subject.difficulty,
            is_active: subject.isActive,
          };

          const result = await SubjectService.createSubject(dbSubject);
          if (result) {
            // Subject synced to Supabase
          }
        } catch {
          // Silent fail for subject sync errors
        }
      }
    } catch {
      // Silent fail for sync errors
    }
  };

  // Load subjects
  const loadSubjects = useCallback(async () => {
    try {
      setIsLoadingSubjects(true);
      let loadedSubjects: Subject[] = [];

      if (isAuthenticated) {
        try {
          const dbSubjects = await SubjectService.getSubjects();

          // If there are subjects in Supabase, use them, otherwise load from localStorage
          if (dbSubjects && dbSubjects.length > 0) {
            loadedSubjects = dbSubjects.map(subject => ({
              id: subject.id,
              name: subject.name,
              description: subject.description,
              category: subject.category,
              difficulty: subject.difficulty,
              questionCount: subject.question_count,
              isActive: subject.is_active,
            }));
          } else {
            loadedSubjects = UnifiedStorageService.getSubjects();

            // Sync localStorage subjects to Supabase
            if (loadedSubjects.length > 0) {
              syncLocalStorageSubjectsToSupabase(loadedSubjects);
            }
          }
        } catch {
          // Fallback to localStorage on Supabase error
          loadedSubjects = UnifiedStorageService.getSubjects();
        }
      } else {
        loadedSubjects = UnifiedStorageService.getSubjects();
      }

      // Calculate real question count for all subjects
      const subjectsWithRealCounts = await calculateRealQuestionCount(loadedSubjects);
      setSubjects(subjectsWithRealCounts);
    } catch {
      toast({
        title: "Hata",
        description: "Dersler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSubjects(false);
    }
  }, [isAuthenticated, setSubjects, setIsLoadingSubjects, toast]);

  return {
    loadSubjects,
    calculateRealQuestionCount,
    UnifiedStorageService,
  };
};
