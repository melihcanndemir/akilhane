"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { QuestionService, SubjectService } from "@/services/supabase-service";
import { supabase } from "@/lib/supabase";
import type { Question } from "@/lib/types";
import type { InsertTables, UpdateTables } from "@/lib/supabase";
import QuestionManagerMain from "./components/question-manager-main";
import type {
  Subject,
  AIGeneratedQuestion,
  AIGenerationResult,
} from "@/types/question-manager";

// Define proper interface for AI form data
interface AIFormData {
  subject: string;
  topic: string;
  type: "multiple-choice" | "true-false" | "calculation" | "case-study";
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
  guidelines: string;
}

// LocalStorage service for questions (fallback)
class QuestionLocalStorageService {
  private static readonly STORAGE_KEY = "exam_training_questions";

  static getQuestions(): Question[] {
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

  static saveQuestions(questions: Question[]): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(questions));
    } catch {
      // Silent fail for localStorage errors
    }
  }

  static addQuestion(question: Omit<Question, "id">): Question {
    const newQuestion: Question = {
      ...question,
      id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const questions = this.getQuestions();
    questions.push(newQuestion);
    this.saveQuestions(questions);

    return newQuestion;
  }

  static updateQuestion(id: string, updates: Partial<Question>): boolean {
    const questions = this.getQuestions();
    const index = questions.findIndex((q) => q.id === id);
    if (index === -1) {
      return false;
    }

    const existingQuestion = questions[index];
    if (existingQuestion) {
      questions[index] = {
        id: existingQuestion.id,
        subject: existingQuestion.subject,
        type: existingQuestion.type,
        difficulty: existingQuestion.difficulty,
        text: existingQuestion.text,
        options: existingQuestion.options,
        explanation: existingQuestion.explanation,
        topic: existingQuestion.topic || "",
        formula: existingQuestion.formula || "",
        ...updates,
      };
    }
    this.saveQuestions(questions);
    return true;
  }

  static deleteQuestion(id: string): boolean {
    const questions = this.getQuestions();
    const filtered = questions.filter((q) => q.id !== id);
    if (filtered.length === questions.length) {
      return false;
    }

    this.saveQuestions(filtered);
    return true;
  }

  static getQuestionsBySubject(subject: string): Question[] {
    const questions = this.getQuestions();
    return questions.filter((q) => q.subject === subject);
  }
}

// LocalStorage service for subjects (fallback)
class SubjectLocalStorageService {
  private static readonly STORAGE_KEY = "exam_training_subjects";

  static getSubjects(): Subject[] {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const subjects = stored ? JSON.parse(stored) : [];
      return subjects;
    } catch {
      // Silent fail for localStorage errors
      return [];
    }
  }

  static saveSubjects(subjects: Subject[]): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(subjects));
    } catch {
      // Silent fail for localStorage errors
    }
  }

  static addSubject(subject: Omit<Subject, "id">): Subject {
    const newSubject: Subject = {
      ...subject,
      id: `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const subjects = this.getSubjects();
    subjects.push(newSubject);
    this.saveSubjects(subjects);
    return newSubject;
  }

  static updateSubject(id: string, updates: Partial<Subject>): boolean {
    const subjects = this.getSubjects();
    const index = subjects.findIndex((s) => s.id === id);
    if (index === -1) {
      return false;
    }

    const existingSubject = subjects[index];
    if (existingSubject) {
      subjects[index] = {
        ...existingSubject,
        ...updates,
      };
      this.saveSubjects(subjects);
      return true;
    }
    return false;
  }

  static deleteSubject(id: string): boolean {
    const subjects = this.getSubjects();
    const filtered = subjects.filter((s) => s.id !== id);
    if (filtered.length === subjects.length) {
      return false;
    }

    this.saveSubjects(filtered);
    return true;
  }
}

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Başlangıçta false
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();

  // AI Generation states
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedQuestions, setAIGeneratedQuestions] = useState<
    AIGeneratedQuestion[]
  >([]);
  const [aiGenerationResult, setAIGenerationResult] =
    useState<AIGenerationResult | null>(null);

  const [aiFormData, setAIFormData] = useState({
    subject: "",
    topic: "",
    type: "multiple-choice" as
      | "multiple-choice"
      | "true-false"
      | "calculation"
      | "case-study",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    count: 5,
    guidelines: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    type: "Çoktan Seçmeli",
    difficulty: "Orta",
    text: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    explanation: "",
    formula: "",
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Gerçek bir session var mı kontrol et
        const hasSession = Boolean(session?.access_token);

        // Eğer session varsa, gerçekten çalışıyor mu test et
        if (hasSession) {
          try {
            // Test: Supabase'den basit bir veri çekmeye çalış
            const testResult = await supabase.from('subjects').select('count').limit(1);

            // Eğer hata varsa veya data null ise, gerçek authentication yok
            if (testResult.error || testResult.data === null) {
              setIsAuthenticated(false);
              return;
            }

            setIsAuthenticated(true);
          } catch {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Sign in olduğunda test et
        try {
          const testResult = await supabase.from('subjects').select('count').limit(1);
          if (testResult.error || testResult.data === null) {
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
        } catch {
          setIsAuthenticated(false);
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Function to calculate real question count for subjects
  const calculateRealQuestionCount = async (subjects: Subject[]): Promise<Subject[]> => {
    try {
             // Get all questions from localStorage to calculate real counts
       const allQuestions = QuestionLocalStorageService.getQuestions();

       return subjects.map(subject => ({
        ...subject,
        questionCount: allQuestions.filter(q => q.subject === subject.name).length,
      }));
    } catch {
      // If calculation fails, return subjects with original counts
      return subjects;
    }
  };

  const loadSubjects = useCallback(async () => {
    try {
      setIsLoadingSubjects(true);
      let loadedSubjects: Subject[] = [];

      if (isAuthenticated) {
        try {
          const dbSubjects = await SubjectService.getSubjects();

          // Eğer Supabase'de ders varsa onları kullan, yoksa localStorage'dan yükle
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
            loadedSubjects = SubjectLocalStorageService.getSubjects();

            // localStorage'daki dersleri Supabase'e senkronize et
            if (loadedSubjects.length > 0) {
              syncLocalStorageSubjectsToSupabase(loadedSubjects);
            }
          }
        } catch {
          // Fallback to localStorage on Supabase error
          loadedSubjects = SubjectLocalStorageService.getSubjects();
        }
      } else {
        loadedSubjects = SubjectLocalStorageService.getSubjects();
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
  }, [isAuthenticated, toast]);

  // Load subjects and questions
  useEffect(() => {
    if (isAuthenticated !== null) { // Sadece authentication durumu belirlendiğinde çağır
      loadSubjects();
    } else {
      // isAuthenticated is null, skipping loadSubjects
    }
  }, [isAuthenticated, loadSubjects]); // Include loadSubjects in dependencies

  // localStorage'daki dersleri Supabase'e senkronize et
  const syncLocalStorageSubjectsToSupabase = async (localSubjects: Subject[]) => {
    try {
      for (const subject of localSubjects) {
        try {
          // Supabase'e ders ekle
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

    const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      let loadedQuestions: Question[] = [];

      if (isAuthenticated) {
        try {
          if (selectedSubject && selectedSubject.trim() !== "") {
            // Belirli bir ders için Supabase'den yükle
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
            // Tüm soruları localStorage'dan yükle (Supabase'de getQuestions metodu yok)
            loadedQuestions = QuestionLocalStorageService.getQuestions();
          }
        } catch {
          // Supabase hatası durumunda localStorage'dan yükle
          if (selectedSubject && selectedSubject.trim() !== "") {
            loadedQuestions = QuestionLocalStorageService.getQuestionsBySubject(selectedSubject);
          } else {
            loadedQuestions = QuestionLocalStorageService.getQuestions();
          }
        }
      } else {
        // Authentication yoksa localStorage'dan yükle
        if (selectedSubject && selectedSubject.trim() !== "") {
          loadedQuestions = QuestionLocalStorageService.getQuestionsBySubject(selectedSubject);
        } else {
          loadedQuestions = QuestionLocalStorageService.getQuestions();
        }
      }

      setQuestions(loadedQuestions);
    } catch {
      toast({
        title: "Hata",
        description: "Sorular yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject, isAuthenticated, toast]);

  // Sadece selectedSubject değiştiğinde soruları yükle
  useEffect(() => {
    loadQuestions();
  }, [selectedSubject, loadQuestions]);

  const handleCreateQuestion = async () => {
    if (!formData.subject || !formData.text || !formData.explanation) {
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === "Çoktan Seçmeli" && formData.options.length < 2) {
      toast({
        title: "Hata",
        description: "Çoktan seçmeli sorular için en az 2 seçenek gerekli.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

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
            createdQuestion = QuestionLocalStorageService.addQuestion(newQuestion);
          }
        } catch {
          // Fallback to localStorage on Supabase error
          createdQuestion = QuestionLocalStorageService.addQuestion(newQuestion);
        }
      } else {
        createdQuestion = QuestionLocalStorageService.addQuestion(newQuestion);
      }

      setQuestions(prev => [...prev, createdQuestion]);

      // Recalculate question count for subjects
      const updatedSubjects = await calculateRealQuestionCount(subjects);
      setSubjects(updatedSubjects);

      // Reset form
      setFormData({
        subject: "",
        topic: "",
        type: "Çoktan Seçmeli",
        difficulty: "Orta",
        text: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        explanation: "",
        formula: "",
      });

      toast({
        title: "Başarılı",
        description: "Soru başarıyla oluşturuldu.",
      });
    } catch {
      toast({
        title: "Hata",
        description: "Soru oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      if (isAuthenticated) {
        try {
          await QuestionService.deleteQuestion(questionId);
        } catch {
          // Fallback to localStorage on Supabase error
          QuestionLocalStorageService.deleteQuestion(questionId);
        }
      } else {
        QuestionLocalStorageService.deleteQuestion(questionId);
      }

      setQuestions(prev => prev.filter(q => q.id !== questionId));

      // Recalculate question count for subjects
      const updatedSubjects = await calculateRealQuestionCount(subjects);
      setSubjects(updatedSubjects);

      toast({
        title: "Başarılı",
        description: "Soru başarıyla silindi.",
      });
    } catch {
      toast({
        title: "Hata",
        description: "Soru silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) {return;}

    try {
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
          await QuestionService.updateQuestion(editingQuestion.id, updateData);
        } catch {
          // Fallback to localStorage on Supabase error
          QuestionLocalStorageService.updateQuestion(editingQuestion.id, editingQuestion);
        }
      } else {
        QuestionLocalStorageService.updateQuestion(editingQuestion.id, editingQuestion);
      }

      setQuestions(prev =>
        prev.map(q => q.id === editingQuestion.id ? editingQuestion : q),
      );

      // Recalculate question count for subjects
      const updatedSubjects = await calculateRealQuestionCount(subjects);
      setSubjects(updatedSubjects);

      setIsEditDialogOpen(false);
      setEditingQuestion(null);

      toast({
        title: "Başarılı",
        description: "Soru başarıyla güncellendi.",
      });
    } catch {
      toast({
        title: "Hata",
        description: "Soru güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleAIGenerate = async (formData: AIFormData) => {
    try {
      setIsGeneratingAI(true);
      setAIGeneratedQuestions([]);
      setAIGenerationResult(null);

      // Update the AI form data state
      setAIFormData(formData);

      // Import the AI question generation service
      const { generateQuestions } = await import("@/ai/flows/question-generator");

      // Get existing questions to avoid duplicates
      const existingQuestions = questions
        .filter(q => q.subject === formData.subject && q.topic === formData.topic)
        .map(q => q.text);

      // Call the AI service
      const result = await generateQuestions({
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
      const compatibleQuestions: AIGeneratedQuestion[] = result.questions.map(q => ({
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
  };

  const handleApproveAIQuestions = async (questionsToAdd: AIGeneratedQuestion[]) => {
    try {
      setIsCreating(true);

      const newQuestions: Omit<Question, "id">[] = questionsToAdd.map(q => ({
        subject: aiFormData.subject,
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
              subject_id: aiFormData.subject,
              subject: aiFormData.subject,
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
            // Fallback to localStorage on Supabase error
            QuestionLocalStorageService.addQuestion(question);
          }
        } else {
          QuestionLocalStorageService.addQuestion(question);
        }
      }

      // Reload questions
      await loadQuestions();

      // Recalculate question count for subjects
      const updatedSubjects = await calculateRealQuestionCount(subjects);
      setSubjects(updatedSubjects);

      // Reset AI dialog
      setIsAIDialogOpen(false);
      setAIGeneratedQuestions([]);
      setAIGenerationResult(null);

      toast({
        title: "Başarılı",
        description: `${questionsToAdd.length} AI sorusu başarıyla eklendi.`,
      });
    } catch {
      toast({
        title: "Hata",
        description: "AI soruları eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <QuestionManagerMain
      subjects={subjects}
      questions={questions}
      selectedSubject={selectedSubject}
      searchTerm={searchTerm}
      filterDifficulty={filterDifficulty}
      isLoading={isLoading}
      isLoadingSubjects={isLoadingSubjects}
      isCreating={isCreating}
      isEditDialogOpen={isEditDialogOpen}
      editingQuestion={editingQuestion}
      isAIDialogOpen={isAIDialogOpen}
      isGeneratingAI={isGeneratingAI}
      aiGeneratedQuestions={aiGeneratedQuestions}
      aiGenerationResult={aiGenerationResult}
      isAuthenticated={isAuthenticated}
      isHydrated={isHydrated}
      formData={formData}
      onSubjectChange={setSelectedSubject}
      onSearchChange={setSearchTerm}
      onDifficultyFilterChange={setFilterDifficulty}
      onFormDataChange={(field, value) => setFormData({ ...formData, [field]: value })}
      onOptionChange={(index, field, value) => {
        const newOptions = [...formData.options];
        if (newOptions[index]) {
          newOptions[index] = { ...newOptions[index], [field]: value };
          setFormData({ ...formData, options: newOptions });
        }
      }}
      onAddOption={() => {
        setFormData({
          ...formData,
          options: [...formData.options, { text: "", isCorrect: false }],
        });
      }}
      onRemoveOption={(index) => {
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: newOptions });
      }}
      onSubmit={handleCreateQuestion}
      onReset={() => {
        setFormData({
          subject: "",
          topic: "",
          type: "Çoktan Seçmeli",
          difficulty: "Orta",
          text: "",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
          explanation: "",
          formula: "",
        });
      }}
      onEditQuestion={(question) => {
        setEditingQuestion(question);
        setIsEditDialogOpen(true);
      }}
      onDeleteQuestion={handleDeleteQuestion}
      onEditDialogOpenChange={setIsEditDialogOpen}
      onAIDialogOpenChange={setIsAIDialogOpen}
      onAIGenerate={handleAIGenerate}
      onAIApprove={handleApproveAIQuestions}
      onEditOptionChange={(index, field, value) => {
        if (!editingQuestion) {return;}
        const newOptions = [...editingQuestion.options];
        if (newOptions[index]) {
          newOptions[index] = { ...newOptions[index], [field]: value };
          setEditingQuestion({ ...editingQuestion, options: newOptions });
        }
      }}
      onEditAddOption={() => {
        if (!editingQuestion) {return;}
        setEditingQuestion({
          ...editingQuestion,
          options: [...editingQuestion.options, { text: "", isCorrect: false }],
        });
      }}
      onEditRemoveOption={(index) => {
        if (!editingQuestion) {return;}
        const newOptions = editingQuestion.options.filter((_, i) => i !== index);
        setEditingQuestion({ ...editingQuestion, options: newOptions });
      }}
      onEditQuestionChange={(field, value) => {
        if (!editingQuestion) {return;}
        setEditingQuestion({ ...editingQuestion, [field]: value });
      }}
      onUpdateQuestion={handleUpdateQuestion}
    />
  );
}
