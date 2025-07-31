'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Mic,
  Brain,
  Users,
  BookOpen,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileNav from '@/components/mobile-nav';

interface DemoStep {
  id: number;
  title: string;
  description: string;
  action: string;
  icon: React.ReactNode;
  color: string;
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: 'AI Destekli Quiz',
    description: 'Kişiselleştirilmiş sorular ve anlık AI açıklamalar',
    action: "Quiz'i Dene",
    icon: <Brain className="h-6 w-6 text-white" />,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 2,
    title: 'Sesli Asistan',
    description: 'Türkçe sesli komutlarla etkileşim',
    action: "Sesli Asistan'ı Dene",
    icon: <Mic className="h-6 w-6 text-white" />,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 3,
    title: 'Flashcard Sistemi',
    description: 'Akıllı tekrar algoritması ile öğrenme',
    action: "Flashcard'ları Dene",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 4,
    title: 'Performans Analizi',
    description: 'Detaylı istatistikler ve AI önerileri',
    action: 'Analizleri Gör',
    icon: <BarChart3 className="h-6 w-6 text-white" />,
    color: 'from-orange-500 to-red-600',
  },
];

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // Activate demo mode when page loads
  useEffect(() => {
    localStorage.setItem('btk_demo_mode', 'true');
  }, []);

  const handleStepAction = (step: DemoStep) => {
    setCompletedSteps(prev => [...prev, step.id]);
    toast({
      title: `${step.title} başlatılıyor!`,
      description: step.description,
    });

    // Ensure demo mode is active
    localStorage.setItem('btk_demo_mode', 'true');

    // Navigate to the actual feature
    switch (step.id) {
      case 1:
        router.push('/quiz?subject=Matematik&demo=true');
        break;
      case 2:
        router.push('/ai-chat?demo=true');
        break;
      case 3:
        router.push('/flashcard?subject=Matematik&demo=true');
        break;
      case 4:
        router.push('/?demo=true');
        break;
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Ensure demo mode is active
      localStorage.setItem('btk_demo_mode', 'true');
      toast({
        title: 'Demo başlatıldı!',
        description: "AkılHane'nin özelliklerini keşfedin.",
      });
    }
  };

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MobileNav />
      <main className="flex-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AkılHane Canlı Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            AI destekli eğitim platformunun tüm özelliklerini keşfedin
          </p>

          {/* Demo Controls */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              onClick={handlePlayPause}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="ml-2">{isPlaying ? 'Duraklat' : 'Başlat'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentStep === demoSteps.length - 1}
              className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Demo İlerlemesi</span>
            <span className="text-sm text-gray-500">
              {currentStep + 1} / {demoSteps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Current Feature */}
        {demoSteps[currentStep] && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="mb-8"
          >
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`bg-gradient-to-r ${demoSteps[currentStep].color} p-3 rounded-xl`}>
                    {demoSteps[currentStep].icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                  {demoSteps[currentStep].title}
                </CardTitle>
                <CardDescription className="text-lg">
                  {demoSteps[currentStep].description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  onClick={() => demoSteps[currentStep] && handleStepAction(demoSteps[currentStep])}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {demoSteps[currentStep].action}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-stretch">
          {demoSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-gradient-question h-full ${
                  currentStep === index ? 'ring-2 ring-blue-500' : ''
                } ${completedSteps.includes(step.id) ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                <CardHeader className="text-center pb-3">
                  <div className="flex justify-center mb-2">
                    <div className={`bg-gradient-to-r ${step.color} p-2 rounded-lg`}>
                      {step.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    {step.title}
                  </CardTitle>
                  {completedSteps.includes(step.id) && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Tamamlandı
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Card className="shadow-xl border-gradient-question bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white drop-shadow-lg">
                AkılHane&apos;yi Deneyimlediniz mi?
              </h2>
              <p className="text-gray-900 dark:text-white mb-6 font-medium drop-shadow-md">
                Ücretsiz hesap oluşturun ve AI destekli eğitim deneyiminin tamamını keşfedin!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/login?mode=register')}
                  variant="secondary"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Ücretsiz Kayt Ol
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="secondary"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Ana Sayfaya Git
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </main>
    </div>
  );
}
