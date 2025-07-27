'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FlashcardComponent from '../../components/flashcard';
import { useSearchParams } from 'next/navigation';
import { shouldUseDemoData } from '@/data/demo-data';

interface Subject {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  questionCount: number;
}

// LocalStorage service for subjects
class SubjectLocalStorageService {
  private static readonly STORAGE_KEY = 'exam_training_subjects';

  static getSubjects(): Subject[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

// LocalStorage service for questions
class QuestionLocalStorageService {
  private static readonly STORAGE_KEY = 'exam_training_questions';

  static getQuestions(): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static getQuestionsBySubject(subject: string): any[] {
    const questions = this.getQuestions();
    return questions.filter(q => q.subject === subject);
  }
}

const FlashcardPageContent = () => {
  const searchParams = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load subjects from localStorage
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setIsLoading(true);
        
        // Demo mode control
        const demoModeActive = shouldUseDemoData();
        setIsDemoMode(demoModeActive);
        
        if (demoModeActive) {
          // Demo subjects
          const demoSubjects: Subject[] = [
            {
              id: 'subj_matematik_001',
              name: 'Matematik',
              category: 'Fen Bilimleri',
              difficulty: 'Orta',
              isActive: true,
              questionCount: 245,
            },
            {
              id: 'subj_fizik_002',
              name: 'Fizik',
              category: 'Fen Bilimleri',
              difficulty: 'Orta',
              isActive: true,
              questionCount: 198,
            },
            {
              id: 'subj_kimya_003',
              name: 'Kimya',
              category: 'Fen Bilimleri',
              difficulty: 'İleri',
              isActive: true,
              questionCount: 167,
            }
          ];
          setSubjects(demoSubjects);
          return;
        }

        // Directly use localStorage
        const localSubjects = SubjectLocalStorageService.getSubjects();
        
        // Calculate question count for each subject
        const subjectsWithQuestionCount = localSubjects.map(subject => {
          const questions = QuestionLocalStorageService.getQuestionsBySubject(subject.name);
          return {
            ...subject,
            questionCount: questions.length
          };
        });
        
        // Filter subjects with questions
        const subjectsWithQuestions = subjectsWithQuestionCount.filter(subject => 
          subject.questionCount > 0
        );
        
        console.log('🎯 Flashcard Page - Loaded subjects:', subjectsWithQuestions);
        setSubjects(subjectsWithQuestions);
      } catch (error) {
        console.error('Error loading subjects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubjects();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Dersler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Ana Sayfaya Dön
            </Button>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                🎯 Flashcard Öğrenme Sistemi
              </h1>
              {isDemoMode && (
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  🎯 BTK Demo
                </Badge>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                {isDemoMode ? 'Demo derslerinden birini seçin:' : 'Hangi konuyu çalışmak istiyorsunuz?'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subjects.length === 0 ? (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {isDemoMode ? 'Demo verileri yükleniyor...' : 'Henüz soru içeren ders bulunmuyor.'}
                    </p>
                    {!isDemoMode && (
                      <button
                        onClick={() => window.location.href = '/question-manager'}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        Soru Ekle
                      </button>
                    )}
                  </div>
                ) : (
                  subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.name)}
                      className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="text-2xl mb-3">
                        {subject.name === 'Matematik' && '📐'}
                        {subject.name === 'Fizik' && '⚛️'}
                        {subject.name === 'Kimya' && '🧪'}
                        {subject.name === 'Tarih' && '🏛️'}
                        {subject.name === 'Biyoloji' && '🧬'}
                        {subject.name === 'Türk Dili ve Edebiyatı' && '📖'}
                        {subject.name === 'İngilizce' && '🇺🇸'}
                        {!['Matematik', 'Fizik', 'Kimya', 'Tarih', 'Biyoloji', 'Türk Dili ve Edebiyatı', 'İngilizce'].includes(subject.name) && '📚'}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{subject.name}</h3>
                      <p className="text-blue-100 text-sm mb-2">
                        {subject.questionCount} {isDemoMode ? 'demo ' : ''}kart mevcut
                      </p>
                      <p className="text-blue-100 text-xs">
                        {isDemoMode ? 'BTK Demo içeriği' : 'Akıllı öğrenme sistemi ile çalışın'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
                🧠 Akıllı Öğrenme Özellikleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center">
                  <span className="mr-2">🔄</span>
                  <span>Aralıklı tekrar algoritması</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📈</span>
                  <span>Kişiselleştirilmiş zorluk seviyesi</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🎯</span>
                  <span>Odaklanmış çalışma modları</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📊</span>
                  <span>Detaylı ilerleme takibi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <FlashcardComponent subject={selectedSubject} isDemoMode={isDemoMode} />
      
      {/* Back to subject selection */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setSelectedSubject('')}
          className="bg-gray-800 dark:bg-gray-700 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          title="Konu seçimine dön"
        >
          ←
        </button>
      </div>
    </div>
  );
};

const FlashcardPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Yükleniyor...</p>
        </div>
      </div>
    }>
      <FlashcardPageContent />
    </Suspense>
  );
};

export default FlashcardPage; 