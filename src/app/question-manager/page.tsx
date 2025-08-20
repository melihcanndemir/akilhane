"use client";

import React, { useEffect } from "react";
import QuestionManagerMain from "./components/question-manager-main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, BookOpen, Brain, GraduationCap, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import MobileNav from "@/components/mobile-nav";
import LoadingSpinner from "@/components/loading-spinner";
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
  totalTopics: number;
  aiGeneratedCount: number;
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

  // Calculate stats
  const stats: Stats = {
    totalQuestions: questions.length,
    totalSubjects: subjects.length,
    totalTopics: new Set(questions.map(q => q.topic)).size,
    aiGeneratedCount: aiGeneratedQuestions.length,
  };

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
    <div className="min-h-screen bg-background">
      <MobileNav />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Soru Yönetimi
          </h1>
          <p className="text-muted-foreground">
            Soru ekle, düzenle ve yapay zeka ile yeni sorular oluştur
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-300 dark:border-blue-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Toplam Soru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalQuestions}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-300 dark:border-green-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Toplam Ders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.totalSubjects}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-400 dark:border-orange-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Toplam Konu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.totalTopics}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-300 dark:border-purple-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Sorular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.aiGeneratedCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <QuestionManagerMain
          questions={questions}
          subjects={subjects}
          isLoading={isLoading}
          isLoadingSubjects={isLoadingSubjects}
          isCreating={isCreating}
          selectedSubject={selectedSubject}
          searchTerm={searchTerm}
          filterDifficulty={filterDifficulty}
          isEditDialogOpen={isEditDialogOpen}
          editingQuestion={editingQuestion}
          isAIDialogOpen={isAIDialogOpen}
          isGeneratingAI={isGeneratingAI}
          aiGeneratedQuestions={aiGeneratedQuestions}
          aiGenerationResult={aiGenerationResult}
          formData={formData}
          setQuestions={setQuestions}
          setSubjects={setSubjects}
          setIsLoadingSubjects={setIsLoadingSubjects}
          setIsCreating={setIsCreating}
          setSelectedSubject={setSelectedSubject}
          setSearchTerm={setSearchTerm}
          setFilterDifficulty={setFilterDifficulty}
          setIsEditDialogOpen={setIsEditDialogOpen}
          setEditingQuestion={setEditingQuestion}
          setIsAIDialogOpen={setIsAIDialogOpen}
          setIsGeneratingAI={setIsGeneratingAI}
          setAIGeneratedQuestions={setAIGeneratedQuestions}
          setAIGenerationResult={setAIGenerationResult}
          setFormData={setFormData}
          loadQuestions={loadQuestions}
          createQuestion={createQuestion}
          updateQuestion={updateQuestion}
          deleteQuestion={deleteQuestion}
          generateQuestions={generateQuestions}
          approveAIQuestions={approveAIQuestions}
          handleFormDataChange={handleFormDataChange}
          handleOptionChange={handleOptionChange}
          handleAddOption={handleAddOption}
          handleRemoveOption={handleRemoveOption}
          handleResetForm={handleResetForm}
          handleEditOptionChange={handleEditOptionChange}
          handleEditAddOption={handleEditAddOption}
          handleEditRemoveOption={handleEditRemoveOption}
          handleEditQuestionChange={handleEditQuestionChange}
        />
      </div>
    </div>
  );
}
