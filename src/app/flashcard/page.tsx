"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ArrowLeft, BookOpen, Calculator, Atom, FlaskConical, Landmark, Dna, BookOpenCheck, Languages, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import FlashcardComponent from "../../components/flashcard";
import FeatureCards from "@/components/ui/feature-cards";
import { flashcardFeatures } from "@/data/feature-cards-data";
import { useSearchParams, useRouter } from "next/navigation";
import { shouldUseDemoData } from "@/data/demo-data";
import { UnifiedStorageService } from "@/services/unified-storage-service";

interface Subject {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  questionCount: number;
}

// Remove old LocalStorage service classes - now using UnifiedStorageService

const FlashcardPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load subjects from localStorage
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setIsLoading(true);

        // Demo mode control
        const demoModeActive = shouldUseDemoData();
        setIsDemoMode(demoModeActive);

        if (demoModeActive) {
          // Demo subjects
          const demoSubjects: Subject[] = [
            {
              id: "subj_matematik_001",
              name: "Matematik",
              category: "Fen Bilimleri",
              difficulty: "Orta",
              isActive: true,
              questionCount: 245,
            },
            {
              id: "subj_fizik_002",
              name: "Fizik",
              category: "Fen Bilimleri",
              difficulty: "Orta",
              isActive: true,
              questionCount: 198,
            },
            {
              id: "subj_kimya_003",
              name: "Kimya",
              category: "Fen Bilimleri",
              difficulty: "İleri",
              isActive: true,
              questionCount: 167,
            },
          ];
          setSubjects(demoSubjects);
          return;
        }

        // Directly use UnifiedStorageService instead of SubjectLocalStorageService
        const localSubjects = UnifiedStorageService.getSubjects();

        // Calculate question count for each subject - sadece flashcard'lar sayılıyor
        const subjectsWithQuestionCount = localSubjects.map((subject) => {
          // Quiz soruları flashcard sayısına dahil edilmiyor
          const flashcards = UnifiedStorageService.getFlashcardsBySubject(
            subject.name,
          );

          return {
            ...subject,
            questionCount: flashcards.length, // Sadece flashcard sayısı
          };
        });

        // Filter subjects with flashcards only
        const subjectsWithFlashcards = subjectsWithQuestionCount.filter(
          (subject) => subject.questionCount > 0,
        );

        setSubjects(subjectsWithFlashcards);
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    loadSubjects();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Dersler yükleniyor...
          </p>
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
                  🎯 BTK Demo
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
                   <div className="col-span-3 text-center py-8">
                                           <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6">
                        <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </div>
                     <p className="text-gray-600 dark:text-gray-300 mb-4">
                       {isDemoMode
                         ? "Demo verileri yükleniyor..."
                         : "Henüz flashcard içeren ders bulunmuyor."}
                     </p>
                    {!isDemoMode && (
                                          <button
                      onClick={() =>
                        (window.location.href = "/flashcard-manager")
                      }
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 border-0"
                    >
                      Flashcard Ekle
                    </button>
                    )}
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
                              {isDemoMode ? "BTK Demo" : "Akıllı Öğrenme"}
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

  return (
    <div>
      <FlashcardComponent subject={selectedSubject} isDemoMode={isDemoMode} />
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
