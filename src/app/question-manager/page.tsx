"use client";

import React, { useEffect, useState } from "react";
import QuestionManagerMain from "./components/question-manager-main";
import { useQuestionManagerState } from "@/hooks/question-manager/use-question-manager-state";
import { useQuestionManagerAuth } from "@/hooks/question-manager/use-question-manager-auth";
import { useSubjectManagement } from "@/hooks/question-manager/use-subject-management";
import { useQuestionCRUD } from "@/hooks/question-manager/use-question-crud";
import { useAIGeneration } from "@/hooks/question-manager/use-ai-generation";
import { useFormManagement } from "@/hooks/question-manager/use-form-management";
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

  // Load subjects when authentication status changes
  useEffect(() => {
    if (isAuthenticated !== null) {
      loadSubjects();
    }
  }, [isAuthenticated, loadSubjects]);

  // Load questions when selected subject changes
  useEffect(() => {
    loadQuestions(selectedSubject);
  }, [selectedSubject, loadQuestions]);

  // Handler functions that wrap the hook functions
  const handleCreateQuestion = async () => {
    const success = await createQuestion(formData);
    if (success) {
      handleResetForm();
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) {
      return;
    }

    const success = await updateQuestion(editingQuestion);
    if (success) {
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestion(questionId);
  };

  const handleAIGenerate = async (formData: AIFormData) => {
    await generateQuestions(formData);
  };

  const handleApproveAIQuestions = async (questionsToAdd: AIGeneratedQuestion[], subject: string) => {
    const success = await approveAIQuestions(questionsToAdd, subject);
    if (success) {
      setIsAIDialogOpen(false);
      setAIGeneratedQuestions([]);
      setAIGenerationResult(null);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsEditDialogOpen(true);
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
      stats={stats}
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
