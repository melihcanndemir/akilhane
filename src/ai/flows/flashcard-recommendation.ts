// src/ai/flows/flashcard-recommendation.ts
"use server";

/**
 * @fileOverview This file defines a Genkit flow to provide intelligent flashcard recommendations based on user performance and learning patterns.
 *
 * It exports:
 * - `getFlashcardRecommendation`: An async function that provides personalized flashcard recommendations.
 * - `FlashcardRecommendationInput`: The input type for the recommendation function.
 * - `FlashcardRecommendationOutput`: The output type for the recommendation function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { getPerformanceHistoryForSubject } from "@/services/performance-service";

const getPerformanceHistoryTool = ai.defineTool(
  {
    name: "getPerformanceHistoryForSubject",
    description:
      "Kullanıcının belirli bir ders için geçmiş quiz performansını alır. Her biri skor ve toplam soru içeren quiz sonuçları dizisi döndürür.",
    inputSchema: z.object({
      subject: z.string().describe("Performans geçmişi alınacak ders."),
      userId: z.string().describe("Kullanıcının ID'si."),
    }),
    outputSchema: z.array(
      z.object({
        score: z.number(),
        totalQuestions: z.number(),
        timeSpent: z.number(),
        date: z.string(),
        weakTopics: z.record(z.string(), z.number()),
      }),
    ),
  },
  async (input) => getPerformanceHistoryForSubject(input.subject, input.userId),
);

const FlashcardRecommendationInputSchema = z.object({
  userId: z.string().describe("Kullanıcının ID'si."),
  subject: z.string().describe("Flashcard önerileri için ders konusu."),
  performanceData: z
    .string()
    .describe(
      "localStorage'dan alınan kullanıcının performans verilerinin JSON string'i.",
    ),
  currentFlashcardData: z
    .string()
    .describe("Kullanıcının mevcut flashcard ilerlemesinin JSON string'i."),
  studyMode: z
    .enum(["review", "new", "difficult"])
    .describe("Kullanıcının şu anda bulunduğu çalışma modu."),
  targetStudyTime: z
    .number()
    .optional()
    .describe("Hedef çalışma süresi (dakika, opsiyonel)."),
});

export type FlashcardRecommendationInput = z.infer<
  typeof FlashcardRecommendationInputSchema
>;

const FlashcardRecommendationOutputSchema = z.object({
  recommendedStudyMode: z
    .enum(["review", "new", "difficult"])
    .describe("Öğrenci için önerilen çalışma modu."),
  recommendedTopics: z
    .array(z.string())
    .describe("Öğrencinin odaklanması gereken spesifik konular."),
  studyStrategy: z
    .string()
    .describe("Kişiselleştirilmiş çalışma stratejisi önerisi (Türkçe)."),
  estimatedTime: z.number().describe("Tahmini çalışma süresi (dakika)."),
  confidence: z.number().describe("AI öneri güven seviyesi (0-1)."),
  reasoning: z
    .string()
    .describe("Bu önerinin neden yapıldığının açıklaması (Türkçe)."),
});

export type FlashcardRecommendationOutput = z.infer<
  typeof FlashcardRecommendationOutputSchema
>;

export async function getFlashcardRecommendation(
  input: FlashcardRecommendationInput,
): Promise<FlashcardRecommendationOutput> {
  // Store the performance data in our mock "service" so the tool can access it.
  const performanceHistory = JSON.parse(input.performanceData);
  (
    getPerformanceHistoryForSubject as unknown as {
      __setData: (data: unknown) => void;
    }
  ).__setData(performanceHistory);

  return flashcardRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: "flashcardRecommendationPrompt",
  input: { schema: FlashcardRecommendationInputSchema },
  output: { schema: FlashcardRecommendationOutputSchema },
  tools: [getPerformanceHistoryTool],
  prompt: `Sen bir Türkçe konuşan akıllı eğitim asistanısın. Flashcard çalışması için kişiselleştirilmiş öneriler veriyorsun.

MUTLAKA 'getPerformanceHistoryForSubject' aracını kullanarak öğrencinin geçmiş performansını al.

Öğrencinin performans verilerini ve mevcut flashcard ilerlemesini analiz ederek akıllı öneriler ver.

## ANALİZ ETMEN GEREKEN FAKTÖRLER:
1. **Son quiz performansı** (son 5 test)
2. **Zayıf konular** (quiz sonuçlarından tespit edilen)
3. **Mevcut flashcard ilerlemesi** ve güven seviyeleri
4. **Çalışma modu tercihleri**
5. **Mevcut çalışma süresi**
6. **Veritabanındaki gerçek sorular** - Artık mock data yok, gerçek sorular var

## ÇALIŞMA MODU ÖNERİLERİ:
- **'review' (Tekrar)**: Yeni öğrenilen kavramları pekiştirmesi gereken öğrenciler için
- **'new' (Yeni)**: Yeni konular keşfetmesi gereken veya yüksek performanslı öğrenciler için
- **'difficult' (Zor)**: Belirli konularda zorlanan veya düşük güven seviyesine sahip öğrenciler için

## KONU ÖNERİLERİ:
- Quiz performansından zayıf konulara odaklan
- Flashcard verilerinde düşük güven seviyesine sahip konuları önceliklendir
- Konu zorluk ilerlemesini göz önünde bulundur
- **Dersin konusuna uygun konulara odaklan** - Öğrencinin çalıştığı derse göre konular öner

## ÇALIŞMA STRATEJİSİ:
- Spesifik, uygulanabilir tavsiyeler ver
- Zaman kısıtlamalarını göz önünde bulundur
- Aralıklı tekrar prensiplerini dahil et
- **Türkçe açıklamalar yap**
- **Gerçek sorulara dayalı öneriler ver** - Mock data yok, veritabanındaki gerçek sorular var
- **Günlük hayattan örnekler ver**
- **Motivasyon ver**

## ÖNEMLİ KURALLAR:
- **Sadece Türkçe konuş**
- **Samimi ve dostane ol**
- **Öğrenciyi cesaretlendir**
- **Pratik öneriler ver**
- **Humor kullan** (ama abartma)
- **Dersin konusuna uygun öneriler ver** - Öğrencinin çalıştığı derse göre konular öner

## ÖĞRENCİ BİLGİLERİ:
Kullanıcı ID: {{{userId}}}
Ders: {{{subject}}}
Mevcut Çalışma Modu: {{{studyMode}}}
Hedef Çalışma Süresi: {{{targetStudyTime}}} dakika

Performans verilerini analiz et ve kapsamlı bir öneri ver. Öğrenciye sanki gerçek bir öğretmenle konuşuyormuş gibi hitap et!`,
});

const flashcardRecommendationFlow = ai.defineFlow(
  {
    name: "flashcardRecommendationFlow",
    inputSchema: FlashcardRecommendationInputSchema,
    outputSchema: FlashcardRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
