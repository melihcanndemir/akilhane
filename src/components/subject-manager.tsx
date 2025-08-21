"use client";

import React, { useState, useEffect } from "react";
import type { Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  GraduationCap,
  Target,
  Brain,
} from "lucide-react";
import { shouldUseDemoData, demoSubjects } from "@/data/demo-data";
import { SubjectService } from "@/services/supabase-service";
import { supabase } from "@/lib/supabase";
import { UnifiedStorageService } from "@/services/unified-storage-service";

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  questionCount: number;
  isActive: boolean;
  createdBy?: string | undefined;
  createdAt?: string;
  updatedAt?: string;
}

interface SubjectManagerProps {
  onRefresh?: () => void;
  refreshTrigger?: number;
}

const SubjectManager = ({ onRefresh, refreshTrigger }: SubjectManagerProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    difficulty: "Orta",
  });
  const [useSupabase, setUseSupabase] = useState(false);
  const { toast } = useToast();

  const loadSubjects = async () => {
    try {
      setIsLoading(true);

      // Use demo data for demo mode
      if (shouldUseDemoData()) {
        setSubjects(demoSubjects);
        setUseSupabase(false);

        // Save demo subjects to localStorage for Question Manager to use
        UnifiedStorageService.saveSubjects(demoSubjects);
        return;
      }

      // Fetch data from API
      const response = await fetch("/api/subjects");
      const apiSubjects = await response.json();

      // If API returns demo data and demo mode is off, show empty state
      if (
        apiSubjects.length > 0 &&
        apiSubjects[0].createdBy === "demo_user_btk_2025" &&
        !shouldUseDemoData()
      ) {
        setSubjects([]);
        setUseSupabase(false);
        return;
      }

      // If API returns real data, use it
      if (
        apiSubjects.length > 0 &&
        apiSubjects[0].createdBy !== "demo_user_btk_2025"
      ) {
        setSubjects(apiSubjects);
        setUseSupabase(true);

        // Save API subjects to localStorage for Question Manager to use
        UnifiedStorageService.saveSubjects(apiSubjects);
        return;
      }

      // If API returns empty, check localStorage
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUseSupabase(false);
        const localSubjects = UnifiedStorageService.getSubjects();

        // Calculate real question count using both localStorage and Supabase
        const getAllQuestions = async () => {
          let allQuestions: Question[] = [];

          try {
            // Check authentication
            const guestUser = localStorage.getItem("guestUser");
            const supabaseToken = localStorage.getItem("sb-gjdjjwvhxlhlftjwykcj-auth-token");
            const isAuth = Boolean(guestUser || supabaseToken);

            if (isAuth) {
              try {
                // Try to load from Supabase first
                const response = await fetch('/api/questions');
                if (response.ok) {
                  const dbQuestions = await response.json();
                  allQuestions = [...dbQuestions];
                }
              } catch {
                //do nothing
              }
            }

            // Also get local questions and merge
            const stored = localStorage.getItem("akilhane_questions");
            if (stored) {
              const localQuestions = JSON.parse(stored);
              localQuestions.forEach((localQ: Question) => {
                if (!allQuestions.find((cloudQ: Question) => cloudQ.id === localQ.id)) {
                  allQuestions.push(localQ);
                }
              });
            }

            return allQuestions;
          } catch {
            // Fallback to localStorage only
            const stored = localStorage.getItem("akilhane_questions");
            return stored ? JSON.parse(stored) : [];
          }
        };

        const questions = await getAllQuestions();
        // Calculate real question count for each subject
        const updatedSubjects = localSubjects.map((subject) => {
          const subjectQuestions = questions.filter((q: Question) => {
            const normalizedQuestionSubject = q.subject?.trim().toLowerCase();
            const normalizedSubjectName = subject.name.trim().toLowerCase();
            return normalizedQuestionSubject === normalizedSubjectName;
          });
          return {
            ...subject,
            questionCount: subjectQuestions.length,
          };
        });

        setSubjects(updatedSubjects);
        return;
      }

      setUseSupabase(true);

      // Fetch data from Supabase
      const supabaseSubjects = await SubjectService.getSubjects();
      const mappedSupabaseSubjects: Subject[] = supabaseSubjects.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        difficulty: s.difficulty,
        questionCount: s.question_count,
        isActive: s.is_active,
        createdBy: s.created_by,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      }));

      // Merge localStorage and Supabase data
      const localSubjects = UnifiedStorageService.getSubjects();
      const mergedSubjects = [...localSubjects];

      // Check each subject in Supabase
      mappedSupabaseSubjects.forEach((supabaseSubject) => {
        const existingIndex = mergedSubjects.findIndex(
          (local) => local.id === supabaseSubject.id,
        );
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
          if (typeof window === "undefined") {
            return [];
          }
          try {
            const stored = localStorage.getItem("akilhane_questions");
            return stored ? JSON.parse(stored) : [];
          } catch {
            return [];
          }
        };

      const questions = getQuestionsFromStorage();

      // Calculate real question count for each subject from Supabase or localStorage fallback
      const updatedMergedSubjects = await Promise.all(
        mergedSubjects.map(async (subject) => {
          try {
            // Check if user is authenticated
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
              // Authenticated user - get from Supabase
              const { count } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .eq('subject', subject.name);

              return {
                ...subject,
                questionCount: count || 0,
              };
            } else {
              // Guest user - use localStorage fallback
              const questionCount = questions.filter(
                (q: { subject: string }) => q.subject === subject.name,
              ).length;

              return {
                ...subject,
                questionCount,
              };
            }
          } catch {
            // Fallback to localStorage on error
            const questionCount = questions.filter(
              (q: { subject: string }) => q.subject === subject.name,
            ).length;

            return { ...subject, questionCount };
          }
        }),
      );

      setSubjects(updatedMergedSubjects);

      // Save merged subjects to localStorage for Question Manager to use
      if (updatedMergedSubjects.length > 0) {
        UnifiedStorageService.saveSubjects(updatedMergedSubjects);

      }
    } catch {
      //do nothing
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
        isActive: true,
      };

      if (useSupabase) {
        const result = await SubjectService.createSubject({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          question_count: 0,
          is_active: true,
        });

        if (result) {
          const mappedSubject: Subject = {
            id: result.id,
            name: result.name,
            description: result.description,
            category: result.category,
            difficulty: result.difficulty,
            questionCount: result.question_count,
            isActive: result.is_active,
            createdBy: result.created_by,
            createdAt: result.created_at,
            updatedAt: result.updated_at,
          };
          setSubjects((prev) => [mappedSubject, ...prev]);
        }
      } else {
        const result = UnifiedStorageService.addSubject(newSubject);
        setSubjects((prev) => [result, ...prev]);
      }

      toast({
        title: "Başarılı",
        description: "Ders başarıyla eklendi.",
      });

      setFormData({
        name: "",
        description: "",
        category: "",
        difficulty: "Orta",
      });
      setIsDialogOpen(false);

      // Call refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch {
      //do nothing
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
          difficulty: formData.difficulty,
        });

        if (result) {
          const mappedSubject: Subject = {
            id: result.id,
            name: result.name,
            description: result.description,
            category: result.category,
            difficulty: result.difficulty,
            questionCount: result.question_count,
            isActive: result.is_active,
            createdBy: result.created_by,
            createdAt: result.created_at,
            updatedAt: result.updated_at,
          };
          setSubjects((prev) =>
            prev.map((s) => (s.id === subject.id ? mappedSubject : s)),
          );
        }
      } else {
        const result = UnifiedStorageService.updateSubject(subject.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
        });

        if (result) {
          setSubjects((prev) =>
            prev.map((s) => (s.id === subject.id ? { ...s, ...formData } : s)),
          );
        }
      }

      toast({
        title: "Başarılı",
        description: "Ders başarıyla güncellendi.",
      });

      setFormData({
        name: "",
        description: "",
        category: "",
        difficulty: "Orta",
      });
      setEditingSubject(null);
      setIsDialogOpen(false);

      // Call refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch {
      //do nothing
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
          setSubjects((prev) => prev.filter((s) => s.id !== id));
        }
      } else {
        const success = UnifiedStorageService.deleteSubject(id);
        if (success) {
          setSubjects((prev) => prev.filter((s) => s.id !== id));
        }
      }

      toast({
        title: "Başarılı",
        description: "Ders başarıyla silindi.",
      });

      // Call refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch {
      //do nothing
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
        const subject = subjects.find((s) => s.id === id);
        if (subject) {
          const result = await SubjectService.toggleActive(
            id,
            !subject.isActive,
          );
          if (result) {
            const mappedSubject: Subject = {
              id: result.id,
              name: result.name,
              description: result.description,
              category: result.category,
              difficulty: result.difficulty,
              questionCount: result.question_count,
              isActive: result.is_active,
            };
            setSubjects((prev) =>
              prev.map((s) => (s.id === id ? mappedSubject : s)),
            );
          }
        }
      } else {
        const subject = subjects.find((s) => s.id === id);
        if (subject) {
          const result = UnifiedStorageService.updateSubject(id, { isActive: !subject.isActive });
          if (result) {
            setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)));
          }
        }
      }

      toast({
        title: "Başarılı",
        description: "Ders durumu güncellendi.",
      });
    } catch {
      //do nothing
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
      difficulty: subject.difficulty,
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingSubject(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      difficulty: "Orta",
    });
    setIsDialogOpen(true);
  };

  useEffect(() => {
    loadSubjects().then(() => {
      // Notify parent after initial load
      if (onRefresh) {
        onRefresh();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadSubjects();
    }
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Dersler yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8 glass-card">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Ders Yöneticisi
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
            Dersleri yönetin ve organize edin
          </p>
        </div>

        {/* Add Subject Button */}
        <div className="mb-6 flex justify-center mx-6 sm:mx-0">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openAddDialog}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Yeni Ders Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-auto max-w-[90%] sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? "Dersi Düzenle" : "Yeni Ders Ekle"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Ders Adı</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Örn: Matematik"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Ders açıklaması"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder="Örn: Fen Bilimleri"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Zorluk Seviyesi</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kolay">Kolay</SelectItem>
                      <SelectItem value="Orta">Orta</SelectItem>
                      <SelectItem value="Zor">Zor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    onClick={
                      editingSubject
                        ? () => {
                            void handleEditSubject(editingSubject);
                          }
                        : () => {
                            void handleAddSubject();
                          }
                    }
                    className="flex-1"
                  >
                    {editingSubject ? "Güncelle" : "Ekle"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mx-6 sm:mx-0">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                subject.isActive
                  ? "border-gradient-active"
                  : "border-2 border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2 truncate">
                      {subject.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                      {subject.description}
                    </p>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void handleToggleActive(subject.id);
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {subject.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
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
                      onClick={() => {
                        void handleDeleteSubject(subject.id);
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Kategori:
                    </span>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {subject.category}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Zorluk:
                    </span>
                    <Badge
                      className={
                        subject.difficulty === "Kolay"
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0"
                          : subject.difficulty === "Orta"
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0"
                            : "bg-gradient-to-r from-red-400 to-pink-500 text-white border-0"
                      }
                    >
                      {subject.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Soru Sayısı:
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {subject.questionCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Durum:
                    </span>
                    <Badge
                      className={
                        subject.isActive
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0"
                          : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0"
                      }
                    >
                      {subject.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-gradient-question shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  İlk Dersinizi Ekleyin
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Ders ekleyerek öğrenme yolculuğunuza başlayın!
                </p>
                <Button
                  onClick={openAddDialog}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ders Ekle
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gradient-question shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ders Yönetimi Nasıl Çalışır?
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Dersleri kategorilere göre organize edin ve yönetin.
                </p>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Ders Ekle</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-4 h-4" />
                    <span>Kategori Belirle</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Brain className="w-4 h-4" />
                    <span>AI Destekli</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gradient-question shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Öğrenme Süreci
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Her ders için özelleştirilmiş öğrenme yolları ve ilerleme takibi.
                </p>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                    <span>Ders Ekle</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                    <span>Sorular Ekle</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                    <span>Öğrenmeye Başla</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// Export the component and the AI handler function
export default SubjectManager;
