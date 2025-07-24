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
import MobileNav from '@/components/mobile-nav';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner';

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
    <div className="min-h-screen">
      {/* Responsive Navigation Bar */}
      <MobileNav />

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Info */}
          <Card className="mb-6 glass-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                      Ders Yöneticisi
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-4 rounded-lg glass-card-inner">
                    <BookOpen className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Ders</p>
                      {isLoading ? <LoadingSpinner className="p-0 h-6 w-6" /> : <p className="text-xl font-bold">{stats.totalSubjects}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-4 rounded-lg glass-card-inner">
                    <Brain className="w-6 h-6 text-purple-500 flex-shrink-0" />
                     <div>
                      <p className="text-sm text-muted-foreground">Toplam Kategori</p>
                       {isLoading ? <LoadingSpinner className="p-0 h-6 w-6" /> : <p className="text-xl font-bold">{stats.totalCategories}</p>}
                    </div>
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