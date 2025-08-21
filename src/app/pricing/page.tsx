"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, X, Star, Zap, Crown, Building, Users, MessageSquare } from "lucide-react";
import MobileNav from "@/components/mobile-nav";
import Link from "next/link";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limitations: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const pricingPlans: PricingPlan[] = [
    {
      id: "free",
      name: "Ücretsiz",
      description: "Bireysel kullanıcılar için temel özellikler",
      price: { monthly: 0, yearly: 0 },
      features: [
        "Günlük 5 AI soru sorma",
        "Temel quiz sistemi",
        "Flashcard özelliği",
        "Temel analitikler",
        "Mobil uygulama erişimi",
        "E-posta desteği",
      ],
      limitations: [
        "Sınırlı AI kullanımı",
        "Temel raporlar",
        "Reklam gösterimi",
        "Sınırlı konu sayısı",
      ],
      icon: <Users className="h-6 w-6" />,
      color: "text-gray-600",
    },
    {
      id: "premium",
      name: "Premium",
      description: "Gelişmiş özellikler ve sınırsız AI erişimi",
      price: { monthly: 499, yearly: 4990 },
      features: [
        "Sınırsız AI soru sorma",
        "Gelişmiş quiz sistemi",
        "Sesli asistan",
        "Detaylı analitikler",
        "Özel ders planları",
        "Öncelikli destek",
        "Reklamsız deneyim",
        "Tüm konulara erişim",
      ],
      limitations: [
        "Kurumsal özellikler yok",
        "API erişimi yok",
      ],
      popular: true,
      icon: <Star className="h-6 w-6" />,
      color: "text-yellow-600",
    },
    {
      id: "enterprise",
      name: "Kurumsal",
      description: "Okullar ve şirketler için özel çözümler",
      price: { monthly: 999, yearly: 9990 },
      features: [
        "Tüm Premium özellikler",
        "Toplu kullanıcı yönetimi",
        "Özel raporlar ve analitikler",
        "API erişimi",
        "Özel entegrasyonlar",
        "7/24 öncelikli destek",
        "Özel eğitim ve danışmanlık",
        "Beyaz etiket çözümleri",
      ],
      limitations: [
        "Minimum 10 kullanıcı",
        "Yıllık sözleşme gerekli",
      ],
      icon: <Building className="h-6 w-6" />,
      color: "text-purple-600",
    },
  ];

  const handlePlanSelect = () => {
    // Burada payment integration başlatılabilir
  };

  const getCurrentPrice = (plan: PricingPlan) => isYearly ? plan.price.yearly : plan.price.monthly;

  const getSavings = (plan: PricingPlan) => {
    if (plan.price.monthly === 0) {return 0;}
    const yearlyTotal = plan.price.monthly * 12;
    const yearlyPrice = plan.price.yearly;
    return Math.round(((yearlyTotal - yearlyPrice) / yearlyTotal) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Fiyatlandırma
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            İhtiyaçlarınıza uygun planı seçin. Tüm planlar 30 gün ücretsiz deneme içerir.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <Label htmlFor="billing-toggle" className="text-sm font-medium">
              Aylık
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-indigo-600"
            />
            <Label htmlFor="billing-toggle" className="text-sm font-medium">
              Yıllık
            </Label>
            {isYearly && (
              <Badge variant="success">
                %20 Tasarruf
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`border-gradient-question relative ${
                plan.popular
                  ? 'ring-2 ring-purple-500 shadow-lg scale-105'
                  : 'hover:shadow-lg transition-shadow'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="purple" className="px-4 py-1">
                    <Crown className="h-3 w-3 mr-1" />
                    En Popüler
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 ${plan.color}`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">
                      ₺{getCurrentPrice(plan)}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-gray-500 ml-2">
                        /{isYearly ? 'yıl' : 'ay'}
                      </span>
                    )}
                  </div>
                  {isYearly && plan.price.monthly > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      %{getSavings(plan)} tasarruf
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Dahil Olan Özellikler:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                      Sınırlamalar:
                    </h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            {limitation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  onClick={() => handlePlanSelect()}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {plan.price.monthly === 0 ? 'Ücretsiz Başla' : 'Planı Seç'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Özellik Karşılaştırması
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 font-semibold">Özellik</th>
                  <th className="text-center py-4 px-6 font-semibold">Ücretsiz</th>
                  <th className="text-center py-4 px-6 font-semibold">Premium</th>
                  <th className="text-center py-4 px-6 font-semibold">Kurumsal</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6 font-medium">AI Soru Sorma</td>
                  <td className="text-center py-4 px-6">5/gün</td>
                  <td className="text-center py-4 px-6">Sınırsız</td>
                  <td className="text-center py-4 px-6">Sınırsız</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6 font-medium">Sesli Asistan</td>
                  <td className="text-center py-4 px-6">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6 font-medium">Detaylı Analitikler</td>
                  <td className="text-center py-4 px-6">Temel</td>
                  <td className="text-center py-4 px-6">Gelişmiş</td>
                  <td className="text-center py-4 px-6">Özel</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6 font-medium">Özel Ders Planları</td>
                  <td className="text-center py-4 px-6">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6 font-medium">API Erişimi</td>
                  <td className="text-center py-4 px-6">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-6 font-medium">Destek</td>
                  <td className="text-center py-4 px-6">E-posta</td>
                  <td className="text-center py-4 px-6">Öncelikli</td>
                  <td className="text-center py-4 px-6">7/24 Özel</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Sık Sorulan Sorular
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="text-lg">30 gün ücretsiz deneme var mı?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Evet, tüm premium planlar 30 gün ücretsiz deneme içerir.
                  İstediğiniz zaman iptal edebilirsiniz.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="text-lg">Plan değiştirebilir miyim?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Evet, istediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz.
                  Değişiklik bir sonraki fatura döneminde geçerli olur.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="text-lg">Kurumsal plan için minimum kullanıcı var mı?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Kurumsal plan için minimum 10 kullanıcı gereklidir.
                  Daha fazla bilgi için bizimle iletişime geçin.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="text-lg">Ödeme yöntemleri nelerdir?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Kredi kartı, banka kartı ve PayPal ile ödeme yapabilirsiniz.
                  Kurumsal müşteriler için fatura ile ödeme seçeneği de mevcuttur.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="border-gradient-question max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Hala karar veremediniz mi?</CardTitle>
              <CardDescription>
                Bizimle iletişime geçin, size en uygun planı önerelim.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link href="/contact">
                   <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                     <MessageSquare className="h-4 w-4 mr-2" />
                     İletişime Geç
                   </Button>
                 </Link>
                                                     <Link href="/contact">
                     <Button variant="outline" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300">
                       <Zap className="h-4 w-4 mr-2" />
                       Demo İste
                     </Button>
                   </Link>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
