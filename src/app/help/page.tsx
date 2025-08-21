"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Video,
  MessageSquare,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Download,
  ExternalLink,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import MobileNav from "@/components/mobile-nav";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface TutorialItem {
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "AkılHane nasıl çalışır?",
      answer: "AkılHane, yapay zeka destekli kişiselleştirilmiş eğitim platformudur. Öğrencilerin bireysel ihtiyaçlarına odaklanarak akıllı öğrenme deneyimi sunar. AI Tutor ile sorularınızı sorabilir, Quiz sistemi ile test çözebilir, Flashcard ile tekrar yapabilirsiniz.",
      category: "genel",
    },
    {
      question: "AI Tutor nasıl kullanılır?",
      answer: "AI Tutor sayfasına gidin ve sorunuzu yazın. AI, konuya özel açıklamalar ve çözümler sunacaktır. Sesli asistan özelliği ile konuşarak da soru sorabilirsiniz.",
      category: "ai",
    },
    {
      question: "Quiz sistemi nasıl çalışır?",
      answer: "Quiz sayfasında konu seçin ve test başlatın. Sistem size kişiselleştirilmiş sorular sunar. Sonuçlarınızı analiz eder ve zayıf konularınızı belirler.",
      category: "quiz",
    },
    {
      question: "Flashcard nasıl kullanılır?",
      answer: "Flashcard sayfasında konu seçin. Sistem size bilimsel tekrar algoritması ile kartlar sunar. Bildiğiniz kartları işaretleyin, bilmediklerinizi tekrar göreceksiniz.",
      category: "flashcard",
    },
    {
      question: "Premium özellikler nelerdir?",
      answer: "Premium abonelik ile sınırsız AI soru sorma, gelişmiş analitikler, özel ders planları, sesli asistan ve daha fazla özelliğe erişebilirsiniz.",
      category: "premium",
    },
    {
      question: "Verilerim güvende mi?",
      answer: "Evet, tüm verileriniz şifrelenmiş olarak saklanır. GDPR uyumlu gizlilik politikamız ile verileriniz korunur.",
      category: "güvenlik",
    },
    {
      question: "Kurumsal kullanım mümkün mü?",
      answer: "Evet, okullar ve şirketler için özel kurumsal planlarımız bulunmaktadır. Toplu kullanıcı yönetimi, özel raporlar ve API erişimi sunuyoruz.",
      category: "kurumsal",
    },
    {
      question: "Teknik destek nasıl alabilirim?",
      answer: "İletişim sayfasından bize ulaşabilir, canlı destek hattını arayabilir veya e-posta gönderebilirsiniz. 24/7 destek hizmetimiz bulunmaktadır.",
      category: "destek",
    },
  ];

  const tutorialData: TutorialItem[] = [
    {
      title: "AkılHane'ye Başlangıç",
      description: "Platformun temel özelliklerini öğrenin ve ilk adımlarınızı atın.",
      duration: "5 dakika",
      videoUrl: "https://www.youtube.com/watch?v=example1",
      thumbnail: "/tutorials/getting-started.jpg",
    },
    {
      title: "AI Tutor Kullanımı",
      description: "Yapay zeka destekli öğretmen ile nasıl çalışacağınızı öğrenin.",
      duration: "8 dakika",
      videoUrl: "https://www.youtube.com/watch?v=example2",
      thumbnail: "/tutorials/ai-tutor.jpg",
    },
    {
      title: "Quiz Sistemi Rehberi",
      description: "Test çözme ve sonuçları analiz etme sürecini keşfedin.",
      duration: "6 dakika",
      videoUrl: "https://www.youtube.com/watch?v=example3",
      thumbnail: "/tutorials/quiz-system.jpg",
    },
    {
      title: "Flashcard Teknikleri",
      description: "Akıllı kartlarla etkili öğrenme yöntemlerini öğrenin.",
      duration: "7 dakika",
      videoUrl: "https://www.youtube.com/watch?v=example4",
      thumbnail: "/tutorials/flashcard.jpg",
    },
    {
      title: "Premium Özellikler",
      description: "Premium abonelik ile gelen gelişmiş özellikleri keşfedin.",
      duration: "10 dakika",
      videoUrl: "https://www.youtube.com/watch?v=example5",
      thumbnail: "/tutorials/premium.jpg",
    },
    {
      title: "Analitik ve Raporlar",
      description: "Performansınızı nasıl takip edeceğinizi öğrenin.",
      duration: "9 dakika",
      videoUrl: "https://www.youtube.com/watch?v=example6",
      thumbnail: "/tutorials/analytics.jpg",
    },
  ];

  const categories = [
    { id: "all", name: "Tümü", count: faqData.length },
    { id: "genel", name: "Genel", count: faqData.filter(f => f.category === "genel").length },
    { id: "ai", name: "AI Özellikleri", count: faqData.filter(f => f.category === "ai").length },
    { id: "quiz", name: "Quiz Sistemi", count: faqData.filter(f => f.category === "quiz").length },
    { id: "flashcard", name: "Flashcard", count: faqData.filter(f => f.category === "flashcard").length },
    { id: "premium", name: "Premium", count: faqData.filter(f => f.category === "premium").length },
    { id: "güvenlik", name: "Güvenlik", count: faqData.filter(f => f.category === "güvenlik").length },
    { id: "kurumsal", name: "Kurumsal", count: faqData.filter(f => f.category === "kurumsal").length },
    { id: "destek", name: "Destek", count: faqData.filter(f => f.category === "destek").length },
  ];

  const filteredFAQ = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Yardım Merkezi
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            AkılHane&apos;yi daha etkili kullanmak için ihtiyacınız olan her şey burada
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Yardım arayın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
            <CardContent className="p-6 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Video Eğitimler</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adım adım video rehberler
              </p>
            </CardContent>
          </Card>

          <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Canlı Destek</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                7/24 teknik destek
              </p>
            </CardContent>
          </Card>

          <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Dokümantasyon</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detaylı kullanım kılavuzu
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Sık Sorulan Sorular
                </CardTitle>
                <CardDescription>
                  En çok sorulan sorular ve cevapları
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="text-xs"
                    >
                      {category.name} ({category.count})
                    </Button>
                  ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {filteredFAQ.map((faq, index) => (
                    <Card key={index} className="border border-gray-200 dark:border-gray-700">
                      <CardHeader
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{faq.question}</CardTitle>
                          {expandedFAQ === index ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      </CardHeader>
                      {expandedFAQ === index && (
                        <CardContent>
                          <p className="text-gray-600 dark:text-gray-400">
                            {faq.answer}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>

                {filteredFAQ.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Arama kriterlerinize uygun sonuç bulunamadı.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tutorial Section */}
          <div>
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  Video Eğitimler
                </CardTitle>
                <CardDescription>
                  Adım adım rehberler
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tutorialData.map((tutorial, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <Play className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{tutorial.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {tutorial.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{tutorial.duration}</span>
                          <Button size="sm" variant="outline" className="text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            İzle
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Support Contact */}
            <Card className="border-gradient-question mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Destek İletişimi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">support@akilhane.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="text-sm">+90 (212) 555-0123</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">7/24 Destek</span>
                </div>
                                 <Link href="/contact">
                   <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 mt-4">
                     <MessageSquare className="h-4 w-4 mr-2" />
                     Canlı Destek
                   </Button>
                 </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Documentation Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Dokümantasyon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">Başlangıç Rehberi</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Platforma ilk adım
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-3 w-3 mr-1" />
                  İndir
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">Video Kütüphanesi</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Tüm video eğitimler
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Görüntüle
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold mb-2">API Dokümantasyonu</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Geliştirici rehberi
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Erişim
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gradient-question hover:shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                <h3 className="font-semibold mb-2">Sorun Giderme</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Yaygın sorunlar
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Görüntüle
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
