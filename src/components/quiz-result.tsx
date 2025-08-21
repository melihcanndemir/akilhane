"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Award, Target, Clock, BookCopy, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  weakTopics: Record<string, number>;
  onRetake: () => void;
}

const getFeedback = (percentage: number) => {
  if (percentage >= 80) {
    return {
      title: "Mükemmel!",
      description: "Konulara hakimsin. Bu harika performansı devam ettir!",
      iconColor: "text-green-500",
    };
  }
  if (percentage >= 60) {
    return {
      title: "Harika İş!",
      description:
        "İyi bir sonuç. Geliştirilmesi gereken konulara odaklanarak daha da iyi olabilirsin.",
      iconColor: "text-blue-500",
    };
  }
  if (percentage >= 40) {
    return {
      title: "Fena Değil",
      description:
        "Temel bilgileri aldın ama tekrar yapman gerekiyor. Zayıf konularına göz at.",
      iconColor: "text-yellow-500",
    };
  }
  return {
    title: "Tekrar Gerekli",
    description:
      "Endişelenme, bu bir öğrenme süreci. Zayıf konularını tekrar ederek başlayabilirsin.",
    iconColor: "text-red-500",
  };
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}dk ${remainingSeconds.toString().padStart(2, "0")}sn`;
};

export const QuizResult: React.FC<QuizResultProps> = ({
  score,
  totalQuestions,
  timeSpent,
  weakTopics,
  onRetake,
}) => {
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const feedback = getFeedback(percentage);
  const weakTopicList = Object.keys(weakTopics);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
            >
              Quiz Sonucu
            </motion.h1>
          </div>

          {/* Modern Result Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm"
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
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl border-2 sm:border-4 border-white/20`}>
                    <Award className={`h-10 w-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white ${feedback.iconColor}`} />
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
                    <span className="text-xs sm:text-sm text-white font-bold">★</span>
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
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </motion.div>
                </motion.div>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-4"
              >
                {feedback.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 font-medium px-4"
              >
                {feedback.description}
              </motion.p>
            </div>

            {/* Modern Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 px-4"
            >
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-200/50 dark:border-blue-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {score} / {totalQuestions}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">Doğru Sayısı</div>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-200/50 dark:border-yellow-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent mb-2">
                    {formatTime(timeSpent)}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-yellow-600 dark:text-yellow-400">Toplam Süre</div>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-200/50 dark:border-green-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">
                    {percentage}%
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">Başarı Oranı</div>
                </div>
              </div>
            </motion.div>

            {/* Modern Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mb-8 px-4"
            >
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl h-4 shadow-inner border border-gray-200/50 dark:border-gray-600/50 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
              <div className="text-center mt-4">
                <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-gray-200/50 dark:border-gray-600/50">
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-200">İlerleme</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {percentage}%
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Weak Topics */}
            {weakTopicList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="text-center mb-8 px-4"
              >
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center justify-center gap-2">
                  <BookCopy className="w-5 h-5 text-red-500" />
                  Geliştirilmesi Gereken Konular
                </h3>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {weakTopicList.map((topic) => (
                    <Badge key={topic} variant="destructive" className="text-sm px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Modern Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRetake}
                className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Testi Tekrar Çöz</span>
              </motion.button>

              <Link href="/quiz" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Test Sayfasına Dön</span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
