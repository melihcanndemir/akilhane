"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Lightbulb,
  Target,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Trash2,
  Volume,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { TopicExplainerInput } from "@/ai/flows/topic-explainer-ai";
import { generateTopicStepContent } from "@/ai/flows/topic-explainer-ai";
import HuggingFaceImageGenerator from "@/components/huggingface-image-generator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import TopicExplainerLocalStorageService from "@/services/topic-explainer-service";
import VoicePlayer from "@/components/voice-player";
import BreakoutLoadingGame from "@/components/breakout-loading-game";

interface TopicData {
  topic: string;
  subject: string;
  steps: Array<{
    id: string;
    title: string;
    content: string;
    examples: string[];
    tips: string[];
    difficulty: "easy" | "medium" | "hard";
    estimatedTime: number;
    visualDescription?: string;
    confidence?: number;
  }>;
  totalTime: number;
  difficulty: "easy" | "medium" | "hard";
  prerequisites: string[];
  learningObjectives: string[];
}

interface TopicExplainerProps {
  topic: string;
  subject: string;
  isDemoMode?: boolean;
  hasSavedContent?: boolean;
  savedTopicId?: string | null;
}

const TopicExplainer: React.FC<TopicExplainerProps> = ({
  topic,
  subject,
  hasSavedContent = false,
  savedTopicId = null,
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showVisuals, setShowVisuals] = useState(true);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    () => new Set(),
  );
  const [userNotes, setUserNotes] = useState<string>("");
  const [notesKey, setNotesKey] = useState<string>("");
  const [showTips, setShowTips] = useState(true);
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load topic data - first check localStorage, then generate if needed
  useEffect(() => {
    const loadTopicData = async () => {
      try {
        setIsLoading(true);

        // First check if we have saved content
        if (hasSavedContent && savedTopicId) {
          const savedTopic = TopicExplainerLocalStorageService.getTopicById(savedTopicId);
          if (savedTopic) {
                        const parsedData = JSON.parse(savedTopic.content);
            setTopicData(parsedData);
            setNotesKey(savedTopicId);

            // Load saved notes
            const savedNotes = localStorage.getItem(`akilhane_notes_${savedTopicId}`);
            if (savedNotes) {
              setUserNotes(savedNotes);
            }

            toast({
              title: "Kaydedilen İçerik Yüklendi",
              description: `${topic} konusu için kaydedilen içerik kullanılıyor.`,
            });
            return;
          }
        }

        // If no saved content, generate with AI
        setAiGenerating(true);
        const aiGeneratedData = await generateAITopicData(topic, subject);
        setTopicData(aiGeneratedData);

        // Auto-save the generated content
        const content = JSON.stringify(aiGeneratedData);
        const savedTopic = TopicExplainerLocalStorageService.saveTopic(
          topic,
          subject,
          content,
          aiGeneratedData.steps,
        );
        setNotesKey(savedTopic.id);

        toast({
          title: "AI İçerik Hazır",
          description: `${topic} konusu için AI destekli içerik başarıyla oluşturuldu ve kaydedildi.`,
        });
      } catch {
        toast({
          title: "AI Hatası",
          description:
            "AI içerik üretilirken bir hata oluştu. Fallback içerik kullanılıyor.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setAiGenerating(false);
      }
    };

    loadTopicData();
  }, [topic, subject, hasSavedContent, savedTopicId, toast]);

  // Auto-save notes when userNotes changes
  useEffect(() => {
    if (notesKey) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(`akilhane_notes_${notesKey}`, userNotes);
      }, 500); // Debounce 500ms

      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [userNotes, notesKey]);

  // Real AI-powered topic data generation
  const generateAITopicData = async (
    topicName: string,
    subjectName: string,
  ): Promise<TopicData> => {
    const stepConfigs = [
      { id: "intro", difficulty: "easy" as const, estimatedTime: 8 },
      { id: "core", difficulty: "medium" as const, estimatedTime: 12 },
      { id: "advanced", difficulty: "hard" as const, estimatedTime: 15 },
      { id: "practice", difficulty: "medium" as const, estimatedTime: 18 },
      { id: "mastery", difficulty: "hard" as const, estimatedTime: 20 },
    ];

    const steps = [];

    // Generate each step using real AI
    for (const config of stepConfigs) {
      try {
        const aiInput: TopicExplainerInput = {
          topic: topicName,
          subject: subjectName,
          step: config.id as
            | "intro"
            | "core"
            | "advanced"
            | "practice"
            | "mastery",
          difficulty: config.difficulty,
          estimatedTime: config.estimatedTime,
        };

        const aiOutput = await generateTopicStepContent(aiInput);

        steps.push({
          id: config.id,
          title: aiOutput.title,
          content: aiOutput.content,
          examples: aiOutput.examples,
          tips: aiOutput.tips,
          difficulty: config.difficulty,
          estimatedTime: config.estimatedTime,
          visualDescription: aiOutput.visualDescription,
          confidence: aiOutput.confidence,
        });
      } catch {
        // Fallback content for this step
        steps.push({
          id: config.id,
          title: `${topicName} ${
            config.id === "intro"
              ? "Giriş"
              : config.id === "core"
                ? "Ana Kavramlar"
                : config.id === "advanced"
                  ? "İleri Seviye"
                  : config.id === "practice"
                    ? "Pratik Uygulamalar"
                    : "Uzmanlık Seviyesi"
          }`,
          content: `${topicName} konusunun ${config.id} aşamasında öğrenilmesi gereken temel kavramlar ve uygulamalar.`,
          examples: [
            `${topicName} konusunun günlük hayattaki uygulamaları`,
            `${topicName} ile ilgili temel kavramlar`,
            `${topicName} konusunun diğer konularla ilişkisi`,
          ],
          tips: [
            `${topicName} konusunu adım adım öğrenin`,
            "Her kavramı tam anlamadan geçmeyin",
            "Bol bol pratik yapın",
          ],
          difficulty: config.difficulty,
          estimatedTime: config.estimatedTime,
          visualDescription: `${topicName} konusu için görsel yardımcı`,
          confidence: 0.3,
        });
      }
    }

    return {
      topic: topicName,
      subject: subjectName,
      steps,
      totalTime: steps.reduce((sum, step) => sum + step.estimatedTime, 0),
      difficulty: "medium" as const,
      prerequisites: [
        `${subjectName} temel bilgileri`,
        "Aktif öğrenme becerisi",
      ],
      learningObjectives: [
        `${topicName} konusunun temel kavramlarını anlamak`,
        `${topicName} konusunu günlük hayatta uygulayabilmek`,
        `${topicName} konusu ile ilgili problem çözme becerilerini geliştirmek`,
        `${topicName} konusunu diğer konularla ilişkilendirebilmek`,
      ],
    };
  };

  const steps = topicData?.steps || [];

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && currentStep < (steps?.length || 0) - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < (steps?.length || 0) - 1) {
            const newStep = prev + 1;
            setProgress(((newStep + 1) / (steps?.length || 1)) * 100);
            return newStep;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 10000); // 10 seconds per step
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length]);

  // Update progress
  useEffect(() => {
    setProgress(((currentStep + 1) / steps.length) * 100);
  }, [currentStep, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCompletedSteps(
        (prev: Set<string>) => new Set([...prev, steps[currentStep]?.id || ""]),
      );
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setCompletedSteps(() => new Set());
    setProgress(0);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Ses Açıldı" : "Ses Kapatıldı",
      description: isMuted
        ? "Ses efektleri tekrar aktif"
        : "Ses efektleri kapatıldı",
    });
  };

  const toggleVisuals = () => {
    setShowVisuals(!showVisuals);
    toast({
      title: showVisuals ? "Görseller Kapatıldı" : "Görseller Açıldı",
      description: showVisuals
        ? "Görsel yardımcılar gizlendi"
        : "Görsel yardımcılar gösteriliyor",
    });
  };

  // Save current topic content
  const handleSaveTopic = async () => {
    if (!topicData) {return;}

    try {
      setIsSaving(true);

      const content = JSON.stringify(topicData);
      TopicExplainerLocalStorageService.saveTopic(
        topic,
        subject,
        content,
        topicData.steps,
      );

      toast({
        title: "Başarılı!",
        description: `${topic} konusu başarıyla kaydedildi.`,
      });
    } catch {
      toast({
        title: "Hata!",
        description: "Konu kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete saved topic
  const handleDeleteTopic = async () => {
    if (!savedTopicId) {return;}

    try {
      setIsDeleting(true);

      const success = TopicExplainerLocalStorageService.deleteTopic(savedTopicId);

      if (success) {
        toast({
          title: "Başarılı!",
          description: "Konu başarıyla silindi.",
        });

        // Redirect back to topic list
        window.location.href = "/topic-explainer";
      } else {
        throw new Error("Failed to delete topic");
      }
    } catch {
      toast({
        title: "Hata!",
        description: "Konu silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <BreakoutLoadingGame
            isLoading={true}
            loadingText={aiGenerating ? "AI içerik üretiliyor..." : "Konu verileri yükleniyor..."}
            onGameComplete={() => {
              if (!isLoading && !aiGenerating) {
                // Game completed, but we're still loading
                // This is just for fun during loading
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Error state
  if (!topicData || steps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Konu Bulunamadı
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            &quot;{topic}&quot; konusu için veri bulunamadı.
          </p>
          <Link href="/topic-explainer">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              Konulara Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep] || null;

  // Safety check for currentStepData
  if (!currentStepData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Adım Bulunamadı
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Seçilen adım bulunamadı.
          </p>
          <Button
            onClick={() => setCurrentStep(0)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            Baştan Başla
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard&apos;a Dön
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Konu Anlatımı - {topic}
            </h1>
            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              {subject}
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              🤖 AI Tutor
            </Badge>
            <Link href="/breakout-game">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:text-white hover:border-0"
              >
                🎮 Breakout Oyunu
              </Button>
            </Link>
            {currentStepData.confidence && (
              <Badge variant="outline" className="text-xs">
                AI Güven: %{Math.round(currentStepData.confidence * 100)}
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  void handleSaveTopic();
                }}
                disabled={isSaving || !topicData}
                size="sm"
                variant="outline"
                className="hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:text-white"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Kaydet
              </Button>
              {savedTopicId && (
                <Button
                  onClick={() => {
                    void handleDeleteTopic();
                  }}
                  disabled={isDeleting}
                  size="sm"
                  variant="outline"
                  className="hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:text-white"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Sil
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                İlerleme: {currentStep + 1} / {steps.length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(progress)}% tamamlandı
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Button
              onClick={togglePlayPause}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isPlaying ? "Duraklat" : "Otomatik Oynat"}</span>
            </Button>

            <Button
              onClick={toggleMute}
              variant="outline"
              size="sm"
              className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white"
              title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>

            <Button
              onClick={toggleVisuals}
              variant="outline"
              size="sm"
              className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white"
              title={showVisuals ? "Görselleri Gizle" : "Görselleri Göster"}
            >
              {showVisuals ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Görseller</span>
            </Button>

            <Button
              onClick={handleRestart}
              variant="outline"
              size="sm"
              className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white"
              title="Baştan Başla"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Baştan Başla</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-xl border-gradient-question">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                          {currentStepData.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={
                              currentStepData.difficulty === "easy"
                                ? "default"
                                : currentStepData.difficulty === "medium"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {currentStepData.difficulty === "easy"
                              ? "Kolay"
                              : currentStepData.difficulty === "medium"
                                ? "Orta"
                                : "Zor"}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ~{currentStepData.estimatedTime} dakika
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Voice Player */}
                    <div className="mb-6">
                      <VoicePlayer
                        text={currentStepData.content}
                        autoPlay={false}
                        speed={1}
                        language="tr-TR"
                        showControls={true}
                        className="mb-4"
                        onPlay={() => {
                          toast({
                            title: "Seslendirme Başladı",
                            description: `${currentStepData.title} adımı seslendiriliyor...`,
                          });
                        }}
                        onEnd={() => {
                          toast({
                            title: "Seslendirme Tamamlandı",
                            description: "Konu anlatımı tamamlandı.",
                          });
                        }}
                      />
                    </div>

                    {/* Main Content */}
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-4 text-gray-700 dark:text-gray-300">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-gray-700 dark:text-gray-300">
                                {children}
                              </li>
                            ),
                            code: ({ children, className }) => {
                              const isInline = !className;
                              if (isInline) {
                                return (
                                  <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                                    {children}
                                  </code>
                                );
                              }
                              return (
                                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                                  <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                                    {children}
                                  </code>
                                </pre>
                              );
                            },
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 mb-4">
                                {children}
                              </blockquote>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-gray-800 dark:text-white">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic text-gray-600 dark:text-gray-400">
                                {children}
                              </em>
                            ),
                          }}
                        >
                          {currentStepData.content}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* AI Image Generator */}
                    {showVisuals && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                      >
                        {/* Hugging Face AI Image Generator */}
                        <HuggingFaceImageGenerator
                          description={
                            currentStepData.visualDescription ||
                            `${topic} konusu için AI destekli görsel`
                          }
                          topic={topic}
                          subject={subject}
                          onImageGenerated={() => {
                            // do nothing
                          }}
                        />
                      </motion.div>
                    )}

                    {/* Examples */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Örnekler
                      </h3>
                      <div className="grid gap-3">
                        {currentStepData.examples.map((example, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeHighlight]}
                                  components={{
                                    h1: ({ children }) => (
                                      <h1 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
                                        {children}
                                      </h1>
                                    ),
                                    h2: ({ children }) => (
                                      <h2 className="text-base font-semibold mb-2 text-gray-800 dark:text-white">
                                        {children}
                                      </h2>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-sm font-semibold mb-1 text-gray-800 dark:text-white">
                                        {children}
                                      </h3>
                                    ),
                                    p: ({ children }) => (
                                      <p className="mb-2 text-gray-700 dark:text-gray-300">
                                        {children}
                                      </p>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc list-inside mb-2 space-y-1 text-gray-700 dark:text-gray-300">
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-700 dark:text-gray-300">
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children }) => (
                                      <li className="text-gray-700 dark:text-gray-300">
                                        {children}
                                      </li>
                                    ),
                                    code: ({ children, className }) => {
                                      const isInline = !className;
                                      if (isInline) {
                                        return (
                                          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                                            {children}
                                          </code>
                                        );
                                      }
                                      return (
                                        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto mb-2">
                                          <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                                            {children}
                                          </code>
                                        </pre>
                                      );
                                    },
                                    blockquote: ({ children }) => (
                                      <blockquote className="border-l-4 border-green-500 pl-3 italic text-gray-600 dark:text-gray-400 mb-2">
                                        {children}
                                      </blockquote>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-semibold text-gray-800 dark:text-white">
                                        {children}
                                      </strong>
                                    ),
                                    em: ({ children }) => (
                                      <em className="italic text-gray-600 dark:text-gray-400">
                                        {children}
                                      </em>
                                    ),
                                  }}
                                >
                                  {example}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    {showTips && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-700"
                      >
                        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 flex items-center gap-2 mb-4">
                          <Lightbulb className="w-5 h-5" />
                          AI Öğrenme İpuçları
                        </h3>
                        <div className="space-y-3">
                          {currentStepData.tips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeHighlight]}
                                  components={{
                                    h1: ({ children }) => (
                                      <h1 className="text-base font-bold mb-1 text-yellow-800 dark:text-yellow-300">
                                        {children}
                                      </h1>
                                    ),
                                    h2: ({ children }) => (
                                      <h2 className="text-sm font-semibold mb-1 text-yellow-800 dark:text-yellow-300">
                                        {children}
                                      </h2>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-xs font-semibold mb-1 text-yellow-800 dark:text-yellow-300">
                                        {children}
                                      </h3>
                                    ),
                                    p: ({ children }) => (
                                      <p className="mb-1 text-yellow-700 dark:text-yellow-300">
                                        {children}
                                      </p>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc list-inside mb-1 space-y-1 text-yellow-700 dark:text-yellow-300">
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-decimal list-inside mb-1 space-y-1 text-yellow-700 dark:text-yellow-300">
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children }) => (
                                      <li className="text-yellow-700 dark:text-yellow-300">
                                        {children}
                                      </li>
                                    ),
                                    code: ({ children, className }) => {
                                      const isInline = !className;
                                      if (isInline) {
                                        return (
                                          <code className="bg-yellow-100 dark:bg-yellow-900 px-1 py-0.5 rounded text-sm font-mono text-yellow-800 dark:text-yellow-300">
                                            {children}
                                          </code>
                                        );
                                      }
                                      return (
                                        <pre className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg overflow-x-auto mb-1">
                                          <code className="text-sm font-mono text-yellow-800 dark:text-yellow-300">
                                            {children}
                                          </code>
                                        </pre>
                                      );
                                    },
                                    blockquote: ({ children }) => (
                                      <blockquote className="border-l-4 border-yellow-500 pl-2 italic text-yellow-600 dark:text-yellow-400 mb-1">
                                        {children}
                                      </blockquote>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-semibold text-yellow-800 dark:text-yellow-300">
                                        {children}
                                      </strong>
                                    ),
                                    em: ({ children }) => (
                                      <em className="italic text-yellow-600 dark:text-yellow-400">
                                        {children}
                                      </em>
                                    ),
                                  }}
                                >
                                  {tip}
                                </ReactMarkdown>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
                className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Önceki
              </Button>

              <Button
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                Sonraki
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Steps Overview */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                  Konu Adımları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setCurrentStep(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        index === currentStep
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : completedSteps?.has(step.id)
                            ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === currentStep
                              ? "bg-white text-blue-600"
                              : completedSteps?.has(step.id)
                                ? "bg-green-500 text-white"
                                : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {completedSteps?.has(step.id) ? "✓" : index + 1}
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${
                              index === currentStep
                                ? "text-white"
                                : "text-gray-800 dark:text-white"
                            }`}
                          >
                            {step.title}
                          </h4>
                          <p
                            className={`text-xs ${
                              index === currentStep
                                ? "text-blue-100"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {step.estimatedTime} dakika
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                  Notlarım
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Bu konu hakkında notlarınızı buraya yazabilirsiniz..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Notlarınız otomatik olarak kaydedilir
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowTips(!showTips)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showTips ? "İpuçlarını Gizle" : "İpuçlarını Göster"}
                </Button>
                <Button
                  onClick={() => setShowVisuals(!showVisuals)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showVisuals ? "Görselleri Gizle" : "Görselleri Göster"}
                </Button>
                <Button
                  onClick={() => {
                    // Voice player will be controlled by the component itself
                    toast({
                      title: "Seslendirme",
                      description: "Seslendirme kontrolleri ana içerik alanında bulunmaktadır.",
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Volume className="w-4 h-4 mr-2" />
                  Seslendirme Kontrolleri
                </Button>
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Baştan Başla
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicExplainer;
