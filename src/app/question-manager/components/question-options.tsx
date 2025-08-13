"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { CheckboxField } from "./form-field";
import type { QuestionOption } from "@/types/question-manager";

interface QuestionOptionsProps {
  options: QuestionOption[];
  onOptionChange: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

export default function QuestionOptions({
  options,
  onOptionChange,
  onAddOption,
  onRemoveOption,
}: QuestionOptionsProps) {
  return (
    <div>
      <div className="text-sm font-medium mb-3">Seçenekler</div>
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-3">
            <CheckboxField
              checked={option.isCorrect}
              onCheckedChange={(checked) =>
                onOptionChange(index, "isCorrect", checked)
              }
            />
            <Input
              value={option.text}
              onChange={(e) =>
                onOptionChange(index, "text", e.target.value)
              }
              placeholder={`Seçenek ${index + 1}`}
              className="flex-1 h-10 sm:h-11"
            />
            {options.length > 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveOption(index)}
                className="h-10 w-10 sm:h-11 sm:w-11"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={onAddOption} className="h-10 sm:h-11">
          <Plus className="w-4 h-4 mr-2" />
          Seçenek Ekle
        </Button>
      </div>
    </div>
  );
}
