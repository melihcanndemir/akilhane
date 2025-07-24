'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Brain, 
  Zap,
  Award,
  Users,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Sparkles
} from 'lucide-react';

interface AnalyticsData {
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  studyTime: number;
  streak: number;
  rank: number;
  totalUsers: number;
  improvement: number;
  weakTopics: string[];
  strongTopics: string[];
  recentActivity: Array<{
    type: string;
    score: number;
    timestamp: string;
  }>;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalQuestions: 0,
    correctAnswers: 0,
    averageScore: 0,
    studyTime: 0,
    streak: 0,
    rank: 0,
    totalUsers: 0,
    improvement: 0,
    weakTopics: [],
    strongTopics: [],
    recentActivity: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time data updates
    const generateMockData = () => {
      const mockData: AnalyticsData = {
        totalQuestions: Math.floor(Math.random() * 500) + 100,
        correctAnswers: Math.floor(Math.random() * 400) + 80,
        averageScore: Math.floor(Math.random() * 30) + 70,
        studyTime: Math.floor(Math.random() * 120) + 30,
        streak: Math.floor(Math.random() * 15) + 5,
        rank: Math.floor(Math.random() * 1000) + 1,
        totalUsers: Math.floor(Math.random() * 5000) + 1000,
        improvement: Math.floor(Math.random() * 20) + 5,
        weakTopics: ['Finansal Analiz', 'Muhasebe', 'İstatistik'],
        strongTopics: ['Matematik', 'Ekonomi', 'Yönetim'],
        recentActivity: [
          { type: 'Quiz', score: 85, timestamp: '2 saat önce' },
          { type: 'Flashcard', score: 90, timestamp: '4 saat önce' },
          { type: 'AI Chat', score: 95, timestamp: '6 saat önce' }
        ]
      };
      setAnalytics(mockData);
      setIsLoading(false);
    };

    generateMockData();
    const interval = setInterval(generateMockData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Mükemmel</Badge>;
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800">İyi</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Orta</Badge>;
    return <Badge className="bg-red-100 text-red-800">Geliştirilmeli</Badge>;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}s ${mins}dk` : `${mins}dk`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Live Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Canlı Analitik Dashboard
        </h2>
        <Badge className="bg-green-100 text-green-800 animate-pulse">
          <Activity className="w-3 h-3 mr-1" />
          CANLI
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Questions */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Soru</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 10) + 5} bugün
            </p>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageScore}%</div>
            <div className="flex items-center gap-2 mt-1">
              {getScoreBadge(analytics.averageScore)}
              <span className="text-xs text-green-600">+{analytics.improvement}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Study Streak */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Çalışma Serisi</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.streak} gün</div>
            <p className="text-xs text-muted-foreground">
              <Award className="w-3 h-3 inline mr-1" />
              Rekor: 21 gün
            </p>
          </CardContent>
        </Card>

        {/* Global Rank */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Sıralama</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{analytics.rank}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalUsers.toLocaleString()} kullanıcı arasında
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-blue-600" />
              Performans İlerlemesi
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Analiz
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Genel Başarı</span>
                <span>{analytics.averageScore}%</span>
              </div>
              <Progress value={analytics.averageScore} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Doğru Cevap Oranı</span>
                <span>{Math.round((analytics.correctAnswers / analytics.totalQuestions) * 100)}%</span>
              </div>
              <Progress value={(analytics.correctAnswers / analytics.totalQuestions) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Çalışma Süresi</span>
                <span>{formatTime(analytics.studyTime)}</span>
              </div>
              <Progress value={Math.min((analytics.studyTime / 120) * 100, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Topic Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              Konu Analizi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-green-700">Güçlü Konular</h4>
              <div className="space-y-2">
                {analytics.strongTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{topic}</span>
                    <Badge className="bg-green-100 text-green-800">Güçlü</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 text-red-700">Geliştirilmesi Gerekenler</h4>
              <div className="space-y-2">
                {analytics.weakTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{topic}</span>
                    <Badge className="bg-red-100 text-red-800">Zayıf</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Son Aktiviteler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${getScoreColor(activity.score)}`}>
                    {activity.score}%
                  </div>
                  {getScoreBadge(activity.score)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 