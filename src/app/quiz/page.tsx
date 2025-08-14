"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import QuizComponent from "@/components/quiz";
import FeatureCards from "@/components/ui/feature-cards";
import { quizFeatures } from "@/data/feature-cards-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Play,
  GraduationCap,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { shouldUseDemoData } from "@/data/demo-data";

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
  private static readonly STORAGE_KEY = "akilhane_subjects";

  static getSubjects(): Subject[] {
    if (typeof window === "undefined") {
      return [];
    }
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
  private static readonly STORAGE_KEY = "akilhane_questions";

  static getQuestions(): unknown[] {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static getQuestionsBySubject(subject: string): unknown[] {
    const questions = this.getQuestions();
    return questions.filter(
      (q: unknown) => (q as { subject: string }).subject === subject,
    );
  }
}

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = searchParams.get("subject");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [defaultSubject, setDefaultSubject] = useState("");

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);

        // Demo mode control
        const demoMode = shouldUseDemoData();
        setIsDemoMode(demoMode);

        if (demoMode) {
          // Demo subjects
          const demoSubjects: Subject[] = [
            {
              id: "subj_matematik_001",
              name: "Matematik",
              category: "Fen Bilimleri",
              difficulty: "Orta",
              isActive: true,
              questionCount: 245,
            },
            {
              id: "subj_fizik_002",
              name: "Fizik",
              category: "Fen Bilimleri",
              difficulty: "Orta",
              isActive: true,
              questionCount: 198,
            },
            {
              id: "subj_kimya_003",
              name: "Kimya",
              category: "Fen Bilimleri",
              difficulty: "İleri",
              isActive: true,
              questionCount: 167,
            },
          ];
          setSubjects(demoSubjects);
          return;
        }

        // Directly use localStorage
        const localSubjects = SubjectLocalStorageService.getSubjects();

        // Calculate question count for each subject
        const subjectsWithQuestionCount = localSubjects.map((subject) => {
          const questions = QuestionLocalStorageService.getQuestionsBySubject(
            subject.name,
          );
          return {
            ...subject,
            questionCount: questions.length,
          };
        });

        // Filter only active courses with questions
        const activeSubjectsWithQuestions = subjectsWithQuestionCount.filter(
          (subject) => subject.isActive && subject.questionCount > 0,
        );

        setSubjects(activeSubjectsWithQuestions);

        // Load default subject from settings
        try {
          const saved = localStorage.getItem("userSettings");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.studyPreferences?.defaultSubject) {
              setDefaultSubject(parsed.studyPreferences.defaultSubject);
              // Auto-select default subject if it exists in subjects list
              const defaultSubjectExists = activeSubjectsWithQuestions.some(
                (s) => s.name === parsed.studyPreferences.defaultSubject,
              );
              if (defaultSubjectExists) {
                setSelectedSubject(parsed.studyPreferences.defaultSubject);
              }
            }
          }
        } catch {
          // Error handling silently
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [searchParams]);

  const handleStartQuiz = () => {
    if (selectedSubject) {
      // Check if there are real questions for this subject
      const questionsForSubject =
        QuestionLocalStorageService.getQuestionsBySubject(selectedSubject);
      const hasRealQuestions = questionsForSubject.length > 0;

      if (hasRealQuestions) {
        // Use real questions - don't set demo mode
        const quizUrl = `/quiz?subject=${encodeURIComponent(selectedSubject)}`;
        router.push(quizUrl);
      } else {
        // No real questions - use demo mode
        localStorage.setItem("btk_demo_mode", "true");
        const quizUrl = `/quiz?subject=${encodeURIComponent(selectedSubject)}&demo=true`;
        router.push(quizUrl);
      }
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
            onClick={() => (window.location.href = "/dashboard")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard&apos;a Dön
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Quiz Sayfası
            </h1>
            {isDemoMode && (
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                BTK Demo
              </Badge>
            )}
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Bilgilerinizi test etmek için bir ders seçin ve quiz&apos;e
            başlayın.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto border-gradient-question shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
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
                  <Button
                    onClick={() => router.push("/subject-manager")}
                    className="mr-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Ders Ekle
                  </Button>
                  <Button
                    onClick={() => router.push("/question-manager")}
                    variant="outline"
                    className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Soru Ekle
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0">
                    <SelectValue placeholder="Quiz yapmak istediğiniz dersi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.name}
                        className={`hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white ${
                          subject.name === defaultSubject ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : ""
                        }`}
                      >
                        {subject.name} ({subject.questionCount} soru)
                        {subject.name === defaultSubject && " (Varsayılan)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleStartQuiz}
                  disabled={!selectedSubject}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {selectedSubject === defaultSubject ? "Varsayılan Dersle Quiz'e Başla" : "Quiz'e Başla"}
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
                  className="cursor-pointer border-gradient-question shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    setSelectedSubject(subject.name);

                    // Check if there are real questions for this subject
                    const questionsForSubject =
                      QuestionLocalStorageService.getQuestionsBySubject(
                        subject.name,
                      );
                    const hasRealQuestions = questionsForSubject.length > 0;

                    if (hasRealQuestions) {
                      // Use real questions - don't set demo mode
                      const quizUrl = `/quiz?subject=${encodeURIComponent(subject.name)}`;
                      router.push(quizUrl);
                    } else {
                      // No real questions - use demo mode
                      localStorage.setItem("btk_demo_mode", "true");
                      const quizUrl = `/quiz?subject=${encodeURIComponent(subject.name)}&demo=true`;
                      router.push(quizUrl);
                    }
                  }}
                >
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
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          subject.difficulty === "Kolay"
                            ? "bg-green-500"
                            : subject.difficulty === "Orta"
                              ? "bg-yellow-500"
                              : "bg-red-500"
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

        {/* Quiz Özellikleri */}
        <FeatureCards
          title="Quiz Özellikleri"
          features={quizFeatures}
          columns={3}
        />
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
