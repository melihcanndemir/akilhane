'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import QuizComponent from '@/components/quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Play, GraduationCap, Loader2, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = searchParams.get('subject');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        console.log('🎯 Quiz Page - Loading subjects from localStorage...');
        
        // Demo mode control
        const demoMode = shouldUseDemoData();
        setIsDemoMode(demoMode);
        
        console.log('🎯 Quiz Page - Demo mode check:', { demoMode });
        
        if (demoMode) {
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
        
        // Filter only active courses with questions
        const activeSubjectsWithQuestions = subjectsWithQuestionCount.filter(subject => 
          subject.isActive && subject.questionCount > 0
        );
        
        console.log('🎯 Quiz Page - Loaded subjects:', activeSubjectsWithQuestions);
        setSubjects(activeSubjectsWithQuestions);
      } catch (error) {
        console.error('🎯 Quiz Page - Error loading subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [searchParams]);

  const handleStartQuiz = () => {
    if (selectedSubject) {
      // Add demo mode parameter to quiz URL
      const isDemoMode = shouldUseDemoData();
      
      const quizUrl = `/quiz?subject=${encodeURIComponent(selectedSubject)}${isDemoMode ? '&demo=true' : ''}`;
      router.push(quizUrl);
    }
  };

  if (subject && subject.length > 0) {
    // Demo mode control
    const isDemoMode = shouldUseDemoData();
    
    return <QuizComponent subject={subject} isDemoMode={isDemoMode} />;
  }

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

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Quiz Sayfası
            </h1>
            {isDemoMode && (
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                BTK Demo
              </Badge>
            )}
          </div>
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
                    
                    // Add demo mode parameter to quiz URL
                    const isDemoMode = shouldUseDemoData();
                    
                    const quizUrl = `/quiz?subject=${encodeURIComponent(subject.name)}${isDemoMode ? '&demo=true' : ''}`;
                    router.push(quizUrl);
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

export default function QuizPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizPageContent />
    </Suspense>
  );
}
