"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, X, Target, BookOpen, Sparkles, Zap, TrendingUp } from "lucide-react";
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

// In-memory storage for AI recommendations
let aiRecommendationStorage: { recommendation: FlashcardRecommendationOutput; timestamp: string } | null = null;

export default function AIPerformanceRecommendation({
  performanceData,
  recentResults,
  totalStats,
  className = "",
}: AIPerformanceRecommendationProps) {
  const [aiRecommendation, setAiRecommendation] = useState<FlashcardRecommendationOutput | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Load saved recommendation on component mount
  useEffect(() => {
    const loadSavedRecommendation = () => {
      try {
        if (aiRecommendationStorage) {
          // Check if the saved recommendation is not too old (24 hours)
          const savedTime = new Date(aiRecommendationStorage.timestamp).getTime();
          const currentTime = new Date().getTime();
          const hoursDiff = (currentTime - savedTime) / (1000 * 60 * 60);

          if (hoursDiff < 24) {
            setAiRecommendation(aiRecommendationStorage.recommendation);
          } else {
            // Remove old recommendation
            aiRecommendationStorage = null;
          }
        }
      } catch {
        // Remove corrupted data
        aiRecommendationStorage = null;
      }
    };

    loadSavedRecommendation();
  }, []);

  // Save recommendation to memory
  const saveRecommendation = (recommendation: FlashcardRecommendationOutput) => {
    try {
      const dataToSave = {
        recommendation,
        timestamp: new Date().toISOString(),
      };
      aiRecommendationStorage = dataToSave;
    } catch {
      // do nothing
    }
  };

  // Clear saved recommendation from memory
  const clearSavedRecommendation = () => {
    try {
      aiRecommendationStorage = null;
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
      {/* Enhanced AI Recommendation Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative overflow-hidden"
      >
                 <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-700 via-violet-800 to-blue-900 hover:from-purple-800 hover:via-violet-900 hover:to-blue-950 transition-all duration-500 shadow-2xl hover:shadow-purple-600/30">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{
                x: isHovered ? ['-100%', '100%'] : '-100%',
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: isHovered ? Infinity : 0,
                repeatDelay: 2,
              }}
            />
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 50 - 25, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${80 + Math.random() * 20}%`,
                }}
              />
            ))}
          </div>

          <CardContent className="relative p-4 sm:p-6 md:p-8 text-center">
            <Button
              onClick={() => {
                void getAIRecommendation();
              }}
              disabled={isLoadingRecommendation}
              variant="ghost"
              className="w-full h-auto p-0 hover:bg-transparent text-white"
            >
              {isLoadingRecommendation ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4 sm:mb-6">
                    <motion.div
                      className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/30 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3">AI Analiz Ediyor...</h3>
                  <p className="text-xs sm:text-sm text-white/80 px-2">
                    Performansınız derinlemesine analiz ediliyor
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4 sm:mb-6">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-50"
                      animate={{
                        scale: isHovered ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: isHovered ? Infinity : 0,
                      }}
                    />
                                         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 sm:p-4 rounded-lg">
                       <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                       <Sparkles className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" />
                     </div>
                  </div>
                  <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-3 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent px-2">
                    AI Akıllı Önerisi
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-white/90 leading-relaxed px-2 sm:px-3 md:px-4 lg:px-6 text-center break-words whitespace-normal overflow-visible">
                    Performans verilerinizi analiz ederek size özel 
                    <span className="font-semibold text-yellow-300"> kişiselleştirilmiş</span> öneriler sunuyoruz
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mt-3 sm:mt-4 text-xs text-white/70">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>Yapay Zeka Destekli</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Performans Odaklı</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Recommendation Card */}
      <AnimatePresence>
        {aiRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-4 sm:mt-6"
          >
            <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 shadow-2xl backdrop-blur-sm">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-50"></div>
                      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
                        <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        AI Performans Önerisi
                      </CardTitle>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg text-xs sm:text-sm">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {Math.round(aiRecommendation.confidence * 100)}% Güven
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={hideRecommendation}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200 self-end sm:self-auto"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                                 {/* Enhanced Performance Summary */}
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                   <motion.div 
                     whileHover={{ scale: 1.05 }}
                     className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg aspect-square flex flex-col justify-center items-center"
                   >
                     <div className="text-lg sm:text-2xl font-bold mb-1">{totalStats.totalTests}</div>
                     <div className="text-xs opacity-90">Toplam Test</div>
                   </motion.div>
                   <motion.div 
                     whileHover={{ scale: 1.05 }}
                     className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg aspect-square flex flex-col justify-center items-center"
                   >
                     <div className="text-lg sm:text-2xl font-bold mb-1">%{totalStats.averageScore}</div>
                     <div className="text-xs opacity-90">Ortalama</div>
                   </motion.div>
                   <motion.div 
                     whileHover={{ scale: 1.05 }}
                     className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg aspect-square flex flex-col justify-center items-center"
                   >
                     <div className="text-lg sm:text-2xl font-bold mb-1">{totalStats.totalTimeSpent}dk</div>
                     <div className="text-xs opacity-90">Toplam Süre</div>
                   </motion.div>
                   <motion.div 
                     whileHover={{ scale: 1.05 }}
                     className="text-center p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg aspect-square flex flex-col justify-center items-center"
                   >
                     <div className="text-lg sm:text-2xl font-bold mb-1">{totalStats.totalSubjects}</div>
                     <div className="text-xs opacity-90">Konu</div>
                   </motion.div>
                 </div>

                {/* Recommendation Details */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                      Önerilen Çalışma Stratejisi
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {aiRecommendation.studyStrategy}
                    </p>
                  </div>

                  {aiRecommendation.recommendedTopics.length > 0 && (
                    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20">
                      <h4 className="font-bold text-gray-800 dark:text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                        Odaklanılacak Konular
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {aiRecommendation.recommendedTopics.slice(0, 5).map((topic, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge
                              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-shadow px-2 sm:px-3 py-1 text-xs sm:text-sm"
                            >
                              {topic}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3 gap-2 sm:gap-0">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      Tahmini süre: {aiRecommendation.estimatedTime} dakika
                    </span>
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      Güven: {Math.round(aiRecommendation.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      onClick={() => {
                        // Navigate to quiz with recommended settings
                        window.location.href = `/quiz?mode=difficult&time=${aiRecommendation.estimatedTime}`;
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 py-4 sm:py-6 text-base sm:text-lg font-semibold"
                    >
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Öneriyi Hemen Uygula
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                         <Button
                       onClick={() => {
                         // Navigate to flashcard
                         window.location.href = "/flashcard";
                       }}
                       className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-800 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 py-4 sm:py-6 text-base sm:text-lg font-semibold"
                     >
                                              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Flashcard
                     </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}