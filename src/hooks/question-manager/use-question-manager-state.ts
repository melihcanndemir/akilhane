import { useState, useEffect } from "react";
import type { Question } from "@/lib/types";
import type { Subject, AIGeneratedQuestion, AIGenerationResult } from "@/types/question-manager";

export const useQuestionManagerState = () => {
  // Core state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  // AI states
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedQuestions, setAIGeneratedQuestions] = useState<AIGeneratedQuestion[]>([]);
  const [aiGenerationResult, setAIGenerationResult] = useState<AIGenerationResult | null>(null);

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

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

  // AI form state
  const [aiFormData, setAIFormData] = useState({
    subject: "",
    topic: "",
    type: "multiple-choice" as "multiple-choice" | "true-false" | "calculation" | "case-study",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    count: 5,
    guidelines: "",
  });

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    // State
    questions,
    subjects,
    isLoading,
    isLoadingSubjects,
    isCreating,
    selectedSubject,
    searchTerm,
    filterDifficulty,
    isEditDialogOpen,
    editingQuestion,
    isAIDialogOpen,
    isGeneratingAI,
    aiGeneratedQuestions,
    aiGenerationResult,
    isAuthenticated,
    isHydrated,
    formData,
    aiFormData,

    // Setters
    setQuestions,
    setSubjects,
    setIsLoading,
    setIsLoadingSubjects,
    setIsCreating,
    setSelectedSubject,
    setSearchTerm,
    setFilterDifficulty,
    setIsEditDialogOpen,
    setEditingQuestion,
    setIsAIDialogOpen,
    setIsGeneratingAI,
    setAIGeneratedQuestions,
    setAIGenerationResult,
    setIsAuthenticated,
    setFormData,
    setAIFormData,
  };
};
