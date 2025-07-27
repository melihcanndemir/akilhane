'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Filter, BookOpen, Database, GraduationCap, Search } from 'lucide-react';
import type { Question } from '@/lib/types';
import Link from 'next/link';
import MobileNav from '@/components/mobile-nav';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/loading-spinner';
import { shouldUseDemoData } from '@/data/demo-data';
import { QuestionService, SubjectService } from '@/services/supabase-service';
import { supabase } from '@/lib/supabase';

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  questionCount: number;
  isActive: boolean;
}

// LocalStorage service for questions (fallback)
class QuestionLocalStorageService {
  private static readonly STORAGE_KEY = 'exam_training_questions';

  static getQuestions(): Question[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveQuestions(questions: Question[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(questions));
    } catch (error) {
      console.error('Error saving questions to localStorage:', error);
    }
  }

  static addQuestion(question: Omit<Question, 'id'>): Question {
    const newQuestion: Question = {
      ...question,
      id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const questions = this.getQuestions();
    questions.push(newQuestion);
    this.saveQuestions(questions);
    return newQuestion;
  }

  static updateQuestion(id: string, updates: Partial<Question>): boolean {
    const questions = this.getQuestions();
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return false;

    const existingQuestion = questions[index];
    if (existingQuestion) {
      questions[index] = {
        id: existingQuestion.id,
        subject: existingQuestion.subject,
        type: existingQuestion.type,
        difficulty: existingQuestion.difficulty,
        text: existingQuestion.text,
        options: existingQuestion.options,
        explanation: existingQuestion.explanation,
        topic: existingQuestion.topic || '',
        formula: existingQuestion.formula || '',
        ...updates,
      };
    }
    this.saveQuestions(questions);
    return true;
  }

  static deleteQuestion(id: string): boolean {
    const questions = this.getQuestions();
    const filtered = questions.filter(q => q.id !== id);
    if (filtered.length === questions.length) return false;
    
    this.saveQuestions(filtered);
    return true;
  }

  static getQuestionsBySubject(subject: string): Question[] {
    const questions = this.getQuestions();
    return questions.filter(q => q.subject === subject);
  }
}

// LocalStorage service for subjects (fallback)
class SubjectLocalStorageService {
  private static readonly STORAGE_KEY = 'exam_training_subjects';

  static getSubjects(): Subject[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveSubjects(subjects: Subject[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(subjects));
    } catch (error) {
      console.error('Error saving subjects to localStorage:', error);
    }
  }
}

const questionTypes = [
  'Çoktan Seçmeli',
  'Doğru/Yanlış',
  'Hesaplama',
  'Vaka Çalışması',
];

const difficulties = ['Kolay', 'Orta', 'Zor'];

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    type: 'Çoktan Seçmeli',
    difficulty: 'Orta',
    text: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    explanation: '',
    formula: '',
  });

  // Load subjects and questions
  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadQuestions();
    }
  }, [selectedSubject]);

  const loadSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      
      // Use demo data for demo mode
      if (shouldUseDemoData()) {
        // Demo subjects
        const demoSubjects: Subject[] = [
          {
            id: 'subj_matematik_001',
            name: 'Matematik',
            description: 'Temel matematik konuları: Cebir, Geometri, Analiz',
            category: 'Fen Bilimleri',
            difficulty: 'Orta',
            questionCount: 245,
            isActive: true,
          },
          {
            id: 'subj_fizik_002',
            name: 'Fizik',
            description: 'Mekanik, Termodinamik, Elektrik ve Manyetizma',
            category: 'Fen Bilimleri',
            difficulty: 'Orta',
            questionCount: 198,
            isActive: true,
          },
          {
            id: 'subj_kimya_003',
            name: 'Kimya',
            description: 'Genel Kimya, Organik ve Anorganik Kimya',
            category: 'Fen Bilimleri',
            difficulty: 'Zor',
            questionCount: 167,
            isActive: true,
          }
        ];
        setSubjects(demoSubjects);
        if (demoSubjects.length > 0 && demoSubjects[0]) {
          const firstSubject = demoSubjects[0];
          setSelectedSubject(firstSubject.name);
          setFormData(prev => ({ ...prev, subject: firstSubject.name }));
        }
        return;
      }

      // First check authentication
      console.log('🔐 Question Manager - Checking authentication...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('❌ No session found, using localStorage');
        const localSubjects = SubjectLocalStorageService.getSubjects();
        setSubjects(localSubjects);
        if (localSubjects.length > 0 && localSubjects[0]) {
          const firstSubject = localSubjects[0];
          setSelectedSubject(firstSubject.name);
          setFormData(prev => ({ ...prev, subject: firstSubject.name }));
        }
        return;
      }

      console.log('✅ Question Manager - Session found, using Supabase');
      
      const supabaseSubjects = await SubjectService.getSubjects();
      const mappedSubjects: Subject[] = supabaseSubjects.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        difficulty: s.difficulty,
        questionCount: s.question_count,
        isActive: s.is_active
      }));
      
      setSubjects(mappedSubjects);
      
      // Sync Supabase subjects to localStorage
      console.log('📦 Syncing Supabase subjects to localStorage...');
      SubjectLocalStorageService.saveSubjects(mappedSubjects);
      
      if (mappedSubjects.length > 0 && mappedSubjects[0]) {
        const firstSubject = mappedSubjects[0];
        setSelectedSubject(firstSubject.name);
        setFormData(prev => ({ ...prev, subject: firstSubject.name }));
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      // Fallback to localStorage
      const localSubjects = SubjectLocalStorageService.getSubjects();
      setSubjects(localSubjects);
      if (localSubjects.length > 0 && localSubjects[0]) {
        const firstSubject = localSubjects[0];
        setSelectedSubject(firstSubject.name);
        setFormData(prev => ({ ...prev, subject: firstSubject.name }));
      }
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      
      // Use demo data for demo mode
      if (shouldUseDemoData()) {
        // Demo questions
        const demoQuestions: Question[] = [
          {
            id: 'demo_q_1',
            subject: 'Matematik' as any, // Type assertion for demo
            type: 'multiple-choice',
            difficulty: 'Medium',
            text: '2x + 5 = 13 denkleminin çözümü nedir?',
            options: [
              { text: 'x = 4', isCorrect: true },
              { text: 'x = 3', isCorrect: false },
              { text: 'x = 5', isCorrect: false },
              { text: 'x = 6', isCorrect: false }
            ],
            explanation: '2x + 5 = 13 → 2x = 8 → x = 4',
            topic: 'Cebir'
          },
          {
            id: 'demo_q_2',
            subject: 'Fizik' as any, // Type assertion for demo
            type: 'multiple-choice',
            difficulty: 'Medium',
            text: 'Hangi kuvvet türü temas gerektirmez?',
            options: [
              { text: 'Sürtünme kuvveti', isCorrect: false },
              { text: 'Yerçekimi kuvveti', isCorrect: true },
              { text: 'Normal kuvvet', isCorrect: false },
              { text: 'Tepki kuvveti', isCorrect: false }
            ],
            explanation: 'Yerçekimi kuvveti uzaktan etki eden bir kuvvettir.',
            topic: 'Mekanik'
          }
        ];
        setQuestions(demoQuestions);
        return;
      }

      // Check Supabase usage
      console.log('🎯 Question Manager - Loading questions for subject:', selectedSubject);
      
      const supabaseQuestions = await QuestionService.getQuestionsBySubject(selectedSubject);
      const mappedQuestions: Question[] = supabaseQuestions.map(q => ({
        id: q.id,
        subject: q.subject,
        type: q.type as 'multiple-choice' | 'true-false' | 'calculation' | 'case-study',
        difficulty: q.difficulty as 'Easy' | 'Medium' | 'Hard',
        text: q.text,
        options: JSON.parse(q.options),
        explanation: q.explanation,
        topic: q.topic,
        formula: q.formula || ''
      }));
      
      setQuestions(mappedQuestions);
      
      // Sync Supabase questions to localStorage
      console.log('📦 Syncing Supabase questions to localStorage...');
      const allQuestions = QuestionLocalStorageService.getQuestions();
      const updatedQuestions = allQuestions.filter(q => q.subject !== selectedSubject);
      updatedQuestions.push(...mappedQuestions);
      QuestionLocalStorageService.saveQuestions(updatedQuestions);
      
    } catch (error) {
      console.error('Error loading questions:', error);
      // Fallback to localStorage
      const localQuestions = QuestionLocalStorageService.getQuestionsBySubject(selectedSubject);
      setQuestions(localQuestions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      setIsCreating(true);

      // Validate form
      if (!formData.text || !formData.topic || !formData.explanation) {
        toast({ title: 'Hata!', description: 'Lütfen tüm zorunlu alanları doldurun', variant: 'destructive' });
        return;
      }

      // Validate options for multiple choice questions
      if (formData.type === 'Çoktan Seçmeli') {
        const validOptions = formData.options.filter(opt => opt.text.trim() !== '');
        if (validOptions.length < 2) {
          toast({ title: 'Hata!', description: 'En az 2 seçenek gerekli', variant: 'destructive' });
          return;
        }

        const correctOptions = validOptions.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) {
          toast({ title: 'Hata!', description: 'Tam olarak 1 doğru cevap seçmelisiniz', variant: 'destructive' });
          return;
        }
      }

      const validOptions = formData.options.filter(opt => opt.text.trim() !== '');

      // Demo mode control
      if (shouldUseDemoData()) {
        QuestionLocalStorageService.addQuestion({
          subject: formData.subject,
          type: formData.type === 'Çoktan Seçmeli' ? 'multiple-choice' : 
                formData.type === 'Doğru/Yanlış' ? 'true-false' :
                formData.type === 'Hesaplama' ? 'calculation' : 'case-study',
          difficulty: formData.difficulty === 'Kolay' ? 'Easy' : 
                     formData.difficulty === 'Orta' ? 'Medium' : 'Hard',
          text: formData.text,
          options: validOptions,
          explanation: formData.explanation,
          formula: formData.formula,
          topic: formData.topic
        });

        toast({ title: 'Başarılı!', description: 'Soru başarıyla oluşturuldu!' });
        resetForm();
        loadQuestions();
        return;
      }

      // Check authentication
      console.log('🔐 Question Manager - Checking authentication for create...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('❌ No session found, using localStorage for create');
        QuestionLocalStorageService.addQuestion({
          subject: formData.subject,
          type: formData.type === 'Çoktan Seçmeli' ? 'multiple-choice' : 
                formData.type === 'Doğru/Yanlış' ? 'true-false' :
                formData.type === 'Hesaplama' ? 'calculation' : 'case-study',
          difficulty: formData.difficulty === 'Kolay' ? 'Easy' : 
                     formData.difficulty === 'Orta' ? 'Medium' : 'Hard',
          text: formData.text,
          options: validOptions,
          explanation: formData.explanation,
          formula: formData.formula,
          topic: formData.topic
        });

        toast({ title: 'Başarılı!', description: 'Soru başarıyla oluşturuldu!' });
        resetForm();
        loadQuestions();
        return;
      }

      // Check Supabase usage
      console.log('✅ Question Manager - Session found, using Supabase for create');
      
      const result = await QuestionService.createQuestion({
        subject_id: subjects.find(s => s.name === formData.subject)?.id || '',
        subject: formData.subject,
        topic: formData.topic,
        type: formData.type === 'Çoktan Seçmeli' ? 'multiple-choice' : 
              formData.type === 'Doğru/Yanlış' ? 'true-false' :
              formData.type === 'Hesaplama' ? 'calculation' : 'case-study',
        difficulty: formData.difficulty === 'Kolay' ? 'Easy' : 
                   formData.difficulty === 'Orta' ? 'Medium' : 'Hard',
        text: formData.text,
        options: JSON.stringify(validOptions),
        correct_answer: validOptions.find(opt => opt.isCorrect)?.text || '',
        explanation: formData.explanation,
        formula: formData.formula,
        is_active: true
      });

      if (result) {
        toast({ title: 'Başarılı!', description: 'Soru başarıyla oluşturuldu!' });
        resetForm();
        loadQuestions();
      } else {
        throw new Error('Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast({ title: 'Hata!', description: 'Soru oluşturulurken bir hata oluştu', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Bu soruyu kalıcı olarak silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      // Demo mode control
      if (shouldUseDemoData()) {
        const success = QuestionLocalStorageService.deleteQuestion(questionId);
        if (!success) {
          throw new Error('Failed to delete question');
        }

        toast({
          title: 'Başarılı!',
          description: 'Soru başarıyla silindi.',
        });
        loadQuestions(); // Refresh the list
        return;
      }

      // Check authentication
      console.log('🔐 Question Manager - Checking authentication for delete...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('❌ No session found, using localStorage for delete');
        const success = QuestionLocalStorageService.deleteQuestion(questionId);
        if (!success) {
          throw new Error('Failed to delete question');
        }

        toast({
          title: 'Başarılı!',
          description: 'Soru başarıyla silindi.',
        });
        loadQuestions(); // Refresh the list
        return;
      }

      // Check Supabase usage
      console.log('✅ Question Manager - Session found, using Supabase for delete');
      
      const success = await QuestionService.deleteQuestion(questionId);
      if (success) {
        toast({
          title: 'Başarılı!',
          description: 'Soru başarıyla silindi.',
        });
        loadQuestions(); // Refresh the list
      } else {
        throw new Error('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Hata!',
        description: 'Soru silinirken bir hata oluştu',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      // Demo mode control
      if (shouldUseDemoData()) {
        const success = QuestionLocalStorageService.updateQuestion(editingQuestion.id, editingQuestion);
        if (!success) {
          throw new Error('Failed to update question');
        }

        toast({
          title: 'Başarılı!',
          description: 'Soru başarıyla güncellendi.',
        });
        setIsEditDialogOpen(false);
        setEditingQuestion(null);
        loadQuestions(); // Refresh the list
        return;
      }

      // Check authentication
      console.log('🔐 Question Manager - Checking authentication for update...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('❌ No session found, using localStorage for update');
        const success = QuestionLocalStorageService.updateQuestion(editingQuestion.id, editingQuestion);
        if (!success) {
          throw new Error('Failed to update question');
        }

        toast({
          title: 'Başarılı!',
          description: 'Soru başarıyla güncellendi.',
        });
        setIsEditDialogOpen(false);
        setEditingQuestion(null);
        loadQuestions(); // Refresh the list
        return;
      }

      // Check Supabase usage
      console.log('✅ Question Manager - Session found, using Supabase for update');
      
      const validOptions = editingQuestion.options.filter((opt: any) => opt.text.trim() !== '');
      
      const success = await QuestionService.updateQuestion(editingQuestion.id, {
        subject: editingQuestion.subject,
        topic: editingQuestion.topic,
        type: editingQuestion.type,
        difficulty: editingQuestion.difficulty,
        text: editingQuestion.text,
        options: JSON.stringify(validOptions),
        correct_answer: validOptions.find((opt: any) => opt.isCorrect)?.text || '',
        explanation: editingQuestion.explanation,
        formula: editingQuestion.formula
      });

      if (success) {
        toast({
          title: 'Başarılı!',
          description: 'Soru başarıyla güncellendi.',
        });
        setIsEditDialogOpen(false);
        setEditingQuestion(null);
        loadQuestions(); // Refresh the list
      } else {
        throw new Error('Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: 'Hata!',
        description: 'Soru güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (question: Question) => {
    // Ensure options are in a mutable format
    const mutableQuestion = {
        ...question,
        options: Array.isArray(question.options) ? [...question.options] : JSON.parse(question.options || '[]')
    };
    setEditingQuestion(mutableQuestion);
    setIsEditDialogOpen(true);
  };
  
  const handleEditOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    if (!editingQuestion) return;
    const newOptions = [...editingQuestion.options];
    newOptions[index] = { ...newOptions[index], [field]: value };

    // If setting an option to correct, uncheck others for multiple choice
    if (field === 'isCorrect' && value === true && editingQuestion.type === 'multiple-choice') {
        newOptions.forEach((opt, i) => {
            if (i !== index) {
                opt.isCorrect = false;
            }
        });
    }

    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  const handleEditAddOption = () => {
    if (!editingQuestion) return;
    const newOptions = [...editingQuestion.options, { text: '', isCorrect: false }];
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  const handleEditRemoveOption = (index: number) => {
    if (!editingQuestion || editingQuestion.options.length <= 2) return;
    const newOptions = editingQuestion.options.filter((_: any, i: number) => i !== index);
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  const resetForm = () => {
    setFormData({
      subject: selectedSubject,
      topic: '',
      type: 'Çoktan Seçmeli',
      difficulty: 'Orta',
      text: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      explanation: '',
      formula: '',
    });
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newOptions = [...formData.options];
    const currentOption = newOptions[index];
    if (currentOption) {
      newOptions[index] = { text: currentOption.text, isCorrect: currentOption.isCorrect, [field]: value };
      setFormData({ ...formData, options: newOptions });
    }
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', isCorrect: false }],
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (question.topic || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen">
      {/* Responsive Navigation Bar */}
      <MobileNav />

      <div className="p-4 md:p-8">
        <div className="container mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-headline font-bold text-primary">Soru Yöneticisi</h1>
              <p className="text-muted-foreground">Soru ekle, düzenle ve yönet</p>
            </div>
            <div className="flex gap-2">
              {shouldUseDemoData() ? (
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  BTK Demo
                </div>
              ) : (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  ☁️ Cloud Storage
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Question Form */}
            <Card id="question-form" className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Yeni Soru Ekle
                </CardTitle>
                <CardDescription>
                  Yeni bir soru oluşturmak için formu doldurun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Ders</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ders seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                            <GraduationCap className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Henüz ders bulunmuyor
                            </p>
                            <p className="text-xs text-muted-foreground/70 mb-3">
                              Ders yöneticisinden ders ekleyin
                            </p>
                            <Link href="/subject-manager">
                              <Button size="sm" variant="outline" className="text-xs">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                Ders Ekle
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="topic">Konu</Label>
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      placeholder="Örn: Finansal Tablolar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Soru Tipi</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                            <BookOpen className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Soru tipi bulunamadı
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              Sistem yapılandırması gerekli
                            </p>
                          </div>
                        ) : (
                          questionTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Zorluk</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                            <Filter className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Zorluk seviyesi bulunamadı
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              Sistem yapılandırması gerekli
                            </p>
                          </div>
                        ) : (
                          difficulties.map(difficulty => (
                            <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="text">Soru Metni</Label>
                  <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                    placeholder="Soruyu buraya yazın..."
                    rows={3}
                  />
                </div>

                {formData.type === 'Çoktan Seçmeli' && (
                  <div>
                    <Label>Seçenekler</Label>
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Checkbox
                            checked={option.isCorrect}
                            onCheckedChange={(checked) => 
                              handleOptionChange(index, 'isCorrect', checked as boolean)
                            }
                          />
                          <Input
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                            placeholder={`Seçenek ${index + 1}`}
                            className="flex-1"
                          />
                          {formData.options.length > 2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addOption}>
                        <Plus className="w-4 h-4 mr-2" />
                        Seçenek Ekle
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="explanation">Açıklama</Label>
                  <Textarea
                    id="explanation"
                    value={formData.explanation}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    placeholder="Doğru cevabın açıklaması..."
                    rows={3}
                  />
                </div>

                {formData.type === 'Hesaplama' && (
                  <div>
                    <Label htmlFor="formula">Formül (Opsiyonel)</Label>
                    <Input
                      id="formula"
                      value={formData.formula}
                      onChange={(e) => setFormData({...formData, formula: e.target.value})}
                      placeholder="Hesaplama formülü..."
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleCreateQuestion} disabled={isCreating}>
                    {isCreating ? 'Oluşturuluyor...' : 'Soru Oluştur'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Sıfırla
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Sorular</CardTitle>
                <CardDescription>
                  {selectedSubject ? `${selectedSubject} dersindeki sorular` : 'Ders seçin'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Ders seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                          <GraduationCap className="w-8 h-8 text-muted-foreground/50 mb-2" />
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Henüz ders bulunmuyor
                          </p>
                          <p className="text-xs text-muted-foreground/70 mb-3">
                            Ders yöneticisinden ders ekleyin
                          </p>
                          <Link href="/subject-manager">
                            <Button size="sm" variant="outline" className="text-xs">
                              <GraduationCap className="w-3 h-3 mr-1" />
                              Ders Ekle
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Soru ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 min-h-[44px] sm:min-h-[40px] text-base pl-10 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm"
                    />
                  </div>
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Zorluk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {difficulties.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                          <Filter className="w-8 h-8 text-muted-foreground/50 mb-2" />
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Zorluk seviyesi bulunamadı
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            Sistem yapılandırması gerekli
                          </p>
                        </div>
                      ) : (
                        difficulties.map(difficulty => (
                          <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Questions */}
                {isLoadingSubjects ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-medium">Dersler yükleniyor...</p>
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <GraduationCap className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Henüz ders bulunmuyor
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Soru ekleyebilmek için önce ders yöneticisinden bir ders oluşturmanız gerekiyor.
                    </p>
                    <Link href="/subject-manager">
                      <Button className="gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Ders Ekle
                      </Button>
                    </Link>
                  </div>
                ) : isLoading ? (
                  <LoadingSpinner />
                ) : !selectedSubject ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Database className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Ders Seçin
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Soruları görüntülemek ve yönetmek için yukarıdan bir ders seçin.
                    </p>
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Bu derste henüz soru bulunmuyor
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Seçili derste henüz soru eklenmemiş. Sol taraftaki formu kullanarak ilk sorunuzu oluşturabilirsiniz.
                    </p>
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        // Scroll to form
                        document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      İlk Soruyu Ekle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredQuestions.map((question) => (
                      <div key={question.id} className="p-4 glass-card-inner">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                              {question.difficulty === 'Easy' ? 'Kolay' : question.difficulty === 'Medium' ? 'Orta' : question.difficulty === 'Hard' ? 'Zor' : question.difficulty}
                            </span>
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
                              {question.topic}
                            </span>
                             <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                                {question.type === 'multiple-choice' ? 'Çoktan Seçmeli' : question.type === 'true-false' ? 'Doğru/Yanlış' : question.type === 'calculation' ? 'Hesaplama' : question.type === 'case-study' ? 'Vaka Çalışması' : question.type}
                            </span>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(question)} className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDeleteQuestion(question.id)} className="text-red-500 hover:text-red-600 h-8 w-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm font-medium mb-2">{question.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {question.options.length} seçenek
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Soruyu Düzenle</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-text" className="text-right">Soru Metni</Label>
                <Textarea
                  id="edit-text"
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-topic" className="text-right">Konu</Label>
                <Input
                  id="edit-topic"
                  value={editingQuestion.topic}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                  className="col-span-3"
                />
              </div>
               {editingQuestion.type === 'multiple-choice' && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Seçenekler</Label>
                    <div className="col-span-3 space-y-2">
                      {editingQuestion.options.map((option: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Checkbox
                            checked={option.isCorrect}
                            onCheckedChange={(checked) => handleEditOptionChange(index, 'isCorrect', checked as boolean)}
                          />
                          <Input
                            value={option.text}
                            onChange={(e) => handleEditOptionChange(index, 'text', e.target.value)}
                            placeholder={`Seçenek ${index + 1}`}
                            className="flex-1"
                          />
                          {editingQuestion.options.length > 2 && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={() => handleEditRemoveOption(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={handleEditAddOption} className="mt-2">
                        <Plus className="w-4 h-4 mr-2" />
                        Seçenek Ekle
                      </Button>
                    </div>
                  </div>
                )}
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-explanation" className="text-right">Açıklama</Label>
                <Textarea
                  id="edit-explanation"
                  value={editingQuestion.explanation}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <DialogClose asChild>
                <Button variant="outline">İptal</Button>
            </DialogClose>
            <Button onClick={handleUpdateQuestion}>Değişiklikleri Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 