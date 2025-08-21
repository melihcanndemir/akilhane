"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { ArrowLeft, BookOpen, Calculator, Atom, FlaskConical, Landmark, Dna, BookOpenCheck, Languages, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import FlashcardComponent from "../../components/flashcard";
import FeatureCards from "@/components/ui/feature-cards";
import { flashcardFeatures } from "@/data/feature-cards-data";
import { useRouter } from "next/navigation";
import { shouldUseDemoData } from "@/data/demo-data";
import { UnifiedStorageService } from "@/services/unified-storage-service";
import { useAuth } from "@/hooks/useAuth";

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  questionCount: number;
}

// Type for cloud API response
interface CloudSubject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  question_count?: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Remove old LocalStorage service classes - now using UnifiedStorageService

const FlashcardPageContent = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    isAttempted: boolean;
    lastSyncTime: number;
    hasAuthChanged: boolean;
  }>({ isAttempted: false, lastSyncTime: 0, hasAuthChanged: false });

  // Enhanced authentication-aware data loading
  const loadSubjects = useCallback(async (forceSync = false) => {
    try {
      setIsLoading(true);
      // Loading subjects with authentication status

      // Demo mode control
      const demoModeActive = shouldUseDemoData();
      setIsDemoMode(demoModeActive);

      if (demoModeActive) {
        // Demo subjects - using actual demo flashcard counts
        const demoSubjects: Subject[] = [
          {
            id: "subj_matematik_001",
            name: "Matematik",
            description: "Matematik flashcard soruları",
            category: "Fen Bilimleri",
            difficulty: "Orta",
            isActive: true,
            questionCount: 3, // Actual demo flashcard count
          },
          {
            id: "subj_fizik_002",
            name: "Fizik",
            description: "Fizik flashcard soruları",
            category: "Fen Bilimleri",
            difficulty: "Orta",
            isActive: true,
            questionCount: 2, // Actual demo flashcard count
          },
          {
            id: "subj_kimya_003",
            name: "Kimya",
            description: "Kimya flashcard soruları",
            category: "Fen Bilimleri",
            difficulty: "İleri",
            isActive: true,
            questionCount: 1, // Actual demo flashcard count
          },
        ];
        setSubjects(demoSubjects);
        return;
      }

      // Enhanced Supabase sync logic with authentication awareness
      const now = Date.now();
      const shouldAttemptSync = forceSync ||
        !syncStatus.isAttempted ||
        (isAuthenticated && syncStatus.hasAuthChanged) ||
        (now - syncStatus.lastSyncTime > 30000); // Re-sync every 30 seconds if needed

      if (shouldAttemptSync && !authLoading) {
        try {
          // Attempting authenticated sync for user

          // Sync both subjects and flashcards from cloud
          const [subjectsResponse, flashcardsResult] = await Promise.all([
            fetch("/api/subjects").then(res => res.json()).catch(() => []),
            UnifiedStorageService.loadFlashcardsFromSupabase(),
          ]);

          // Cloud sync completed successfully

          // Save cloud subjects to localStorage if we got any
          if (Array.isArray(subjectsResponse) && subjectsResponse.length > 0) {
            const cloudSubjects = subjectsResponse.map((s: CloudSubject) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              category: s.category,
              difficulty: s.difficulty,
              questionCount: s.question_count || 0,
              isActive: s.is_active,
              createdBy: s.created_by,
              createdAt: s.created_at,
              updatedAt: s.updated_at,
            }));

            // Merge with existing localStorage subjects
            const localSubjects = UnifiedStorageService.getSubjects();
            const mergedSubjects = [...localSubjects];

            cloudSubjects.forEach((cloudSubject) => {
              const exists = localSubjects.find(local => local.id === cloudSubject.id);
              if (!exists) {
                mergedSubjects.push(cloudSubject);
              }
            });

            UnifiedStorageService.saveSubjects(mergedSubjects);
            // Synced subjects from cloud successfully
          }

          setSyncStatus({
            isAttempted: true,
            lastSyncTime: now,
            hasAuthChanged: false,
          });

          if (flashcardsResult.loaded > 0) {
            // Synced flashcards from cloud successfully
          } else if (isAuthenticated) {
            // No new data found in cloud database
          }
        } catch {
          // Could not sync from cloud
          setSyncStatus(prev => ({ ...prev, isAttempted: true, lastSyncTime: now }));
        }
      }

      // Load subjects and flashcards
      const localSubjects = UnifiedStorageService.getSubjects();
      const allFlashcards = UnifiedStorageService.getFlashcards();

      // Create subjects from flashcards if subjects are missing
      const flashcardSubjects = new Set(allFlashcards.map(f => f.subject));
      const missingSubjects: Subject[] = [];

      flashcardSubjects.forEach(subjectName => {
        const exists = localSubjects.find(s => s.name === subjectName);
        if (!exists) {
          missingSubjects.push({
            id: `auto_subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: subjectName,
            description: `Otomatik oluşturulan ${subjectName} konusu`,
            category: "Genel",
            difficulty: "Orta",
            isActive: true,
            questionCount: 0,
          });
        }
      });

      // Merge subjects (existing + auto-created)
      const allSubjects = [...localSubjects, ...missingSubjects];

      // Save auto-created subjects
      if (missingSubjects.length > 0) {
        UnifiedStorageService.saveSubjects(allSubjects);
        // Auto-created subjects from flashcards
      }

      // Calculate question count for each subject
      const subjectsWithQuestionCount = allSubjects.map((subject) => {
        const flashcards = UnifiedStorageService.getFlashcardsBySubject(subject.name);
        return {
          ...subject,
          questionCount: flashcards.length,
        };
      });

      // Filter subjects with flashcards only
      const subjectsWithFlashcards = subjectsWithQuestionCount.filter(
        (subject) => subject.questionCount > 0,
      );

      setSubjects(subjectsWithFlashcards);
      // Loaded subjects with flashcards successfully
    } catch {
      // Error loading subjects
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load subjects when page loads or auth changes
  useEffect(() => {
    if (!authLoading) {
      loadSubjects();
    }
  }, [authLoading, loadSubjects]);

  // Handle auth state changes
  useEffect(() => {
    if (!authLoading && (isAuthenticated || user?.id)) {
      setSyncStatus(prev => ({ ...prev, hasAuthChanged: true }));
      loadSubjects(true); // Force sync when user logs in
    }
  }, [authLoading, isAuthenticated, user?.id, loadSubjects]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {authLoading ? "Kimlik doğrulanıyor..." : "Dersler yükleniyor..."}
          </p>
          {isAuthenticated && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Bulut verileriniz senkronize ediliyor...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard&apos;a Dön
            </Button>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                Flashcard Öğrenme Sistemi
              </h1>
              {isDemoMode && (
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Demo
                </Badge>
              )}
            </div>

            {/* Flashcard Manager Access Button */}
            <div className="mb-6">
              <Button
                onClick={() => router.push("/flashcard-manager")}
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Flashcard Yönetimi
              </Button>
            </div>

            <Card className="border-gradient-question shadow-lg p-8 mb-8">
              <CardContent className="p-0">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                  {isDemoMode
                    ? "Demo derslerinden birini seçin:"
                    : "Hangi konuyu çalışmak istiyorsunuz?"}
                </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 {subjects.length === 0 ? (
                   <div className="col-span-3">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 rounded-lg p-8 text-center">
                         <div className="mb-4 flex justify-center">
                           <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                             <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                           </div>
                         </div>
                         <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                           Flashcard Ekle
                         </h3>
                         <p className="text-gray-500 dark:text-gray-400 mb-6">
                           İlk flashcard&apos;ınızı ekleyerek öğrenmeye başlayın!
                         </p>
                         {!isDemoMode && (
                           <button
                             onClick={() => (window.location.href = "/flashcard-manager")}
                             className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 border-0 w-full"
                           >
                             Flashcard Ekle
                           </button>
                         )}
                       </div>

                       <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 rounded-lg p-8 text-center">
                         <div className="mb-4 flex justify-center">
                           <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center">
                             <Calculator className="w-8 h-8 text-green-600 dark:text-green-400" />
                           </div>
                         </div>
                         <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                           Nasıl Çalışır?
                         </h3>
                         <p className="text-gray-500 dark:text-gray-400 mb-6">
                           Flashcard&apos;lar ile hızlı ve etkili öğrenme deneyimi.
                         </p>
                         <div className="text-sm text-gray-400 dark:text-gray-500">
                           <div className="flex items-center justify-center gap-2 mb-2">
                             <BookOpen className="w-4 h-4" />
                             <span>Kart Ekle</span>
                           </div>
                           <div className="flex items-center justify-center gap-2 mb-2">
                             <Calculator className="w-4 h-4" />
                             <span>Çalış</span>
                           </div>
                           <div className="flex items-center justify-center gap-2">
                             <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                             <span>Öğren</span>
                           </div>
                         </div>
                       </div>

                       <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 rounded-lg p-8 text-center">
                         <div className="mb-4 flex justify-center">
                           <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center">
                             <Plus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                           </div>
                         </div>
                         <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                           Öğrenme Süreci
                         </h3>
                         <p className="text-gray-500 dark:text-gray-400 mb-6">
                           Her ders için özelleştirilmiş flashcard&apos;lar oluşturun.
                         </p>
                         <div className="text-sm text-gray-400 dark:text-gray-500">
                           <div className="flex items-center justify-center gap-2 mb-2">
                             <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                             <span>Ders Seç</span>
                           </div>
                           <div className="flex items-center justify-center gap-2 mb-2">
                             <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                             <span>Kart Ekle</span>
                           </div>
                           <div className="flex items-center justify-center gap-2">
                             <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                             <span>Çalış</span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 ) : (
                  subjects.map((subject) => (
                                        <Card
                      key={subject.id}
                      className="cursor-pointer border-gradient-question shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => setSelectedSubject(subject.name)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                            {subject.name === "Matematik" && <Calculator className="w-6 h-6 text-white" />}
                            {subject.name === "Fizik" && <Atom className="w-6 h-6 text-white" />}
                            {subject.name === "Kimya" && <FlaskConical className="w-6 h-6 text-white" />}
                            {subject.name === "Tarih" && <Landmark className="w-6 h-6 text-white" />}
                            {subject.name === "Biyoloji" && <Dna className="w-6 h-6 text-white" />}
                            {subject.name === "Türk Dili ve Edebiyatı" && <BookOpenCheck className="w-6 h-6 text-white" />}
                            {subject.name === "İngilizce" && <Languages className="w-6 h-6 text-white" />}
                            {![
                              "Matematik",
                              "Fizik",
                              "Kimya",
                              "Tarih",
                              "Biyoloji",
                              "Türk Dili ve Edebiyatı",
                              "İngilizce",
                            ].includes(subject.name) && <BookOpen className="w-6 h-6 text-white" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                              {subject.name}
                            </h3>
                                                         <p className="text-sm text-gray-500 dark:text-gray-400">
                               {isDemoMode ? "Demo" : "Akıllı Öğrenme"}
                             </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-blue-500 text-white">
                            {subject.questionCount} {isDemoMode ? "demo " : ""}flashcard
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {isDemoMode
                              ? "Demo içeriği"
                              : "Öğrenme sistemi"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              </CardContent>
            </Card>

            {/* Flashcard Özellikleri */}
            <FeatureCards
              title="Flashcard Özellikleri"
              features={flashcardFeatures}
              columns={2}
            />
          </div>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    setSelectedSubject("");
  };

  return (
    <div>
      <FlashcardComponent 
        subject={selectedSubject} 
        isDemoMode={isDemoMode} 
        onBack={handleBack}
      />
    </div>
  );
};

const FlashcardPage = () => (
  <Suspense
    fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Yükleniyor...</p>
        </div>
      </div>
    }
  >
    <FlashcardPageContent />
  </Suspense>
);

export default FlashcardPage;
