"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Question } from "@/lib/types";

// Utility functions for mapping
export const mapDifficulty = (difficulty: string): string => {
  const mapping: Record<string, string> = {
    "Easy": "Kolay",
    "Medium": "Orta",
    "Hard": "Zor",
  };
  return mapping[difficulty] || difficulty;
};

export const mapQuestionType = (type: string): string => {
  const mapping: Record<string, string> = {
    "multiple-choice": "Çoktan Seçmeli",
    "true-false": "Doğru/Yanlış",
    "calculation": "Hesaplama",
    "case-study": "Vaka Çalışması",
  };
  return mapping[type] || type;
};

// Question Tags Component
interface QuestionTagsProps {
  question: Question;
}

function QuestionTags({ question }: QuestionTagsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
        {mapDifficulty(question.difficulty)}
      </span>
      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
        {question.topic}
      </span>
      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
        {mapQuestionType(question.type)}
      </span>
    </div>
  );
}

// Question Actions Component
interface QuestionActionsProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => Promise<void>;
}

function QuestionActions({ question, onEdit, onDelete }: QuestionActionsProps) {
  return (
    <div className="flex gap-1 flex-shrink-0">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onEdit(question)}
        className="h-8 w-8"
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          void onDelete(question.id);
        }}
        className="text-red-500 hover:text-red-600 h-8 w-8"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Main Question Card Component
interface QuestionCardProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => Promise<void>;
}

export default function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50 w-full hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <QuestionTags question={question} />
        <QuestionActions
          question={question}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
      <p className="text-sm font-medium mb-2 break-words">
        {question.text}
      </p>
      <p className="text-xs text-muted-foreground">
        {question.options.length} seçenek
      </p>
    </div>
  );
}
