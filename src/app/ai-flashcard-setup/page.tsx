"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Key,
  Settings,
  Code,
  Terminal,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Brain,
  Zap,
  BookOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AIFlashcardSetupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı!",
      description: "Metin panoya kopyalandı",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push("/flashcard-manager")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Flashcard Yöneticisi&apos;ne Dön
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              AI Flashcard Kurulum Rehberi
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Yapay zeka özelliklerini aktifleştirmek için gerekli adımları takip edin
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Brain className="w-3 h-3 mr-1" />
                AI Entegrasyonu
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Gerekli
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 max-w-3xl mx-auto gap-2 sm:gap-0 h-auto sm:h-10 p-2 sm:p-1">
            <TabsTrigger value="overview" className="flex items-center justify-center gap-2 text-sm">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Genel Bakış</span>
              <span className="sm:hidden">Genel</span>
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center justify-center gap-2 text-sm">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Kurulum</span>
              <span className="sm:hidden">Kurulum</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center justify-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Test</span>
              <span className="sm:hidden">Test</span>
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="flex items-center justify-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Sorun Giderme</span>
              <span className="sm:hidden">Sorun</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Flashcard Özellikleri
                  </CardTitle>
                  <CardDescription>
                    Yapay zeka ile flashcard üretimi ve özelleştirme
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        🚀 Otomatik Üretim
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Konuya özel flashcard&apos;lar</li>
                        <li>• Zorluk seviyesi ayarlama</li>
                        <li>• Türkçe dil desteği</li>
                        <li>• Kalite kontrol</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                        🎯 Akıllı Özelleştirme
                      </h4>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        <li>• Özel yönergeler</li>
                        <li>• Çalışma ipuçları</li>
                        <li>• İyileştirme önerileri</li>
                        <li>• Performans analizi</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      💡 Neden AI Flashcard?
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Yapay zeka, öğrenme sürecinizi hızlandırır ve kişiselleştirilmiş içerik üretir.
                      Zaman tasarrufu sağlar, konuları daha iyi anlamanıza yardımcı olur ve
                      çalışma verimliliğinizi artırır.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-orange-600" />
                    Gereksinimler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Google Gemini API Anahtarı</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ücretsiz hesap oluşturun ve API anahtarı alın
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">İnternet Bağlantısı</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          AI servislerine erişim için gerekli
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Modern Web Tarayıcısı</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Chrome, Firefox, Safari, Edge (güncel sürüm)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Setup Tab */}
          <TabsContent value="setup">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Adım 1: Google Gemini API Anahtarı Alın
                  </CardTitle>
                  <CardDescription>
                    Google AI Studio&apos;dan ücretsiz API anahtarı edinin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">
                          Google AI Studio&apos;ya Gidin
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                          <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            https://aistudio.google.com/app/apikey
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">
                          Google Hesabınızla Giriş Yapın
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Gmail hesabınızla oturum açın
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">
                          &quot;Create API Key&quot; Butonuna Tıklayın
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Yeni bir API anahtarı oluşturun
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">
                          API Anahtarını Kopyalayın
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Oluşturulan anahtarı güvenli bir yere kaydedin
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          ⚠️ Güvenlik Uyarısı
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          API anahtarınızı kimseyle paylaşmayın ve public repository&apos;lere yüklemeyin.
                          Bu anahtar, AI servislerine erişim sağlar.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-green-600" />
                    Adım 2: Environment Variable Ayarlayın
                  </CardTitle>
                  <CardDescription>
                    API anahtarını sisteminizde tanımlayın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Windows PowerShell (Önerilen)</h4>
                      <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span>PowerShell Komutu:</span>
                          <Button
                            onClick={() => copyToClipboard('$env:GEMINI_API_KEY=&quot;your-api-key-here&quot;')}
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Kopyala
                          </Button>
                        </div>
                        <code>$env:GEMINI_API_KEY=&quot;your-api-key-here&quot;</code>
                      </div>
                                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          &quot;your-api-key-here&quot; kısmını gerçek API anahtarınızla değiştirin
                        </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Windows Command Prompt</h4>
                      <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span>CMD Komutu:</span>
                          <Button
                            onClick={() => copyToClipboard('set GEMINI_API_KEY=your-api-key-here')}
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Kopyala
                          </Button>
                        </div>
                        <code>set GEMINI_API_KEY=your-api-key-here</code>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Kalıcı Ayar (Windows)</h4>
                      <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span>PowerShell Komutu:</span>
                          <Button
                            onClick={() => copyToClipboard('[Environment]::SetEnvironmentVariable(&quot;GEMINI_API_KEY&quot;, &quot;your-api-key-here&quot;, &quot;User&quot;)')}
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Kopyala
                          </Button>
                        </div>
                        <code>[Environment]::SetEnvironmentVariable(&quot;GEMINI_API_KEY&quot;, &quot;your-api-key-here&quot;, &quot;User&quot;)</code>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Bu komut API anahtarını kalıcı olarak kaydeder (bilgisayar yeniden başlatıldıktan sonra da çalışır)
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                          💡 İpucu
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Environment variable&apos;ı ayarladıktan sonra, uygulamayı yeniden başlatmanız gerekebilir.
                          Eğer hala çalışmıyorsa, bilgisayarınızı yeniden başlatmayı deneyin.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-600" />
                    Adım 3: Proje Yapılandırması
                  </CardTitle>
                  <CardDescription>
                    Proje dosyalarında gerekli ayarları yapın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">.env.local Dosyası Oluşturun</h4>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span>Proje kök dizininde .env.local dosyası oluşturun:</span>
                        <Button
                          onClick={() => copyToClipboard('GEMINI_API_KEY=your-api-key-here')}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Kopyala
                        </Button>
                      </div>
                      <code>GEMINI_API_KEY=your-api-key-here</code>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Bu dosyayı .gitignore&apos;a ekleyin ki API anahtarınız public olmasın
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                          ✅ Kurulum Tamamlandı!
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Artık AI flashcard özelliklerini kullanabilirsiniz.
                          Flashcard Yöneticisi&apos;ne dönüp AI sekmesini test edin.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Kurulum Testi
                  </CardTitle>
                  <CardDescription>
                    AI özelliklerinin düzgün çalıştığını doğrulayın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                          Flashcard Yöneticisi&apos;ne Gidin
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          <Button
                            onClick={() => router.push("/flashcard-manager")}
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                          >
                            Flashcard Yöneticisi&apos;ni Aç
                          </Button>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                          AI Sekmesini Seçin
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          &quot;AI Üretimi&quot; sekmesine tıklayın
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                          Test Flashcard&apos;ı Üretin
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Ders ve konu seçin, &quot;AI ile Flashcard Üret&quot; butonuna tıklayın
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                          Sonucu Kontrol Edin
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Flashcard&apos;lar üretildiyse kurulum başarılı!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                          🧪 Test Senaryoları
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• Farklı zorluk seviyeleri test edin</li>
                          <li>• Çeşitli konular deneyin</li>
                          <li>• Farklı kart sayıları üretin</li>
                          <li>• Özel yönergeler ekleyin</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Performans Testi
                  </CardTitle>
                  <CardDescription>
                    AI özelliklerinin performansını ölçün
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">~3-5s</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Ortalama Üretim Süresi</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">95%+</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Başarı Oranı</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">85%+</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Kalite Skoru</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Troubleshooting Tab */}
          <TabsContent value="troubleshooting">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Yaygın Sorunlar ve Çözümleri
                  </CardTitle>
                  <CardDescription>
                    Karşılaşabileceğiniz sorunları çözün
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-900/20">
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                        ❌ &quot;API key not configured&quot; Hatası
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                        Bu hata, GEMINI_API_KEY environment variable&apos;ının ayarlanmadığını gösterir.
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">Çözüm:</p>
                        <ol className="text-xs text-red-600 dark:text-red-400 space-y-1 ml-4">
                          <li>1. PowerShell&apos;i yönetici olarak çalıştırın</li>
                          <li>2. <code>$env:GEMINI_API_KEY=&quot;your-key&quot;</code> komutunu çalıştırın</li>
                          <li>3. Uygulamayı yeniden başlatın</li>
                        </ol>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                        ⚠️ &quot;Failed to generate&quot; Hatası
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-700 mb-2">
                        AI servisi geçici olarak kullanılamıyor olabilir.
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Çözüm:</p>
                        <ol className="text-xs text-orange-600 dark:text-orange-400 space-y-1 ml-4">
                          <li>1. İnternet bağlantınızı kontrol edin</li>
                          <li>2. Birkaç dakika bekleyin</li>
                          <li>3. Daha basit bir konu deneyin</li>
                        </ol>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        🔄 Environment Variable Çalışmıyor
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-700 mb-2">
                        API anahtarı ayarlandı ama hala çalışmıyor.
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Çözüm:</p>
                        <ol className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1 ml-4">
                          <li>1. Bilgisayarı yeniden başlatın</li>
                          <li>2. .env.local dosyası oluşturun</li>
                          <li>3. PowerShell&apos;i yeniden başlatın</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                          🆘 Hala Sorun mu Yaşıyorsunuz?
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Eğer yukarıdaki çözümler işe yaramadıysa, lütfen proje GitHub sayfasında
                          issue açın veya geliştirici ekibi ile iletişime geçin.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-gray-600" />
                    Debug Bilgileri
                  </CardTitle>
                  <CardDescription>
                    Sorun giderme için gerekli bilgileri toplayın
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Environment Variable Kontrolü</h4>
                      <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span>PowerShell&apos;de bu komutu çalıştırın:</span>
                          <Button
                            onClick={() => copyToClipboard('echo $env:GEMINI_API_KEY')}
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Kopyala
                          </Button>
                        </div>
                        <code>echo $env:GEMINI_API_KEY</code>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Eğer boş çıktı alıyorsanız, API anahtarı ayarlanmamış demektir
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Browser Console Kontrolü</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        F12 tuşuna basarak Developer Tools&apos;u açın ve Console sekmesinde hata mesajlarını kontrol edin.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-12">
          <Card className="border-gradient-question bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-center text-xl">
                <Zap className="w-6 h-6 inline mr-2 text-yellow-500" />
                Hızlı Erişim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/flashcard-manager")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Flashcard Test Et
                </Button>
                <Button
                  onClick={() => router.push("/flashcard")}
                  variant="outline"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Flashcard&apos;a Dön
                </Button>
                <Button
                  onClick={() => window.open("https://aistudio.google.com/app/apikey", "_blank")}
                  variant="outline"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  API Anahtarı Al
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
