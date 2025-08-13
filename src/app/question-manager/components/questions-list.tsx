"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Question } from "@/lib/types";
import LoadingSpinner from "@/components/loading-spinner";
import type { Subject } from "@/types/question-manager";
import {
  LoadingState,
  NoSubjectsState,
  NoSubjectSelectedState,
  NoQuestionsState,
} from "./empty-states";
import QuestionCard from "./question-card";
import FilterBar from "./filter-bar";
import { mapDifficulty } from "./question-card";

interface QuestionsListProps {
  subjects: Subject[];
  questions: Question[];
  selectedSubject: string;
  searchTerm: string;
  filterDifficulty: string;
  isLoading: boolean;
  isLoadingSubjects: boolean;
  onSubjectChange: (subject: string) => void;
  onSearchChange: (term: string) => void;
  onDifficultyFilterChange: (difficulty: string) => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => Promise<void>;
  onAIDialogOpenChange: (open: boolean) => void;
}

export default function QuestionsList({
  subjects,
  questions,
  selectedSubject,
  searchTerm,
  filterDifficulty,
  isLoading,
  isLoadingSubjects,
  onSubjectChange,
  onSearchChange,
  onDifficultyFilterChange,
  onEditQuestion,
  onDeleteQuestion,
  onAIDialogOpenChange,
}: QuestionsListProps) {
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (question.topic || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === "all" || mapDifficulty(question.difficulty) === filterDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <Card className="glass-card w-full h-full rounded-none">
      <CardHeader>
        <CardTitle>Sorular</CardTitle>
        <CardDescription>
          {selectedSubject
            ? `${selectedSubject} dersindeki sorular`
            : "Ders seçin"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <FilterBar
          selectedSubject={selectedSubject}
          searchTerm={searchTerm}
          filterDifficulty={filterDifficulty}
          subjects={subjects}
          onSubjectChange={onSubjectChange}
          onSearchChange={onSearchChange}
          onDifficultyFilterChange={onDifficultyFilterChange}
        />

        {/* Questions */}
        {isLoadingSubjects ? (
          <LoadingState />
        ) : subjects.length === 0 ? (
          <NoSubjectsState onAIDialogOpenChange={onAIDialogOpenChange} />
        ) : isLoading ? (
          <LoadingSpinner />
        ) : !selectedSubject ? (
          <NoSubjectSelectedState
            subjects={subjects}
            onSubjectChange={onSubjectChange}
            onAIDialogOpenChange={onAIDialogOpenChange}
          />
        ) : filteredQuestions.length === 0 ? (
          <NoQuestionsState onAIDialogOpenChange={onAIDialogOpenChange} />
        ) : (
          <div className="space-y-4 w-full overflow-y-auto" style={{ maxHeight: '850px' }}>
            {filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={onEditQuestion}
                onDelete={onDeleteQuestion}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
