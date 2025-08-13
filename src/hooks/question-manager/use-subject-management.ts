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

  // Load subjects - Use same simple logic as Subject Manager
  const loadSubjects = useCallback(async () => {
    try {
      console.log("🔄 useSubjectManagement: loadSubjects started");
      console.log("🔄 useSubjectManagement: isAuthenticated:", isAuthenticated);
      
      setIsLoadingSubjects(true);
      
      // Use same simple logic as Subject Manager for consistency
      let loadedSubjects = UnifiedStorageService.getSubjects();
      console.log("🔄 useSubjectManagement: loadedSubjects from UnifiedStorageService:", loadedSubjects);
      console.log("🔄 useSubjectManagement: loadedSubjects length:", loadedSubjects.length);
      
      // If authenticated and no local subjects, try to sync from Supabase
      if (isAuthenticated && loadedSubjects.length === 0) {
        console.log("🔄 useSubjectManagement: Trying to load from Supabase...");
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

      // Calculate real question count for all subjects
      const subjectsWithRealCounts = await calculateRealQuestionCount(loadedSubjects);
      console.log("🔄 useSubjectManagement: Final subjects to set:", subjectsWithRealCounts);
      setSubjects(subjectsWithRealCounts);
    } catch (error) {
      console.error("🔄 useSubjectManagement: General error:", error);
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
