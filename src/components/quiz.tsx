"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAiTutorHelp, type AiTutorOutput } from "../ai/flows/ai-tutor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import VoiceAssistant from "./voice-assistant";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MobileNav from "./mobile-nav";
import { QuizResult } from "./quiz-result";
import LoadingSpinner from "./loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { QuestionService } from "@/services/supabase-service";
import { getDemoQuestions } from "@/data/demo-data";

interface DemoQuestion {
  id: string;
  subjectId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  tags: string[];
  createdAt: string;
}

interface Question {
  id: string;
  subject: string;
  type: string;
  difficulty: string;
  text: string;
  topic: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
}

interface QuizProps {
  subject: string;
  isDemoMode?: boolean;
}

interface UserSettings {
  studyPreferences: {
    defaultSubject: string;
    questionsPerQuiz: number;
    timeLimit: number;
    showTimer: boolean;
    autoSubmit: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
    achievements: boolean;
  };
  appearance: {
    fontSize: "small" | "medium" | "large";
    compactMode: boolean;
    theme: "light" | "dark" | "system";
  };
}

const QuizComponent: React.FC<QuizProps> = ({
  subject,
  isDemoMode = false,
}) => {
  const { toast } = useToast();

  // Save demo mode to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && isDemoMode) {
      localStorage.setItem("btk_demo_mode", "true");
    }
  }, [isDemoMode]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [aiTutorHelp, setAiTutorHelp] = useState<AiTutorOutput | null>(null);
  const [isLoadingTutor, setIsLoadingTutor] = useState(false);
  const [tutorStep, setTutorStep] = useState<
    "hint" | "explanation" | "step-by-step" | "concept-review"
  >("hint");
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalResult, setFinalResult] = useState({
    score: 0,
    totalQuestions: 0,
    timeSpent: 0,
    weakTopics: {},
  });
  const [userAnswers, setUserAnswers] = useState<
    Array<{ questionId: string; topic: string; isCorrect: boolean }>
  >([]);

  // Settings state
  const [userSettings, setUserSettings] = useState<UserSettings>({
    studyPreferences: {
      defaultSubject: "",
      questionsPerQuiz: 10,
      timeLimit: 30,
      showTimer: true,
      autoSubmit: false,
    },
    notifications: {
      email: true,
      push: false,
      reminders: true,
      achievements: true,
    },
    appearance: {
      fontSize: "medium",
      compactMode: false,
      theme: "system",
    },
  });

  // Timer states
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Generate a unique user ID for this session
  const userId = React.useMemo(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        return storedUserId;
      }

      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("userId", newUserId);
      return newUserId;
    }
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Load user settings
  useEffect(() => {
    const loadUserSettings = () => {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("userSettings");
          if (saved) {
            const parsed = JSON.parse(saved);
            setUserSettings((prev) => ({
              ...prev,
              ...parsed,
              studyPreferences: {
                ...prev.studyPreferences,
                ...parsed.studyPreferences,
              },
            }));
          }
        } catch {
          // Use default settings
        }
      }
    };

    loadUserSettings();
  }, []);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Check demo mode
        const demoModeActive =
          isDemoMode ||
          (typeof window !== "undefined" &&
            localStorage.getItem("btk_demo_mode") === "true");

        if (demoModeActive) {
          // Load demo questions from demo-data.ts
          const demoQuestionsFromData = getDemoQuestions(subject) as DemoQuestion[];
          
          // Convert demo questions to Quiz component format
          const convertedDemoQuestions: Question[] = demoQuestionsFromData.map(q => ({
            id: q.id,
            subject, // Use the selected subject name directly
            type: "multiple-choice",
            difficulty: q.difficulty === "Başlangıç" ? "Easy" : q.difficulty === "Orta" ? "Medium" : "Hard",
            text: q.question,
            topic: (q.tags && q.tags.length > 0 ? q.tags[0] : "Genel") as string,
            options: q.options.map((option, index) => ({
              text: option,
              isCorrect: index === q.correctAnswer
            })),
            explanation: q.explanation
          }));

          const demoQuestions = convertedDemoQuestions;

          // Apply user settings for question count
          const questionCount = Math.min(
            userSettings.studyPreferences.questionsPerQuiz,
            demoQuestions.length,
          );
          const selectedQuestions = demoQuestions.slice(0, questionCount);

          setQuestions(selectedQuestions);
          setTotalQuestions(selectedQuestions.length);
          setStartTime(new Date());

          // Set time limit if configured
          if (userSettings.studyPreferences.timeLimit > 0) {
            const timeLimitMinutes = userSettings.studyPreferences.timeLimit;
            setTimeLimit(timeLimitMinutes * 60); // Convert to seconds
            setTimeRemaining(timeLimitMinutes * 60);
          }

          return;
        }

        // USE DIRECT LOCALSTORAGE

        // Load questions from both localStorage and Supabase
        const getQuestionsFromAllSources = async (): Promise<Question[]> => {
          if (typeof window === "undefined") {
            return [];
          }

          let allQuestions: Question[] = [];

          try {
            // Check authentication
            const guestUser = localStorage.getItem("guestUser");
            const supabaseToken = localStorage.getItem("sb-gjdjjwvhxlhlftjwykcj-auth-token");
            const isAuthenticated = Boolean(guestUser || supabaseToken);

            // Try to load from Supabase if authenticated
            if (isAuthenticated) {
              try {
                const dbQuestions = await QuestionService.getQuestionsBySubject(subject);
                const cloudQuestions = dbQuestions.map(question => ({
                  id: question.id,
                  subject: question.subject,
                  type: question.type,
                  difficulty: question.difficulty,
                  text: question.text,
                  options: JSON.parse(question.options || "[]"),
                  explanation: question.explanation,
                  topic: question.topic || "",
                }));
                allQuestions = [...cloudQuestions];

              } catch {
                //do nothing
              }
            }

            // Also check localStorage and merge
            const stored = localStorage.getItem("akilhane_questions");
            if (stored) {
              const localQuestions = JSON.parse(stored).filter(
                (q: unknown) =>
                  typeof q === "object" &&
                  q !== null &&
                  "subject" in q &&
                  q.subject === subject,
              ) as Question[];

              // Add local questions that don't exist in cloud questions
              localQuestions.forEach(localQ => {
                if (!allQuestions.find(cloudQ => cloudQ.id === localQ.id)) {
                  allQuestions.push(localQ);
                }
              });

            }
            return allQuestions;
          } catch {
            return [];
          }
        };

        const localQuestions = await getQuestionsFromAllSources();

        if (localQuestions.length === 0) {
          // Show error message and redirect to home page
          toast({
            title: "Hata",
            description: "Bu ders için henüz soru bulunmuyor",
            variant: "destructive",
          });
          window.location.href = "/";
          return;
        }

        // Apply user settings for question count
        const questionCount = Math.min(
          userSettings.studyPreferences.questionsPerQuiz,
          localQuestions.length,
        );
        const quizQuestions = localQuestions.slice(0, questionCount);

        setQuestions(quizQuestions);
        setTotalQuestions(quizQuestions.length);
        setStartTime(new Date());

        // Set time limit if configured
        if (userSettings.studyPreferences.timeLimit > 0) {
          const timeLimitMinutes = userSettings.studyPreferences.timeLimit;
          setTimeLimit(timeLimitMinutes * 60); // Convert to seconds
          setTimeRemaining(timeLimitMinutes * 60);
        }
      } catch (error) {
        // Show user-friendly error message
        toast({
          title: "Hata",
          description: `Soru yüklenirken hata oluştu: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
          variant: "destructive",
        });
        window.location.href = "/";
      }
    };

    if (subject && userSettings) {
      loadQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    subject,
    userSettings.studyPreferences.questionsPerQuiz,
    userSettings.studyPreferences.timeLimit,
  ]);

  // Timer for elapsed time
  useEffect(() => {
    if (startTime) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [startTime]);

  // Helper function to calculate weak topics
  const getWeakTopics = useCallback(() => {
    const weakTopics: Record<string, number> = {};

    // Track actual wrong answers from user answers
    userAnswers.forEach((answer) => {
      if (!answer.isCorrect) {
        weakTopics[answer.topic] = (weakTopics[answer.topic] || 0) + 1;
      }
    });

    // Also include current question if answered incorrectly
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && selectedAnswer !== null) {
      const isCorrect =
        currentQuestion.options[selectedAnswer]?.isCorrect ?? false;
      if (!isCorrect) {
        weakTopics[currentQuestion.topic] =
          (weakTopics[currentQuestion.topic] || 0) + 1;
      }
    }

    return weakTopics;
  }, [userAnswers, questions, currentQuestionIndex, selectedAnswer]);

  // Function to handle quiz completion
  const handleFinish = useCallback(async () => {
    const endTime = new Date();
    const totalTime = startTime
      ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      : 0;

    // Get weak topics
    const weakTopics = getWeakTopics();

    setIsSaving(true);

    try {
      // SAVE TO LOCALSTORAGE

      // Save quiz result to localStorage
      const saveQuizResult = () => {
        if (typeof window === "undefined") {
          return;
        }

        try {
          // Use different localStorage keys for demo and real results
          const storageKey = isDemoMode
            ? "exam_training_demo_quiz_results"
            : "exam_training_quiz_results";
          const existingResults = localStorage.getItem(storageKey);
          const results = existingResults ? JSON.parse(existingResults) : [];

          const newResult = {
            id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            subject,
            score,
            totalQuestions,
            timeSpent: totalTime,
            weakTopics,
            createdAt: new Date().toISOString(),
            completedAt: endTime.toISOString(),
            isDemo: isDemoMode, // Add demo flag for identification
          };

          results.push(newResult);
          localStorage.setItem(storageKey, JSON.stringify(results));
        } catch {
          //do nothing
        }
      };

      saveQuizResult();

      setFinalResult({
        // Set the final result on success
        score,
        totalQuestions,
        timeSpent: totalTime,
        weakTopics,
      });
      setQuizFinished(true); // Show the result screen
    } catch {
      // Even if saving fails, show the result screen to the user
      setFinalResult({
        score,
        totalQuestions,
        timeSpent: totalTime,
        weakTopics,
      });
      setQuizFinished(true);
    } finally {
      setIsSaving(false);
    }
  }, [
    startTime,
    getWeakTopics,
    userId,
    subject,
    score,
    totalQuestions,
    isDemoMode,
    setFinalResult,
    setQuizFinished,
    setIsSaving,
  ]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    if (!showResult) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = useCallback(() => {
    if (selectedAnswer !== null && currentQuestion) {
      const isCorrect =
        currentQuestion.options[selectedAnswer]?.isCorrect ?? false;
      if (isCorrect) {
        setScore(score + 1);
      }

      // Save user answer
      setUserAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          topic: currentQuestion.topic,
          isCorrect,
        },
      ]);

      setShowResult(true);

      // Otomatik olarak açıklamayı oku (2 saniye sonra)
      setTimeout(() => {
        if (currentQuestion.explanation) {
          // Voice assistant'a açıklama okuma sinyali gönder
          const event = new CustomEvent('readExplanation', {
            detail: { explanation: currentQuestion.explanation },
          });
          window.dispatchEvent(event);
        }
      }, 2000);
    }
  }, [selectedAnswer, currentQuestion, score]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setAiTutorHelp(null);
    }
  }, [currentQuestionIndex, questions.length]);

  // AutoSubmit fonksiyonu ekleyin
  const handleAutoSubmit = useCallback(() => {
    if (!showResult && currentQuestion) {
      // Eğer henüz cevap verilmemişse, random bir cevap seç
      if (selectedAnswer === null) {
        const randomAnswer = Math.floor(Math.random() * currentQuestion.options.length);
        setSelectedAnswer(randomAnswer);

        // State update'in tamamlanması için timeout kullan
        setTimeout(() => {
          const isCorrect = currentQuestion.options[randomAnswer]?.isCorrect ?? false;
          if (isCorrect) {
            setScore(prev => prev + 1);
          }

          setUserAnswers((prev) => [
            ...prev,
            {
              questionId: currentQuestion.id,
              topic: currentQuestion.topic,
              isCorrect,
            },
          ]);

          setShowResult(true);
        }, 100);
      } else {
        // Cevap seçilmişse direkt submit et
        handleSubmit();
      }
    } else if (showResult) {
      // Sonuç gösteriliyorsa bir sonraki soruya geç veya bitir
      if (currentQuestionIndex < questions.length - 1) {
        handleNext();
      } else {
        handleFinish();
      }
    } else {
      // Diğer durumlarda quiz'i bitir
      handleFinish();
    }
  }, [
    showResult,
    currentQuestion,
    selectedAnswer,
    handleSubmit,
    currentQuestionIndex,
    questions.length,
    handleNext,
    handleFinish,
  ]);

  // Timer for countdown (time limit)
  useEffect(() => {
    if (
      timeLimit &&
      timeRemaining !== null &&
      timeRemaining > 0 &&
      !quizFinished
    ) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            // AutoSubmit aktifse otomatik submit yap
            if (userSettings.studyPreferences.autoSubmit) {
              // Timer callback'i async olamayacağı için setTimeout kullan
              setTimeout(() => {
                handleAutoSubmit();
              }, 10);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [
    timeLimit,
    timeRemaining,
    quizFinished,
    userSettings.studyPreferences.autoSubmit,
    handleAutoSubmit, // Bu önemli!
  ]);

  const handleRetake = () => {
    // Mevcut soruları sakla
    const currentQuestions = [...questions];

    // Reset all quiz-related state
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTotalQuestions(0);
    setTimeSpent(0);
    setStartTime(null);
    setAiTutorHelp(null);
    setIsSaving(false);
    setQuizFinished(false);
    setUserAnswers([]);
    setFinalResult({
      score: 0,
      totalQuestions: 0,
      timeSpent: 0,
      weakTopics: {},
    });
    setTimeRemaining(null);
    setTimeLimit(null);

    // Soruları geri yükle
    setTimeout(() => {
      setQuestions(currentQuestions);
      setTotalQuestions(currentQuestions.length);
      setStartTime(new Date());

      // Set time limit if configured
      if (userSettings.studyPreferences.timeLimit > 0) {
        const timeLimitMinutes = userSettings.studyPreferences.timeLimit;
        setTimeLimit(timeLimitMinutes * 60); // Convert to seconds
        setTimeRemaining(timeLimitMinutes * 60);
      }
    }, 0);
  };

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case "next":
        if (currentQuestionIndex < questions.length - 1) {
          handleNext();
        }
        break;
      case "previous":
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
          setSelectedAnswer(null);
          setShowResult(false);
        }
        break;
      case "shuffle":
        // Shuffle questions
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        break;
      case "hint":
        // Request AI Tutor hint
        void requestAiTutorHelp("hint");
        break;
      case "explanation":
        // Request AI Tutor explanation
        void requestAiTutorHelp("explanation");
        break;
      case "step-by-step":
        // Request AI Tutor step-by-step
        void requestAiTutorHelp("step-by-step");
        break;
      case "concept-review":
        // Request AI Tutor concept review
        void requestAiTutorHelp("concept-review");
        break;
      default:
    }
  };

  // Convert difficulty from English to Turkish for AI Tutor
  const convertDifficulty = (difficulty: string): "Kolay" | "Orta" | "Zor" => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "Kolay";
      case "medium":
        return "Orta";
      case "hard":
        return "Zor";
      default:
        return "Orta"; // Default fallback
    }
  };

  const requestAiTutorHelp = async (
    step: "hint" | "explanation" | "step-by-step" | "concept-review",
  ) => {
    if (!currentQuestion) {
      return;
    }

    setIsLoadingTutor(true);
    setTutorStep(step);

    try {
      const result = await getAiTutorHelp({
        question: currentQuestion.text,
        subject: currentQuestion.subject,
        topic: currentQuestion.topic,
        difficulty: convertDifficulty(currentQuestion.difficulty),
        options: currentQuestion.options,
        correctAnswer:
          currentQuestion.options.find((opt) => opt.isCorrect)?.text || "",
        explanation: currentQuestion.explanation,
        userAnswer:
          selectedAnswer !== null
            ? currentQuestion.options[selectedAnswer]?.text
            : undefined,
        step,
      });

      setAiTutorHelp(result);
    } catch {
      // Show user-friendly error message
      setAiTutorHelp({
        help: "Şu anda AI asistanına erişilemiyor. Lütfen daha sonra tekrar deneyin.",
        confidence: 0,
      });
    } finally {
      setIsLoadingTutor(false);
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="flex flex-col min-h-screen">
        <MobileNav />
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  // Show result screen when quiz is finished
  if (quizFinished) {
    return (
      <div className="min-h-screen bg-background">
        <MobileNav />
        <QuizResult
          score={finalResult.score}
          totalQuestions={finalResult.totalQuestions}
          timeSpent={finalResult.timeSpent}
          weakTopics={finalResult.weakTopics}
          onRetake={handleRetake}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Navigation Bar */}
      <MobileNav />

      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/quiz">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
              >
                <ArrowLeft className="w-4 h-4" />
                Test Sayfasına Dön
              </Button>
            </Link>
            <h1 className="text-3xl font-headline font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {subject} Quiz
            </h1>
          </div>
          <div className="flex items-center justify-between text-base font-medium">
            <span className="text-gray-700 dark:text-gray-300">
              Soru {currentQuestionIndex + 1} / {totalQuestions}
            </span>
            <div className="flex items-center gap-4">
              {userSettings.studyPreferences.showTimer && (
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(timeSpent)}
                </span>
              )}
              {timeLimit && timeRemaining !== null && (
                <span
                  className={`px-3 py-1 rounded-full flex items-center gap-1 ${
                    timeRemaining <= 60
                      ? "bg-red-500 text-white"
                      : timeRemaining <= 300
                        ? "bg-yellow-500 text-white"
                        : "bg-green-500 text-white"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Kalan: {formatTime(timeRemaining)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Time Warning */}
        {timeLimit &&
          timeRemaining !== null &&
          timeRemaining <= 60 &&
          timeRemaining > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg"
            >
              <p className="text-red-800 dark:text-red-200 font-semibold text-center">
                ⚠️ Dikkat! Sadece {timeRemaining} saniye kaldı!
              </p>
            </motion.div>
          )}

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-lg p-6 mb-8 shadow-lg"
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium border-0">
                  {currentQuestion.topic}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${
                    currentQuestion.difficulty === "Kolay" ||
                    currentQuestion.difficulty === "Easy"
                      ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                      : currentQuestion.difficulty === "Orta" ||
                          currentQuestion.difficulty === "Medium"
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                        : "bg-gradient-to-r from-red-400 to-pink-500 text-white"
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>

              <h2 className="text-xl font-semibold mb-4">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswer === index
                      ? showResult
                        ? option.isCorrect
                          ? "border-gradient-question bg-blue-50 dark:bg-blue-950"
                          : "border-gradient-question bg-red-50 dark:bg-red-950"
                        : "border-gradient-question bg-primary/5"
                      : "border-border hover:border-gradient-question"
                  } ${showResult && option.isCorrect ? "border-gradient-question bg-blue-50 dark:bg-blue-950" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === index
                          ? showResult
                            ? option.isCorrect
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-red-500 bg-red-500 text-white"
                            : "border-primary bg-primary text-white"
                          : "border-border"
                      }`}
                    >
                      {selectedAnswer === index && (
                        <span className="text-xs">✓</span>
                      )}
                    </div>
                    <span className="font-medium">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Explanation */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border-gradient-question bg-white dark:bg-gray-800 rounded-lg p-4 mb-6"
              >
                <h3 className="font-semibold mb-2">Açıklama:</h3>
                <p className="text-muted-foreground">
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}

            {/* AI Tutor Help */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">AI Tutor Yardımı:</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {!showResult ? (
                  // Cevaplanmadan önce sadece İpucu butonu
                  <button
                    onClick={() => {
                      void requestAiTutorHelp("hint");
                    }}
                    disabled={isLoadingTutor}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    💡 İpucu
                  </button>
                ) : (
                  // Cevaplandıktan sonra tüm butonlar
                  (
                    [
                      "hint",
                      "explanation",
                      "step-by-step",
                      "concept-review",
                    ] as const
                  ).map((step) => (
                    <button
                      key={step}
                      onClick={() => {
                        void requestAiTutorHelp(step);
                      }}
                      disabled={isLoadingTutor}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                    >
                      {step === "hint" && "💡 İpucu"}
                      {step === "explanation" && "📚 Açıklama"}
                      {step === "step-by-step" && "🔍 Adım Adım"}
                      {step === "concept-review" && "🎯 Konu Tekrarı"}
                    </button>
                  ))
                )}
              </div>

              {isLoadingTutor && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    AI yardımı hazırlanıyor...
                  </p>
                </div>
              )}

              {aiTutorHelp && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-gradient-question bg-white dark:bg-gray-800 rounded-lg p-4"
                >
                  <h4 className="font-semibold mb-2">
                    {tutorStep === "hint" && "💡 İpucu"}
                    {tutorStep === "explanation" && "📚 Açıklama"}
                    {tutorStep === "step-by-step" && "🔍 Adım Adım"}
                    {tutorStep === "concept-review" && "🎯 Konu Tekrarı"}
                  </h4>
                  <div className="ai-tutor-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiTutorHelp.help}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!showResult ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cevabı Gönder
                </button>
              ) : currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Sonraki Soru
                </button>
              ) : (
                <button
                  onClick={() => {
                    void handleFinish();
                  }}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? "Kaydediliyor..." : "Testi Bitir"}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Score Display */}
        <div className="text-center">
          <p className="text-lg font-semibold">
            Puan: {score} / {totalQuestions}
          </p>
          <p className="text-muted-foreground">
            Başarı Oranı:{" "}
            {totalQuestions > 0
              ? Math.round((score / totalQuestions) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant
        onCommand={handleVoiceCommand}
        currentQuestion={currentQuestion.text}
        currentOptions={currentQuestion.options}
        currentAnswer={
          currentQuestion.options.find((opt) => opt.isCorrect)?.text || ""
        }
        currentExplanation={currentQuestion.explanation}
        aiTutorOutput={aiTutorHelp?.help || ""}
        isListening={isListening}
        onListeningChange={setIsListening}
        showExplanation={showResult}
        mode="quiz"
      />
    </div>
  );
};

export default QuizComponent;
