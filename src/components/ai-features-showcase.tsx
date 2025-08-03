"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Sparkles,
  Image,
  BookOpen,
  Code2,
  Bot,
  GitBranch,
  Zap,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Palette,
  FileCode,
  Cpu,
  Globe,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function AIFeaturesShowcase() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-900/50 dark:to-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Destekli Özellikler
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Google Gemini, Pollinations.ai ve modern AI teknolojileri ile
              güçlendirilmiş eğitim deneyimi
            </p>
          </div>

          {/* AI Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Topic Explainer */}
            <div className="border-gradient-question p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full rounded-[11px] border-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                    AI Konu Anlatımı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Google Gemini ile dinamik konu anlatımları, adım adım
                    öğrenme ve markdown desteği
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">Google Gemini</Badge>
                    <Badge variant="secondary">Markdown</Badge>
                    <Badge variant="secondary">Dynamic Content</Badge>
                  </div>
                  <Link href="/topic-explainer">
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Deneyin
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* AI Image Generation */}
            <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mb-4">
                    <Image className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    AI Görsel Üretimi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Pollinations.ai ile eğitimsel görseller, konuya özel
                    illüstrasyonlar ve yüksek kaliteli görsel içerik
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">Pollinations.ai</Badge>
                    <Badge variant="secondary">Educational</Badge>
                    <Badge variant="secondary">High Quality</Badge>
                  </div>
                  <Link href="/topic-explainer">
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Görsel Üret
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* AI Chat Assistant */}
            <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    AI Asistan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    7/24 AI destekli öğrenme asistanı, soru-cevap ve
                    kişiselleştirilmiş rehberlik
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">24/7 Support</Badge>
                    <Badge variant="secondary">Personalized</Badge>
                    <Badge variant="secondary">Smart Q&A</Badge>
                    <Badge variant="secondary">AI Tutor</Badge>
                  </div>
                  <Link href="/ai-chat">
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Sohbet Et
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Development Stack */}
            <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
                    <Code2 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Modern Tech Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Next.js 15.3.3, TypeScript, Tailwind CSS ve enterprise-level
                    development tools
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">Next.js 15.3.3</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="secondary">Tailwind CSS</Badge>
                    <Badge variant="secondary">Enterprise</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <GitBranch className="h-3 w-3" />
                      <span>50+ Active Branches</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      <span>Qodo + Cursor Bots</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quality Assurance */}
            <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Quality Assurance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Python proje kontrol scripti, ESLint, TypeScript strict mode
                    ve otomatik test sistemi
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">Python Script</Badge>
                    <Badge variant="secondary">ESLint</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="secondary">Testing</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap className="h-3 w-3" />
                      <span>Automated Testing</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      <span>Production Ready</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hackathon Ready */}
            <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    BTK Hackathon 2025
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    AI Eğitim Kategorisi için özel olarak tasarlanmış,
                    production-ready eğitim platformu
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">AI Education</Badge>
                    <Badge variant="secondary">Production Ready</Badge>
                    <Badge variant="secondary">Hackathon Ready</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <Cpu className="h-3 w-3" />
                      <span>Advanced AI Integration</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileCode className="h-3 w-3" />
                      <span>Enterprise Level</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 rounded-full px-6 py-3 mb-8">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                AI-Powered Education Platform
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/topic-explainer">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  AI Özelliklerini Keşfet
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-3 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Ücretsiz Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
