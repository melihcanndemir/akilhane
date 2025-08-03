"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getFlashcardRecommendation,
  type FlashcardRecommendationOutput,
} from "../ai/flows/flashcard-recommendation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import VoiceAssistant from "./voice-assistant";
import { getDemoFlashcards } from "@/data/demo-data";
import MobileNav from "@/components/mobile-nav";
import { useToast } from "@/hooks/use-toast";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  topic: string;
  difficulty: string;
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  confidence: number; // 1-5 scale
  options?: Array<{ text: string; isCorrect: boolean }> | undefined; // Added for multiple choice questions
}

interface FlashcardProps {
  subject: string;
  isDemoMode?: boolean;
}

const FlashcardComponent: React.FC<FlashcardProps> = ({
  subject,
  isDemoMode = false,
}) => {
  const { toast } = useToast();

  // Check demo mode from localStorage
  const demoModeActive =
    isDemoMode ||
    (typeof window !== "undefined" &&
      localStorage.getItem("btk_demo_mode") === "true");

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [studyMode, setStudyMode] = useState<"review" | "new" | "difficult">(
    "review",
  );
  const [stats, setStats] = useState({
    total: 0,
    reviewed: 0,
    mastered: 0,
    needsReview: 0,
  });
  const [aiRecommendation, setAiRecommendation] =
    useState<FlashcardRecommendationOutput | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Load flashcards from localStorage or demo data
  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        if (demoModeActive) {
          // Demo mode - load demo flashcards
          const demoFlashcards = getDemoFlashcards(subject);

          setFlashcards(demoFlashcards);
          setStats({
            total: demoFlashcards.length,
            reviewed: demoFlashcards.filter((f) => f.reviewCount > 0).length,
            mastered: demoFlashcards.filter((f) => f.confidence >= 4).length,
            needsReview: demoFlashcards.filter((f) => f.confidence < 4).length,
          });
          return;
        }

        // USE DIRECT LOCALSTORAGE

        // Get questions from LocalStorage
        const getQuestionsFromStorage = (): {
          subject: string;
          id: string;
          text: string;
          options?: Array<{ text: string; isCorrect: boolean }>;
          explanation: string;
          topic?: string;
          difficulty: string;
        }[] => {
          if (typeof window === "undefined") {
            return [];
          }
          try {
            const stored = localStorage.getItem("exam_training_questions");
            const questions = stored ? JSON.parse(stored) : [];
            return questions.filter(
              (q: { subject: string }) => q.subject === subject,
            );
          } catch {
            return [];
          }
        };

        const questions = getQuestionsFromStorage();

        if (questions.length === 0) {
          throw new Error("Bu ders için henüz soru bulunmuyor");
        }

        const flashcardData: Flashcard[] = questions.map(
          (q: {
            id: string;
            text: string;
            options?: Array<{ text: string; isCorrect: boolean }>;
            explanation: string;
            topic?: string;
            difficulty: string;
          }) => ({
            id: q.id,
            question: q.text,
            answer: q.options
              ? q.options.find(
                  (opt: { isCorrect: boolean; text: string }) => opt.isCorrect,
                )?.text || "Cevap bulunamadı"
              : q.explanation,
            explanation: q.explanation,
            topic: q.topic || "Genel",
            difficulty: q.difficulty,
            reviewCount: 0,
            confidence: 3, // Default confidence
            options: q.options,
          }),
        );

        setFlashcards(flashcardData);
        setStats({
          total: flashcardData.length,
          reviewed: flashcardData.filter((f) => f.reviewCount > 0).length,
          mastered: flashcardData.filter((f) => f.confidence >= 4).length,
          needsReview: flashcardData.filter((f) => f.confidence < 4).length,
        });
      } catch (error) {
        // Show user-friendly error message
        toast({
          title: "Hata",
          description: `Flashcard yüklenirken hata oluştu: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
          variant: "destructive",
        });
      }
    };

    if (subject) {
      loadFlashcards();
    }
  }, [subject, demoModeActive, toast]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setShowAnswer(true);
    }
  };

  const handleConfidence = (level: number) => {
    setConfidence(level);

    // Update flashcard stats
    const updatedFlashcards = [...flashcards];
    const currentCard = updatedFlashcards[currentIndex];

    if (currentCard) {
      currentCard.confidence = level;
      currentCard.reviewCount += 1;
      currentCard.lastReviewed = new Date();

      // Calculate next review date based on confidence (spaced repetition)
      const daysUntilNextReview = calculateNextReview(
        level,
        currentCard.reviewCount,
      );
      currentCard.nextReview = new Date(
        Date.now() + daysUntilNextReview * 24 * 60 * 60 * 1000,
      );

      setFlashcards(updatedFlashcards);

      // Update stats
      updateStats(updatedFlashcards);
    }
  };

  const calculateNextReview = (
    confidence: number,
    reviewCount: number,
  ): number => {
    // Spaced repetition algorithm
    if (confidence >= 4) {
      return Math.pow(2, reviewCount); // 1, 2, 4, 8, 16... days
    } else if (confidence >= 3) {
      return Math.max(1, Math.pow(2, reviewCount - 1));
    } else {
      return 1; // Review tomorrow
    }
  };

  const updateStats = (cards: Flashcard[]) => {
    const now = new Date();
    const reviewed = cards.filter((c) => c.lastReviewed).length;
    const mastered = cards.filter(
      (c) => c.confidence >= 4 && c.reviewCount >= 3,
    ).length;
    const needsReview = cards.filter(
      (c) => !c.nextReview || c.nextReview <= now,
    ).length;

    setStats({
      total: cards.length,
      reviewed,
      mastered,
      needsReview,
    });
  };

  const getAiRecommendation = async () => {
    setIsLoadingRecommendation(true);
    try {
      // Get performance data from localStorage
      const performanceData =
        typeof window !== "undefined"
          ? localStorage.getItem("performanceData") || "{}"
          : "{}";

      // Get current flashcard progress with real data
      const flashcardProgress = flashcards.map((card) => ({
        id: card.id,
        topic: card.topic,
        difficulty: card.difficulty,
        confidence: card.confidence,
        reviewCount: card.reviewCount,
        lastReviewed: card.lastReviewed,
        nextReview: card.nextReview,
      }));

      const flashcardData = JSON.stringify(flashcardProgress);

      const recommendation = await getFlashcardRecommendation({
        userId: "user-123",
        subject,
        performanceData,
        currentFlashcardData: flashcardData,
        studyMode,
        targetStudyTime: 30, // 30 minutes default
      });

      setAiRecommendation(recommendation);
    } catch {
      //do nothing
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowAnswer(false);
      setConfidence(null);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowAnswer(false);
      setConfidence(null);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setConfidence(null);
  };

  const getCardsForStudyMode = () => {
    const now = new Date();

    switch (studyMode) {
      case "review":
        return flashcards.filter((c) => !c.nextReview || c.nextReview <= now);
      case "new":
        return flashcards.filter((c) => !c.lastReviewed);
      case "difficult":
        // Show cards with confidence <= 2 OR cards that haven't been reviewed yet
        return flashcards.filter((c) => c.confidence <= 2 || !c.lastReviewed);
      default:
        return flashcards;
    }
  };

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case "next":
        if (currentIndex < filteredCards.length - 1) {
          nextCard();
        }
        break;
      case "previous":
        if (currentIndex > 0) {
          previousCard();
        }
        break;
      case "flip":
        handleFlip();
        break;
      case "shuffle":
        shuffleCards();
        break;
      case "show":
        setShowAnswer(true);
        break;
      case "hide":
        setShowAnswer(false);
        break;
      default:
    }
  };

  // Filter cards based on study mode
  const filteredCards = getCardsForStudyMode();
  const currentCard = filteredCards[currentIndex];

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Flashcard Sistemi - {subject}
            </h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                {filteredCards.length === 0
                  ? `${studyMode === "review" ? "Tekrar" : studyMode === "new" ? "Yeni" : "Zor"} modunda gösterilecek kart bulunamadı.`
                  : "Bu konu için flashcard bulunamadı."}
              </p>
              {filteredCards.length === 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {studyMode === "review" &&
                      "Tekrar modu: Zamanı gelen kartları gösterir"}
                    {studyMode === "new" &&
                      "Yeni modu: Henüz incelenmemiş kartları gösterir"}
                    {studyMode === "difficult" &&
                      "Zor modu: Güven seviyesi düşük kartları gösterir"}
                  </p>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    Debug: Toplam {flashcards.length} kart,{" "}
                    {flashcards.filter((c) => c.confidence <= 2).length} zor
                    kart, {flashcards.filter((c) => !c.lastReviewed).length}{" "}
                    yeni kart
                  </div>
                  <button
                    onClick={() => {
                      setStudyMode("review");
                      setCurrentIndex(0);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tüm Kartları Göster
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Responsive Navigation Bar */}
      <MobileNav />

      <div className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 min-h-[44px] px-4 text-base hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard&apos;a Dön
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Flashcard Sistemi - {subject}
              </h1>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Toplam
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.reviewed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                İncelenen
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.mastered}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Öğrenilen
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.needsReview}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Tekrar Gerekli
              </div>
            </div>
          </div>

          {/* Study Mode Selector */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
            <button
              onClick={() => {
                setStudyMode("review");
                setCurrentIndex(0);
                setIsFlipped(false);
                setShowAnswer(false);
                setConfidence(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                studyMode === "review"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Tekrar
            </button>
            <button
              onClick={() => {
                setStudyMode("new");
                setCurrentIndex(0);
                setIsFlipped(false);
                setShowAnswer(false);
                setConfidence(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                studyMode === "new"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Yeni
            </button>
            <button
              onClick={() => {
                setStudyMode("difficult");
                setCurrentIndex(0);
                setIsFlipped(false);
                setShowAnswer(false);
                setConfidence(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                studyMode === "difficult"
                  ? "bg-red-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Zor
            </button>
            <button
              onClick={() => {
                void getAiRecommendation();
              }}
              disabled={isLoadingRecommendation}
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {isLoadingRecommendation ? "🤖 AI Düşünüyor..." : "🧠 AI Önerisi"}
            </button>
          </div>
        </div>

        {/* AI Recommendation */}
        {aiRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-6 border border-blue-200 dark:border-blue-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🧠</span>
              <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300">
                AI Önerisi
              </h3>
              <span className="text-sm text-indigo-600 dark:text-indigo-400">
                Güven: {Math.round(aiRecommendation.confidence * 100)}%
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                  Önerilen Mod:{" "}
                  {aiRecommendation.recommendedStudyMode === "review"
                    ? "Tekrar"
                    : aiRecommendation.recommendedStudyMode === "new"
                      ? "Yeni"
                      : "Zor"}
                </h4>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-3">
                  {aiRecommendation.reasoning}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                  Odaklanılacak Konular:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aiRecommendation.recommendedTopics
                    .slice(0, 3)
                    .map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs rounded"
                      >
                        {topic}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                📚 Çalışma Stratejisi
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {aiRecommendation.studyStrategy}
              </p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Tahmini süre: {aiRecommendation.estimatedTime} dakika
              </div>
            </div>

            <button
              onClick={() => {
                setStudyMode(aiRecommendation.recommendedStudyMode);
                setCurrentIndex(0);
                setIsFlipped(false);
                setShowAnswer(false);
                setConfidence(null);
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Öneriyi Uygula
            </button>
          </motion.div>
        )}

        {/* Flashcard */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="w-full max-w-2xl h-80 sm:h-96 cursor-pointer perspective-1000"
            onClick={handleFlip}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front of card */}
              <div
                className={`absolute w-full h-full border-gradient-question bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 flex flex-col justify-center items-center text-center ${
                  isFlipped ? "backface-hidden" : ""
                }`}
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="mb-4">
                  <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded">
                    {currentCard.topic}
                  </span>
                  <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded ml-2">
                    {currentCard.difficulty}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  {currentCard.question}
                </h2>

                {/* Şıkları göster - Eğer options varsa ve soru içinde "aşağıdakilerden" veya "hangisi" gibi ifadeler geçiyorsa */}
                {currentCard.options &&
                  (currentCard.question
                    .toLowerCase()
                    .includes("aşağıdakilerden") ||
                    currentCard.question.toLowerCase().includes("hangisi")) && (
                    <div className="w-full text-left mb-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        {currentCard.options.map((option, index) => (
                          <div key={index} className="mb-2 last:mb-0">
                            <span className="font-medium">
                              {String.fromCharCode(65 + index)})
                            </span>{" "}
                            {option.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cevabı görmek için tıklayın
                </p>

                <div className="mt-4 text-sm text-gray-400 dark:text-gray-500">
                  {currentIndex + 1} / {filteredCards.length}
                </div>
              </div>

              {/* Back of card */}
              <div
                className={`absolute w-full h-full border-gradient-question bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-xl shadow-xl p-8 flex flex-col justify-center items-center text-center ${
                  !isFlipped ? "backface-hidden" : ""
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="mb-4">
                  <span className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2.5 py-0.5 rounded">
                    Cevap
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  {currentCard.answer}
                </h3>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 w-full">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {currentCard.explanation}
                  </p>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Geri dönmek için tıklayın
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Confidence Rating */}
        {showAnswer && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
                Bu soruyu ne kadar iyi biliyorsunuz?
              </h3>

              <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleConfidence(level)}
                    disabled={confidence !== null}
                    className={`w-12 h-12 rounded-full font-bold transition-all ${
                      confidence === level
                        ? "bg-blue-600 text-white scale-110"
                        : confidence !== null
                          ? "bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                {confidence === 1 && "Hiç bilmiyorum"}
                {confidence === 2 && "Biraz biliyorum"}
                {confidence === 3 && "Orta seviyede biliyorum"}
                {confidence === 4 && "İyi biliyorum"}
                {confidence === 5 && "Çok iyi biliyorum"}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <button
            onClick={previousCard}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            ← Önceki
          </button>

          <button
            onClick={shuffleCards}
            className="px-6 py-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            🔀 Karıştır
          </button>

          <button
            onClick={nextCard}
            disabled={currentIndex === filteredCards.length - 1}
            className="px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            Sonraki →
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / filteredCards.length) * 100}%`,
              }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            İlerleme: {currentIndex + 1} / {filteredCards.length}
          </div>
        </div>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant
        onCommand={handleVoiceCommand}
        currentQuestion={currentCard?.question}
        currentAnswer={currentCard?.answer}
        isListening={isListening}
        onListeningChange={setIsListening}
      />
    </div>
  );
};

export default FlashcardComponent;
