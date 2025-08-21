"use client";

import React, { useEffect, useState } from "react";
import QuestionManagerMain from "./components/question-manager-main";
import MobileNav from "@/components/mobile-nav";
import LoadingSpinner from "@/components/loading-spinner";
import { useQuestionManagerState } from "@/hooks/question-manager/use-question-manager-state";
import { useQuestionManagerAuth } from "@/hooks/question-manager/use-question-manager-auth";
import { useSubjectManagement } from "@/hooks/question-manager/use-subject-management";
import { useQuestionCRUD } from "@/hooks/question-manager/use-question-crud";
import { useAIGeneration } from "@/hooks/question-manager/use-ai-generation";
import { useFormManagement } from "@/hooks/question-manager/use-form-management";
import { shouldUseDemoData } from "@/data/demo-data";
import type { Question } from "@/lib/types";
import type { AIGeneratedQuestion } from "@/types/question-manager";

// Define proper interface for AI form data
interface AIFormData {
  subject: string;
  topic: string;
  type: "multiple-choice" | "true-false" | "calculation" | "case-study";
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
  guidelines: string;
}

interface Stats {
  totalQuestions: number;
  totalSubjects: number;
  totalCategories: number;
}

export default function QuestionManager() {
  // Use custom hooks for state management
  const {
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
    setQuestions,
    setSubjects,
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
  } = useQuestionManagerState();

  // Add stats state
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 0,
    totalSubjects: 0,
    totalCategories: 0,
  });

  // Demo mode state
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check demo mode on mount
  useEffect(() => {
    setIsDemoMode(shouldUseDemoData());
  }, []);

  // Calculate stats when subjects or questions change
  useEffect(() => {
    const totalSubjects = subjects.length;
    const totalQuestions = questions.length;
    const categories = new Set(subjects.map(subject => subject.category));
    const totalCategories = categories.size;

    setStats({
      totalQuestions,
      totalSubjects,
      totalCategories,
    });
  }, [subjects, questions]);

  // Use custom hook for authentication
  useQuestionManagerAuth(isAuthenticated, setIsAuthenticated);

  // Use custom hook for subject management
  const { loadSubjects, calculateRealQuestionCount } = useSubjectManagement(
    isAuthenticated || false,
    setSubjects,
    setIsLoadingSubjects,
  );

  // Use custom hook for question CRUD operations
  const { loadQuestions, createQuestion, updateQuestion, deleteQuestion } = useQuestionCRUD(
    isAuthenticated || false,
    setQuestions,
    subjects,
    setSubjects,
    calculateRealQuestionCount,
  );

  // Use custom hook for AI generation
  const { generateQuestions, approveAIQuestions } = useAIGeneration(
    isAuthenticated || false,
    questions,
    setAIGeneratedQuestions,
    setAIGenerationResult,
    setIsGeneratingAI,
    setIsCreating,
    () => loadQuestions(selectedSubject),
    subjects,
    setSubjects,
    setQuestions,
    calculateRealQuestionCount,
  );

  // Use custom hook for form management
  const {
    handleFormDataChange,
    handleOptionChange,
    handleAddOption,
    handleRemoveOption,
    handleResetForm,
    handleEditOptionChange,
    handleEditAddOption,
    handleEditRemoveOption,
    handleEditQuestionChange,
  } = useFormManagement(formData, setFormData, editingQuestion, setEditingQuestion);

  useEffect(() => {
    if (isHydrated) {
      console.log("🔄 Question Manager: useEffect triggered, isHydrated:", isHydrated);
      loadSubjects();
      loadQuestions(selectedSubject);
    }
  }, [isHydrated, selectedSubject]);

  // Debug: subjects değiştiğinde log
  useEffect(() => {
    console.log("📚 Question Manager: subjects changed:", subjects);
    console.log("📚 Question Manager: subjects length:", subjects.length);
  }, [subjects]);

  // Handler functions for the component
  const handleCreateQuestion = async () => {
    const success = await createQuestion(formData);
    if (success) {
      handleResetForm();
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsEditDialogOpen(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestion(questionId);
  };

  const handleAIGenerate = async (formData: AIFormData) => {
    await generateQuestions(formData);
  };

  const handleApproveAIQuestions = async (questions: AIGeneratedQuestion[], subject: string) => {
    await approveAIQuestions(questions, subject);
  };

  const handleUpdateQuestion = async () => {
    if (editingQuestion) {
      const success = await updateQuestion(editingQuestion);
      if (success) {
        setIsEditDialogOpen(false);
        setEditingQuestion(null);
      }
    }
  };

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileNav />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

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
      formData={formData}
      stats={stats}
      isDemoMode={isDemoMode}
      onSubjectChange={setSelectedSubject}
      onSearchChange={setSearchTerm}
      onDifficultyFilterChange={setFilterDifficulty}
      onFormDataChange={handleFormDataChange}
      onOptionChange={handleOptionChange}
      onAddOption={handleAddOption}
      onRemoveOption={handleRemoveOption}
      onSubmit={handleCreateQuestion}
      onReset={handleResetForm}
      onEditQuestion={handleEditQuestion}
      onDeleteQuestion={handleDeleteQuestion}
      onEditDialogOpenChange={setIsEditDialogOpen}
      onAIDialogOpenChange={setIsAIDialogOpen}
      onAIGenerate={handleAIGenerate}
      onAIApprove={handleApproveAIQuestions}
      onEditOptionChange={handleEditOptionChange}
      onEditAddOption={handleEditAddOption}
      onEditRemoveOption={handleEditRemoveOption}
      onEditQuestionChange={handleEditQuestionChange}
      onUpdateQuestion={handleUpdateQuestion}
    />
  );
}