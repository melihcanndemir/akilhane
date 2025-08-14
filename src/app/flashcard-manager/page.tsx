"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Brain,
  Sparkles,
  Loader2,
  Target,
  Zap,
  CheckCircle,
  BookOpen,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { shouldUseDemoData } from "@/data/demo-data";
import { generateFlashcards, type FlashcardGenerationOutput } from "@/ai/flows/flashcard-generation";
import { UnifiedStorageService, type Flashcard } from "@/services/unified-storage-service";

interface Subject {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  isActive: boolean;
}

export default function FlashcardManagerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Manual flashcard form state
  const [manualForm, setManualForm] = useState({
    subject: "",
    topic: "",
    question: "",
    answer: "",
    explanation: "",
    difficulty: "Medium",
  });

  // AI flashcard generation state
  const [aiForm, setAiForm] = useState({
    subject: "",
    topic: "",
    difficulty: "Medium",
    count: 5,
    guidelines: "",
  });

  // Generated flashcards
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([]);
  const [aiMetadata, setAiMetadata] = useState<FlashcardGenerationOutput['metadata'] | null>(null);
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [studyTips, setStudyTips] = useState<string[]>([]);

  // Existing flashcards management
  const [existingFlashcards, setExistingFlashcards] = useState<Flashcard[]>([]);
  const [selectedSubjectForManage, setSelectedSubjectForManage] = useState<string>("");
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("manage");

  // Delete confirmation state
  const [flashcardToDelete, setFlashcardToDelete] = useState<Flashcard | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        const demoMode = shouldUseDemoData();
        setIsDemoMode(demoMode);

        if (demoMode) {
          // Demo subjects
          const demoSubjects: Subject[] = [
            { id: "1", name: "Matematik", category: "Fen Bilimleri", difficulty: "Orta", isActive: true },
            { id: "2", name: "Fizik", category: "Fen Bilimleri", difficulty: "Orta", isActive: true },
            { id: "3", name: "Kimya", category: "Fen Bilimleri", difficulty: "İleri", isActive: true },
          ];
          setSubjects(demoSubjects);
        } else {
          // Load from UnifiedStorageService instead of direct localStorage
          const localSubjects = UnifiedStorageService.getSubjects();
          setSubjects(localSubjects.filter((s: Subject) => s.isActive));
        }
      } catch {
        // Error logged for debugging purposes
        // In production, this would be sent to an error tracking service
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  // Load existing flashcards when subject changes
  useEffect(() => {
    if (selectedSubjectForManage) {
      const flashcards = UnifiedStorageService.getFlashcardsBySubject(selectedSubjectForManage);
      // Ensure createdAt is a Date object
      const processedFlashcards = flashcards.map(flashcard => ({
        ...flashcard,
        createdAt: flashcard.createdAt instanceof Date ? flashcard.createdAt : new Date(flashcard.createdAt),
      }));
      setExistingFlashcards(processedFlashcards);
    } else {
      setExistingFlashcards([]);
    }
  }, [selectedSubjectForManage]);

  // Flashcard management functions
  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setManualForm({
      subject: flashcard.subject,
      topic: flashcard.topic,
      question: flashcard.question,
      answer: flashcard.answer,
      explanation: flashcard.explanation,
      difficulty: flashcard.difficulty,
    });
    setIsEditing(true);

    // Automatically switch to the manual tab for editing
    setActiveTab("manual");
  };

  const handleDeleteFlashcard = (id: string) => {
    const flashcard = existingFlashcards.find(f => f.id === id);
    if (flashcard) {
      setFlashcardToDelete(flashcard);
      setShowDeleteDialog(true);
    }
  };

  const confirmDeleteFlashcard = () => {
    if (!flashcardToDelete) {
      return;
    }

    const success = UnifiedStorageService.deleteFlashcard(flashcardToDelete.id);
    if (success) {
      // Reload flashcards
      if (selectedSubjectForManage) {
        const flashcards = UnifiedStorageService.getFlashcardsBySubject(selectedSubjectForManage);
        setExistingFlashcards(flashcards);
      }
      toast({
        title: "Başarılı",
        description: "Flashcard başarıyla silindi",
        variant: "default",
      });
    } else {
      toast({
        title: "Hata",
        description: "Flashcard silinirken hata oluştu",
        variant: "destructive",
      });
    }

    setShowDeleteDialog(false);
    setFlashcardToDelete(null);
  };

  const handleUpdateFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlashcard) {
      return;
    }

    try {
      const success = UnifiedStorageService.updateFlashcard(editingFlashcard.id, {
        question: manualForm.question,
        answer: manualForm.answer,
        explanation: manualForm.explanation,
        topic: manualForm.topic,
        difficulty: manualForm.difficulty,
        subject: manualForm.subject,
      });

      if (success) {
        // Reload flashcards
        if (selectedSubjectForManage) {
          const flashcards = UnifiedStorageService.getFlashcardsBySubject(selectedSubjectForManage);
          setExistingFlashcards(flashcards);
        }

        // Reset form
        setManualForm({
          subject: "",
          topic: "",
          question: "",
          answer: "",
          explanation: "",
          difficulty: "Medium",
        });
        setEditingFlashcard(null);
        setIsEditing(false);
        setActiveTab("manage");

        toast({
          title: "Başarılı",
          description: "Flashcard başarıyla güncellendi",
          variant: "default",
        });
      } else {
        toast({
          title: "Hata",
          description: "Flashcard güncellenirken hata oluştu",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Hata",
        description: "Flashcard güncellenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualForm.subject || !manualForm.question || !manualForm.answer) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen gerekli alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      await handleUpdateFlashcard(e);
      return;
    }

    try {
      const newFlashcard = {
        subject: manualForm.subject,
        topic: manualForm.topic,
        question: manualForm.question,
        answer: manualForm.answer,
        explanation: manualForm.explanation,
        difficulty: manualForm.difficulty,
        createdAt: new Date(),
      };

      // Use UnifiedStorageService instead of direct localStorage
      UnifiedStorageService.addFlashcard(newFlashcard);

      // Reset form
      setManualForm({
        subject: "",
        topic: "",
        question: "",
        answer: "",
        explanation: "",
        difficulty: "Medium",
      });

      toast({
        title: "Başarılı!",
        description: "Flashcard başarıyla eklendi",
        variant: "default",
      });

      // Reload existing flashcards if we're on the manage tab
      if (selectedSubjectForManage === manualForm.subject) {
        const flashcards = UnifiedStorageService.getFlashcardsBySubject(manualForm.subject);
        setExistingFlashcards(flashcards);
      }

    } catch {
      toast({
        title: "Hata",
        description: "Flashcard eklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleAIGeneration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aiForm.subject || !aiForm.topic) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen ders ve konu seçin",
        variant: "destructive",
      });
      return;
    }

    try {
      setAiGenerating(true);

      // Show loading toast
      toast({
        title: "AI Üretiyor...",
        description: `${aiForm.count} adet flashcard üretiliyor. Bu işlem birkaç saniye sürebilir.`,
        variant: "default",
      });

      // Call actual AI generation
      const aiResponse = await generateFlashcards({
        subject: aiForm.subject,
        topic: aiForm.topic,
        difficulty: aiForm.difficulty as "Easy" | "Medium" | "Hard",
        count: aiForm.count,
        language: "tr",
        guidelines: aiForm.guidelines || undefined,
      });

      // Convert AI response to Flashcard format
      const convertedFlashcards: Flashcard[] = aiResponse.flashcards.map((aiCard, i) => ({
        id: `ai_flashcard_${Date.now()}_${i}`,
        subject: aiForm.subject,
        topic: aiCard.topic,
        difficulty: aiCard.difficulty,
        question: aiCard.question,
        answer: aiCard.answer,
        explanation: aiCard.explanation,
        createdAt: new Date(),
      }));

      setGeneratedFlashcards(convertedFlashcards);
      setAiMetadata(aiResponse.metadata);
      setQualityScore(aiResponse.qualityScore);
      setSuggestions(aiResponse.suggestions);
      setStudyTips(aiResponse.studyTips);

      // Check if we got fallback flashcards due to AI errors
      if (aiResponse.metadata.aiModel.includes("Fallback") || aiResponse.metadata.aiModel.includes("Error")) {
        toast({
          title: "AI Hatası - Fallback Modu",
          description: "AI servisi kullanılamadı, fallback flashcard&apos;lar üretildi. Lütfen API anahtarınızı kontrol edin.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "AI Üretimi Tamamlandı!",
          description: `${aiForm.count} adet flashcard başarıyla üretildi (Kalite: ${Math.round(aiResponse.qualityScore * 100)}%)`,
          variant: "default",
        });
      }

    } catch (error) {
      // Error logged for debugging purposes
      // In production, this would be sent to an error tracking service

      let errorMessage = "Flashcard üretilirken bir hata oluştu. Lütfen tekrar deneyin.";

      if (error instanceof Error) {
        if (error.message.includes("API key not configured")) {
          errorMessage = "AI API anahtarı yapılandırılmamış. Lütfen GEMINI_API_KEY environment variable'ını ayarlayın.";
        } else if (error.message.includes("Failed to generate")) {
          errorMessage = "AI flashcard üretimi başarısız oldu. Lütfen internet bağlantınızı kontrol edin.";
        }
      }

      toast({
        title: "AI Hatası",
        description: errorMessage,
        variant: "destructive",
      });

      // Set fallback flashcards for better UX
      const fallbackFlashcards: Flashcard[] = [];
      for (let i = 0; i < aiForm.count; i++) {
        fallbackFlashcards.push({
          id: `fallback_${Date.now()}_${i}`,
          subject: aiForm.subject,
          topic: aiForm.topic,
          difficulty: aiForm.difficulty,
          question: `AI Hatası: Soru ${i + 1} üretilemedi`,
          answer: `AI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.`,
          explanation: `Teknik bir sorun nedeniyle AI flashcard üretimi başarısız oldu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.`,
          createdAt: new Date(),
        });
      }

      setGeneratedFlashcards(fallbackFlashcards);
      setAiMetadata({
        totalGenerated: fallbackFlashcards.length,
        subject: aiForm.subject,
        topic: aiForm.topic,
        averageDifficulty: aiForm.difficulty,
        generationTimestamp: new Date().toISOString(),
        aiModel: "Fallback - AI Error",
      });
      setQualityScore(0.1);
      setSuggestions(["AI servisi yapılandırılmamış veya hata oluştu"]);
      setStudyTips(["Lütfen sistem yöneticisi ile iletişime geçin"]);
    } finally {
      setAiGenerating(false);
    }
  };

  const saveGeneratedFlashcards = () => {
    try {
      // Use UnifiedStorageService instead of direct localStorage
      generatedFlashcards.forEach(flashcard => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...flashcardData } = flashcard;
        UnifiedStorageService.addFlashcard(flashcardData);
      });

      setGeneratedFlashcards([]);

      toast({
        title: "Başarılı!",
        description: "Tüm flashcard'lar kaydedildi",
        variant: "default",
      });

    } catch {
      toast({
        title: "Hata",
        description: "Flashcard'lar kaydedilirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push("/flashcard")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Flashcard&apos;a Dön
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Flashcard Yöneticisi
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manuel olarak flashcard ekleyin veya AI ile otomatik üretin
            </p>
            {isDemoMode && (
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-2">
                BTK Demo Modu
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto gap-2 sm:gap-0 h-auto sm:h-10 p-2 sm:p-1">
            <TabsTrigger
              value="manage"
              className="flex items-center justify-center gap-2 text-sm sm:text-base h-10 sm:h-auto w-full"
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
                                <span className="hidden sm:inline">Mevcut Flashcard&apos;lar</span>
              <span className="sm:hidden">Mevcut</span>
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="flex items-center justify-center gap-2 text-sm sm:text-base h-10 sm:h-auto w-full"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Manuel Ekleme</span>
              <span className="sm:hidden">Manuel</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="flex items-center justify-center gap-2 text-sm sm:text-base h-10 sm:h-auto w-full"
            >
              <Brain className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">AI Üretimi</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
          </TabsList>

          {/* Manage Existing Flashcards */}
          <TabsContent value="manage">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Mevcut Flashcard&apos;ları Yönet
                </CardTitle>
                <CardDescription>
                  Mevcut flashcard&apos;larınızı görüntüleyin, düzenleyin ve silin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Subject Selector */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ders Seçin</label>
                    {loading ? (
                      <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Dersler yükleniyor...</span>
                      </div>
                    ) : (
                      <Select
                        value={selectedSubjectForManage}
                        onValueChange={setSelectedSubjectForManage}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Flashcard&apos;ları görüntülemek için ders seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Flashcards List */}
                  {selectedSubjectForManage && (
                    <div className="space-y-3">
                      {isEditing && editingFlashcard && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Edit className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Flashcard düzenleniyor: &quot;{editingFlashcard.question.substring(0, 50)}...&quot;
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setIsEditing(false);
                                setEditingFlashcard(null);
                                setActiveTab("manage");
                                setManualForm({
                                  subject: "",
                                  topic: "",
                                  question: "",
                                  answer: "",
                                  explanation: "",
                                  difficulty: "Medium",
                                });
                              }}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-300 hover:bg-blue-100"
                            >
                              Düzenlemeyi İptal Et
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {selectedSubjectForManage} - {existingFlashcards.length} Flashcard
                        </h3>
                        <Button
                          onClick={() => {
                            setSelectedSubjectForManage("");
                            setExistingFlashcards([]);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Temizle
                        </Button>
                      </div>

                      {existingFlashcards.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          Bu ders için henüz flashcard bulunmuyor.
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:gap-4">
                          {existingFlashcards.map((flashcard) => (
                            <Card key={flashcard.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                                  <div className="flex-1 space-y-2 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge variant="outline" className="text-xs px-2 py-1">
                                        {flashcard.topic}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs px-2 py-1">
                                        {flashcard.difficulty}
                                      </Badge>
                                      <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {flashcard.createdAt instanceof Date
                                          ? flashcard.createdAt.toLocaleDateString('tr-TR')
                                          : new Date(flashcard.createdAt).toLocaleDateString('tr-TR')
                                        }
                                      </span>
                                    </div>
                                    <h4 className="font-medium text-sm sm:text-base leading-relaxed break-words">
                                      {flashcard.question}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">
                                      {flashcard.answer}
                                    </p>
                                    {flashcard.explanation && (
                                      <p className="text-xs text-gray-500 leading-relaxed break-words">
                                        {flashcard.explanation}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2 sm:flex-col sm:gap-1 sm:ml-0 self-end sm:self-start">
                                    <Button
                                      onClick={() => handleEditFlashcard(flashcard)}
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 sm:h-7 sm:w-7 p-0 flex-shrink-0"
                                    >
                                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteFlashcard(flashcard.id)}
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 sm:h-7 sm:w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                    >
                                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Flashcard Creation */}
          <TabsContent value="manual">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {isEditing ? "Flashcard Düzenle" : "Manuel Flashcard Ekleme"}
                </CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Flashcard&apos;ı düzenleyin ve güncelleyin"
                    : "Kendi flashcard&apos;larınızı oluşturun ve özelleştirin"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { handleManualSubmit(e); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Ders</label>
                      <Select
                        value={manualForm.subject}
                        onValueChange={(value) => setManualForm(prev => ({ ...prev, subject: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ders seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Zorluk</label>
                      <Select
                        value={manualForm.difficulty}
                        onValueChange={(value) => setManualForm(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Kolay</SelectItem>
                          <SelectItem value="Medium">Orta</SelectItem>
                          <SelectItem value="Hard">Zor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Konu</label>
                    <Input
                      placeholder="Örn: Türev, İntegral, Limit..."
                      value={manualForm.topic}
                      onChange={(e) => setManualForm(prev => ({ ...prev, topic: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Soru</label>
                    <Textarea
                      placeholder="Flashcard&apos;ın ön yüzünde görünecek soru..."
                      value={manualForm.question}
                      onChange={(e) => setManualForm(prev => ({ ...prev, question: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Cevap</label>
                    <Textarea
                      placeholder="Flashcard&apos;ın arka yüzünde görünecek cevap..."
                      value={manualForm.answer}
                      onChange={(e) => setManualForm(prev => ({ ...prev, answer: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Açıklama (Opsiyonel)</label>
                    <Textarea
                      placeholder="Detaylı açıklama ekleyin..."
                      value={manualForm.explanation}
                      onChange={(e) => setManualForm(prev => ({ ...prev, explanation: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                      {isEditing ? (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Güncelle
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Flashcard Ekle
                        </>
                      )}
                    </Button>
                    {isEditing && (
                      <Button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditingFlashcard(null);
                          setActiveTab("manage");
                          setManualForm({
                            subject: "",
                            topic: "",
                            question: "",
                            answer: "",
                            explanation: "",
                            difficulty: "Medium",
                          });
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        İptal
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Flashcard Generation */}
          <TabsContent value="ai">
            <div className="space-y-6">
              {/* AI Generation Form */}
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Flashcard Üretimi
                  </CardTitle>
                  <CardDescription>
                    Yapay zeka ile otomatik olarak flashcard&apos;lar üretin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* AI Status Info */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                          AI Servisi Durumu
                        </h4>
                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <p>• Google Gemini AI entegrasyonu aktif</p>
                          <p>• Türkçe dil desteği mevcut</p>
                          <p>• Dinamik içerik üretimi</p>
                          <p>• Kalite kontrol ve doğrulama</p>
                        </div>
                        <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                          <p><strong>Not:</strong> AI özelliğini kullanmak için GEMINI_API_KEY environment variable&apos;ı gerekli</p>
                          <p>Kurulum için <a href="/ai-flashcard-setup" className="underline hover:text-blue-800">AI Flashcard Setup Guide</a>&apos;ı inceleyin</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={(e) => { handleAIGeneration(e); }} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Ders</label>
                        <Select
                          value={aiForm.subject}
                          onValueChange={(value) => setAiForm(prev => ({ ...prev, subject: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ders seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.name}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Zorluk</label>
                        <Select
                          value={aiForm.difficulty}
                          onValueChange={(value) => setAiForm(prev => ({ ...prev, difficulty: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Kolay</SelectItem>
                            <SelectItem value="Medium">Orta</SelectItem>
                            <SelectItem value="Hard">Zor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Konu</label>
                      <Input
                        placeholder="Örn: Türev, İntegral, Limit..."
                        value={aiForm.topic}
                        onChange={(e) => setAiForm(prev => ({ ...prev, topic: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Üretilecek Kart Sayısı</label>
                        <Select
                          value={aiForm.count.toString()}
                          onValueChange={(value) => setAiForm(prev => ({ ...prev, count: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 Kart</SelectItem>
                            <SelectItem value="5">5 Kart</SelectItem>
                            <SelectItem value="10">10 Kart</SelectItem>
                            <SelectItem value="15">15 Kart</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Özel Yönergeler</label>
                        <Input
                          placeholder="Opsiyonel özel istekler..."
                          value={aiForm.guidelines}
                          onChange={(e) => setAiForm(prev => ({ ...prev, guidelines: e.target.value }))}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={aiGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
                    >
                      {aiGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          AI Üretiyor...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI ile Flashcard Üret
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

                             {/* Generated Flashcards Preview */}
               {generatedFlashcards.length > 0 && (
                 <Card className="max-w-4xl mx-auto">
                   <CardHeader>
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                       <div className="flex-1 min-w-0">
                         <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                           <CheckCircle className="w-5 h-5 text-green-600" />
                           Üretilen Flashcard&apos;lar ({generatedFlashcards.length})
                         </CardTitle>
                         <CardDescription className="text-sm sm:text-base">
                           AI tarafından üretilen flashcard&apos;ları inceleyin ve kaydedin
                         </CardDescription>
                       </div>
                       {aiMetadata && (
                         <div className="text-center sm:text-right">
                           <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-2 text-xs sm:text-sm">
                             Kalite: {Math.round(qualityScore * 100)}%
                           </Badge>
                           <p className="text-xs text-gray-500">
                             {aiMetadata.aiModel} • {aiMetadata.generationTimestamp}
                           </p>
                         </div>
                       )}
                     </div>
                   </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {generatedFlashcards.map((flashcard, index) => (
                        <div key={flashcard.id} className="border rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-800">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-3">
                            <Badge variant="outline" className="text-xs px-2 py-1 self-start">
                              {flashcard.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-500 self-end sm:self-start">#{index + 1}</span>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <div>
                              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Soru:</label>
                              <p className="text-xs sm:text-sm text-gray-800 dark:text-white leading-relaxed break-words">{flashcard.question}</p>
                            </div>

                            <div>
                              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Cevap:</label>
                              <p className="text-xs sm:text-sm text-gray-800 dark:text-white leading-relaxed break-words">{flashcard.answer}</p>
                            </div>

                            {flashcard.explanation && (
                              <div>
                                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Açıklama:</label>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">{flashcard.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                                         {/* AI Insights */}
                     {(suggestions.length > 0 || studyTips.length > 0) && (
                       <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                         <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                           <Brain className="w-4 h-4 text-purple-600" />
                           AI Önerileri ve Çalışma İpuçları
                         </h4>

                         {suggestions.length > 0 && (
                           <div className="mb-4">
                             <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">💡 İyileştirme Önerileri:</h5>
                             <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                               {suggestions.map((suggestion, index) => (
                                 <li key={index} className="flex items-start gap-2">
                                   <span className="text-purple-500">•</span>
                                   {suggestion}
                                 </li>
                               ))}
                             </ul>
                           </div>
                         )}

                         {studyTips.length > 0 && (
                           <div>
                             <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📚 Çalışma İpuçları:</h5>
                             <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                               {studyTips.map((tip, index) => (
                                 <li key={index} className="flex items-start gap-2">
                                   <span className="text-green-500">•</span>
                                   {tip}
                                 </li>
                               ))}
                             </ul>
                           </div>
                         )}
                       </div>
                     )}

                     <div className="flex flex-col sm:flex-row gap-3 mt-6">
                       <Button
                         onClick={saveGeneratedFlashcards}
                         className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 text-sm sm:text-base py-2 sm:py-2.5"
                       >
                         <CheckCircle className="w-4 h-4 mr-2" />
                         Tümünü Kaydet
                       </Button>

                       <Button
                         onClick={() => {
                           setGeneratedFlashcards([]);
                           setAiMetadata(null);
                           setQualityScore(0);
                           setSuggestions([]);
                           setStudyTips([]);
                         }}
                         variant="outline"
                         className="flex-1 text-sm sm:text-base py-2 sm:py-2.5"
                       >
                         Temizle
                       </Button>
                     </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-12">
          <Card className="border-gradient-question bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-center text-xl">
                <Zap className="w-6 h-6 inline mr-2 text-yellow-500" />
                Flashcard Yöneticisi Özellikleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Plus className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2">Manuel Oluşturma</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Kendi flashcard&apos;larınızı tamamen özelleştirerek oluşturun
                  </p>
                </div>

                <div className="text-center">
                  <Brain className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-2">AI Üretimi</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Yapay zeka ile otomatik olarak kaliteli flashcard&apos;lar üretin
                  </p>
                </div>

                <div className="text-center">
                  <Target className="w-12 h-12 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold mb-2">Akıllı Yönetim</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tüm flashcard&apos;larınızı tek yerden organize edin
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flashcard&apos;ı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu flashcard&apos;ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setFlashcardToDelete(null);
            }}>
              İptal
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFlashcard} className="bg-red-600 hover:bg-red-700">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
