"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ArrowLeft, BookOpen, Brain, RotateCcw, TrendingUp, Target, BarChart3, Calculator, Atom, FlaskConical, Landmark, Dna, BookOpenCheck, Languages, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FlashcardComponent from "../../components/flashcard";
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

        // Calculate question count for each subject
        const subjectsWithQuestionCount = localSubjects.map((subject) => {
          const questions = UnifiedStorageService.getQuestionsBySubject(
            subject.name,
          );
          
          // Also check for flashcards using UnifiedStorageService
          const flashcards = UnifiedStorageService.getFlashcardsBySubject(
            subject.name,
          );
          
          return {
            ...subject,
            questionCount: questions.length + flashcards.length,
          };
        });

        // Filter subjects with questions OR flashcards
        const subjectsWithQuestions = subjectsWithQuestionCount.filter(
          (subject) => subject.questionCount > 0,
        );

        setSubjects(subjectsWithQuestions);
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

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-8">
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
                         : "Henüz soru içeren ders bulunmuyor."}
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
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.name)}
                      className="p-6 border-gradient-question bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                                             <div className="text-2xl mb-3 flex justify-center items-center">
                        {subject.name === "Matematik" && <Calculator className="w-8 h-8 text-blue-600" />}
                        {subject.name === "Fizik" && <Atom className="w-8 h-8 text-purple-600" />}
                        {subject.name === "Kimya" && <FlaskConical className="w-8 h-8 text-green-600" />}
                        {subject.name === "Tarih" && <Landmark className="w-8 h-8 text-orange-600" />}
                        {subject.name === "Biyoloji" && <Dna className="w-8 h-8 text-pink-600" />}
                        {subject.name === "Türk Dili ve Edebiyatı" && <BookOpenCheck className="w-8 h-8 text-indigo-600" />}
                        {subject.name === "İngilizce" && <Languages className="w-8 h-8 text-red-600" />}
                        {![
                          "Matematik",
                          "Fizik",
                          "Kimya",
                          "Tarih",
                          "Biyoloji",
                          "Türk Dili ve Edebiyatı",
                          "İngilizce",
                        ].includes(subject.name) && <BookOpen className="w-8 h-8 text-gray-600" />}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {subject.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                        {subject.questionCount} {isDemoMode ? "demo " : ""}kart
                        mevcut
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {isDemoMode
                          ? "BTK Demo içeriği"
                          : "Akıllı öğrenme sistemi ile çalışın"}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="border-gradient-question bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                <Brain className="w-5 h-5 inline mr-2 text-purple-600" />
                Akıllı Öğrenme Özellikleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <RotateCcw className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Aralıklı tekrar algoritması</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                  <span>Kişiselleştirilmiş zorluk seviyesi</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2 text-purple-600" />
                  <span>Odaklanmış çalışma modları</span>
                </div>
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
                  <span>Detaylı ilerleme takibi</span>
                </div>
              </div>
            </div>
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
