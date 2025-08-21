import {
  Brain,
  MessageCircle,
  BookOpen,
  Lightbulb,
  Zap,
  Target,
  BarChart3,
  Trophy,
  TrendingUp,
  Star,
  Play,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Database,
  Users,
} from "lucide-react";
import type { FeatureCard } from "@/components/ui/feature-cards";

// AI Chat Features
export const aiChatFeatures: FeatureCard[] = [
  {
    icon: Brain,
    title: "Akıllı AI Tutor",
    description: "Kişiselleştirilmiş öğrenme deneyimi",
    iconBgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
  },
  {
    icon: MessageCircle,
    title: "Anlık Soru-Cevap",
    description: "Her türlü sorunuza hızlı ve detaylı yanıt",
    iconBgColor: "bg-gradient-to-r from-green-500 to-green-600",
  },
  {
    icon: BookOpen,
    title: "Ders Desteği",
    description: "Tüm derslerde kapsamlı akademik yardım",
    iconBgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
  },
  {
    icon: Lightbulb,
    title: "Akıllı Öneriler",
    description: "Öğrenme konularında kişisel öneriler",
    iconBgColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
  },
  {
    icon: Zap,
    title: "Hızlı Öğrenme",
    description: "Etkili öğrenme teknikleri ve metodları",
    iconBgColor: "bg-gradient-to-r from-red-500 to-pink-500",
  },
  {
    icon: Target,
    title: "Hedef Odaklı",
    description: "Kişisel hedeflerinize göre öğrenme planı",
    iconBgColor: "bg-indigo-500",
  },
];

// Dashboard Features
export const dashboardFeatures: FeatureCard[] = [
  {
    icon: BarChart3,
    title: "Detaylı Analitik",
    description: "Performansınızı derinlemesine analiz edin",
    iconBgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
  },
  {
    icon: Brain,
    title: "Akıllı Öneriler",
    description: "AI destekli kişisel öğrenme tavsiyeleri",
    iconBgColor: "bg-gradient-to-r from-green-500 to-green-600",
  },
  {
    icon: Trophy,
    title: "Başarı Takibi",
    description: "Gelişiminizi görsel olarak izleyin",
    iconBgColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
  },
  {
    icon: TrendingUp,
    title: "Performans Grafikleri",
    description: "İlerlemenizi grafiklerle takip edin",
    iconBgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
  },
  {
    icon: Lightbulb,
    title: "Öğrenme İpuçları",
    description: "Verimli çalışma teknikleri",
    iconBgColor: "bg-gradient-to-r from-red-500 to-pink-500",
  },
  {
    icon: Star,
    title: "Başarı Rozetleri",
    description: "Hedeflerinize ulaştıkça rozetler kazanın",
    iconBgColor: "bg-indigo-500",
  },
];

// Settings Features
export const settingsFeatures: FeatureCard[] = [
  {
    icon: Brain,
    title: "AI Destekli Öğrenme",
    description: "Yapay zeka ile kişiselleştirilmiş eğitim deneyimi",
    iconBgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
  },
  {
    icon: MessageCircle,
    title: "Akıllı AI Tutor",
    description: "Her konuda uzman AI asistanı ile çalışın",
    iconBgColor: "bg-gradient-to-r from-green-500 to-green-600",
  },
  {
    icon: Target,
    title: "Hedef Odaklı Çalışma",
    description: "Kişisel hedeflerinize göre öğrenme planı",
    iconBgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
  },
  {
    icon: Zap,
    title: "Hızlı Test Sistemi",
    description: "Anında test çözme ve sonuç analizi",
    iconBgColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
  },
  {
    icon: Trophy,
    title: "Başarı Takibi",
    description: "Detaylı performans analizi ve gelişim izleme",
    iconBgColor: "bg-gradient-to-r from-red-500 to-pink-500",
  },
  {
    icon: Star,
    title: "Premium Özellikler",
    description: "Gelişmiş analitik ve özel özellikler",
    iconBgColor: "bg-indigo-500",
  },
];

// Quiz Features
export const quizFeatures: FeatureCard[] = [
  {
    icon: Play,
    title: "Hızlı Başlangıç",
    description: "Seçtiğiniz dersle hemen quiz&apos;e başlayın ve bilgilerinizi test edin",
    iconBgColor: "bg-gradient-to-r from-blue-600 to-indigo-600",
  },
  {
    icon: GraduationCap,
    title: "Akıllı Değerlendirme",
    description: "Detaylı sonuç analizi ile zayıf konularınızı tespit edin",
    iconBgColor: "bg-gradient-to-r from-purple-600 to-pink-600",
  },
  {
    icon: BookOpen,
    title: "AI Destekli Öğrenme",
    description: "Yapay zeka ile kişiselleştirilmiş soru önerileri ve akıllı analiz",
    iconBgColor: "bg-gradient-to-r from-green-600 to-emerald-600",
  },
  {
    icon: Brain,
    title: "Kişiselleştirilmiş Sorular",
    description: "Seviyenize uygun sorularla etkili öğrenme",
    iconBgColor: "bg-gradient-to-r from-purple-600 to-pink-600",
  },
  {
    icon: Target,
    title: "Hedef Odaklı Çalışma",
    description: "Belirlediğiniz hedeflere göre quiz planlaması",
    iconBgColor: "bg-gradient-to-r from-blue-500 to-indigo-500",
  },
  {
    icon: TrendingUp,
    title: "Sürekli Gelişim",
    description: "Her quiz&apos;de kendinizi geliştirin ve ilerleyin",
    iconBgColor: "bg-gradient-to-r from-red-500 to-pink-500",
  },
];

// Question Manager Features
export const questionManagerFeatures: FeatureCard[] = [
  {
    icon: Sparkles,
    title: "AI Destekli Soru Üretimi",
    description: "Yapay zeka ile otomatik soru oluşturma ve özelleştirme",
    iconBgColor: "bg-gradient-to-r from-purple-600 to-pink-600",
  },
  {
    icon: Database,
    title: "Gelişmiş Veri Yönetimi",
    description: "Kategorilere göre organize edilmiş soru bankası sistemi",
    iconBgColor: "bg-gradient-to-r from-blue-600 to-indigo-600",
  },
  {
    icon: Target,
    title: "Hedef Odaklı Filtreleme",
    description: "Zorluk seviyesi ve konuya göre akıllı soru filtreleme",
    iconBgColor: "bg-gradient-to-r from-green-600 to-emerald-600",
  },
  {
    icon: Users,
    title: "Çoklu Kullanıcı Desteği",
    description: "Ekip çalışması için paylaşımlı soru yönetimi",
    iconBgColor: "bg-gradient-to-r from-orange-600 to-red-600",
  },
  {
    icon: BarChart3,
    title: "Detaylı İstatistikler",
    description: "Soru ve kategori bazında kapsamlı analitik raporlar",
    iconBgColor: "bg-gradient-to-r from-teal-600 to-cyan-600",
  },
  {
    icon: GraduationCap,
    title: "Akademik Standartlar",
    description: "Eğitim müfredatına uygun kalite kontrol sistemi",
    iconBgColor: "bg-gradient-to-r from-emerald-500 to-teal-600",
  },
];

// Flashcard Features
export const flashcardFeatures: FeatureCard[] = [
  {
    icon: RotateCcw,
    title: "Aralıklı Tekrar",
    description: "Bilimsel algoritma ile optimal tekrar zamanlaması",
    iconBgColor: "bg-gradient-to-r from-blue-600 to-indigo-600",
  },
  {
    icon: TrendingUp,
    title: "Kişiselleştirilmiş Zorluk",
    description: "Seviyenize uygun dinamik zorluk ayarlaması",
    iconBgColor: "bg-gradient-to-r from-purple-600 to-pink-600",
  },
  {
    icon: Target,
    title: "Odaklanmış Modlar",
    description: "Farklı çalışma stillerine uygun özel modlar",
    iconBgColor: "bg-gradient-to-r from-green-600 to-emerald-600",
  },
  {
    icon: BarChart3,
    title: "İlerleme Takibi",
    description: "Detaylı analiz ve performans raporları",
    iconBgColor: "bg-gradient-to-r from-orange-600 to-red-600",
  },
];

// Landing Page Features
export const landingFeatures: FeatureCard[] = [
  {
    icon: Brain,
    title: "AI Destekli Öğrenme",
    description: "Yapay zeka ile kişiselleştirilmiş eğitim deneyimi",
    iconBgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
  },
  {
    icon: Zap,
    title: "Hızlı Test Sistemi",
    description: "Anında quiz çözme ve sonuç analizi",
    iconBgColor: "bg-gradient-to-r from-green-500 to-green-600",
  },
  {
    icon: Trophy,
    title: "Başarı Takibi",
    description: "Detaylı performans analizi ve gelişim izleme",
    iconBgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
  },
  {
    icon: MessageCircle,
    title: "AI Tutor",
    description: "Her konuda uzman AI asistanı ile çalışın",
    iconBgColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
  },
  {
    icon: BookOpen,
    title: "Kapsamlı İçerik",
    description: "Tüm derslerde zengin soru bankası",
    iconBgColor: "bg-gradient-to-r from-red-500 to-pink-500",
  },
  {
    icon: Star,
    title: "Premium Özellikler",
    description: "Gelişmiş analitik ve özel özellikler",
    iconBgColor: "bg-indigo-500",
  },
];
