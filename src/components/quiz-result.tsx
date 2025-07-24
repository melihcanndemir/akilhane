'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Target, Clock, BookCopy, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

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
      title: 'Mükemmel!',
      description: 'Konulara hakimsin. Bu harika performansı devam ettir!',
      iconColor: 'text-green-500',
    };
  }
  if (percentage >= 60) {
    return {
      title: 'Harika İş!',
      description: 'İyi bir sonuç. Geliştirilmesi gereken konulara odaklanarak daha da iyi olabilirsin.',
      iconColor: 'text-blue-500',
    };
  }
  if (percentage >= 40) {
    return {
      title: 'Fena Değil',
      description: 'Temel bilgileri aldın ama tekrar yapman gerekiyor. Zayıf konularına göz at.',
      iconColor: 'text-yellow-500',
    };
  }
  return {
    title: 'Tekrar Gerekli',
    description: 'Endişelenme, bu bir öğrenme süreci. Zayıf konularını tekrar ederek başlayabilirsin.',
    iconColor: 'text-red-500',
  };
};

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}dk ${remainingSeconds.toString().padStart(2, '0')}sn`;
};

export const QuizResult: React.FC<QuizResultProps> = ({
  score,
  totalQuestions,
  timeSpent,
  weakTopics,
  onRetake,
}) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const feedback = getFeedback(percentage);
  const weakTopicList = Object.keys(weakTopics);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-8 max-w-4xl"
    >
      <Card className="shadow-2xl">
        <CardHeader className="text-center items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={`p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4`}
          >
            <Award className={`h-12 w-12 ${feedback.iconColor}`} />
          </motion.div>
          <CardTitle className="text-4xl font-bold">{feedback.title}</CardTitle>
          <CardDescription className="text-lg mt-2">{feedback.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 mt-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Target className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-3xl font-bold">{score} / {totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Doğru Sayısı</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-3xl font-bold">{formatTime(timeSpent)}</p>
              <p className="text-sm text-muted-foreground">Toplam Süre</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-3xl font-bold">{percentage}%</p>
              <p className="text-sm text-muted-foreground">Başarı Oranı</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <Progress value={percentage} className="h-4" />
          </div>

          {/* Weak Topics */}
          {weakTopicList.length > 0 && (
            <div className="text-center">
              <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                <BookCopy className="h-6 w-6 text-red-500" />
                Geliştirilmesi Gereken Konular
              </h3>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {weakTopicList.map((topic) => (
                  <Badge key={topic} variant="destructive" className="text-md">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Button onClick={onRetake} size="lg" className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Testi Tekrar Çöz
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto flex items-center gap-2">
                <Home className="h-5 w-5" />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 