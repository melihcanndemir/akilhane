"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, X, Target, BookOpen } from "lucide-react";
import { getFlashcardRecommendation, type FlashcardRecommendationOutput } from "@/ai/flows/flashcard-recommendation";

interface PerformanceData {
  subject: string;
  averageScore: number;
  totalTests: number;
  weakTopics: string[];
  strongTopics: string[];
  lastUpdated: string;
}

interface QuizResult {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  weakTopics: string[] | Record<string, number>;
  createdAt: string;
  isDemo?: boolean;
}

interface TotalStats {
  totalTests: number;
  averageScore: number;
  totalTimeSpent: number;
  totalSubjects: number;
}

interface AIPerformanceRecommendationProps {
  performanceData: PerformanceData[];
  recentResults: QuizResult[];
  totalStats: TotalStats;
  useDemoData?: boolean;
  className?: string;
}

// localStorage key for AI recommendations
const AI_RECOMMENDATION_KEY = "ai_performance_recommendation";

export default function AIPerformanceRecommendation({
  performanceData,
  recentResults,
  totalStats,
  className = "",
}: AIPerformanceRecommendationProps) {
  const [aiRecommendation, setAiRecommendation] = useState<FlashcardRecommendationOutput | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);

  // Load saved recommendation on component mount
  useEffect(() => {
    const loadSavedRecommendation = () => {
      try {
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(AI_RECOMMENDATION_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            // Check if the saved recommendation is not too old (24 hours)
            const savedTime = new Date(parsed.timestamp).getTime();
            const currentTime = new Date().getTime();
            const hoursDiff = (currentTime - savedTime) / (1000 * 60 * 60);

            if (hoursDiff < 24) {
              setAiRecommendation(parsed.recommendation);
            } else {
              // Remove old recommendation
              localStorage.removeItem(AI_RECOMMENDATION_KEY);
            }
          }
        }
      } catch {
        // Remove corrupted data
        if (typeof window !== "undefined") {
          localStorage.removeItem(AI_RECOMMENDATION_KEY);
        }
      }
    };

    loadSavedRecommendation();
  }, []);

  // Save recommendation to localStorage
  const saveRecommendation = (recommendation: FlashcardRecommendationOutput) => {
    try {
      if (typeof window !== "undefined") {
        const dataToSave = {
          recommendation,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(AI_RECOMMENDATION_KEY, JSON.stringify(dataToSave));
      }
    } catch {
      // do nothing
    }
  };

  // Clear saved recommendation from localStorage
  const clearSavedRecommendation = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(AI_RECOMMENDATION_KEY);
      }
    } catch {
      // do nothing
    }
  };

  const getAIRecommendation = async () => {
    setIsLoadingRecommendation(true);
    try {
      // Prepare performance data for AI
      const performanceDataString = JSON.stringify(performanceData);

      // Get the most recent weak topics from recent results
      recentResults
        .slice(-3)
        .flatMap(result => {
          if (Array.isArray(result.weakTopics)) {
            return result.weakTopics;
          } else if (typeof result.weakTopics === 'object') {
            return Object.keys(result.weakTopics);
          }
          return [];
        })
        .slice(0, 5);

      // Find the subject with lowest performance
      const worstPerformingSubject = performanceData
        .sort((a, b) => a.averageScore - b.averageScore)[0];

      const recommendation = await getFlashcardRecommendation({
        userId: "user-123",
        subject: worstPerformingSubject?.subject || "Genel",
        performanceData: performanceDataString,
        currentFlashcardData: JSON.stringify([]), // Empty for general recommendations
        studyMode: "difficult",
        targetStudyTime: 30,
      });

      setAiRecommendation(recommendation);
      saveRecommendation(recommendation);
    } catch {
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const hideRecommendation = () => {
    setAiRecommendation(null);
    clearSavedRecommendation();
  };

  return (
    <div className={className}>
      {/* AI Recommendation Card/Button */}
      <Card className="border-gradient-question hover:shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200">
        <CardContent className="p-6 text-center">
          <Button
            onClick={() => {
              void getAIRecommendation();
            }}
            disabled={isLoadingRecommendation}
            variant="ghost"
            className="w-full h-auto p-0 hover:bg-transparent"
          >
            {isLoadingRecommendation ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                <h3 className="font-semibold mb-2 text-base">AI Analiz Ediyor...</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Performansınız analiz ediliyor
                </p>
              </>
            ) : (
              <>
                <Brain className="h-8 w-8 mx-auto mb-3 text-indigo-600" />
                <h3 className="font-semibold mb-2 text-base">AI Performans Önerisi</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Performansınıza göre öneriler alın
                </p>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Recommendation Card */}
      <AnimatePresence>
        {aiRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <Card className="border-gradient-question bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-indigo-600" />
                    <CardTitle className="text-lg text-indigo-800 dark:text-indigo-300">
                      AI Performans Önerisi
                    </CardTitle>
                    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300">
                      {Math.round(aiRecommendation.confidence * 100)}% Güven
                    </Badge>
                  </div>
                  <Button
                    onClick={hideRecommendation}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Performance Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{totalStats.totalTests}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Toplam Test</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-lg font-bold text-green-600">%{totalStats.averageScore}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Ortalama</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{totalStats.totalTimeSpent}dk</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Toplam Süre</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">{totalStats.totalSubjects}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Konu</div>
                  </div>
                </div>

                {/* Recommendation Details */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                      Önerilen Çalışma Stratejisi
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {aiRecommendation.studyStrategy}
                    </p>
                  </div>

                  {aiRecommendation.recommendedTopics.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        Odaklanılacak Konular
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {aiRecommendation.recommendedTopics.slice(0, 5).map((topic, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Tahmini süre: {aiRecommendation.estimatedTime} dakika</span>
                    <span>Güven: {Math.round(aiRecommendation.confidence * 100)}%</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      // Navigate to quiz with recommended settings
                      window.location.href = `/quiz?mode=difficult&time=${aiRecommendation.estimatedTime}`;
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Öneriyi Uygula
                  </Button>
                  <Button
                    onClick={() => {
                      // Navigate to flashcard
                      window.location.href = "/flashcard";
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Flashcard&apos;a Git
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
