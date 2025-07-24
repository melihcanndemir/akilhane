'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Settings,
  BarChart3,
  FileText,
  Users,
  Database
} from 'lucide-react';
import Link from 'next/link';
import AnalyticsDashboard from './analytics-dashboard';
import MobileNav from './mobile-nav'; // Import the new component
import LoadingSpinner from './loading-spinner';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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
}

const mockPerformanceData: PerformanceData[] = [
  {
    subject: 'Matematik',
    averageScore: 75,
    totalTests: 12,
    weakTopics: ['Türev', 'İntegral', 'Limit'],
    lastUpdated: new Date().toISOString(),
  },
  {
    subject: 'Fizik',
    averageScore: 62,
    totalTests: 8,
    weakTopics: ['Optik', 'Dinamik'],
    lastUpdated: new Date().toISOString(),
  },
  {
    subject: 'Tarih',
    averageScore: 91,
    totalTests: 15,
    weakTopics: ['Osmanlı Yükselme Dönemi'],
    lastUpdated: new Date().toISOString(),
  },
];

const mockRecentResults: QuizResult[] = [
  {
    id: 'res1',
    subject: 'Matematik',
    score: 85,
    totalQuestions: 20,
    timeSpent: 1200, // 20 mins
    weakTopics: ['Türev'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'res2',
    subject: 'Tarih',
    score: 95,
    totalQuestions: 10,
    timeSpent: 300, // 5 mins
    weakTopics: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'res3',
    subject: 'Fizik',
    score: 55,
    totalQuestions: 15,
    timeSpent: 950, // ~16 mins
    weakTopics: ['Optik', 'Dinamik'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];


export default function Dashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [recentResults, setRecentResults] = useState<QuizResult[]>([]);
  const [totalStats, setTotalStats] = useState<TotalStats>({ totalTests: 0, averageScore: 0, totalTimeSpent: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const [useMockData, setUseMockData] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    const saved = localStorage.getItem('useMockData');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    // Save preference to localStorage whenever it changes
    if (typeof window !== 'undefined') {
      localStorage.setItem('useMockData', JSON.stringify(useMockData));
    }
    loadDashboardData();
  }, [useMockData]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    if (useMockData) {
      setPerformanceData(mockPerformanceData);
      setRecentResults(mockRecentResults);
      // Mock total stats as well for consistency
      setTotalStats({
        totalTests: 15,
        averageScore: 77,
        totalTimeSpent: 2450,
      });
      setIsLoading(false);
      return;
    }

    try {
      // For real data, we need the user ID
      const userId = localStorage.getItem('userId');
      if (!userId) {
        // If no user, show empty state
        setPerformanceData([]);
        setRecentResults([]);
        setTotalStats({ totalTests: 0, averageScore: 0, totalTimeSpent: 0 });
        setIsLoading(false);
        return;
      }
      
      const headers = new Headers({ 'x-user-id': userId });

      const [performanceResponse, resultsResponse, statsResponse] = await Promise.all([
        fetch('/api/analytics/performance', { headers }),
        fetch('/api/results?limit=5', { headers }),
        fetch('/api/analytics/quick-stats', { headers }),
      ]);

      const perfData = performanceResponse.ok ? await performanceResponse.json() : [];
      const resData = resultsResponse.ok ? await resultsResponse.json() : [];
      const statsData = statsResponse.ok ? await statsResponse.json() : { totalTests: 0, averageScore: 0, totalTimeSpent: 0 };
      
      setPerformanceData(perfData);
      setRecentResults(resData);
      setTotalStats(statsData);

    } catch (error) {
      console.error('Error loading real dashboard data:', error);
      // If any fetch fails, clear all data
      setPerformanceData([]);
      setRecentResults([]);
      setTotalStats({ totalTests: 0, averageScore: 0, totalTimeSpent: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatCardClick = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800">Mükemmel</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">İyi</Badge>;
    return <Badge className="bg-red-100 text-red-800">Geliştirilmeli</Badge>;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MobileNav />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Navigation Bar */}
      <MobileNav />

      <div className="p-4 md:p-8">
        <div className="container mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-headline font-bold text-blue-600">Dashboard</h1>
              <p className="text-muted-foreground">Sınav hazırlık performansınızı takip edin</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
               <div className="flex items-center space-x-2">
                <Switch id="mock-data-switch" checked={useMockData} onCheckedChange={setUseMockData} />
                <Label htmlFor="mock-data-switch">Örnek Veri</Label>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/question-manager">
                  <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Soru Ekle</span>
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Ayarlar</span>
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">{showAnalytics ? 'Dashboard' : 'Analitik'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          {showAnalytics && (
            <div className="mb-8">
              <AnalyticsDashboard useMockData={useMockData} />
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Test</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalStats.totalTests}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tüm zamanlar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ortalama Skor</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalStats.averageScore}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Tüm zamanlar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Süre</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(totalStats.totalTimeSpent)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tüm zamanlar
                </p>
              </CardContent>
            </Card>

            <Card 
              onClick={() => handleStatCardClick('performance-analytics-section')}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Zayıf Konular</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData.length > 0 
                    ? performanceData.reduce((acc, data) => acc + data.weakTopics.length, 0)
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  İncelemek için tıkla
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Analytics */}
            <Card id="performance-analytics-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performans Analizi
                </CardTitle>
                <CardDescription>
                  Ders bazında performans durumunuz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {performanceData.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz performans verisi yok</p>
                    <p className="text-sm text-muted-foreground">İlk testinizi çözerek başlayın</p>
                  </div>
                ) : (
                  performanceData.map((data) => (
                    <div key={data.subject} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{data.subject}</h3>
                        <span className={`font-bold ${getScoreColor(data.averageScore)}`}>
                          {data.averageScore}%
                        </span>
                      </div>
                      <Progress value={data.averageScore} className="h-2" />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{data.totalTests} test</span>
                        <span>{data.weakTopics.length} zayıf konu</span>
                      </div>
                      {data.weakTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {data.weakTopics.slice(0, 3).map((topic, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {data.weakTopics.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{data.weakTopics.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card id="recent-results-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Son Sonuçlar
                </CardTitle>
                <CardDescription>
                  En son çözdüğünüz testler
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentResults.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz test sonucu yok</p>
                    <p className="text-sm text-muted-foreground">İlk testinizi çözerek başlayın</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${result.score >= 60 ? 'bg-blue-100' : 'bg-red-100'}`}>
                            {result.score >= 60 ? (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{result.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.totalQuestions} soru • {formatTime(result.timeSpent)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold text-lg ${getScoreColor(result.score)}`}>
                            {result.score}%
                          </div>
                          {getScoreBadge(result.score)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hızlı Erişim</CardTitle>
              <CardDescription>
                Sık kullandığınız özelliklere hızlı erişim
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href="/quiz">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <BookOpen className="w-6 h-6" />
                    <span>Test Çöz</span>
                  </Button>
                </Link>
                <Link href="/flashcard">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <Brain className="w-6 h-6" />
                    <span>Flashcard</span>
                  </Button>
                </Link>
                <Link href="/ai-chat">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <Users className="w-6 h-6" />
                    <span>AI Asistan</span>
                  </Button>
                </Link>
                <Link href="/question-manager">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <Database className="w-6 h-6" />
                    <span>Soru Yöneticisi</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

