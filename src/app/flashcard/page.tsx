'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FlashcardComponent from '../../components/flashcard';

interface Subject {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  questionCount: number;
}

const FlashcardPage = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load subjects from database
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');
        if (response.ok) {
          const data = await response.json();
          // Only show subjects with questions
          const subjectsWithQuestions = data.filter((subject: Subject) => subject.questionCount > 0);
          setSubjects(subjectsWithQuestions);
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubjects();
  }, []);

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
          {/* Geri Butonu */}
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
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
              🎯 Flashcard Öğrenme Sistemi
            </h1>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                Hangi konuyu çalışmak istiyorsunuz?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subjects.length === 0 ? (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Henüz soru içeren ders bulunmuyor.
                    </p>
                    <button
                      onClick={() => window.location.href = '/question-manager'}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Soru Ekle
                    </button>
                  </div>
                ) : (
                  subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.name)}
                      className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="text-2xl mb-3">
                        {subject.name.includes('Finansal') && '📊'}
                        {subject.name.includes('Karar') && '🤖'}
                        {subject.name.includes('Müşteri') && '👥'}
                        {!subject.name.includes('Finansal') && !subject.name.includes('Karar') && !subject.name.includes('Müşteri') && '📚'}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{subject.name}</h3>
                      <p className="text-blue-100 text-sm mb-2">
                        {subject.questionCount} soru mevcut
                      </p>
                      <p className="text-blue-100 text-xs">
                        Akıllı öğrenme sistemi ile çalışın
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
      <FlashcardComponent subject={selectedSubject} />
      
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

export default FlashcardPage; 