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
  AIGenerationResult 
} from "@/types/question-manager";

interface QuestionManagerMainProps {
  subjects: Subject[];
  questions: any[];
  selectedSubject: string;
  searchTerm: string;
  filterDifficulty: string;
  isLoading: boolean;
  isLoadingSubjects: boolean;
  isCreating: boolean;
  isEditDialogOpen: boolean;
  editingQuestion: any;
  isAIDialogOpen: boolean;
  isGeneratingAI: boolean;
  aiGeneratedQuestions: AIGeneratedQuestion[];
  aiGenerationResult: AIGenerationResult | null;
  isAuthenticated: boolean | null;
  isHydrated: boolean;
  formData: any;
  onSubjectChange: (subject: string) => void;
  onSearchChange: (term: string) => void;
  onDifficultyFilterChange: (difficulty: string) => void;
  onFormDataChange: (field: string, value: any) => void;
  onOptionChange: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  onEditQuestion: (question: any) => void;
  onDeleteQuestion: (questionId: string) => Promise<void>;
  onEditDialogOpenChange: (open: boolean) => void;
  onAIDialogOpenChange: (open: boolean) => void;
  onAIGenerate: (formData: any) => Promise<void>;
  onAIApprove: (questions: AIGeneratedQuestion[]) => Promise<void>;
  onEditOptionChange: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
  onEditAddOption: () => void;
  onEditRemoveOption: (index: number) => void;
  onEditQuestionChange: (field: string, value: any) => void;
  onUpdateQuestion: () => Promise<void>;
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
  isHydrated,
  formData,
  onSubjectChange,
  onSearchChange,
  onDifficultyFilterChange,
  onFormDataChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onSubmit,
  onReset,
  onEditQuestion,
  onDeleteQuestion,
  onEditDialogOpenChange,
  onAIDialogOpenChange,
  onAIGenerate,
  onAIApprove,
  onEditOptionChange,
  onEditAddOption,
  onEditRemoveOption,
  onEditQuestionChange,
  onUpdateQuestion,
}: QuestionManagerMainProps) {
  return (
    <div className="min-h-screen">
      {/* Responsive Navigation Bar */}
      <MobileNav />

      <div className="p-1 sm:p-4 md:p-8">
        <div className="container mx-auto space-y-2 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-headline font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Soru Yöneticisi
              </h1>
              <p className="text-muted-foreground">
                Soru ekle, düzenle ve yönet
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <Button
                onClick={() => {
                  onAIDialogOpenChange(true);
                }}
                disabled={!selectedSubject && subjects.length === 0}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 w-full sm:w-auto shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">AI ile Soru Oluştur</span>
                <span className="sm:hidden">AI Soru</span>
              </Button>
              {!isHydrated ? (
                <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium w-full sm:w-auto text-center">
                  Loading...
                </div>
              ) : (
                <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-medium w-full sm:w-auto text-center">
                  💾 LocalStorage
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 lg:items-stretch">
            {/* Create Question Form */}
            <div className="lg:flex-1">
              <QuestionForm
                subjects={subjects}
                formData={formData}
                onFormDataChange={onFormDataChange}
                onOptionChange={onOptionChange}
                onAddOption={onAddOption}
                onRemoveOption={onRemoveOption}
                onSubmit={onSubmit}
                onReset={onReset}
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
                onSubjectChange={onSubjectChange}
                onSearchChange={onSearchChange}
                onDifficultyFilterChange={onDifficultyFilterChange}
                onEditQuestion={onEditQuestion}
                onDeleteQuestion={onDeleteQuestion}
                onAIDialogOpenChange={onAIDialogOpenChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Question Dialog */}
      <EditQuestionDialog
        open={isEditDialogOpen}
        onOpenChange={onEditDialogOpenChange}
        editingQuestion={editingQuestion}
        onUpdate={onUpdateQuestion}
        onOptionChange={onEditOptionChange}
        onAddOption={onEditAddOption}
        onRemoveOption={onEditRemoveOption}
        onQuestionChange={onEditQuestionChange}
      />

      {/* AI Question Generation Dialog */}
      <AIQuestionDialog
        open={isAIDialogOpen}
        onOpenChange={onAIDialogOpenChange}
        subjects={subjects}
        onGenerate={onAIGenerate}
        onApprove={onAIApprove}
        isGenerating={isGeneratingAI}
        isCreating={isCreating}
        aiGeneratedQuestions={aiGeneratedQuestions}
        aiGenerationResult={aiGenerationResult}
      />
    </div>
  );
}
