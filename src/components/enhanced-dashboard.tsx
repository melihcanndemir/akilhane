'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import localStorageService from '@/services/localStorage-service';
import AnalyticsDashboard from './analytics-dashboard';
import MobileNav from './mobile-nav';
import LoadingSpinner from './loading-spinner';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { 
  shouldUseDemoData, 
  toggleDemoMode, 
  loadDemoDataToLocalStorage,
  demoPerformanceData,
  demoRecentResults,
  demoTotalStats
} from '@/data/demo-data';

interface PerformanceData {
  subject: string;
  averageScore: number;
  totalTests: number;
  weakTopics: string[];
  lastUpdated: string;
}

interface QuizResult {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  weakTopics: string[];
  createdAt: string;
}

interface TotalStats {
  totalTests: number;
  averageScore: number;
  totalTimeSpent: number;
  totalSubjects: number;
}

export default function EnhancedDashboard() {
  const { user, loading, isGuest, isAuthenticated } = useLocalAuth();
  const { toast } = useToast();
  
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [recentResults, setRecentResults] = useState<QuizResult[]>([]);
  const [totalStats, setTotalStats] = useState<TotalStats>({
    totalTests: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    totalSubjects: 0
  });
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, percentage: 0 });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useDemoData, setUseDemoData] = useState(true);
  const [userSettings, setUserSettings] = useState({
    studyPreferences: {
      questionsPerQuiz: 10,
      timeLimit: 30,
    }
  });

  // Safely initialize the demo data state
  useEffect(() => {
    setUseDemoData(shouldUseDemoData());
  }, []);

  useEffect(() => {
    if (user && !loading) {
      loadUserData();
    }
  }, [user?.id, loading, useDemoData]);

  // Load user settings
  useEffect(() => {
    const loadSettings = () => {
      try {
        const settings = localStorageService.getUserSettings();
        setUserSettings(settings);
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    };
    
    loadSettings();

    // Listen for storage changes to update settings in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userSettings') {
        loadSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadUserData = async () => {
    if (!user) return;
    
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
      console.log('🎯 Enhanced Dashboard - Loading from localStorage...');
      
      // Fetch data from LocalStorage
      const getDataFromStorage = () => {
        if (typeof window === 'undefined') return null;
        
        try {
          // Load appropriate quiz results based on demo mode
          const quizResultsKey = useDemoData ? 'exam_training_demo_quiz_results' : 'exam_training_quiz_results';
          const quizResults = localStorage.getItem(quizResultsKey);
          const results = quizResults ? JSON.parse(quizResults) : [];
          
          // Filter out demo results if not in demo mode
          const filteredResults = useDemoData ? results : results.filter((result: any) => !result.isDemo);
          
          // Get subject information from Subjects
          const subjects = localStorage.getItem('exam_training_subjects');
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
                totalSubjects: subjectsData.length
              },
              storageInfo: { used: 0, available: 5242880, percentage: 0 }
            };
          }
          
          // Calculate performance data
          const performanceMap: Record<string, any> = {};
          filteredResults.forEach((result: any) => {
            if (!performanceMap[result.subject]) {
              performanceMap[result.subject] = {
                totalTests: 0,
                totalScore: 0,
                weakTopics: {}
              };
            }
            performanceMap[result.subject].totalTests++;
            performanceMap[result.subject].totalScore += result.score;
            
            // Add weak topics
            if (result.weakTopics) {
              Object.entries(result.weakTopics).forEach(([topic, count]) => {
                performanceMap[result.subject].weakTopics[topic] = 
                  (performanceMap[result.subject].weakTopics[topic] || 0) + (count as number);
              });
            }
          });
          
          const performanceData = Object.entries(performanceMap).map(([subject, data]: [string, any]) => ({
            subject,
            averageScore: Math.round((data.totalScore / data.totalTests) * 100),
            totalTests: data.totalTests,
            weakTopics: Object.entries(data.weakTopics)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 3)
              .map(([topic]) => topic),
            lastUpdated: new Date().toISOString()
          }));
          
          // Recent results
          const recentResults = filteredResults
            .slice(-5)
            .map((result: any) => ({
              id: result.id,
              subject: result.subject,
              score: result.score,
              totalQuestions: result.totalQuestions,
              timeSpent: result.timeSpent || 0,
              weakTopics: result.weakTopics ? Object.keys(result.weakTopics) : [],
              createdAt: result.createdAt
            }));
          
          // Total stats
          const totalTests = filteredResults.length;
          const totalScore = filteredResults.reduce((sum: number, result: any) => sum + result.score, 0);
          const averageScore = totalTests > 0 ? Math.round((totalScore / totalTests) * 100) : 0;
          const totalTimeSpent = filteredResults.reduce((sum: number, result: any) => sum + (result.timeSpent || 0), 0);
          
          const totalStats = {
            totalTests,
            averageScore,
            totalTimeSpent: Math.floor(totalTimeSpent / 60), // convert to minutes
            totalSubjects: subjectsData.length
          };
          
          // Storage info (simple calculation)
          const used = JSON.stringify(filteredResults).length + JSON.stringify(subjectsData).length;
          const storageInfo = {
            used,
            available: 5242880, // 5MB
            percentage: Math.min((used / 5242880) * 100, 100)
          };
          
          return {
            performanceData,
            recentResults,
            totalStats,
            storageInfo
          };
        } catch (error) {
          console.error('Error loading data from localStorage:', error);
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
          totalSubjects: 0
        });
        setStorageInfo({ used: 0, available: 5242880, percentage: 0 });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    if (!isGuest) {
      toast({
        title: "Bu özellik sadece misafir kullanıcılar içindir",
        description: "Giriş yapmış kullanıcılar verilerini profil ayarlarından yönetebilir.",
        variant: "destructive"
      });
      return;
    }

    try {
      const data = localStorageService.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `akilhane-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Veriler başarıyla dışa aktarıldı",
        description: "Yedek dosyanız indirildi. Bu dosyayı güvenli bir yerde saklayın.",
      });
    } catch {
      toast({
        title: "Dışa aktarma hatası",
        description: "Veriler dışa aktarılırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const handleImportData = () => {
    if (!isGuest) {
      toast({
        title: "Bu özellik sadece misafir kullanıcılar içindir",
        description: "Giriş yapmış kullanıcılar verilerini profil ayarlarından yönetebilir.",
        variant: "destructive"
      });
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
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
                description: "Yedek verileriniz geri yüklendi. Sayfa yenileniyor...",
              });
              setTimeout(() => window.location.reload(), 1500);
            } else {
              throw new Error('Import failed');
            }
          } catch {
            toast({
              title: "İçe aktarma hatası",
              description: "Dosya formatı geçersiz veya bozuk.",
              variant: "destructive"
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
        title: "🎯 BTK Hackathon Demo Modu Aktif",
        description: "Demo veriler yüklendi. Sayfa yenileniyor...",
      });
      setTimeout(() => window.location.reload(), 1000);
    } else {
      // Clear demo quiz results when exiting demo mode
      if (typeof window !== 'undefined') {
        localStorage.removeItem('exam_training_demo_quiz_results');
      }
      toast({
        title: "Demo modu kapatıldı",
        description: "Demo testler temizlendi. Gerçek veriler kullanılacak. Sayfa yenileniyor...",
      });
      setTimeout(() => window.location.reload(), 1000);
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
              Dashboard'a erişmek için giriş yapmanız gerekiyor.
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
                Hoş geldiniz, {isGuest ? (user as any)?.name : (user as any)?.email || 'Kullanıcı'}! 
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
                  <Label htmlFor="demo-mode" className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:text-indigo-600 transition-colors">
                    BTK Demo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="analytics-mode"
                    checked={showAnalytics}
                    onCheckedChange={setShowAnalytics}
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                  <Label htmlFor="analytics-mode" className="hover:text-indigo-600 transition-colors">Analitik Görünüm</Label>
                </div>
              </div>
              
              {/* Settings Button - Separate Group */}
              <div className="flex justify-start sm:justify-end">
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0">
                    <Settings className="h-4 w-4 mr-2" />
                    Ayarlar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          {/* UPDATED SECTION END */}

          {/* BTK Hackathon Demo Mode Alert */}
          {useDemoData && (
            <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
              <Trophy className="h-4 w-4" />
              <AlertDescription>
                <strong>🎯 BTK Hackathon Demo Modu Aktif!</strong> Bu veriler jüri sunumu için hazırlanmış demo verileridir. 
                Gerçek kullanım deneyimini görmek için demo modunu kapatabilirsiniz.
                <div className="mt-2 text-xs text-orange-700 dark:text-orange-300">
                  ✨ 157 test • %84.2 başarı oranı • 7 farklı konu • 78 saat çalışma
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Guest User Alert */}
          {isGuest && !useDemoData && (
            <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <Users className="h-4 w-4" />
              <AlertDescription>
                <strong>Misafir modunda kullanıyorsunuz.</strong> Verileriniz sadece bu cihazda saklanıyor. 
                Kalıcı kayıt için{' '}
                <Link href="/login?mode=register" className="text-blue-600 hover:underline font-medium">
                  ücretsiz hesap oluşturun
                </Link>
                {' '}veya verilerinizi yedekleyin.
                {/* OPTIONAL UPDATE */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button onClick={handleExportData} size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Yedekle
                  </Button>
                  <Button onClick={handleImportData} size="sm" variant="outline">
                    <Upload className="h-3 w-3 mr-1" />
                    Geri Yükle
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Storage Usage for Guest Users */}
          {isGuest && !useDemoData && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Depolama Kullanımı</CardTitle>
                  <HardDrive className="h-4 w-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Kullanılan: {(storageInfo.used / 1024).toFixed(1)} KB</span>
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
                      Depolama alanınız dolmak üzere. Eski verileri silin veya yedekleyin.
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
                  <CardTitle className="text-sm font-medium">Toplam Test</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{totalStats.totalTests}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalStats.totalSubjects} farklı konuda
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gradient-question hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ortalama Başarı</CardTitle>
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
                  <CardTitle className="text-sm font-medium">Toplam Süre</CardTitle>
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
                  <CardTitle className="text-sm font-medium">Aktif Konular</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600">{totalStats.totalSubjects}</div>
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
                          <div key={index} className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-b-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-lg">{subject.subject}</h4>
                              <Badge 
                                className={`text-sm ${
                                  subject.averageScore >= 80 ? 'badge-gradient-high' : 
                                  subject.averageScore >= 70 ? 'badge-gradient-medium' : 
                                  'badge-gradient-low'
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
                              <span>{new Date(subject.lastUpdated).toLocaleDateString('tr-TR')}</span>
                            </div>
                            {subject.weakTopics.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Geliştirilmesi gereken konular:</p>
                                <div className="flex flex-wrap gap-1">
                                  {subject.weakTopics.slice(0, 3).map((topic, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                  {subject.weakTopics.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{subject.weakTopics.length - 3} diğer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Henüz test çözmediniz.</p>
                        <p className="text-sm">İlk testinizi çözerek performansınızı takip etmeye başlayın!</p>
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
                    <CardDescription>
                      En son çözdüğünüz testler
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentResults.length > 0 ? (
                      <div className="space-y-4">
                        {recentResults.map((result) => (
                          <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{result.subject}</p>
                              <p className="text-xs text-gray-500">
                                {result.score}/{result.totalQuestions} doğru • {Math.round(result.timeSpent / 60)}dk
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                className={`${
                                  (result.score / result.totalQuestions) >= 0.8 ? 'badge-gradient-high' : 
                                  (result.score / result.totalQuestions) >= 0.7 ? 'badge-gradient-medium' : 
                                  'badge-gradient-low'
                                }`}
                              >
                                %{Math.round((result.score / result.totalQuestions) * 100)}
                              </Badge>
                              {(result.score / result.totalQuestions) >= 0.8 ? 
                                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                <XCircle className="h-4 w-4 text-red-500" />
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Henüz test sonucunuz yok.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <Card className="border-gradient-question hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transition-transform duration-200">
                <Link href="/quiz">
                  <CardContent className="p-8 text-center">
                    <Zap className="h-10 w-10 mx-auto mb-4 text-blue-600" />
                    <h3 className="font-semibold mb-3 text-lg">Hızlı Test</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {userSettings.studyPreferences.questionsPerQuiz} soruluk hızlı test çöz
                    </p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="border-gradient-question hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transition-transform duration-200">
                <Link href="/flashcard">
                  <CardContent className="p-8 text-center">
                    <Brain className="h-10 w-10 mx-auto mb-4 text-green-600" />
                    <h3 className="font-semibold mb-3 text-lg">Flashcard</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Akıllı kartlarla çalış</p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="border-gradient-question hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transition-transform duration-200">
                <Link href="/ai-chat">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-10 w-10 mx-auto mb-4 text-purple-600" />
                    <h3 className="font-semibold mb-3 text-lg">AI Tutor</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Yapay zeka ile sohbet et</p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="border-gradient-question hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transition-transform duration-200">
                <Link href="/subject-manager">
                  <CardContent className="p-8 text-center">
                    <Database className="h-10 w-10 mx-auto mb-4 text-indigo-600" />
                    <h3 className="font-semibold mb-3 text-lg">Konu Yönetimi</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Konuları düzenle</p>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}