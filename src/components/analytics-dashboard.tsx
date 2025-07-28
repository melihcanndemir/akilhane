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
  Award,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Sparkles
} from 'lucide-react';
import { demoAnalyticsData } from '@/data/demo-data';

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
    subject?: string;
  }>;
  weeklyProgress?: Array<{
    day: string;
    score: number;
    tests: number;
  }>;
  subjectDistribution?: Array<{
    subject: string;
    percentage: number;
    color: string;
  }>;
}

interface AnalyticsDashboardProps {
  useMockData: boolean;
}

// return the useMockData parameter
export default function AnalyticsDashboard({ useMockData }: AnalyticsDashboardProps) {
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
    const generateMockData = () => {
      // Use rich demo data for BTK Hackathon
      if (useMockData) {
        console.log("🎯 BTK Demo Analytics Data yükleniyor...");
        setAnalytics(demoAnalyticsData);
      } else {
        // Simple mock data (old version)
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
          recentActivity: []
        };
        setAnalytics(mockData);
      }
      setIsLoading(false);
    };

    const fetchRealData = async () => {
      try {
        console.log("🎯 Analytics Dashboard - Loading from localStorage...");
        
        // Get data from localStorage
        const getAnalyticsFromStorage = () => {
          if (typeof window === 'undefined') return null;
          
          try {
            // Calculate analytics from quiz results
            const quizResultsKey = useMockData ? 'exam_training_demo_quiz_results' : 'exam_training_quiz_results';
            const quizResults = localStorage.getItem(quizResultsKey);
            const results = quizResults ? JSON.parse(quizResults) : [];
            
            // Filter out demo results if not in demo mode
            const filteredResults = useMockData ? results : results.filter((result: any) => !result.isDemo);
            
            // Get subject information from Subjects
            const subjects = localStorage.getItem('exam_training_subjects');
            const subjectsData = subjects ? JSON.parse(subjects) : [];
            
            // Get question information from Questions
            const questions = localStorage.getItem('exam_training_questions');
            questions ? JSON.parse(questions) : [];
            
            if (filteredResults.length === 0) {
              // If there are no quiz results, use simple mock data
              return {
                totalQuestions: 0,
                correctAnswers: 0,
                averageScore: 0,
                studyTime: 0,
                streak: 0,
                rank: 0,
                totalUsers: 1,
                improvement: 0,
                weakTopics: [],
                strongTopics: [],
                recentActivity: []
              };
            }
            
            // Calculate analytics
            const totalQuestions = filteredResults.reduce((sum: number, result: any) => sum + result.totalQuestions, 0);
            const correctAnswers = filteredResults.reduce((sum: number, result: any) => sum + result.score, 0);
            const averageScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            const studyTime = filteredResults.reduce((sum: number, result: any) => sum + (result.timeSpent || 0), 0);
            
            // Calculate weak topics
            const weakTopicsMap: Record<string, number> = {};
            filteredResults.forEach((result: any) => {
              if (result.weakTopics) {
                Object.entries(result.weakTopics).forEach(([topic, count]) => {
                  weakTopicsMap[topic] = (weakTopicsMap[topic] || 0) + (count as number);
                });
              }
            });
            
            const weakTopics = Object.entries(weakTopicsMap)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 3)
              .map(([topic]) => topic);
            
            // Strong topics (most correctly answered topics)
            const strongTopics = subjectsData
              .filter((subject: any) => subject.isActive)
              .slice(0, 3)
              .map((subject: any) => subject.name);
            
            // Recent activity
            const recentActivity = filteredResults
              .slice(-5)
              .map((result: any) => ({
                type: 'Quiz',
                score: result.score,
                timestamp: result.completedAt,
                subject: result.subject
              }));
            
            return {
              totalQuestions,
              correctAnswers,
              averageScore,
              studyTime: Math.floor(studyTime / 60), // convert to minutes
              streak: Math.min(results.length, 7), // Simple streak calculation
              rank: Math.floor(Math.random() * 1000) + 1, // Mock rank
              totalUsers: 1,
              improvement: Math.floor(Math.random() * 20) + 5,
              weakTopics,
              strongTopics,
              recentActivity
            };
          } catch (error) {
            console.error('Error loading analytics from localStorage:', error);
            return null;
          }
        };
        
        const analyticsData = getAnalyticsFromStorage();
        
        if (analyticsData) {
          setAnalytics(prev => ({...prev, ...analyticsData}));
        } else {
          // Fallback mock data
          const fallbackData: AnalyticsData = {
            totalQuestions: 0,
            correctAnswers: 0,
            averageScore: 0,
            studyTime: 0,
            streak: 0,
            rank: 0,
            totalUsers: 1,
            improvement: 0,
            weakTopics: [],
            strongTopics: [],
            recentActivity: []
          };
          setAnalytics(fallbackData);
        }
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // load data immediately when useMockData changes
    setIsLoading(true);
    
    if (useMockData) {
      console.log("Loading mock analytics data");
      generateMockData();
    } else {
      console.log("Loading real analytics data");
      fetchRealData();
    }
    
    return () => {};
  }, [useMockData]); // add useMockData as a dependency

  // add console log for debugging
  useEffect(() => {
    console.log("Analytics data updated:", analytics);
  }, [analytics]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
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
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Canlı Analitik Dashboard
        </h2>
        <Badge className="bg-green-100 text-green-800 animate-pulse dark:bg-green-900 dark:text-green-200">
          <Activity className="w-3 h-3 mr-1" />
          CANLI
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Questions */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Toplam Cevaplanan Soru</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.totalQuestions.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Tüm zamanlar
            </p>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Ortalama Puan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.averageScore}%</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Genel başarı oranı
            </p>
          </CardContent>
        </Card>

        {/* Study Time */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Toplam Çalışma Süresi</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatTime(analytics.studyTime)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Tüm zamanlar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <LineChart className="w-5 h-5 text-blue-600" />
              Performans İlerlemesi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300">
                <span>Genel Başarı</span>
                <span>{analytics.averageScore}%</span>
              </div>
              <Progress value={analytics.averageScore} className="h-2" />
            </div>
            
            <div>
               <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300">
                <span>Doğru Cevap Oranı</span>
                <span>{analytics.totalQuestions > 0 ? Math.round((analytics.correctAnswers / analytics.totalQuestions) * 100) : 0}%</span>
              </div>
              <Progress value={analytics.totalQuestions > 0 ? (analytics.correctAnswers / analytics.totalQuestions) * 100 : 0} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300">
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
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <PieChart className="w-5 h-5 text-green-600" />
              Konu Analizi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.strongTopics.length === 0 && analytics.weakTopics.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                <p>Yeterli veri toplandığında konu analiziniz burada görünecek.</p>
              </div>
            ) : (
              <>
                {/* Strong Topics */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-green-700 dark:text-green-400">Güçlü Konular</h4>
                  {analytics.strongTopics && analytics.strongTopics.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.strongTopics
                        // If a topic is in weak topics, it will not be shown in strong topics
                        .filter(topic => !analytics.weakTopics.includes(topic))
                        .map((topic, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{topic}</span>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Güçlü</Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Henüz güçlü konu tespit edilmedi.</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Daha fazla test çözerek güçlü konularınızı belirleyin.</p>
                    </div>
                  )}
                </div>

                {/* Weak Topics */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-red-700 dark:text-red-400">Geliştirilmesi Gerekenler</h4>
                  {analytics.weakTopics && analytics.weakTopics.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.weakTopics.map((topic, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{topic}</span>
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Zayıf</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-800 dark:text-green-200">Harika İş!</p>
                      <p className="text-sm text-green-700 dark:text-green-300">Geliştirilmesi gereken konu bulunamadı.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weak and Strong Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Geliştirilmesi Gereken Konular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.weakTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{topic}</span>
                  <Badge variant="destructive" className="text-xs">
                    Zayıf
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Güçlü Olduğunuz Konular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.strongTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{topic}</span>
                  <Badge className="bg-green-100 text-green-800 text-xs dark:bg-green-900 dark:text-green-200">
                    Güçlü
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BTK Hackathon: Weekly Progress Graph */}
      {analytics.weeklyProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <LineChart className="w-5 h-5 text-purple-600" />
              Haftalık İlerleme Analizi
              <Badge className="bg-orange-100 text-orange-800 text-xs dark:bg-orange-900 dark:text-orange-200">BTK Demo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.weeklyProgress.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 w-24">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{day.day}</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <Progress value={day.score} className="h-3" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">%{day.score}</span>
                    <Badge variant="outline" className="text-xs">
                      {day.tests} test
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* BTK Hackathon: Subject Distribution */}
      {analytics.subjectDistribution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <PieChart className="w-5 h-5 text-indigo-600" />
              Konu Bazlı Çalışma Dağılımı
              <Badge className="bg-orange-100 text-orange-800 text-xs dark:bg-orange-900 dark:text-orange-200">BTK Demo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.subjectDistribution.map((subject, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32">
                      <Progress value={subject.percentage} className="h-2" />
                    </div>
                    <span className="text-sm font-semibold w-12 text-gray-700 dark:text-gray-300">%{subject.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Activity className="w-5 h-5 text-blue-600" />
            Son Aktiviteler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    {activity.type === 'Quiz' && <Target className="w-4 h-4 text-blue-500" />}
                    {activity.type === 'Flashcard' && <Brain className="w-4 h-4 text-green-500" />}
                    {activity.type === 'ai_chat' && <Sparkles className="w-4 h-4 text-purple-500" />}
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {activity.type === 'Quiz' && 'Test Çözüldü'}
                        {activity.type === 'Flashcard' && 'Flashcard Çalışması'}
                        {activity.type === 'ai_chat' && 'AI Tutor Sohbeti'}
                      </p>
                      {activity.subject && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.subject}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`${getScoreColor(activity.score)} bg-transparent border border-gray-300 dark:border-gray-600`}
                    >
                      %{activity.score}
                    </Badge>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">Henüz aktivite bulunmuyor.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 