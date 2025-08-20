import { toast } from "@/hooks/use-toast";
import { shouldUseDemoData } from "@/data/demo-data";
import { SubjectService } from "@/services/supabase-service";
import { supabase } from "@/lib/supabase";

interface AIGeneratedSubject {
  name: string;
  description: string;
  category: string;
  difficulty: "Başlangıç" | "Orta" | "İleri";
  topics: string[];
  learningObjectives: string[];
  estimatedDuration: string;
  prerequisites: string[];
  keywords: string[];
}

// Subject type for localStorage operations
interface LocalStorageSubject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "Başlangıç" | "Orta" | "İleri";
  questionCount: number;
  isActive: boolean;
}

// LocalStorage service for subjects
class SubjectLocalStorageService {
  private static readonly STORAGE_KEY = "akilhane_subjects";

  static getSubjects(): LocalStorageSubject[] {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveSubjects(subjects: LocalStorageSubject[]): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(subjects));
    } catch {
      //do nothing
    }
  }

  static addSubject(subject: Omit<LocalStorageSubject, "id">): LocalStorageSubject {
    const newSubject: LocalStorageSubject = {
      ...subject,
      id: `subj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const subjects = this.getSubjects();
    subjects.push(newSubject);
    this.saveSubjects(subjects);
    return newSubject;
  }
}

export const handleAIGeneratedSubjects = async (aiSubjects: AIGeneratedSubject[]) => {
  try {
    for (const aiSubject of aiSubjects) {
      const subjectData = {
        name: aiSubject.name,
        description: aiSubject.description,
        category: aiSubject.category,
        difficulty: aiSubject.difficulty,
        questionCount: 0,
        isActive: true,
      };

      if (shouldUseDemoData()) {
        SubjectLocalStorageService.addSubject(subjectData);
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          SubjectLocalStorageService.addSubject(subjectData);
        } else {
          await SubjectService.createSubject({
            name: subjectData.name,
            description: subjectData.description,
            category: subjectData.category,
            difficulty: subjectData.difficulty,
            question_count: 0,
            is_active: true,
          });
        }
      }
    }

    toast({
      title: "Başarılı!",
      description: `${aiSubjects.length} ders başarıyla eklendi`,
    });

    return true;
  } catch {
    toast({
      title: "Hata!",
      description: "Dersler eklenirken bir hata oluştu",
      variant: "destructive",
    });
    return false;
  }
};
