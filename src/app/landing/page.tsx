'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Users,
  Award,
  Code2,       
  Server,      
  BrainCircuit, 
  GitMerge,     
  Globe,       
  Layers,      
  FileCode,    
  Palette,     
  Package,     
  Database,
  HardDrive,   
  Network,     
  Key,         
  Bot,         
  Cpu,         
  MessageSquare, 
  Lightbulb,   
  UserCheck,   
  GitBranch,   
  ShieldCheck, 
  Code,        
  Sparkles,    
  Smartphone,  
} from 'lucide-react';
import MobileNav from '@/components/mobile-nav';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header - Consistent with all pages */}
      <MobileNav />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <section className="text-center py-8 lg:py-12">
            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-200 dark:border-orange-800 rounded-full px-4 py-2 mb-6">
              <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                BTK Hackathon 2025 Project
              </span>
            </div>

            {/* Main Headline - Following the gradient text pattern */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Destekli
              </span>
              <br />
              <span className="text-foreground">
                Kişiselleştirilmiş Eğitim
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Yapay zeka ile desteklenen akıllı test sistemi, flashcard'lar ve AI tutor ile 
              öğrenme deneyiminizi kişiselleştirin.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                onClick={() => {
                  localStorage.setItem('btk_demo_mode', 'true');
                  window.location.href = '/demo';
                }}
                size="lg" 
                className="w-full sm:w-auto text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Ücretsiz Demo Dene
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-3 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all duration-300 hover:scale-105">
                  <Brain className="h-5 w-5 mr-2" />
                  Dashboard'a Git
                </Button>
              </Link>
            </div>

            {/* Stats - Modern card pattern */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <div className="h-full w-full border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-[11px] p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Hızlı</div>
                  <div className="text-sm text-muted-foreground font-medium">Test (Anında Başla)</div>
                </div>
              </div>
              <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <div className="h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px] p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">Akıllı</div>
                  <div className="text-sm text-muted-foreground font-medium">Analiz (Performans Takibi)</div>
                </div>
              </div>
              <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <div className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-[11px] p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">Flashcard</div>
                  <div className="text-xs text-muted-foreground font-medium">Tekrar Sistemi</div>
                </div>
              </div>
              <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <div className="h-full w-full border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-[11px] p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">AI Asistan</div>
                  <div className="text-sm text-muted-foreground font-medium">(7/24 Destek)</div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gelişmiş Özellikler
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Modern teknolojiler ve yapay zeka ile güçlendirilmiş eğitim deneyimi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* AI-Powered Learning */}
              <motion.div 
                className="rounded-xl border-gradient-question bg-white dark:bg-gray-800 p-[1px]"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20">
                <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">AI Destekli Öğrenme</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Yapay zeka ile kişiselleştirilmiş soru önerileri ve zorluk seviyesi ayarlaması
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Google Gemini</Badge>
                    <Badge variant="secondary">Genkit Framework</Badge>
                  </div>
                </CardContent>
              </Card>
              </motion.div>

              {/* Smart Analytics */}
              <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px]">
                <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                    <CardTitle className="text-xl font-semibold text-foreground">Akıllı Analitik</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Detaylı performans analizleri ve gelişim takibi ile zayıf noktalarınızı keşfedin
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Performance Tracking</Badge>
                    <Badge variant="secondary">Charts</Badge>
                  </div>
                </CardContent>
              </Card>
              </div>

              {/* Progressive Web App */}
              <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-[11px]">
                <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mb-4">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                    <CardTitle className="text-xl font-semibold text-foreground">Progressive Web App</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Mobil cihazınıza yükleyebilir, offline çalışabilir ve native app deneyimi yaşayabilirsiniz
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Offline Support</Badge>
                    <Badge variant="secondary">Mobile Optimized</Badge>
                  </div>
                </CardContent>
              </Card>
              </div>

              {/* Smart Flashcards */}
              <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-[11px]">
                <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                    <CardTitle className="text-xl font-semibold text-foreground">Akıllı Flashcard'lar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    AI tarafından önerilen flashcard'lar ile etkili tekrar sistemleri
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Spaced Repetition</Badge>
                    <Badge variant="secondary">AI Recommendations</Badge>
                  </div>
                </CardContent>
              </Card>
              </div>

              {/* Quick Tests */}
              <div className="border-gradient-yellow p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 dark:from-yellow-500/20 dark:to-amber-500/20 rounded-[11px]">
                <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                    <CardTitle className="text-xl font-semibold text-foreground">Hızlı Test Sistemi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Kişiselleştirilebilir soru sayısı ve zorluk seviyesi ile hızlı değerlendirmeler
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Custom Length</Badge>
                    <Badge variant="secondary">Adaptive Difficulty</Badge>
                  </div>
                </CardContent>
              </Card>
              </div>

              {/* Security & Privacy */}
              <div className="border-gradient-teal p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20 rounded-[11px]">
                <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                    <CardTitle className="text-xl font-semibold text-foreground">Güvenlik & Gizlilik</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Verileriniz güvenli bir şekilde saklanır, gizlilik politikalarımız şeffaftır
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Data Privacy</Badge>
                    <Badge variant="secondary">Secure Storage</Badge>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </section>

          {/* Technology Stack Section */}
          <section id="technology" className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Modern Teknoloji Yığını
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Endüstri standardı teknolojiler ile geliştirilmiş profesyonel platform
              </p>
            </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Frontend */}
            <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Code2 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">Frontend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-slate-700">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-700 dark:text-blue-200">Next.js 15+</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-slate-700">
                    <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-700 dark:text-blue-200">React 18+</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-slate-700">
                    <FileCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-700 dark:text-blue-200">TypeScript</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-slate-700">
                    <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-700 dark:text-blue-200">Tailwind CSS</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-slate-700">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-700 dark:text-blue-200">Shadcn/ui</span>
                  </div>
                </CardContent>
              </Card>
            </div>

              {/* Backend */}
            <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Server className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">Backend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-slate-800/50 rounded-lg border border-green-200 dark:border-slate-700">
                    <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-700 dark:text-green-200">Supabase</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-slate-800/50 rounded-lg border border-green-200 dark:border-slate-700">
                    <HardDrive className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-700 dark:text-green-200">PostgreSQL</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-slate-800/50 rounded-lg border border-green-200 dark:border-slate-700">
                    <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-700 dark:text-green-200">Drizzle ORM</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-slate-800/50 rounded-lg border border-green-200 dark:border-slate-700">
                    <Network className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-700 dark:text-green-200">API Routes</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-slate-800/50 rounded-lg border border-green-200 dark:border-slate-700">
                    <Key className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-700 dark:text-green-200">Authentication</span>
                  </div>
                </CardContent>
              </Card>
            </div>

              {/* AI & ML */}
            <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                    <BrainCircuit className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">AI & ML</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-slate-800/50 rounded-lg border border-purple-200 dark:border-slate-700">
                    <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-purple-700 dark:text-purple-200">Google Gemini</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-slate-800/50 rounded-lg border border-purple-200 dark:border-slate-700">
                    <Cpu className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-purple-700 dark:text-purple-200">Genkit Framework</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-slate-800/50 rounded-lg border border-purple-200 dark:border-slate-700">
                    <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-purple-700 dark:text-purple-200">AI Tutor</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-slate-800/50 rounded-lg border border-purple-200 dark:border-slate-700">
                    <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-purple-700 dark:text-purple-200">Smart Recommendations</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-slate-800/50 rounded-lg border border-purple-200 dark:border-slate-700">
                    <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-purple-700 dark:text-purple-200">Personalization</span>
                  </div>
                </CardContent>
              </Card>
            </div>

              {/* DevOps & Quality */}
            <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                    <GitMerge className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">DevOps & Quality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-slate-800/50 rounded-lg border border-orange-200 dark:border-slate-700">
                    <GitBranch className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-semibold text-orange-700 dark:text-orange-200">CircleCI</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-slate-800/50 rounded-lg border border-orange-200 dark:border-slate-700">
                    <ShieldCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-semibold text-orange-700 dark:text-orange-200">TypeScript Strict</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-slate-800/50 rounded-lg border border-orange-200 dark:border-slate-700">
                    <Code className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-semibold text-orange-700 dark:text-orange-200">ESLint</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-slate-800/50 rounded-lg border border-orange-200 dark:border-slate-700">
                    <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-semibold text-orange-700 dark:text-orange-200">Prettier</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-slate-800/50 rounded-lg border border-orange-200 dark:border-slate-700">
                    <Smartphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-semibold text-orange-700 dark:text-orange-200">PWA</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          </section>

          {/* Demo CTA Section */}
          <section id="demo" className="py-16">
            <div className="glass-card p-8 rounded-xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Hemen Demo'yu Deneyin
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                BTK Hackathon için özel hazırlanmış demo veriler ile platformun tüm özelliklerini keşfedin
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 max-w-4xl mx-auto">
                <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                  <div className="h-full w-full border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-[11px] p-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold mb-2 text-foreground">Kayıt Gerektirmez</h3>
                  <p className="text-muted-foreground text-sm">Hemen denemeye başlayın</p>
                  </div>
                </div>
                <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                  <div className="h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px] p-6 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold mb-2 text-foreground">5 Dakikada Deneyim</h3>
                  <p className="text-muted-foreground text-sm">Tüm özellikleri hızlıca test edin</p>
                  </div>
                </div>
                <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                  <div className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-[11px] p-6 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold mb-2 text-foreground">Gerçek Veriler</h3>
                  <p className="text-muted-foreground text-sm">Hackathon demo verileri ile test edin</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  localStorage.setItem('btk_demo_mode', 'true');
                  window.location.href = '/demo';
                }}
                size="lg" 
                className="text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Play className="h-5 w-5 mr-2" />
                Demo'yu Başlat
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </section>

          {/* Quick Actions - Dashboard Style */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Öğrenme Yolculuğunuzu Başlatın
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                AI destekli kişiselleştirilmiş eğitim deneyimi ile hedeflerinize ulaşın
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 cursor-pointer">
                <div 
                  onClick={() => {
                    localStorage.setItem('btk_demo_mode', 'true');
                    window.location.href = '/quiz';
                  }}
                  className="cursor-pointer"
                >
                  <CardContent className="p-6 text-center">
                      <Zap className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold mb-2 text-foreground">Hızlı Test</h3>
                    <p className="text-sm text-muted-foreground">Test çözmeye hemen başlayın</p>
                  </CardContent>
                </div>
              </Card>
              </div>

              <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 cursor-pointer">
                <Link href="/flashcard">
                  <CardContent className="p-6 text-center">
                      <Brain className="h-8 w-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold mb-2 text-foreground">Flashcard</h3>
                    <p className="text-sm text-muted-foreground">Akıllı kartlarla çalışın</p>
                  </CardContent>
                </Link>
              </Card>
              </div>

              <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 cursor-pointer">
                <Link href="/ai-chat">
                  <CardContent className="p-6 text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
                      <h3 className="font-semibold mb-2 text-foreground">AI Tutor</h3>
                    <p className="text-sm text-muted-foreground">Yapay zeka ile sohbet edin</p>
                  </CardContent>
                </Link>
              </Card>
              </div>

              <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
                <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20 cursor-pointer">
                <Link href="/subject-manager">
                  <CardContent className="p-6 text-center">
                      <Database className="h-8 w-8 mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-semibold mb-2 text-foreground">Konu Yönetimi</h3>
                    <p className="text-sm text-muted-foreground">Konuları düzenleyin</p>
                  </CardContent>
                </Link>
              </Card>
              </div>
            </div>

            {/* Main CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Brain className="h-5 w-5 mr-2" />
                  Dashboard'a Git
                </Button>
              </Link>
              <Button 
                onClick={() => {
                  localStorage.setItem('btk_demo_mode', 'true');
                  window.location.href = '/demo';
                }}
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto text-lg px-8 py-3 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all duration-300 hover:scale-105"
              >
                <Play className="h-5 w-5 mr-2" />
                Demo Dene
              </Button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
} 