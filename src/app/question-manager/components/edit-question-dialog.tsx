"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import type { Question } from "@/lib/types";
import type { QuestionOption } from "@/types/question-manager";

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingQuestion: Question | null;
  onUpdate: () => Promise<void>;
  onOptionChange: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onQuestionChange: (field: keyof Question, value: any) => void;
}

export default function EditQuestionDialog({
  open,
  onOpenChange,
  editingQuestion,
  onUpdate,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onQuestionChange,
}: EditQuestionDialogProps) {
  if (!editingQuestion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Soruyu Düzenle</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-text" className="text-right">
              Soru Metni
            </Label>
            <Textarea
              id="edit-text"
              value={editingQuestion.text}
              onChange={(e) =>
                onQuestionChange("text", e.target.value)
              }
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-topic" className="text-right">
              Konu
            </Label>
            <Input
              id="edit-topic"
              value={editingQuestion.topic || ""}
              onChange={(e) =>
                onQuestionChange("topic", e.target.value)
              }
              className="col-span-3"
            />
          </div>
          
          {editingQuestion.type === "multiple-choice" && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Seçenekler</Label>
              <div className="col-span-3 space-y-2">
                {editingQuestion.options.map(
                  (option: QuestionOption, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Checkbox
                        checked={option.isCorrect}
                        onCheckedChange={(checked) =>
                          onOptionChange(
                            index,
                            "isCorrect",
                            checked as boolean,
                          )
                        }
                      />
                      <Input
                        value={option.text}
                        onChange={(e) =>
                          onOptionChange(
                            index,
                            "text",
                            e.target.value,
                          )
                        }
                        placeholder={`Seçenek ${index + 1}`}
                        className="flex-1"
                      />
                      {editingQuestion.options.length > 2 && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => onRemoveOption(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddOption}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Seçenek Ekle
                </Button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-explanation" className="text-right">
              Açıklama
            </Label>
            <Textarea
              id="edit-explanation"
              value={editingQuestion.explanation}
              onChange={(e) =>
                onQuestionChange("explanation", e.target.value)
              }
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">İptal</Button>
          </DialogClose>
          <Button onClick={onUpdate}>
            Değişiklikleri Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
