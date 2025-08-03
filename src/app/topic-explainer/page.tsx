'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TopicExplainer from '@/components/topic-explainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Lightbulb, Target, ArrowLeft, Plus, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { shouldUseDemoData } from '@/data/demo-data';

interface Topic {
  name: string;
  subject: string;
  difficulty: string;
  estimatedTime: number;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  questionCount: number;
  isActive: boolean;
}

// LocalStorage service for subjects
class SubjectLocalStorageService {
  private static readonly STORAGE_KEY = 'exam_training_subjects';

  static getSubjects(): Subject[] {
    if (typeof window === 'undefined') {return [];}
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

const TopicExplainerPageContent = () => {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  const subject = searchParams.get('subject');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const demoMode = shouldUseDemoData();
    setIsDemoMode(demoMode);

    // Load real subjects
    const loadRealData = () => {
      const realSubjects = SubjectLocalStorageService.getSubjects();

      setSubjects(realSubjects);
      setIsLoading(false);
    };

    loadRealData();
  }, []);

  // If topic and subject are provided, show the explainer
  if (topic && subject) {
    return <TopicExplainer topic={topic} subject={subject} isDemoMode={isDemoMode} />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Konular yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get available topics from real subjects
  const getRealTopics = (): Topic[] => {
    const realTopics: Topic[] = [];

    subjects.forEach(subject => {
      if (subject.isActive) {
        // Generate topics for each active subject
        const subjectTopics = generateTopicsForSubject(subject);
        realTopics.push(...subjectTopics);
      }
    });

    return realTopics;
  };

  const generateTopicsForSubject = (subject: Subject): Topic[] => {
    const baseTopics = [
      { name: 'Temel Kavramlar', difficulty: 'easy', estimatedTime: 20 },
      { name: 'Ana Konular', difficulty: 'medium', estimatedTime: 30 },
      { name: 'İleri Seviye', difficulty: 'hard', estimatedTime: 40 },
      { name: 'Uygulamalar', difficulty: 'medium', estimatedTime: 35 },
      { name: 'Problem Çözme', difficulty: 'hard', estimatedTime: 45 },
    ];

    return baseTopics.map(topic => ({
      name: topic.name,
      subject: subject.name,
      difficulty: topic.difficulty,
      estimatedTime: topic.estimatedTime,
    }));
  };

  const availableTopics = getRealTopics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Akıllı Konu Anlatımı
            </h1>
            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              💾 LocalStorage
            </Badge>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            AI destekli, görsel ve interaktif konu anlatımları ile öğrenmeyi kolaylaştırın.
            Her konu adım adım, örnekler ve ipuçları ile açıklanır.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-gradient-question shadow-lg">
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                AI Destekli Öğrenme
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Yapay zeka ile kişiselleştirilmiş öğrenme deneyimi
              </p>
            </CardContent>
          </Card>

          <Card className="border-gradient-question shadow-lg">
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Adım Adım
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Karmaşık konuları basit adımlara böler
              </p>
            </CardContent>
          </Card>

          <Card className="border-gradient-question shadow-lg">
            <CardContent className="p-6 text-center">
              <Lightbulb className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                İnteraktif
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Görseller, örnekler ve ipuçları ile zenginleştirilmiş
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Overview */}
        {subjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              Dersleriniz
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {subjects.filter(s => s.isActive).map((subject) => (
                <Card key={subject.id} className="border-gradient-question shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {subject.category}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {subject.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          subject.difficulty === 'Kolay' ? 'bg-green-500' :
                          subject.difficulty === 'Orta' ? 'bg-yellow-500' : 'bg-red-500'
                        }
                      >
                        {subject.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {subject.questionCount} soru
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Topics Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            {availableTopics.length > 0 ? 'Mevcut Konular' : 'Henüz Konu Yok'}
          </h2>

          {availableTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTopics.map((topic, index) => (
                <Card
                  key={`${topic.name}-${topic.subject}-${index}`}
                  className="border-gradient-question shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    const url = `/topic-explainer?topic=${encodeURIComponent(topic.name)}&subject=${encodeURIComponent(topic.subject)}`;
                    window.location.href = url;
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          {topic.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {topic.subject}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {topic.name} konusu {topic.subject} dersinin temel konularından biridir.
                    </p>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          topic.difficulty === 'easy' ? 'default' :
                          topic.difficulty === 'medium' ? 'secondary' : 'destructive'
                        }
                      >
                        {topic.difficulty === 'easy' ? 'Kolay' :
                         topic.difficulty === 'medium' ? 'Orta' : 'Zor'}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ~{topic.estimatedTime} dakika
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Brain className="w-4 h-4" />
                        <span>AI destekli anlatım</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4 flex justify-center">
                <GraduationCap className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Henüz konu anlatımı yok
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Ders Yöneticisi&apos;nden ders ekleyerek konu anlatımlarını başlatın!
              </p>
              <Link href="/subject-manager">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Ders Yöneticisi&apos;ne Git
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* How it works */}
        <Card className="border-gradient-question shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white text-center">
              Nasıl Çalışır?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Ders Ekle</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Ders Yöneticisi&apos;nden derslerinizi ekleyin
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Konu Seç</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  İstediğin konuyu seç ve başla
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">AI Öğren</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Yapay zeka ile kişiselleştirilmiş öğrenme
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">4</span>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Pekiştir</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Örnekler ve ipuçları ile pekiştir
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const TopicExplainerPage = () => (
  <Suspense fallback={
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Yükleniyor...</p>
      </div>
    </div>
  }>
    <TopicExplainerPageContent />
  </Suspense>
);

export default TopicExplainerPage;
