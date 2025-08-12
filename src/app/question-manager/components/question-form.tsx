"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


import { Plus } from "lucide-react";
import type { Subject, QuestionFormData } from "@/types/question-manager";
import { QUESTION_TYPES, DIFFICULTIES } from "@/types/question-manager";
import { SelectField, SubjectSelectField, InputField, TextareaField } from "./form-field";
import QuestionOptions from "./question-options";
import FormActions from "./form-actions";

interface QuestionFormProps {
  subjects: Subject[];
  formData: QuestionFormData;
  onFormDataChange: (field: string, value: any) => void;
  onOptionChange: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  isCreating: boolean;
}

const questionTypes = QUESTION_TYPES;
const difficulties = DIFFICULTIES;

export default function QuestionForm({
  subjects,
  formData,
  onFormDataChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onSubmit,
  onReset,
  isCreating,
}: QuestionFormProps) {
  return (
    <Card id="question-form" className="glass-card h-full">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Yeni Soru Ekle
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Yeni bir soru oluşturmak için formu doldurun
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <SubjectSelectField
            id="subject"
            label="Ders"
            value={formData.subject}
            onChange={(value) => onFormDataChange("subject", value)}
            subjects={subjects}
          />
          <InputField
            id="topic"
            label="Konu"
            value={formData.topic}
            onChange={(value) => onFormDataChange("topic", value)}
            placeholder="Örn: Finansal Tablolar"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <SelectField
            id="type"
            label="Soru Tipi"
            value={formData.type}
            onChange={(value) => onFormDataChange("type", value)}
            options={questionTypes}
          />
          <SelectField
            id="difficulty"
            label="Zorluk"
            value={formData.difficulty}
            onChange={(value) => onFormDataChange("difficulty", value)}
            options={difficulties}
          />
        </div>

        <TextareaField
          id="text"
          label="Soru Metni"
          value={formData.text}
          onChange={(value) => onFormDataChange("text", value)}
          placeholder="Soru metnini buraya yazın..."
          rows={3}
        />

        {formData.type === "Çoktan Seçmeli" && (
          <QuestionOptions
            options={formData.options}
            onOptionChange={onOptionChange}
            onAddOption={onAddOption}
            onRemoveOption={onRemoveOption}
          />
        )}

        <TextareaField
          id="explanation"
          label="Açıklama"
          value={formData.explanation}
          onChange={(value) => onFormDataChange("explanation", value)}
          placeholder="Doğru cevabın açıklaması..."
          rows={3}
        />

        {formData.type === "Hesaplama" && (
          <InputField
            id="formula"
            label="Formül (Opsiyonel)"
            value={formData.formula}
            onChange={(value) => onFormDataChange("formula", value)}
            placeholder="Hesaplama formülü..."
          />
        )}

        <FormActions
          onSubmit={onSubmit}
          onReset={onReset}
          isCreating={isCreating}
        />
      </CardContent>
    </Card>
  );
}
