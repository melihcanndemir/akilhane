'use client';

import React, { useState, useEffect } from 'react';
import SubjectManager from '@/components/subject-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Database, 
  BookOpen, 
  Brain, 
  Users, 
  Settings,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Başlangıç' | 'Orta' | 'İleri';
  questionCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalSubjects: number;
  totalQuestions: number;
  totalCategories: number;
}

export default function SubjectManagerPage() {
  const [stats, setStats] = useState<Stats>({
    totalSubjects: 0,
    totalQuestions: 0,
    totalCategories: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/subjects');
      if (response.ok) {
        const subjects: Subject[] = await response.json();
        
        // Calculate stats
        const totalSubjects = subjects.length;
        const totalQuestions = subjects.reduce((sum, subject) => sum + subject.questionCount, 0);
        const categories = new Set(subjects.map(subject => subject.category));
        const totalCategories = categories.size;

        setStats({
          totalSubjects,
          totalQuestions,
          totalCategories
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-primary" />
              <span className="font-headline font-bold text-xl text-primary">AkılHane</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
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
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
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
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Ayarlar
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Info */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      Ders Yöneticisi
                      <Badge variant="secondary" className="ml-2">
                        <Sparkles className="w-3 h-3 mr-1" />
                        BETA
                      </Badge>
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Dersleri ekleyin, düzenleyin ve yönetin. Her ders için sorular ekleyebilirsiniz.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/question-manager">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Soru Yöneticisi
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Dersler: <strong>{isLoading ? '...' : stats.totalSubjects}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-600" />
                  <span>Toplam Soru: <strong>{isLoading ? '...' : stats.totalQuestions}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span>Kategoriler: <strong>{isLoading ? '...' : stats.totalCategories}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Manager Component */}
          <SubjectManager onStatsUpdate={loadStats} />
        </div>
      </div>
    </div>
  );
} 