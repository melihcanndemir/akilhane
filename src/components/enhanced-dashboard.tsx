"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FeatureCards from "@/components/ui/feature-cards";
import { dashboardFeatures } from "@/data/feature-cards-data";
import {
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  FileText,
  Users,
  Database,
  Download,
  Upload,
  HardDrive,
  UserCheck,
  UserX,
  Zap,
  Trophy,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import localStorageService from "@/services/localStorage-service";
import AnalyticsDashboard from "./analytics-dashboard";
import MobileNav from "./mobile-nav";
import LoadingSpinner from "./loading-spinner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AIPerformanceRecommendation from "./ai-performance-recommendation";
import {
  shouldUseDemoData,
  toggleDemoMode,
  loadDemoDataToLocalStorage,
  demoPerformanceData,
  demoRecentResults,
  demoTotalStats,
} from "@/data/demo-data";

interface PerformanceData {
  subject: string;
  averageScore: number;
  totalTests: number;
  weakTopics: string[];
  strongTopics: string[];
  lastUpdated: string;
}

interface QuizResult {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  weakTopics: string[] | Record<string, number>;
  createdAt: string;
  isDemo?: boolean;
}

interface TotalStats {
  totalTests: number;
  averageScore: number;
  totalTimeSpent: number;
  totalSubjects: number;
}

export default function EnhancedDashboard() {
  const { user, loading, isGuest, isAuthenticated, clearGuestData, initializeGuestUser } = useLocalAuth();
  const { toast } = useToast();

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [recentResults, setRecentResults] = useState<QuizResult[]>([]);
  const [totalStats, setTotalStats] = useState<TotalStats>({
    totalTests: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    totalSubjects: 0,
  });
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: 0,
    percentage: 0,
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useDemoData, setUseDemoData] = useState(true);
  const [userSettings, setUserSettings] = useState({
    studyPreferences: {
      questionsPerQuiz: 10,
      timeLimit: 30,
    },
  });

  // Safely initialize the demo data state
  useEffect(() => {
    setUseDemoData(shouldUseDemoData());
  }, []);

  // Load user settings
  useEffect(() => {
    const loadSettings = () => {
      try {
        const settings = localStorageService.getUserSettings();
        setUserSettings(settings);
      } catch {
        //do nothing
      }
    };

    loadSettings();

    // Listen for storage changes to update settings in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userSettings") {
        loadSettings();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        return;
      }

      setIsLoading(true);
      try {
        // BTK Hackathon Demo Mode
        if (useDemoData) {
          setPerformanceData(demoPerformanceData);
          setRecentResults(demoRecentResults);
          setTotalStats(demoTotalStats);
          setStorageInfo({ used: 2048, available: 5242880, percentage: 0.04 });

          setIsLoading(false);
          return;
        }

        // USE DIRECT LOCALSTORAGE

        // Fetch data from LocalStorage
        const getDataFromStorage = () => {
          if (typeof window === "undefined") {
            return null;
          }

          try {
            // Load appropriate quiz results based on demo mode
            const quizResultsKey = useDemoData
              ? "exam_training_demo_quiz_results"
              : "exam_training_quiz_results";
            const quizResults = localStorage.getItem(quizResultsKey);
            const results = quizResults ? JSON.parse(quizResults) : [];

            // Filter out demo results if not in demo mode
            const filteredResults = useDemoData
              ? results
              : results.filter((result: QuizResult) => !result.isDemo);

            // Get subject information from Subjects
            const subjects = localStorage.getItem("akilhane_subjects");
            const subjectsData = subjects ? JSON.parse(subjects) : [];

            if (filteredResults.length === 0) {
              // If there are no quiz results, return empty data
              return {
                performanceData: [],
                recentResults: [],
                totalStats: {
                  totalTests: 0,
                  averageScore: 0,
                  totalTimeSpent: 0,
                  totalSubjects: subjectsData.length,
                },
                storageInfo: { used: 0, available: 5242880, percentage: 0 },
              };
            }

            // Calculate performance data
            const performanceMap: Record<
              string,
              {
                totalTests: number;
                totalScore: number;
                totalQuestions: number;
                weakTopics: Record<string, number>;
              }
            > = {};
            filteredResults.forEach((result: QuizResult) => {
              if (!performanceMap[result.subject]) {
                performanceMap[result.subject] = {
                  totalTests: 0,
                  totalScore: 0,
                  totalQuestions: 0,
                  weakTopics: {},
                };
              }
              const subjectData = performanceMap[result.subject]!;
              subjectData.totalTests++;
              subjectData.totalScore += result.score;
              subjectData.totalQuestions += result.totalQuestions;

              // Add weak topics
              if (
                result.weakTopics &&
                typeof result.weakTopics === "object" &&
                !Array.isArray(result.weakTopics)
              ) {
                Object.entries(result.weakTopics).forEach(([topic, count]) => {
                  subjectData.weakTopics[topic] =
                    (subjectData.weakTopics[topic] || 0) + count;
                });
              }
            });

            const performanceData = Object.entries(performanceMap).map(
              ([subject, data]) => {
                // Calculate strong topics for this subject (topics not in weak topics)
                const allTopicsInSubject = new Set<string>();
                const topicPerformance: Record<
                  string,
                  { correct: number; total: number }
                > = {};

                // Collect all topics from this subject's results
                filteredResults
                  .filter((result: QuizResult) => result.subject === subject)
                  .forEach((result: QuizResult) => {
                    const { weakTopics } = result;
                    if (
                      weakTopics &&
                      typeof weakTopics === "object" &&
                      !Array.isArray(weakTopics)
                    ) {
                      Object.keys(weakTopics).forEach((topic) => {
                        allTopicsInSubject.add(topic);
                        if (!topicPerformance[topic]) {
                          topicPerformance[topic] = { correct: 0, total: 0 };
                        }
                        const weakCount = weakTopics[topic] || 0;
                        topicPerformance[topic].total += 3;
                        topicPerformance[topic].correct += Math.max(
                          0,
                          3 - weakCount,
                        );
                      });
                    }
                  });

                // Find strong topics (not in weak topics and good performance)
                const strongTopics = Array.from(allTopicsInSubject)
                  .filter((topic) => {
                    const performance = topicPerformance[topic];
                    if (!performance || performance.total < 2) {
                      return false;
                    }

                    const successRate =
                      (performance.correct / performance.total) * 100;
                    return successRate >= 70 && !data.weakTopics[topic];
                  })
                  .slice(0, 2);

                return {
                  subject,
                  averageScore: Math.round(
                    (data.totalScore / data.totalQuestions) * 100,
                  ),
                  totalTests: data.totalTests,
                  weakTopics: Object.entries(data.weakTopics)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([topic]) => topic),
                  strongTopics, // Add strong topics to performance data
                  lastUpdated: new Date().toISOString(),
                };
              },
            );

            // Recent results
            const recentResults = filteredResults
              .slice(-5)
              .map((result: QuizResult) => ({
                id: result.id,
                subject: result.subject,
                score: result.score,
                totalQuestions: result.totalQuestions,
                timeSpent: result.timeSpent || 0,
                weakTopics: result.weakTopics
                  ? Object.keys(result.weakTopics)
                  : [],
                createdAt: result.createdAt,
              }));

            // Total stats
            const totalTests = filteredResults.length;
            const totalCorrectAnswers = filteredResults.reduce(
              (sum: number, result: QuizResult) => sum + result.score,
              0,
            );
            const totalQuestions = filteredResults.reduce(
              (sum: number, result: QuizResult) => sum + result.totalQuestions,
              0,
            );
            const averageScore =
              totalQuestions > 0
                ? Math.round((totalCorrectAnswers / totalQuestions) * 100)
                : 0;
            const totalTimeSpent = filteredResults.reduce(
              (sum: number, result: QuizResult) =>
                sum + (result.timeSpent || 0),
              0,
            );

            const totalStats = {
              totalTests,
              averageScore,
              totalTimeSpent: Math.floor(totalTimeSpent / 60), // convert to minutes
              totalSubjects: subjectsData.length,
            };

            // Storage info (simple calculation)
            const used =
              JSON.stringify(filteredResults).length +
              JSON.stringify(subjectsData).length;
            const storageInfo = {
              used,
              available: 5242880, // 5MB
              percentage: Math.min((used / 5242880) * 100, 100),
            };

            return {
              performanceData,
              recentResults,
              totalStats,
              storageInfo,
            };
          } catch {
            //do nothing
            return null;
          }
        };

        const data = getDataFromStorage();

        if (data) {
          setPerformanceData(data.performanceData);
          setRecentResults(data.recentResults);
          setTotalStats(data.totalStats);
          setStorageInfo(data.storageInfo);
        } else {
          // Fallback boş data
          setPerformanceData([]);
          setRecentResults([]);
          setTotalStats({
            totalTests: 0,
            averageScore: 0,
            totalTimeSpent: 0,
            totalSubjects: 0,
          });
          setStorageInfo({ used: 0, available: 5242880, percentage: 0 });
        }
      } catch {
        //do nothing
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !loading) {
      loadUserData();
    }
  }, [user, loading, useDemoData]);

  const handleExportData = () => {
    if (!isGuest) {
      toast({
        title: "Bu özellik sadece misafir kullanıcılar içindir",
        description:
          "Giriş yapmış kullanıcılar verilerini profil ayarlarından yönetebilir.",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = localStorageService.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `akilhane-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Veriler başarıyla dışa aktarıldı",
        description:
          "Yedek dosyanız indirildi. Bu dosyayı güvenli bir yerde saklayın.",
      });
    } catch {
      toast({
        title: "Dışa aktarma hatası",
        description: "Veriler dışa aktarılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    if (!isGuest) {
      toast({
        title: "Bu özellik sadece misafir kullanıcılar içindir",
        description:
          "Giriş yapmış kullanıcılar verilerini profil ayarlarından yönetebilir.",
        variant: "destructive",
      });
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            const success = localStorageService.importAllData(data);

            if (success) {
              toast({
                title: "Veriler başarıyla içe aktarıldı",
                description:
                  "Yedek verileriniz geri yüklendi. Sayfa yenileniyor...",
              });
              setTimeout(() => window.location.reload(), 1500);
            } else {
              throw new Error("Import failed");
            }
          } catch {
            toast({
              title: "İçe aktarma hatası",
              description: "Dosya formatı geçersiz veya bozuk.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleToggleDemoMode = () => {
    const newDemoMode = !useDemoData;
    setUseDemoData(newDemoMode);
    toggleDemoMode(newDemoMode);

    if (newDemoMode) {
      loadDemoDataToLocalStorage();
      toast({
        title: "Demo Modu Aktif",
        description: "Demo veriler yüklendi. Sayfa yenileniyor...",
      });
      setTimeout(() => window.location.reload(), 1000);
    } else {
      // Clear demo data when exiting demo mode
      if (typeof window !== "undefined") {
        localStorage.removeItem("exam_training_demo_quiz_results");
        localStorage.removeItem("guestUser");
        localStorage.removeItem("guestQuizResults");
        localStorage.removeItem("guestFlashcardProgress");
        localStorage.removeItem("guestPerformanceData");
        localStorage.removeItem("guestAIRecommendations");
        
        // Clear guest data and reinitialize with default guest user
        clearGuestData();
        initializeGuestUser();
      }
      toast({
        title: "Demo modu kapatıldı",
        description:
          "Demo veriler temizlendi. Misafir kullanıcı moduna geçildi. Sayfa yenileniyor...",
      });
      // Reload immediately to ensure user data is updated
      window.location.reload();
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Giriş Gerekli</CardTitle>
            <CardDescription>
              Dashboard&apos;a erişmek için giriş yapmanız gerekiyor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Giriş Yap</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* UPDATED HEADER LAYOUT */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Title Section */}
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AkılHane Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Hoş geldiniz,{" "}
                {isGuest
                  ? user && "name" in user
                    ? user.name
                    : "Kullanıcı"
                  : user?.email || "Kullanıcı"}
                !
                {isGuest && (
                  <span className="ml-2 inline-flex items-center">
                    <UserX className="h-4 w-4 mr-1" />
                    Misafir Modu
                  </span>
                )}
                {!isGuest && (
                  <span className="ml-2 inline-flex items-center">
                    <UserCheck className="h-4 w-4 mr-1" />
                    Üye
                  </span>
                )}
              </p>
            </div>

            {/* Controls Section - Mobile: Stacked, Desktop: Right aligned */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Switches Group */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="demo-mode"
                    checked={useDemoData}
                    onCheckedChange={handleToggleDemoMode}
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                  <Label
                    htmlFor="demo-mode"
                    className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:text-indigo-600 transition-colors"
                  >
                    Demo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="analytics-mode"
                    checked={showAnalytics}
                    onCheckedChange={setShowAnalytics}
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                  <Label
                    htmlFor="analytics-mode"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Analitik Görünüm
                  </Label>
                </div>
              </div>

              {/* Settings Button - Separate Group */}
              <div className="flex justify-start sm:justify-end">
                <Link href="/settings">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Ayarlar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          {/* UPDATED SECTION END */}

          {/* Demo Mode Alert */}
          {useDemoData && (
            <div className="mb-6 border-gradient-question p-[1px] rounded-xl">
              <Alert className="border-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-[11px] backdrop-blur-sm">
                <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-800 dark:text-white">Demo Modu Aktif!</strong> Bu veriler
                  örnek kullanım için hazırlanmış demo verileridir. Gerçek kullanım
                  deneyimini görmek için demo modunu kapatabilirsiniz.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Guest User Alert */}
          {isGuest && !useDemoData && (
            <div className="mb-6 border-gradient-question p-[1px] rounded-xl">
              <Alert className="border-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-[11px] backdrop-blur-sm">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-800 dark:text-white">
                    Misafir modunda kullanıyorsunuz.
                  </strong>{" "}
                  Verileriniz sadece bu cihazda saklanıyor. Kalıcı kayıt için{" "}
                  <Link
                    href="/login?mode=register"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                  >
                    ücretsiz hesap oluşturun
                  </Link>{" "}
                  veya verilerinizi yedekleyin.
                  {/* OPTIONAL UPDATE */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      onClick={handleExportData}
                      size="sm"
                      variant="outline"
                      className="border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Yedekle
                    </Button>
                    <Button
                      onClick={handleImportData}
                      size="sm"
                      variant="outline"
                      className="border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Geri Yükle
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Storage Usage for Guest Users */}
          {isGuest && !useDemoData && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Depolama Kullanımı
                  </CardTitle>
                  <HardDrive className="h-4 w-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Kullanılan: {(storageInfo.used / 1024).toFixed(1)} KB
                    </span>
                    <span>{storageInfo.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="progress-gradient-bg rounded-full h-2">
                    <div
                      className="progress-gradient h-2 rounded-full transition-all duration-300"
                      style={{ width: `${storageInfo.percentage}%` }}
                    />
                  </div>
                  {storageInfo.percentage > 80 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Depolama alanınız dolmak üzere. Eski verileri silin veya
                      yedekleyin.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {showAnalytics ? (
          <AnalyticsDashboard useMockData={useDemoData} />
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-gradient-question hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Toplam Test
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {totalStats.totalTests}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalStats.totalSubjects} farklı konuda
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gradient-question hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ortalama Başarı
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    %{totalStats.averageScore.toFixed(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Son testlerin ortalaması
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gradient-question hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Toplam Süre
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(totalStats.totalTimeSpent)}dk
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Çalışma süresi
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gradient-question hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Aktif Konular
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600">
                    {totalStats.totalSubjects}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Çalıştığınız konu sayısı
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Performance by Subject */}
              <div className="lg:col-span-2">
                <Card className="border-gradient-question">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Konu Bazlı Performans
                    </CardTitle>
                    <CardDescription>
                      Her konudaki gelişiminizi takip edin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {performanceData.length > 0 ? (
                      <div className="space-y-6">
                        {performanceData.map((subject, index) => (
                          <div
                            key={index}
                            className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-b-0"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-lg">
                                {subject.subject}
                              </h4>
                              <Badge
                                className={`text-sm ${
                                  subject.averageScore >= 80
                                    ? "badge-gradient-high"
                                    : subject.averageScore >= 70
                                      ? "badge-gradient-medium"
                                      : "badge-gradient-low"
                                }`}
                              >
                                %{subject.averageScore.toFixed(0)}
                              </Badge>
                            </div>
                            <div className="progress-gradient-bg rounded-full mb-2">
                              <div
                                className="progress-gradient h-2 rounded-full transition-all duration-300"
                                style={{ width: `${subject.averageScore}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                              <span>{subject.totalTests} test tamamlandı</span>
                              <span>
                                {new Date(
                                  subject.lastUpdated,
                                ).toLocaleDateString("tr-TR")}
                              </span>
                            </div>
                            {subject.weakTopics.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">
                                  Geliştirilmesi gereken konular:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {subject.weakTopics
                                    .slice(0, 3)
                                    .map((topic, i) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {topic}
                                      </Badge>
                                    ))}
                                  {subject.weakTopics.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{subject.weakTopics.length - 3} diğer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            {subject.strongTopics &&
                              subject.strongTopics.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-green-600 mb-1">
                                    Güçlü olduğunuz konular:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {subject.strongTopics
                                      .slice(0, 2)
                                      .map((topic, i) => (
                                        <Badge
                                          key={i}
                                          variant="outline"
                                          className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                        >
                                          {topic}
                                        </Badge>
                                      ))}
                                    {subject.strongTopics.length > 2 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                      >
                                        +{subject.strongTopics.length - 2} diğer
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 rounded-lg p-8 text-center">
                          <div className="mb-4 flex justify-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                              <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            İlk Testinizi Çözün
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Test çözerek performansınızı takip etmeye başlayın!
                          </p>
                          <Link href="/quiz">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                              <Zap className="w-4 h-4 mr-2" />
                              Test Çöz
                            </Button>
                          </Link>
                        </div>

                        <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 rounded-lg p-8 text-center">
                          <div className="mb-4 flex justify-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center">
                              <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Performans Takibi
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Test sonuçlarınızı analiz edin ve gelişiminizi görün.
                          </p>
                          <div className="text-sm text-gray-400 dark:text-gray-500">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                              <span>Test Çöz</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                              <span>Sonuçları Gör</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                              <span>Gelişimi Takip Et</span>
                            </div>
                          </div>
                        </div>

                        <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 rounded-lg p-8 text-center">
                          <div className="mb-4 flex justify-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Gelişim Süreci
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Her test ile kendinizi geliştirin ve başarıya ulaşın.
                          </p>
                          <div className="text-sm text-gray-400 dark:text-gray-500">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                              <span>Konu Seç</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                              <span>Test Çöz</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                              <span>Gelişimi İzle</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Results */}
              <div>
                <Card className="border-gradient-question">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Son Testler
                    </CardTitle>
                    <CardDescription>En son çözdüğünüz testler</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentResults.length > 0 ? (
                      <div className="space-y-4">
                        {recentResults.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {result.subject}
                              </p>
                              <p className="text-xs text-gray-500">
                                {result.score}/{result.totalQuestions} doğru •{" "}
                                {Math.round(result.timeSpent / 60)}dk
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={`${
                                  result.score / result.totalQuestions >= 0.8
                                    ? "badge-gradient-high"
                                    : result.score / result.totalQuestions >=
                                        0.7
                                      ? "badge-gradient-medium"
                                      : "badge-gradient-low"
                                }`}
                              >
                                %
                                {Math.round(
                                  (result.score / result.totalQuestions) * 100,
                                )}
                              </Badge>
                              {result.score / result.totalQuestions >= 0.8 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                                         ) : (
                       <div className="flex flex-col items-center justify-center py-4 text-center">
                         <div className="shadow-lg border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 rounded-lg p-8 text-center max-w-md">
                           <div className="mb-4 flex justify-center">
                             <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                               <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                             </div>
                           </div>
                           <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                             Test Sonuçları
                           </h3>
                           <p className="text-gray-500 dark:text-gray-400 mb-6">
                             Test çözerek sonuçlarınızı görün ve gelişiminizi takip edin!
                           </p>
                           <Link href="/quiz">
                             <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                               <Zap className="w-4 h-4 mr-2" />
                               Test Çöz
                             </Button>
                           </Link>
                         </div>
                       </div>
                     )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              {/* AI Performance Recommendation */}
              <div className="lg:col-span-1">
                <AIPerformanceRecommendation
                  performanceData={performanceData}
                  recentResults={recentResults}
                  totalStats={totalStats}
                  useDemoData={useDemoData}
                  className="h-full"
                />
              </div>

              {/* Other Quick Actions */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-gradient-question hover:shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200">
                    <Link href="/quiz">
                      <CardContent className="p-6 text-center">
                        <Zap className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                        <h3 className="font-semibold mb-2 text-base">Hızlı Test</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {userSettings.studyPreferences.questionsPerQuiz} soruluk hızlı test çöz
                        </p>
                      </CardContent>
                    </Link>
                  </Card>

                  <Card className="border-gradient-question hover:shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200">
                    <Link href="/flashcard">
                      <CardContent className="p-6 text-center">
                        <Brain className="h-8 w-8 mx-auto mb-3 text-green-600" />
                        <h3 className="font-semibold mb-2 text-base">Flashcard</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Akıllı kartlarla çalış
                        </p>
                      </CardContent>
                    </Link>
                  </Card>

                  <Card className="border-gradient-question hover:shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200">
                    <Link href="/ai-chat">
                      <CardContent className="p-6 text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                        <h3 className="font-semibold mb-2 text-base">AI Tutor</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Yapay zeka ile sohbet et
                        </p>
                      </CardContent>
                    </Link>
                  </Card>

                  <Card className="border-gradient-question hover:shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200">
                    <Link href="/subject-manager">
                      <CardContent className="p-6 text-center">
                        <Database className="h-8 w-8 mx-auto mb-3 text-indigo-600" />
                        <h3 className="font-semibold mb-2 text-base">Konu Yönetimi</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Konuları düzenle
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <FeatureCards
              title="Dashboard Özellikleri"
              features={dashboardFeatures}
              columns={3}
            />
          </>
        )}
      </div>
    </div>
  );
}
