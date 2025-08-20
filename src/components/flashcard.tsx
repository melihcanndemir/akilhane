"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getFlashcardRecommendation,
  type FlashcardRecommendationOutput,
} from "../ai/flows/flashcard-recommendation";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Frown, Meh, Smile, Star, Target, Shuffle, Brain, BookOpen, Zap, MousePointer2, BarChart3, CheckCircle, Lightbulb, Eye, RotateCcw } from "lucide-react";
import Link from "next/link";
import VoiceAssistant from "./voice-assistant";
import { getDemoFlashcards } from "@/data/demo-data";
import MobileNav from "@/components/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { UnifiedStorageService } from "@/services/unified-storage-service";

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

  // Reset confirmation state
  const [showResetDialog, setShowResetDialog] = useState(false);

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

        // USE UNIFIED STORAGE SERVICE INSTEAD OF DIRECT LOCALSTORAGE

        // Sadece flashcard'ları yükle - quiz soruları kaldırıldı
        const flashcards = UnifiedStorageService.getFlashcardsBySubject(subject);

        if (flashcards.length === 0) {
          throw new Error("Bu ders için henüz flashcard bulunamadı. Flashcard Yöneticisi&apos;nden flashcard ekleyebilirsiniz.");
        }

        // Flashcard'ları component interface'ine uygun hale getir
        const convertedFlashcards: Flashcard[] = flashcards.map((f) => {
          const card: Flashcard = {
            id: f.id,
            question: f.question,
            answer: f.answer,
            explanation: f.explanation,
            topic: f.topic,
            difficulty: f.difficulty,
            reviewCount: f.reviewCount || 0,
            confidence: f.confidence || 3,
            options: undefined,
          };

          // Only add optional properties if they exist
          if (f.lastReviewed) {
            card.lastReviewed = f.lastReviewed instanceof Date ? f.lastReviewed : new Date(f.lastReviewed);
          }
          if (f.nextReview) {
            card.nextReview = f.nextReview instanceof Date ? f.nextReview : new Date(f.nextReview);
          }

          return card;
        });

        setFlashcards(convertedFlashcards);
        setStats({
          total: convertedFlashcards.length,
          reviewed: convertedFlashcards.filter((f) => f.reviewCount > 0).length,
          mastered: convertedFlashcards.filter((f) => f.confidence >= 4).length,
          needsReview: convertedFlashcards.filter((f) => f.confidence < 4).length,
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

      // Save progress to storage using UnifiedStorageService
      if (currentCard.id.startsWith('flashcard_') || currentCard.id.startsWith('ai_flashcard_')) {
        // This is a flashcard, save progress
        UnifiedStorageService.updateFlashcardProgress(currentCard.id, {
          confidence: currentCard.confidence,
          reviewCount: currentCard.reviewCount,
          lastReviewed: currentCard.lastReviewed,
          nextReview: currentCard.nextReview,
        });
      }

      // Update stats
      updateStats(updatedFlashcards);
    }
  };

  const calculateNextReview = (
    confidence: number,
    reviewCount: number,
  ): number => {
    // Optimized spaced repetition algorithm with realistic limits
    let daysUntilNextReview: number;

    if (confidence >= 4) {
      // High confidence: gradual increase with cap
      daysUntilNextReview = Math.min(Math.pow(1.5, reviewCount), 30);
    } else if (confidence >= 3) {
      // Medium confidence: moderate increase
      daysUntilNextReview = Math.min(Math.pow(1.3, reviewCount), 14);
    } else if (confidence >= 2) {
      // Low confidence: slow increase
      daysUntilNextReview = Math.min(Math.pow(1.2, reviewCount), 7);
    } else {
      // Very low confidence: review soon
      daysUntilNextReview = 1;
    }

    // Ensure minimum 1 day and maximum 30 days
    return Math.max(1, Math.min(Math.round(daysUntilNextReview), 30));
  };

  const updateStats = (cards: Flashcard[]) => {
    const now = new Date();
    const reviewed = cards.filter((c) => c.lastReviewed).length;
    const mastered = cards.filter(
      (c) => c.confidence >= 4 && c.reviewCount >= 3,
    ).length;
    const needsReview = cards.filter((c) => {
      if (!c.nextReview) {return true;}
      const nextReviewDate = c.nextReview instanceof Date ? c.nextReview : new Date(c.nextReview);
      return nextReviewDate <= now;
    }).length;

    setStats({
      total: cards.length,
      reviewed,
      mastered,
      needsReview,
    });
  };

  const resetAllCards = () => {
    // Reset all flashcards to initial state
    const resetFlashcards = flashcards.map(card => {
      const { ...cardWithoutDates } = card;
      return {
        ...cardWithoutDates,
        reviewCount: 0,
        confidence: 3, // Default confidence
      };
    });

    setFlashcards(resetFlashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setConfidence(null);

    // Update stats
    updateStats(resetFlashcards);

    // Save reset state to storage
    resetFlashcards.forEach(card => {
      if (card.id.startsWith('flashcard_') || card.id.startsWith('ai_flashcard_')) {
        UnifiedStorageService.updateFlashcardProgress(card.id, {
          confidence: card.confidence,
          reviewCount: card.reviewCount,
        });
      }
    });

    // Show success message
    toast({
      title: "Başarılı!",
      description: "Tüm kartlar sıfırlandı. Spaced repetition sistemi yeniden başlatıldı.",
      variant: "default",
    });
  };

  const getAiRecommendation = async () => {
    setIsLoadingRecommendation(true);
    try {
      // Get comprehensive data from localStorage for AI recommendations
      const performanceData =
        typeof window !== "undefined"
          ? localStorage.getItem("performanceData") || "{}"
          : "{}";

      // Get quiz results from localStorage
      const quizResults =
        typeof window !== "undefined"
          ? localStorage.getItem("quizResults") || "[]"
          : "[]";

      // Get study history from localStorage
      const studyHistory =
        typeof window !== "undefined"
          ? localStorage.getItem("studyHistory") || "[]"
          : "[]";

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

      // Combine all data for comprehensive AI analysis
      const combinedData = {
        performanceData: JSON.parse(performanceData),
        quizResults: JSON.parse(quizResults),
        studyHistory: JSON.parse(studyHistory),
        flashcardProgress,
        currentSubject: subject,
        currentStudyMode: studyMode,
        totalFlashcards: flashcards.length,
        reviewedCount: flashcards.filter(card => card.lastReviewed).length,
        masteredCount: flashcards.filter(card => card.confidence >= 4).length,
        needsReviewCount: flashcards.filter(card => {
          if (!card.nextReview) {return true;}
          const nextReviewDate = card.nextReview instanceof Date ? card.nextReview : new Date(card.nextReview);
          return nextReviewDate <= new Date();
        }).length,
      };

      const flashcardData = JSON.stringify(combinedData);

      const recommendation = await getFlashcardRecommendation({
        userId: "user-123",
        subject,
        performanceData: JSON.stringify(combinedData), // Send combined data
        currentFlashcardData: flashcardData,
        studyMode,
        targetStudyTime: 30, // 30 minutes default
      });

      setAiRecommendation(recommendation);
    } catch /* (error) */ {
      if (process.env.NODE_ENV === 'development') {
        //console.error("AI recommendation error:", error);
      }
      // Show user-friendly error message
      toast({
        title: "AI Önerisi Alınamadı",
        description: "Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
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
    // Get current card before shuffling
    const currentCard = filteredCards[currentIndex];

    // Create a shuffled copy of the filtered cards
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);

    // Update the main flashcards array with the shuffled order
    // but preserve the original cards that aren't in the current filter
    const originalCards = [...flashcards];
    const shuffledIds = new Set(shuffled.map(card => card.id));

    // Replace cards that are in the current filter with shuffled ones
    const updatedFlashcards = originalCards.map(card => {
      if (shuffledIds.has(card.id)) {
        return shuffled.find(shuffledCard => shuffledCard.id === card.id) || card;
      }
      return card;
    });

    setFlashcards(updatedFlashcards);

    // Find the new position of the current card in shuffled array
    if (currentCard) {
      const newIndex = shuffled.findIndex(card => card.id === currentCard.id);
      setCurrentIndex(newIndex >= 0 ? newIndex : 0);
    } else {
      setCurrentIndex(0);
    }

    setIsFlipped(false);
    setShowAnswer(false);
    setConfidence(null);
  };

  const getCardsForStudyMode = () => {
    switch (studyMode) {
      case "review":
        return flashcards.filter(() =>
          // Show all cards in review mode
          // This includes: new cards, cards due for review, and completed cards
           true,
        );
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
  let filteredCards = getCardsForStudyMode();

  // Debug filtering
  /* if (process.env.NODE_ENV === 'development') {
    console.log('Filtering Debug:', {
      studyMode,
      totalCards: flashcards.length,
      filteredCards: filteredCards.length,
      cards: flashcards.map(c => ({
        id: c.id,
        confidence: c.confidence,
        lastReviewed: c.lastReviewed,
        nextReview: c.nextReview,
      })),
    });
  } */

  // If no cards found in current mode, fallback to showing all cards
  if (filteredCards.length === 0 && flashcards.length > 0) {
    filteredCards = flashcards;
  }

  const currentCard = filteredCards[currentIndex];

  // Check if all cards are completed (confidence >= 4) - show congratulations
  const allCardsCompleted = flashcards.length > 0 && flashcards.every(card => card.confidence >= 4);

  if (!currentCard || allCardsCompleted) {
    // Check if current study mode has no cards
    const currentModeCompleted = filteredCards.length === 0 && flashcards.length > 0;

    // Debug info
    /* if (process.env.NODE_ENV === 'development') {
      console.log('Debug Info:', {
        totalCards: flashcards.length,
        completedCards: flashcards.filter(c => c.confidence >= 4).length,
        allCardsCompleted,
        currentModeCompleted,
        studyMode,
        filteredCardsLength: filteredCards.length,
        confidenceDistribution: flashcards.map(c => c.confidence),
      });
    } */

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Flashcard Sistemi - {subject}
            </h1>

            {(allCardsCompleted || currentModeCompleted) ? (
              // 🎉 MODERN CONGRATULATIONS SCREEN 🎉
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm mx-4 sm:mx-0"
              >
                {/* Modern Celebration Animation */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-6 sm:mb-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                      className="relative"
                    >
                      {/* Main achievement badge */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl border-2 sm:border-4 border-white/20">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>

                      {/* Floating success indicators */}
                      <motion.div
                        animate={{
                          y: [0, -8, 0],
                          rotate: [0, 5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </motion.div>

                      <motion.div
                        animate={{
                          y: [0, -6, 0],
                          rotate: [0, -5, 0],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: 0.5,
                        }}
                        className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </motion.div>
                    </motion.div>
                  </div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-4"
                    style={{ lineHeight: '1.2', height: 'auto', overflow: 'visible' }}
                  >
                    Başarıyla Tamamlandı!
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 font-medium px-4"
                  >
                    {allCardsCompleted
                      ? "Matematik konusundaki tüm flashcard&apos;ları başarıyla öğrendiniz!"
                      : "Harika bir iş çıkardınız!"}
                  </motion.p>
                </div>

                {/* Modern Stats Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 px-4"
                >
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-200/50 dark:border-blue-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                        {flashcards.length}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">Toplam Kart</div>
                    </div>
                  </div>

                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-200/50 dark:border-green-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-2">
                        {Math.round((flashcards.filter(c => c.confidence >= 4).length / flashcards.length) * 100)}%
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-green-400">Başarı Oranı</div>
                    </div>
                  </div>

                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-200/50 dark:border-purple-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2">
                        {flashcards.reduce((sum, c) => sum + c.reviewCount, 0)}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400">Toplam Tekrar</div>
                    </div>
                  </div>
                </motion.div>

                {/* Modern Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      resetAllCards();
                    }}
                    className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Yeni Baştan Başla</span>
                  </motion.button>

                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Dashboard&apos;a Dön</span>
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              // Modern "no cards" message with better debugging
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-600/50"
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {filteredCards.length === 0 && flashcards.length > 0
                      ? `${studyMode === "review" ? "Tekrar" : studyMode === "new" ? "Yeni" : "Zor"} modunda gösterilecek kart bulunamadı`
                      : "Bu konu için flashcard bulunamadı"}
                  </h3>
                </div>

                {filteredCards.length === 0 && flashcards.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-600/50 rounded-2xl p-6 mb-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">💡</span>
                      <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300">İpucu</h4>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300">
                      Mevcut modda kart bulunamadı. Aşağıdaki butonlardan birini kullanarak farklı modları deneyebilir veya tüm kartları görebilirsiniz.
                    </p>
                  </motion.div>
                )}

                {/* Modern Debug Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 mb-6 border border-gray-200/50 dark:border-gray-600/50"
                >
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    Debug Bilgileri
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{flashcards.length}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Toplam</div>
                    </div>
                    <div className="text-center p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">{flashcards.filter(c => c.confidence >= 4).length}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Tamamlanan</div>
                    </div>
                    <div className="text-center p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                      <div className="text-xl font-bold text-red-600 dark:text-red-400">{flashcards.filter(c => c.confidence <= 2).length}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Zor</div>
                    </div>
                    <div className="text-center p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{flashcards.filter(c => !c.lastReviewed).length}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Yeni</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div><strong>Güven Dağılımı:</strong> {flashcards.map(c => `${c.confidence}/5`).join(' • ')}</div>
                    <div><strong>Mevcut Mod:</strong> {studyMode === "review" ? "🔄 Tekrar" : studyMode === "new" ? "🆕 Yeni" : "⚠️ Zor"}</div>
                    <div><strong>Filtrelenmiş Kartlar:</strong> {filteredCards.length}</div>
                  </div>
                </motion.div>

                {filteredCards.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      {studyMode === "review" && "🔄 Tekrar modu: Zamanı gelen kartları gösterir"}
                      {studyMode === "new" && "🆕 Yeni modu: Henüz incelenmemiş kartları gösterir"}
                      {studyMode === "difficult" && "⚠️ Zor modu: Güven seviyesi düşük kartları gösterir"}
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setStudyMode("review");
                          setCurrentIndex(0);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                      >
                        🔄 Tüm Kartları Göster
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setStudyMode("new");
                          setCurrentIndex(0);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                      >
                        🆕 Yeni Kartlar
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setStudyMode("difficult");
                          setCurrentIndex(0);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                      >
                        ⚠️ Zor Kartlar
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
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
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Toplam
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.reviewed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                İncelenen
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.mastered}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Öğrenilen
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md text-center">
              <div className="flex items-center justify-center mb-2">
                <RotateCcw className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.needsReview}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Tekrar Gerekli
              </div>
            </div>
          </div>

          {/* Reset All Cards Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowResetDialog(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              title="Tüm kartların spaced repetition verilerini sıfırla"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Tüm Kartları Sıfırla
            </button>
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
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoadingRecommendation ? (
                <>
                  <Brain className="w-4 h-4 animate-pulse" />
                  <span>AI Düşünüyor...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>AI Önerisi</span>
                </>
              )}
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300">
                  AI Önerisi
                </h3>
                <span className="text-sm text-indigo-600 dark:text-indigo-400">
                  Güven: {Math.round(aiRecommendation.confidence * 100)}%
                </span>
              </div>
              <button
                onClick={() => setAiRecommendation(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1"
                title="Öneriyi gizle"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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

        {/* Modern Flashcard */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="w-full max-w-5xl cursor-pointer perspective-1000"
            onClick={handleFlip}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              className="relative w-full h-auto min-h-[31rem] sm:min-h-[35rem]"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front of card - Modern Design */}
              <div
                className={`absolute w-full h-full bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center text-center border border-gray-100 dark:border-gray-600 ${
                  isFlipped ? "backface-hidden" : ""
                }`}
                style={{ backfaceVisibility: "hidden" }}
              >
                {/* Header with modern badges */}
                <div className="mb-6 flex flex-wrap justify-center gap-3">
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-full shadow-lg gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{currentCard.topic}</span>
                  </span>
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg gap-2">
                    <Zap className="w-4 h-4" />
                    <span>{currentCard.difficulty}</span>
                  </span>
                </div>

                {/* Question with modern typography */}
                <div className="mb-8 px-4 flex-1 flex items-center justify-center">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white leading-relaxed text-center">
                    {currentCard.question}
                  </h2>
                </div>

                {/* Modern options display */}
                {currentCard.options &&
                  (currentCard.question
                    .toLowerCase()
                    .includes("aşağıdakilerden") ||
                    currentCard.question.toLowerCase().includes("hangisi")) && (
                    <div className="w-full max-w-lg mb-6">
                      <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-600/50">
                        {currentCard.options.map((option, index) => (
                          <div key={index} className="mb-3 last:mb-0">
                            <div className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 rounded-xl hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-600/20 dark:hover:to-blue-700/20 transition-all duration-200">
                              <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-full mr-3 shadow-md">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="text-gray-700 dark:text-gray-200 font-medium">
                                {option.text}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Interactive hint */}
                <div className="mt-auto">
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-600/30">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center justify-center gap-2">
                      <MousePointer2 className="w-4 h-4 animate-pulse text-blue-600 dark:text-blue-400" />
                      <span>Cevabı görmek için tıklayın</span>
                    </p>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="absolute bottom-4 right-4">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border border-gray-200/50 dark:border-gray-600/50">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                      {currentIndex + 1} / {filteredCards.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Back of card - Modern Design */}
              <div
                className={`absolute w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center text-center border border-gray-100 dark:border-gray-600 ${
                  !isFlipped ? "backface-hidden" : ""
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                {/* Answer header */}
                <div className="mb-4 sm:mb-6">
                  <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Cevap</span>
                  </span>
                </div>

                {/* Answer content */}
                <div className="mb-4 sm:mb-6 px-2 sm:px-4 flex-1 flex items-center justify-center">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 dark:text-white leading-relaxed text-center">
                    {currentCard.answer}
                  </h3>
                </div>

                {/* Explanation in modern card */}
                <div className="w-full max-w-2xl mb-4 sm:mb-6">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                      <h4 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">Açıklama</h4>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {currentCard.explanation}
                    </p>
                  </div>
                </div>

                {/* Interactive hint */}
                <div className="mt-auto">
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20 rounded-2xl p-4 border border-green-200/30 dark:border-green-600/30">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                      <MousePointer2 className="w-4 h-4 animate-pulse text-green-600 dark:text-green-400" />
                      <span>Geri dönmek için tıklayın</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Modern Confidence Rating */}
        {showAnswer && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-gray-200/50 dark:border-gray-600/50"
            >
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                  <span className="leading-none">Bu soruyu ne kadar iyi biliyorsunuz?</span>
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Güven seviyenizi seçin ve öğrenme yolculuğunuza devam edin
                </p>
              </div>

              <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
                {[1, 2, 3, 4, 5].map((level) => (
                  <motion.button
                    key={level}
                    onClick={() => handleConfidence(level)}
                    disabled={confidence !== null}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg ${
                      confidence === level
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-110 shadow-2xl"
                        : confidence !== null
                          ? "bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
                    }`}
                  >
                    {level}
                    {confidence === level && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                      >
                        <span className="text-xs">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="text-center">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-200/50 dark:border-gray-600/50">
                  <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2">
                    {confidence === 1 && (
                      <>
                        <Frown className="w-5 h-5 text-red-500" />
                        <span>Hiç bilmiyorum</span>
                      </>
                    )}
                    {confidence === 2 && (
                      <>
                        <Meh className="w-5 h-5 text-orange-500" />
                        <span>Biraz biliyorum</span>
                      </>
                    )}
                    {confidence === 3 && (
                      <>
                        <Meh className="w-5 h-5 text-yellow-500" />
                        <span>Orta seviyede biliyorum</span>
                      </>
                    )}
                    {confidence === 4 && (
                      <>
                        <Smile className="w-5 h-5 text-green-500" />
                        <span>İyi biliyorum</span>
                      </>
                    )}
                    {confidence === 5 && (
                      <>
                        <Star className="w-5 h-5 text-blue-500" />
                        <span>Çok iyi biliyorum</span>
                      </>
                    )}
                  </p>
                  {confidence && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Bu seviye ile kartınız {(() => {
                        const days = calculateNextReview(confidence, (currentCard?.reviewCount || 0) + 1);
                        if (days === 1) {return "yarın";}
                        if (days < 7) {return `${days} gün sonra`;}
                        if (days < 30) {return `${days} gün sonra`;}
                        return "1 ay sonra";
                      })()} tekrar gösterilecek
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Modern Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <motion.button
            onClick={previousCard}
            disabled={currentIndex === 0}
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-600 hover:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span className="text-xl">←</span>
            <span>Önceki</span>
          </motion.button>

          <motion.button
            onClick={shuffleCards}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Shuffle className="w-5 h-5 text-white" />
            <span>Karıştır</span>
          </motion.button>

          <motion.button
            onClick={nextCard}
            disabled={currentIndex === filteredCards.length - 1}
            whileHover={{ scale: 1.05, x: 3 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-600 hover:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span>Sonraki</span>
            <span className="text-xl">→</span>
          </motion.button>
        </div>

        {/* Modern Progress Bar */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl h-4 shadow-inner border border-gray-200/50 dark:border-gray-600/50 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl shadow-lg"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + 1) / filteredCards.length) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-gray-200/50 dark:border-gray-600/50">
              <span className="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>İlerleme</span>
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {currentIndex + 1} / {filteredCards.length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                (%{Math.round(((currentIndex + 1) / filteredCards.length) * 100)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant
        key={`${currentCard?.id}-${currentIndex}`}
        onCommand={handleVoiceCommand}
        currentQuestion={currentCard?.question}
        currentAnswer={currentCard?.answer}
        {...(currentCard?.options && { currentOptions: currentCard.options })}
        currentExplanation={currentCard?.explanation}
        isListening={isListening}
        onListeningChange={setIsListening}
        mode="flashcard"
      />

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tüm Kartları Sıfırla</AlertDialogTitle>
            <AlertDialogDescription>
              Tüm kartların ilerleme durumunu sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowResetDialog(false)}>
              İptal
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              resetAllCards();
              setShowResetDialog(false);
            }} className="bg-red-600 hover:bg-red-700">
              Sıfırla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FlashcardComponent;
