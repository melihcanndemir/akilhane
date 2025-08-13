"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Subject } from "@/types/question-manager";
import { SelectNoSubjectsState } from "./empty-states";

// Select Field Component
interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: readonly string[];
  className?: string;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  placeholder,
  options,
  className = "h-10 sm:h-11 mt-1",
}: SelectFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Subject Select Field Component
interface SubjectSelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  subjects: Subject[];
  className?: string;
}

export function SubjectSelectField({
  id,
  label,
  value,
  onChange,
  subjects,
  className = "h-10 sm:h-11 mt-1",
}: SubjectSelectFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={className}>
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
    </div>
  );
}

// Input Field Component
interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  className = "h-10 sm:h-11 mt-1",
}: InputFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
}

// Textarea Field Component
interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "min-h-[80px] sm:min-h-[100px] mt-1",
}: TextareaFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />
    </div>
  );
}

// Checkbox Field Component
interface CheckboxFieldProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function CheckboxField({
  checked,
  onCheckedChange,
  className,
}: CheckboxFieldProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
      className={className}
    />
  );
}
