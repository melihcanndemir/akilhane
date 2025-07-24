'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import QuizComponent from '@/components/quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Play, GraduationCap, Loader2, ArrowLeft } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  questionCount: number;
}

export default function QuizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = searchParams.get('subject');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');
        if (response.ok) {
          const data = await response.json();
          // Sadece aktif ve soru içeren dersleri filtrele
          const activeSubjectsWithQuestions = data.filter((subject: Subject) => 
            subject.isActive && subject.questionCount > 0
          );
          setSubjects(activeSubjectsWithQuestions);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleStartQuiz = () => {
    if (selectedSubject) {
      router.push(`/quiz?subject=${encodeURIComponent(selectedSubject)}`);
    }
  };

  if (subject) {
    return <QuizComponent subject={subject} />;
  }

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

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Quiz Sayfası
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Bilgilerinizi test etmek için bir ders seçin ve quiz'e başlayın.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Ders Seçimi
            </CardTitle>
            <CardDescription>
              Quiz başlatmak için aşağıdan bir ders seçin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Dersler yükleniyor...</span>
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Henüz soru içeren aktif ders bulunmuyor
                </p>
                <div className="space-y-2">
                  <Button onClick={() => router.push('/subject-manager')} className="mr-2">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Ders Ekle
                  </Button>
                  <Button onClick={() => router.push('/question-manager')} variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Soru Ekle
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Quiz yapmak istediğiniz dersi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>
                        {subject.name} ({subject.questionCount} soru)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleStartQuiz} 
                  disabled={!selectedSubject}
                  className="w-full"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Quiz'e Başla
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {subjects.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">
              Mevcut Dersler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Card 
                  key={subject.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setSelectedSubject(subject.name);
                    handleStartQuiz();
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {subject.category} • {subject.difficulty}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {subject.questionCount} soru mevcut
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
