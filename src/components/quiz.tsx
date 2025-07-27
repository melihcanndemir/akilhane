'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAiTutorHelp, type AiTutorOutput } from '../ai/flows/ai-tutor';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import VoiceAssistant from './voice-assistant';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MobileNav from './mobile-nav';
import { QuizResult } from './quiz-result';
import LoadingSpinner from './loading-spinner';

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

const QuizComponent: React.FC<QuizProps> = ({ subject, isDemoMode = false }) => {
  // Save demo mode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isDemoMode) {
      localStorage.setItem('btk_demo_mode', 'true');
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
  const [tutorStep, setTutorStep] = useState<'hint' | 'explanation' | 'step-by-step' | 'concept-review'>('hint');
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false); // New state
  const [finalResult, setFinalResult] = useState({ // New state for result data
    score: 0,
    totalQuestions: 0,
    timeSpent: 0,
    weakTopics: {}
  });

  // Generate a unique user ID for this session
  const userId = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) return storedUserId;
      
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', newUserId);
      return newUserId;
    }
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('Loading questions for subject:', subject);
        
        // Check demo mode
        const demoModeActive = isDemoMode || 
                          (typeof window !== 'undefined' && localStorage.getItem('btk_demo_mode') === 'true');
        
        console.log('🎮 Quiz Component - Demo mode:', demoModeActive);
        
        if (demoModeActive) {
          // Demo questions
          const demoQuestions: Question[] = [
            {
              id: 'demo_q_1',
              subject: 'Matematik',
              type: 'multiple-choice',
              difficulty: 'Medium',
              text: '2x + 5 = 13 denkleminin çözümü nedir?',
              topic: 'Cebir',
              options: [
                { text: 'x = 4', isCorrect: true },
                { text: 'x = 3', isCorrect: false },
                { text: 'x = 5', isCorrect: false },
                { text: 'x = 6', isCorrect: false }
              ],
              explanation: '2x + 5 = 13 → 2x = 8 → x = 4'
            },
            {
              id: 'demo_q_2',
              subject: 'Matematik',
              type: 'multiple-choice',
              difficulty: 'Medium',
              text: 'Bir üçgenin iç açıları toplamı kaç derecedir?',
              topic: 'Geometri',
              options: [
                { text: '90°', isCorrect: false },
                { text: '180°', isCorrect: true },
                { text: '270°', isCorrect: false },
                { text: '360°', isCorrect: false }
              ],
              explanation: 'Bir üçgenin iç açıları toplamı her zaman 180 derecedir.'
            },
            {
              id: 'demo_q_3',
              subject: 'Matematik',
              type: 'multiple-choice',
              difficulty: 'Hard',
              text: 'x² - 4x + 4 = 0 denkleminin çözümü nedir?',
              topic: 'Cebir',
              options: [
                { text: 'x = 2', isCorrect: true },
                { text: 'x = -2', isCorrect: false },
                { text: 'x = 4', isCorrect: false },
                { text: 'x = -4', isCorrect: false }
              ],
              explanation: 'x² - 4x + 4 = (x-2)² = 0 → x = 2'
            }
          ];
          
          setQuestions(demoQuestions);
          setTotalQuestions(demoQuestions.length);
          setStartTime(new Date());
          return;
        }

        // USE DIRECT LOCALSTORAGE
        console.log('🎮 Quiz Component - Loading from localStorage...');
        
        // LocalStorage service for questions
        const getQuestionsFromStorage = (): Question[] => {
          if (typeof window === 'undefined') return [];
          try {
            const stored = localStorage.getItem('exam_training_questions');
            const questions = stored ? JSON.parse(stored) : [];
            return questions.filter((q: any) => q.subject === subject);
          } catch {
            return [];
          }
        };

        const localQuestions = getQuestionsFromStorage();
        
        if (localQuestions.length === 0) {
          throw new Error('Bu ders için henüz soru bulunmuyor');
        }

        // Get up to 10 questions
        const quizQuestions = localQuestions.slice(0, 10);
        
        setQuestions(quizQuestions);
        setTotalQuestions(quizQuestions.length);
        setStartTime(new Date());
        
      } catch (error) {
        console.error('Error loading questions:', error);
        // Show user-friendly error message
        alert(`Soru yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      }
    };

    if (subject) {
      loadQuestions();
    }
  }, [subject]);

  // Timer
  useEffect(() => {
    if (startTime) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [startTime]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    if (!showResult) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      const isCorrect = currentQuestion?.options[selectedAnswer]?.isCorrect ?? false;
      if (isCorrect) {
        setScore(score + 1);
      }
      setShowResult(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setAiTutorHelp(null);
    }
  };

  const handleFinish = async () => {
    const endTime = new Date();
    const totalTime = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;
    
    // Get weak topics
    const weakTopics = getWeakTopics();
    
    setIsSaving(true);
    
    try {
      // SAVE TO LOCALSTORAGE
      console.log('🎮 Quiz Component - Saving result to localStorage...');
      
      // Save quiz result to localStorage
      const saveQuizResult = () => {
        if (typeof window === 'undefined') return;
        
        try {
          const existingResults = localStorage.getItem('exam_training_quiz_results');
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
            completedAt: endTime.toISOString()
          };
          
          results.push(newResult);
          localStorage.setItem('exam_training_quiz_results', JSON.stringify(results));
          
          console.log('✅ Quiz result saved to localStorage:', newResult);
        } catch (error) {
          console.error('❌ Error saving to localStorage:', error);
        }
      };
      
      saveQuizResult();
      
      setFinalResult({ // Set the final result on success
        score,
        totalQuestions,
        timeSpent: totalTime,
        weakTopics,
      });
      setQuizFinished(true); // Show the result screen
    } catch (error) {
      console.error('❌ Error saving quiz result:', error);
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
  };

  const handleRetake = () => {
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
    setFinalResult({ score: 0, totalQuestions: 0, timeSpent: 0, weakTopics: {} });

    // Reload questions from localStorage
    const loadQuestions = async () => {
      try {
        console.log('🎮 Quiz Component - Reloading questions from localStorage...');
        
        // Check demo mode
        const demoModeActive = isDemoMode || 
                          (typeof window !== 'undefined' && localStorage.getItem('btk_demo_mode') === 'true');
        
        if (demoModeActive) {
          // Demo questions
          const demoQuestions: Question[] = [
            {
              id: 'demo_q_1',
              subject: 'Matematik',
              type: 'multiple-choice',
              difficulty: 'Medium',
              text: '2x + 5 = 13 denkleminin çözümü nedir?',
              topic: 'Cebir',
              options: [
                { text: 'x = 4', isCorrect: true },
                { text: 'x = 3', isCorrect: false },
                { text: 'x = 5', isCorrect: false },
                { text: 'x = 6', isCorrect: false }
              ],
              explanation: '2x + 5 = 13 → 2x = 8 → x = 4'
            },
            {
              id: 'demo_q_2',
              subject: 'Matematik',
              type: 'multiple-choice',
              difficulty: 'Medium',
              text: 'Bir üçgenin iç açıları toplamı kaç derecedir?',
              topic: 'Geometri',
              options: [
                { text: '90°', isCorrect: false },
                { text: '180°', isCorrect: true },
                { text: '270°', isCorrect: false },
                { text: '360°', isCorrect: false }
              ],
              explanation: 'Bir üçgenin iç açıları toplamı her zaman 180 derecedir.'
            },
            {
              id: 'demo_q_3',
              subject: 'Matematik',
              type: 'multiple-choice',
              difficulty: 'Hard',
              text: 'x² - 4x + 4 = 0 denkleminin çözümü nedir?',
              topic: 'Cebir',
              options: [
                { text: 'x = 2', isCorrect: true },
                { text: 'x = -2', isCorrect: false },
                { text: 'x = 4', isCorrect: false },
                { text: 'x = -4', isCorrect: false }
              ],
              explanation: 'x² - 4x + 4 = (x-2)² = 0 → x = 2'
            }
          ];
          
          setQuestions(demoQuestions);
          setTotalQuestions(demoQuestions.length);
          setStartTime(new Date());
          return;
        }

        // Get questions from LocalStorage
        const getQuestionsFromStorage = (): Question[] => {
          if (typeof window === 'undefined') return [];
          try {
            const stored = localStorage.getItem('exam_training_questions');
            const questions = stored ? JSON.parse(stored) : [];
            return questions.filter((q: any) => q.subject === subject);
          } catch {
            return [];
          }
        };

        const localQuestions = getQuestionsFromStorage();
        
        if (localQuestions.length === 0) {
          throw new Error('Bu ders için henüz soru bulunmuyor');
        }

        // Get up to 10 questions and shuffle
        const shuffledQuestions = localQuestions
          .slice(0, 10)
          .sort(() => Math.random() - 0.5);
        
        setQuestions(shuffledQuestions);
        setTotalQuestions(shuffledQuestions.length);
        setStartTime(new Date());
        
      } catch (error) {
        alert(`Sorular yeniden yüklenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      }
    };
    loadQuestions();
  };

  const getWeakTopics = () => {
    const weakTopics: Record<string, number> = {};
    
    // This is a simplified version - in a real app, you'd track wrong answers per question
    if (currentQuestion && selectedAnswer !== null) {
      const isCorrect = currentQuestion.options[selectedAnswer]?.isCorrect ?? false;
      if (!isCorrect) {
        weakTopics[currentQuestion.topic] = (weakTopics[currentQuestion.topic] || 0) + 1;
      }
    }
    
    return weakTopics;
  };

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    console.log('🎤 Voice command received:', command);
    
    switch (command) {
      case 'next':
        if (currentQuestionIndex < questions.length - 1) {
          handleNext();
        }
        break;
      case 'previous':
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
          setSelectedAnswer(null);
          setShowResult(false);
        }
        break;
      case 'shuffle':
        // Shuffle questions
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        break;
      default:
        console.log('Unknown voice command:', command);
    }
  };

  // Convert difficulty from English to Turkish for AI Tutor
  const convertDifficulty = (difficulty: string): 'Kolay' | 'Orta' | 'Zor' => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'Kolay';
      case 'medium':
        return 'Orta';
      case 'hard':
        return 'Zor';
      default:
        return 'Orta'; // Default fallback
    }
  };

  const requestAiTutorHelp = async (step: 'hint' | 'explanation' | 'step-by-step' | 'concept-review') => {
    if (!currentQuestion) return;
    
    setIsLoadingTutor(true);
    setTutorStep(step);
    
    try {
      const result = await getAiTutorHelp({
        question: currentQuestion.text,
        subject: currentQuestion.subject,
        topic: currentQuestion.topic,
        difficulty: convertDifficulty(currentQuestion.difficulty),
        options: currentQuestion.options,
        correctAnswer: currentQuestion.options.find(opt => opt.isCorrect)?.text || '',
        explanation: currentQuestion.explanation,
        userAnswer: selectedAnswer !== null ? currentQuestion.options[selectedAnswer]?.text : undefined,
        step,
      });
      
      setAiTutorHelp(result);
    } catch (error) {
      console.error('Error getting AI tutor help:', error);
      // Show user-friendly error message
      setAiTutorHelp({
        help: 'Şu anda AI asistanına erişilemiyor. Lütfen daha sonra tekrar deneyin.',
        confidence: 0
      });
    } finally {
      setIsLoadingTutor(false);
    }
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
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Ana Sayfaya Dön
              </Button>
            </Link>
            <h1 className="text-3xl font-headline font-bold text-primary">
              {subject} Quiz
            </h1>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Soru {currentQuestionIndex + 1} / {totalQuestions}</span>
            <span>⏱️ {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

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
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {currentQuestion.topic}
                </span>
                <span className="bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full text-sm">
                  {currentQuestion.difficulty}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold mb-4">{currentQuestion.text}</h2>
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
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-red-500 bg-red-50 dark:bg-red-950'
                        : 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${showResult && option.isCorrect ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index
                        ? showResult
                          ? option.isCorrect
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-red-500 bg-red-500 text-white'
                          : 'border-primary bg-primary text-white'
                        : 'border-border'
                    }`}>
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
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-muted/50 rounded-lg p-4 mb-6"
              >
                <h3 className="font-semibold mb-2">Açıklama:</h3>
                <p className="text-muted-foreground">{currentQuestion.explanation}</p>
              </motion.div>
            )}

            {/* AI Tutor Help */}
            {showResult && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">AI Tutor Yardımı:</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(['hint', 'explanation', 'step-by-step', 'concept-review'] as const).map((step) => (
                    <button
                      key={step}
                      onClick={() => requestAiTutorHelp(step)}
                      disabled={isLoadingTutor}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
                    >
                      {step === 'hint' && '💡 İpucu'}
                      {step === 'explanation' && '📚 Açıklama'}
                      {step === 'step-by-step' && '🔍 Adım Adım'}
                      {step === 'concept-review' && '🎯 Konu Tekrarı'}
                    </button>
                  ))}
                </div>
                
                {isLoadingTutor && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">AI yardımı hazırlanıyor...</p>
                  </div>
                )}
                
                {aiTutorHelp && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border rounded-lg p-4"
                  >
                    <h4 className="font-semibold mb-2">
                      {tutorStep === 'hint' && '💡 İpucu'}
                      {tutorStep === 'explanation' && '📚 Açıklama'}
                      {tutorStep === 'step-by-step' && '🔍 Adım Adım'}
                      {tutorStep === 'concept-review' && '🎯 Konu Tekrarı'}
                    </h4>
                    <div className="ai-tutor-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiTutorHelp.help}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!showResult ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cevabı Gönder
                </button>
              ) : currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Sonraki Soru
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Kaydediliyor...' : 'Testi Bitir'}
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
            Başarı Oranı: {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant
        onCommand={handleVoiceCommand}
        currentQuestion={currentQuestion.text}
        currentAnswer={currentQuestion.options.find(opt => opt.isCorrect)?.text || ''}
        aiTutorOutput={aiTutorHelp?.help || ''}
        isListening={isListening}
        onListeningChange={setIsListening}
      />
    </div>
  );
};

export default QuizComponent;