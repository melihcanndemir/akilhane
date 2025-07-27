'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { shouldUseDemoData, demoSubjects } from '@/data/demo-data';
import { SubjectService } from '@/services/supabase-service';
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

// LocalStorage service for subjects
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

  static addSubject(subject: Omit<Subject, 'id'>): Subject {
    const newSubject: Subject = {
      ...subject,
      id: `subj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const subjects = this.getSubjects();
    subjects.push(newSubject);
    this.saveSubjects(subjects);
    return newSubject;
  }

  static updateSubject(id: string, updates: Partial<Subject>): Subject | null {
    const subjects = this.getSubjects();
    const index = subjects.findIndex(s => s.id === id);
    if (index === -1) return null;

    const existingSubject = subjects[index];
    if (existingSubject) {
      subjects[index] = {
        id: existingSubject.id,
        name: existingSubject.name,
        description: existingSubject.description,
        category: existingSubject.category,
        difficulty: existingSubject.difficulty,
        questionCount: existingSubject.questionCount,
        isActive: existingSubject.isActive,
        ...updates,
      };
      this.saveSubjects(subjects);
      return subjects[index];
    }
    return null;
  }

  static deleteSubject(id: string): boolean {
    const subjects = this.getSubjects();
    const filtered = subjects.filter(s => s.id !== id);
    if (filtered.length === subjects.length) return false;
    
    this.saveSubjects(filtered);
    return true;
  }

  static toggleActive(id: string): Subject | null {
    const subjects = this.getSubjects();
    const index = subjects.findIndex(s => s.id === id);
    if (index === -1) return null;

    const existingSubject = subjects[index];
    if (existingSubject) {
      subjects[index] = {
        id: existingSubject.id,
        name: existingSubject.name,
        description: existingSubject.description,
        category: existingSubject.category,
        difficulty: existingSubject.difficulty,
        questionCount: existingSubject.questionCount,
        isActive: !existingSubject.isActive,
      };
      this.saveSubjects(subjects);
      return subjects[index];
    }
    return null;
  }
}

const SubjectManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'Orta'
  });
  const [useSupabase, setUseSupabase] = useState(false);
  const { toast } = useToast();

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      
      // Use demo data for demo mode
      if (shouldUseDemoData()) {
        console.log('🎯 Subject Manager - Using Demo Data');
        setSubjects(demoSubjects);
        setUseSupabase(false);
        return;
      }

      // Fetch data from API
      console.log('🔐 Subject Manager - Fetching from API...');
      const response = await fetch('/api/subjects');
      const apiSubjects = await response.json();
      
      // If API returns demo data and demo mode is off, show empty state
      if (apiSubjects.length > 0 && apiSubjects[0].createdBy === 'demo_user_btk_2025' && !shouldUseDemoData()) {
        console.log('❌ Subject Manager - API returned demo data but demo mode is off, showing empty state');
        setSubjects([]);
        setUseSupabase(false);
        return;
      }
      
      // If API returns real data, use it
      if (apiSubjects.length > 0 && apiSubjects[0].createdBy !== 'demo_user_btk_2025') {
        console.log('✅ Subject Manager - Using API data');
        setSubjects(apiSubjects);
        setUseSupabase(true);
        return;
      }

      // If API returns empty, check localStorage
      console.log('🔍 Subject Manager - API empty, checking localStorage...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('❌ No session found, using localStorage');
        setUseSupabase(false);
        const localSubjects = SubjectLocalStorageService.getSubjects();
        
        // Calculate real question count
        const getQuestionsFromStorage = () => {
          if (typeof window === 'undefined') return [];
          try {
            const stored = localStorage.getItem('exam_training_questions');
            return stored ? JSON.parse(stored) : [];
          } catch {
            return [];
          }
        };
        
        const questions = getQuestionsFromStorage();
        
        // Calculate real question count for each subject
        const updatedSubjects = localSubjects.map(subject => {
          const questionCount = questions.filter((q: any) => q.subject === subject.name).length;
          console.log(`🔍 Debug - Subject: ${subject.name}, Question count: ${questionCount}`);
          return {
            ...subject,
            questionCount
          };
        });
        
        setSubjects(updatedSubjects);
        return;
      }

      console.log('✅ Session found, using Supabase');
      setUseSupabase(true);
      
      // Fetch data from Supabase
      const supabaseSubjects = await SubjectService.getSubjects();
      const mappedSupabaseSubjects: Subject[] = supabaseSubjects.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        difficulty: s.difficulty,
        questionCount: s.question_count,
        isActive: s.is_active
      }));
      
      // Merge localStorage and Supabase data
      console.log('🔄 Merging localStorage and Supabase data...');
      const localSubjects = SubjectLocalStorageService.getSubjects();
      const mergedSubjects = [...localSubjects];
      
      // Check each subject in Supabase
      mappedSupabaseSubjects.forEach(supabaseSubject => {
        const existingIndex = mergedSubjects.findIndex(local => local.id === supabaseSubject.id);
        if (existingIndex !== -1) {
          // If same ID exists, update with Supabase data
          mergedSubjects[existingIndex] = supabaseSubject;
        } else {
          // If new subject, add it
          mergedSubjects.push(supabaseSubject);
        }
      });
      
      // Calculate real question count
      const getQuestionsFromStorage = () => {
        if (typeof window === 'undefined') return [];
        try {
          const stored = localStorage.getItem('exam_training_questions');
          return stored ? JSON.parse(stored) : [];
        } catch {
          return [];
        }
      };
      
      const questions = getQuestionsFromStorage();
      
      // Calculate real question count for each subject
      const updatedMergedSubjects = mergedSubjects.map(subject => {
        const questionCount = questions.filter((q: any) => q.subject === subject.name).length;
        return {
          ...subject,
          questionCount
        };
      });
      
      setSubjects(updatedMergedSubjects);
    } catch (error) {
      console.error('❌ Error loading subjects:', error);
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = async () => {
    try {
      if (!formData.name || !formData.description || !formData.category) {
        toast({
          title: "Hata",
          description: "Lütfen tüm alanları doldurun.",
          variant: "destructive",
        });
        return;
      }

      const newSubject = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        questionCount: 0,
        isActive: true
      };

      if (useSupabase) {
        const result = await SubjectService.createSubject({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          question_count: 0,
          is_active: true
        });
        
        if (result) {
          const mappedSubject: Subject = {
            id: result.id,
            name: result.name,
            description: result.description,
            category: result.category,
            difficulty: result.difficulty,
            questionCount: result.question_count,
            isActive: result.is_active
          };
          setSubjects(prev => [mappedSubject, ...prev]);
        }
      } else {
        const result = SubjectLocalStorageService.addSubject(newSubject);
        setSubjects(prev => [result, ...prev]);
      }

      toast({
        title: "Başarılı",
        description: "Ders başarıyla eklendi.",
      });

      setFormData({ name: '', description: '', category: '', difficulty: 'Orta' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({
        title: "Hata",
        description: "Ders eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleEditSubject = async (subject: Subject) => {
    try {
      if (!formData.name || !formData.description || !formData.category) {
        toast({
          title: "Hata",
          description: "Lütfen tüm alanları doldurun.",
          variant: "destructive",
        });
        return;
      }

      if (useSupabase) {
        const result = await SubjectService.updateSubject(subject.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty
        });
        
        if (result) {
          const mappedSubject: Subject = {
            id: result.id,
            name: result.name,
            description: result.description,
            category: result.category,
            difficulty: result.difficulty,
            questionCount: result.question_count,
            isActive: result.is_active
          };
          setSubjects(prev => prev.map(s => s.id === subject.id ? mappedSubject : s));
        }
      } else {
        const result = SubjectLocalStorageService.updateSubject(subject.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty
        });
        
        if (result) {
          setSubjects(prev => prev.map(s => s.id === subject.id ? result : s));
        }
      }

      toast({
        title: "Başarılı",
        description: "Ders başarıyla güncellendi.",
      });

      setFormData({ name: '', description: '', category: '', difficulty: 'Orta' });
      setEditingSubject(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating subject:', error);
      toast({
        title: "Hata",
        description: "Ders güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      if (useSupabase) {
        const success = await SubjectService.deleteSubject(id);
        if (success) {
          setSubjects(prev => prev.filter(s => s.id !== id));
        }
      } else {
        const success = SubjectLocalStorageService.deleteSubject(id);
        if (success) {
          setSubjects(prev => prev.filter(s => s.id !== id));
        }
      }

      toast({
        title: "Başarılı",
        description: "Ders başarıyla silindi.",
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: "Hata",
        description: "Ders silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      if (useSupabase) {
        const subject = subjects.find(s => s.id === id);
        if (subject) {
          const result = await SubjectService.toggleActive(id, !subject.isActive);
          if (result) {
            const mappedSubject: Subject = {
              id: result.id,
              name: result.name,
              description: result.description,
              category: result.category,
              difficulty: result.difficulty,
              questionCount: result.question_count,
              isActive: result.is_active
            };
            setSubjects(prev => prev.map(s => s.id === id ? mappedSubject : s));
          }
        }
      } else {
        const result = SubjectLocalStorageService.toggleActive(id);
        if (result) {
          setSubjects(prev => prev.map(s => s.id === id ? result : s));
        }
      }

      toast({
        title: "Başarılı",
        description: "Ders durumu güncellendi.",
      });
    } catch (error) {
      console.error('Error toggling subject:', error);
      toast({
        title: "Hata",
        description: "Ders durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description,
      category: subject.category,
      difficulty: subject.difficulty
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingSubject(null);
    setFormData({ name: '', description: '', category: '', difficulty: 'Orta' });
    setIsDialogOpen(true);
  };

  useEffect(() => {
    console.log('🚀 SubjectManager useEffect triggered');
    loadSubjects();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Dersler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              📚 Ders Yöneticisi
            </h1>
            {shouldUseDemoData() && (
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                🎯 BTK Demo
              </Badge>
            )}
            {useSupabase && (
              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                ☁️ Cloud Storage
              </Badge>
            )}
            {!useSupabase && !shouldUseDemoData() && (
              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                💾 LocalStorage
              </Badge>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Dersleri yönetin ve organize edin
          </p>
        </div>

        {/* Add Subject Button */}
        <div className="mb-6 flex justify-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="w-5 h-5 mr-2" />
                Yeni Ders Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Ders Adı</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Örn: Matematik"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ders açıklaması"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Örn: Fen Bilimleri"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Zorluk Seviyesi</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kolay">Kolay</SelectItem>
                      <SelectItem value="Orta">Orta</SelectItem>
                      <SelectItem value="Zor">Zor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={editingSubject ? () => handleEditSubject(editingSubject) : handleAddSubject} className="flex-1">
                    {editingSubject ? 'Güncelle' : 'Ekle'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    İptal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 ${
                subject.isActive ? 'border-green-200 dark:border-green-800' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                      {subject.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {subject.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(subject.id)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {subject.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(subject)}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Kategori:</span>
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                      {subject.category}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Zorluk:</span>
                    <Badge 
                      className={
                        subject.difficulty === 'Kolay' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                        subject.difficulty === 'Orta' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }
                    >
                      {subject.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Soru Sayısı:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {subject.questionCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Durum:</span>
                    <Badge 
                      className={subject.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'}
                    >
                      {subject.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Henüz ders eklenmemiş
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              İlk dersinizi ekleyerek başlayın!
            </p>
            <Button onClick={openAddDialog} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
              <Plus className="w-5 h-5 mr-2" />
              İlk Dersi Ekle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManager; 