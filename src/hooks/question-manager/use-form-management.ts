import { useCallback } from "react";
import type { QuestionFormData, QuestionOption } from "@/types/question-manager";
import type { Question } from "@/lib/types";

export const useFormManagement = (
  formData: QuestionFormData,
  setFormData: (data: QuestionFormData) => void,
  editingQuestion: Question | null,
  setEditingQuestion: (question: Question | null) => void,
) => {
  // Handle form data changes
  const handleFormDataChange = useCallback((field: keyof QuestionFormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  }, [formData, setFormData]);

  // Handle option changes
  const handleOptionChange = useCallback((index: number, field: keyof QuestionOption, value: string | boolean) => {
    const newOptions = [...formData.options];
    if (newOptions[index]) {
      newOptions[index] = { ...newOptions[index], [field]: value };
      setFormData({ ...formData, options: newOptions });
    }
  }, [formData, setFormData]);

  // Add option
  const handleAddOption = useCallback(() => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: "", isCorrect: false }],
    });
  }, [formData, setFormData]);

  // Remove option
  const handleRemoveOption = useCallback((index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  }, [formData, setFormData]);

  // Reset form
  const handleResetForm = useCallback(() => {
    setFormData({
      subject: "",
      topic: "",
      type: "Çoktan Seçmeli",
      difficulty: "Orta",
      text: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      explanation: "",
      formula: "",
    });
  }, [setFormData]);

  // Handle edit option changes
  const handleEditOptionChange = useCallback((index: number, field: keyof QuestionOption, value: string | boolean) => {
    if (!editingQuestion) {
      return;
    }
    const newOptions = [...editingQuestion.options];
    if (newOptions[index]) {
      newOptions[index] = { ...newOptions[index], [field]: value };
      setEditingQuestion({ ...editingQuestion, options: newOptions });
    }
  }, [editingQuestion, setEditingQuestion]);

  // Add edit option
  const handleEditAddOption = useCallback(() => {
    if (!editingQuestion) {
      return;
    }
    setEditingQuestion({
      ...editingQuestion,
      options: [...editingQuestion.options, { text: "", isCorrect: false }],
    });
  }, [editingQuestion, setEditingQuestion]);

  // Remove edit option
  const handleEditRemoveOption = useCallback((index: number) => {
    if (!editingQuestion) {
      return;
    }
    const newOptions = editingQuestion.options.filter((_: QuestionOption, i: number) => i !== index);
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  }, [editingQuestion, setEditingQuestion]);

  // Handle edit question changes
  const handleEditQuestionChange = useCallback((field: keyof Question, value: string | boolean) => {
    if (!editingQuestion) {
      return;
    }
    setEditingQuestion({ ...editingQuestion, [field]: value });
  }, [editingQuestion, setEditingQuestion]);

  return {
    handleFormDataChange,
    handleOptionChange,
    handleAddOption,
    handleRemoveOption,
    handleResetForm,
    handleEditOptionChange,
    handleEditAddOption,
    handleEditRemoveOption,
    handleEditQuestionChange,
  };
};
