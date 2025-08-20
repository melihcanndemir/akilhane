"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import MobileNav from "@/components/mobile-nav";
import QuestionForm from "./question-form";
import QuestionsList from "./questions-list";
import AIQuestionDialog from "./ai-question-dialog";
import EditQuestionDialog from "./edit-question-dialog";
import type {
  Subject,
  AIGeneratedQuestion,
  AIGenerationResult,
  QuestionFormData,
} from "@/types/question-manager";
import type { Question } from "@/lib/types";

// Define proper interface for AI form data
interface AIFormData {
  subject: string;
  topic: string;
  type: "multiple-choice" | "true-false" | "calculation" | "case-study";
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
  guidelines: string;
}

// Define proper interfaces for the component props
interface QuestionManagerMainProps {
  subjects: Subject[];
  questions: Question[];
  selectedSubject: string;
  searchTerm: string;
  filterDifficulty: string;
  isLoading: boolean;
  isLoadingSubjects: boolean;
  isCreating: boolean;
  isEditDialogOpen: boolean;
  editingQuestion: Question | null;
  isAIDialogOpen: boolean;
  isGeneratingAI: boolean;
  aiGeneratedQuestions: AIGeneratedQuestion[];
  aiGenerationResult: AIGenerationResult | null;
  formData: QuestionFormData;
  
  // State setters
  setQuestions: (questions: Question[] | ((prev: Question[]) => Question[])) => void;
  setSubjects: (subjects: Subject[]) => void;
  setIsLoadingSubjects: (loading: boolean) => void;
  setIsCreating: (creating: boolean) => void;
  setSelectedSubject: (subject: string) => void;
  setSearchTerm: (term: string) => void;
  setFilterDifficulty: (difficulty: string) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setEditingQuestion: (question: Question | null) => void;
  setIsAIDialogOpen: (open: boolean) => void;
  setIsGeneratingAI: (generating: boolean) => void;
  setAIGeneratedQuestions: (questions: AIGeneratedQuestion[]) => void;
  setAIGenerationResult: (result: AIGenerationResult | null) => void;
  setFormData: (data: QuestionFormData) => void;
  
  // Functions
  loadQuestions: (subject: string) => Promise<void>;
  createQuestion: (formData: QuestionFormData) => Promise<boolean>;
  updateQuestion: (question: Question) => Promise<boolean>;
  deleteQuestion: (questionId: string) => Promise<void>;
  generateQuestions: (formData: AIFormData) => Promise<void>;
  approveAIQuestions: (questions: AIGeneratedQuestion[], subject: string) => Promise<boolean>;
  
  // Form handlers
  handleFormDataChange: (field: keyof QuestionFormData, value: string | number) => void;
  handleOptionChange: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
  handleAddOption: () => void;
  handleRemoveOption: (index: number) => void;
  handleResetForm: () => void;
  handleEditOptionChange: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
  handleEditAddOption: () => void;
  handleEditRemoveOption: (index: number) => void;
  handleEditQuestionChange: (field: keyof Question, value: string | boolean) => void;
}

export default function QuestionManagerMain({
  subjects,
  questions,
  selectedSubject,
  searchTerm,
  filterDifficulty,
  isLoading,
  isLoadingSubjects,
  isCreating,
  isEditDialogOpen,
  editingQuestion,
  isAIDialogOpen,
  isGeneratingAI,
  aiGeneratedQuestions,
  aiGenerationResult,
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
  setFormData,
  loadQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  generateQuestions,
  approveAIQuestions,
  handleFormDataChange,
  handleOptionChange,
  handleAddOption,
  handleRemoveOption,
  handleResetForm,
  handleEditOptionChange,
  handleEditAddOption,
  handleEditRemoveOption,
  handleEditQuestionChange,
}: QuestionManagerMainProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Soru Yönetimi
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Soru ekle, düzenle ve yapay zeka ile yeni sorular oluştur
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={() => {
                setIsAIDialogOpen(true);
              }}
              disabled={!selectedSubject && subjects.length === 0}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 w-full sm:w-auto shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">AI ile Soru Oluştur</span>
              <span className="sm:hidden">AI Soru</span>
            </Button>

            {isLoadingSubjects ? (
              <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-xs font-medium w-full sm:w-auto flex justify-center items-center">
                Yükleniyor...
              </div>
            ) : (
              <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md text-xs font-medium w-full sm:w-auto flex justify-center items-center">
                💾 Yerel Depolama
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 lg:items-stretch">
        {/* Create Question Form */}
        <div className="lg:flex-1">
          <QuestionForm
            subjects={subjects}
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onOptionChange={handleOptionChange}
            onAddOption={handleAddOption}
            onRemoveOption={handleRemoveOption}
            onSubmit={async () => {
              await createQuestion(formData);
            }}
            onReset={handleResetForm}
            isCreating={isCreating}
          />
        </div>

        {/* Questions List */}
        <div className="lg:flex-1">
          <QuestionsList
            subjects={subjects}
            questions={questions}
            selectedSubject={selectedSubject}
            searchTerm={searchTerm}
            filterDifficulty={filterDifficulty}
            isLoading={isLoading}
            isLoadingSubjects={isLoadingSubjects}
            onSubjectChange={setSelectedSubject}
            onSearchChange={setSearchTerm}
            onDifficultyFilterChange={setFilterDifficulty}
            onEditQuestion={(question) => {
              setEditingQuestion(question);
              setIsEditDialogOpen(true);
            }}
            onDeleteQuestion={deleteQuestion}
            onAIDialogOpenChange={setIsAIDialogOpen}
          />
        </div>
      </div>

      {/* Edit Question Dialog */}
      <EditQuestionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingQuestion={editingQuestion}
        onUpdate={async () => {
          if (editingQuestion) {
            await updateQuestion(editingQuestion);
          }
        }}
        onOptionChange={handleEditOptionChange}
        onAddOption={handleEditAddOption}
        onRemoveOption={handleEditRemoveOption}
        onQuestionChange={handleEditQuestionChange}
      />

      {/* AI Question Generation Dialog */}
      <AIQuestionDialog
        open={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        subjects={subjects}
        onGenerate={generateQuestions}
        onApprove={async (questions, subject) => {
          await approveAIQuestions(questions, subject);
        }}
        isGenerating={isGeneratingAI}
        isCreating={isCreating}
        aiGeneratedQuestions={aiGeneratedQuestions}
        aiGenerationResult={aiGenerationResult}
      />
    </div>
  );
}
