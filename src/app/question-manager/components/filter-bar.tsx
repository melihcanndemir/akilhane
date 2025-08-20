"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Subject } from "@/types/question-manager";
import { DIFFICULTIES } from "@/types/question-manager";
import { SelectNoSubjectsState } from "./empty-states";

// Subject Filter Component
interface SubjectFilterProps {
  value: string;
  onChange: (value: string) => void;
  subjects: Subject[];
}

function SubjectFilter({ value, onChange, subjects }: SubjectFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder="Ders seçin" />
      </SelectTrigger>
      <SelectContent>
        {subjects.length === 0 ? (
          <SelectNoSubjectsState />
        ) : (
          subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.name}>
              {subject.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

// Search Filter Component
interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchFilter({ value, onChange }: SearchFilterProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        placeholder="Soru ara..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-h-[44px] sm:min-h-[40px] text-base pl-10 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm"
      />
    </div>
  );
}

// Difficulty Filter Component
interface DifficultyFilterProps {
  value: string;
  onChange: (value: string) => void;
}

function DifficultyFilter({ value, onChange }: DifficultyFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-32">
        <SelectValue placeholder="Zorluk" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tümü</SelectItem>
        {DIFFICULTIES.map((difficulty) => (
          <SelectItem key={difficulty} value={difficulty}>
            {difficulty}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Main Filter Bar Component
interface FilterBarProps {
  selectedSubject: string;
  searchTerm: string;
  filterDifficulty: string;
  subjects: Subject[];
  onSubjectChange: (subject: string) => void;
  onSearchChange: (term: string) => void;
  onDifficultyFilterChange: (difficulty: string) => void;
}

export default function FilterBar({
  selectedSubject,
  searchTerm,
  filterDifficulty,
  subjects,
  onSubjectChange,
  onSearchChange,
  onDifficultyFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-gradient-question shadow-sm">
      <SubjectFilter
        value={selectedSubject}
        onChange={onSubjectChange}
        subjects={subjects}
      />
      <SearchFilter
        value={searchTerm}
        onChange={onSearchChange}
      />
      <DifficultyFilter
        value={filterDifficulty}
        onChange={onDifficultyFilterChange}
      />
    </div>
  );
}
