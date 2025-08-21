"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Subject } from "@/types/question-manager";

// Loading State Component
export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground font-medium">
        Dersler yükleniyor...
      </p>
    </div>
  );
}

// No Subjects State Component
interface NoSubjectsStateProps {
  onAIDialogOpenChange: (open: boolean) => void;
}

export function NoSubjectsState({ onAIDialogOpenChange }: NoSubjectsStateProps) {
  return (
    <div className="flex justify-center py-16">
      <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 rounded-lg p-8 text-center max-w-md">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          İlk Dersinizi Ekleyin
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Soru ekleyebilmek için önce ders yöneticisinden bir ders oluşturmanız gerekiyor.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/subject-manager">
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 w-full">
              <GraduationCap className="w-4 h-4 text-white" />
              Ders Ekle
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2 w-full hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-0"
            onClick={() => onAIDialogOpenChange(true)}
          >
            <Sparkles className="w-4 h-4" />
            AI ile Soru Oluştur
          </Button>
        </div>
      </div>
    </div>
  );
}

// No Subject Selected State Component
interface NoSubjectSelectedStateProps {
  subjects: Subject[];
  onSubjectChange: (subject: string) => void;
  onAIDialogOpenChange: (open: boolean) => void;
}

export function NoSubjectSelectedState({
  subjects,
  onSubjectChange,
  onAIDialogOpenChange,
}: NoSubjectSelectedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6">
        <GraduationCap className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">
        Ders Seçin
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
        Soruları görüntülemek ve yönetmek için yukarıdan bir ders seçin.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/subject-manager">
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
            <GraduationCap className="w-4 h-4 text-white" />
            Ders Ekle
          </Button>
        </Link>
        {subjects.length > 0 && (
          <Select value="" onValueChange={onSubjectChange}>
            <SelectTrigger className="gap-2 min-w-[200px]">
              <BookOpen className="w-4 h-4" />
              <SelectValue placeholder="Mevcut Dersleri Gör" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.name}>
                  <div className="flex items-center justify-between w-full">
                    <span>{subject.name}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {subject.questionCount} soru
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => onAIDialogOpenChange(true)}
        >
          <Sparkles className="w-4 h-4" />
          AI ile Soru Oluştur
        </Button>
      </div>
    </div>
  );
}

// No Questions State Component
interface NoQuestionsStateProps {
  onAIDialogOpenChange: (open: boolean) => void;
}

export function NoQuestionsState({ onAIDialogOpenChange }: NoQuestionsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6">
        <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">
        Bu derste henüz soru bulunmuyor
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
        Seçili derste henüz soru eklenmemiş. Sol taraftaki formu kullanarak ilk sorunuzu oluşturabilirsiniz.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
        >
          <BookOpen className="w-4 h-4" />
          İlk Soruyu Ekle
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => onAIDialogOpenChange(true)}>
          <Sparkles className="w-4 h-4" />
          AI ile Soru Oluştur
        </Button>
      </div>
    </div>
  );
}

// Select No Subjects State Component (for dropdowns)
export function SelectNoSubjectsState() {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground mb-1">
        Henüz ders bulunmuyor
      </p>
      <p className="text-xs text-muted-foreground/70 mb-3">
        Ders yöneticisinden ders ekleyin
      </p>
    </div>
  );
}
