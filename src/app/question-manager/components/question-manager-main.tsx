"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, Target, Brain, Database, GraduationCap } from "lucide-react";
import MobileNav from "@/components/mobile-nav";
import FeatureCards from "@/components/ui/feature-cards";
import { questionManagerFeatures } from "@/data/feature-cards-data";
import QuestionForm from "./question-form";
import QuestionsList from "./questions-list";
import AIQuestionDialog from "./ai-question-dialog";
import EditQuestionDialog from "./edit-question-dialog";
import Link from "next/link";
import LoadingSpinner from "@/components/loading-spinner";
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

interface Stats {
  totalQuestions: number;
  totalSubjects: number;
  totalCategories: number;
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
  stats: Stats;
  isDemoMode?: boolean;
  onSubjectChange: (subject: string) => void;
  onSearchChange: (term: string) => void;
  onDifficultyFilterChange: (difficulty: string) => void;
  onFormDataChange: (field: keyof QuestionFormData, value: string | number) => void;
  onOptionChange: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => Promise<void>;
  onEditDialogOpenChange: (open: boolean) => void;
  onAIDialogOpenChange: (open: boolean) => void;
  onAIGenerate: (formData: AIFormData) => Promise<void>;
  onAIApprove: (questions: AIGeneratedQuestion[], subject: string) => Promise<void>;
  onEditOptionChange: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
  onEditAddOption: () => void;
  onEditRemoveOption: (index: number) => void;
  onEditQuestionChange: (field: keyof Question, value: string | boolean) => void;
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
  formData,
  stats,
  isDemoMode = false,
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
    <div className="space-y-6">
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Info */}
          <Card className="mb-6 glass-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                      Soru Yöneticisi
                      {isDemoMode && (
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          Demo
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Soruları ekleyin, düzenleyin ve yönetin. Her ders için
                      sorular ekleyebilirsiniz.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => {
                      onAIDialogOpenChange(true);
                    }}
                    disabled={!selectedSubject && subjects.length === 0}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 w-full sm:w-auto shadow-lg sm:mr-2"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">AI ile Soru Oluştur</span>
                    <span className="sm:hidden">AI Soru</span>
                  </Button>
                  <Link href="/subject-manager" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 w-full sm:w-auto"
                    >
                      <Database className="w-4 h-4" />
                      <span className="hidden sm:inline">Ders Yöneticisi</span>
                      <span className="sm:hidden">Dersler</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-4 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Ders</p>
                    {isLoadingSubjects ? (
                      <LoadingSpinner className="p-0 h-6 w-6" />
                    ) : (
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.totalSubjects}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 p-4 border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Toplam Kategori
                    </p>
                    {isLoadingSubjects ? (
                      <LoadingSpinner className="p-0 h-6 w-6" />
                    ) : (
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.totalCategories}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 p-4 border-2 border-green-300 dark:border-green-700 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 md:col-span-2 lg:col-span-1">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Toplam Soru
                    </p>
                    {isLoading ? (
                      <LoadingSpinner className="p-0 h-6 w-6" />
                    ) : (
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {stats.totalQuestions}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Question Manager Features */}
          <div className="px-4 sm:px-0">
            <FeatureCards
              title="Soru Yöneticisi Özellikleri"
              features={questionManagerFeatures}
              columns={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}