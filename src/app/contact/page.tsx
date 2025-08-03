"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Building,
  Users,
  Globe,
  MessageSquare,
} from "lucide-react";
import MobileNav from "@/components/mobile-nav";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Formspree entegrasyonu
      const response = await fetch("https://formspree.io/f/xblkaqka", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            İletişim
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            AkılHane ile iletişime geçin. Sorularınızı yanıtlamaya hazırız.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Bize Ulaşın
                </CardTitle>
                <CardDescription>
                  Sorularınızı, önerilerinizi veya işbirliği tekliflerinizi gönderin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Ad Soyad</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Adınız ve soyadınız"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-posta</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="ornek@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Konu</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Mesajınızın konusu"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mesaj</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Mesajınızı buraya yazın..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Mesaj Gönder
                      </>
                    )}
                  </Button>
                </form>

                {submitStatus === "success" && (
                  <Alert className="mt-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === "error" && (
                  <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  AkılHane
                </CardTitle>
                <CardDescription>
                  AI Destekli Eğitim Platformu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">info@akilhane.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="text-sm">+90 (212) 555-0123</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Ankara, Türkiye</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Pzt-Cmt: 09:00-18:00</span>
                </div>
              </CardContent>
            </Card>

            {/* Support Channels */}
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Destek Kanalları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Teknik Destek</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Hızlı
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Satış</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Aktif
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">İşbirliği</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    Açık
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Sosyal Medya
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">📘</span>
                  Facebook
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">📷</span>
                  Instagram
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">🐦</span>
                  Twitter
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">💼</span>
                  LinkedIn
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Sık Sorulan Sorular
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="text-lg">AkılHane nasıl çalışır?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  AkılHane, yapay zeka destekli kişiselleştirilmiş eğitim platformudur.
                  Öğrencilerin bireysel ihtiyaçlarına odaklanarak akıllı öğrenme deneyimi sunar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="text-lg">Ücretsiz mi?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Temel özellikler ücretsizdir. Gelişmiş AI özellikleri için premium abonelik gereklidir.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="text-lg">Hangi dersler mevcut?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Matematik, Fizik, Kimya, Biyoloji, Türkçe, İngilizce ve daha fazlası.
                  Sürekli yeni dersler eklenmektedir.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="text-lg">Kurumsal kullanım mümkün mü?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Evet, okullar ve şirketler için özel kurumsal planlarımız bulunmaktadır.
                  İletişime geçin.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
