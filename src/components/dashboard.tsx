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
  Home,
  Database,
  GraduationCap,
  Play
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import AnalyticsDashboard from './analytics-dashboard';

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

export default function Dashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [recentResults, setRecentResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load performance analytics
      const performanceResponse = await fetch('/api/analytics/performance');
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setPerformanceData(performanceData);
      } else {
        console.log('Performance API not available, using empty data');
        setPerformanceData([]);
      }

      // Load recent quiz results
      const resultsResponse = await fetch('/api/results?limit=5');
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setRecentResults(resultsData);
      } else {
        console.log('Results API not available, using empty data');
        setRecentResults([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty data on error
      setPerformanceData([]);
      setRecentResults([]);
    } finally {
      setIsLoading(false);
    }
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
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="container mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Dashboard yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-blue-600" />
              <span className="font-headline font-bold text-xl text-blue-600">AkılHane</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Demo
                </Button>
              </Link>
              <Link href="/">
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Home className="w-4 h-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
              <Link href="/question-manager">
                <Button variant="ghost" size="sm">
                  <Database className="w-4 h-4 mr-2" />
                  Soru Yöneticisi
                </Button>
              </Link>
              <Link href="/subject-manager">
                <Button variant="ghost" size="sm">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Ders Yöneticisi
                </Button>
              </Link>
              <Link href="/quiz">
                <Button variant="ghost" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Test Çöz
                </Button>
              </Link>
              <Link href="/flashcard">
                <Button variant="ghost" size="sm">
                  <Brain className="w-4 h-4 mr-2" />
                  Flashcard
                </Button>
              </Link>
              <Link href="/ai-chat">
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  AI Asistan
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4 md:p-8">
        <div className="container mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-headline font-bold text-blue-600">Dashboard</h1>
              <p className="text-muted-foreground">Sınav hazırlık performansınızı takip edin</p>
            </div>
            <div className="flex gap-2">
              <Link href="/question-manager">
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  Soru Ekle
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Ayarlar
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="w-4 h-4" />
                {showAnalytics ? 'Dashboard' : 'Analitik'}
              </Button>
            </div>
          </div>

          {/* Analytics Dashboard */}
          {showAnalytics && (
            <div className="mb-8">
              <AnalyticsDashboard />
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
                  {recentResults.length > 0 ? recentResults.reduce((acc, result) => acc + result.totalQuestions, 0) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Son 30 günde
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
                  {recentResults.length > 0 
                    ? Math.round(recentResults.reduce((acc, result) => acc + result.score, 0) / recentResults.length)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Genel performans
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
                  {recentResults.length > 0 
                    ? formatTime(recentResults.reduce((acc, result) => acc + result.timeSpent, 0))
                    : '0:00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Çalışma süresi
                </p>
              </CardContent>
            </Card>

            <Card>
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
                  Geliştirilmesi gereken
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Analytics */}
            <Card>
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
            <Card>
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

