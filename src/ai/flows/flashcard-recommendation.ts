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
  try {
    // Parse the combined data from localStorage
    const combinedData = JSON.parse(input.performanceData);
    
    // Extract different types of data
    const performanceHistory = combinedData.performanceData || {};
    const quizResults = combinedData.quizResults || [];
    const studyHistory = combinedData.studyHistory || [];
    const flashcardProgress = combinedData.flashcardProgress || [];
    const currentSubject = combinedData.currentSubject || input.subject;
    
    // Set mock data for the performance service tool
    (
      getPerformanceHistoryForSubject as unknown as {
        __setData: (data: unknown) => void;
      }
    ).__setData({
      subject: currentSubject,
      quizResults: quizResults,
      studyHistory: studyHistory,
      flashcardProgress: flashcardProgress,
      performanceData: performanceHistory
    });

    return flashcardRecommendationFlow(input);
  } catch (error) {
    console.error("Error parsing performance data:", error);
    
    // Fallback to basic recommendation if data parsing fails
    return {
      recommendedStudyMode: input.studyMode,
      recommendedTopics: ["Genel Tekrar"],
      studyStrategy: "Veri analizi yapılamadığı için genel bir çalışma stratejisi öneriyorum. Mevcut flashcard'larınızı tekrar edin ve zorlandığınız konulara odaklanın.",
      estimatedTime: input.targetStudyTime || 30,
      confidence: 0.5,
      reasoning: "Veri analizi sırasında bir hata oluştu. Genel öneriler sunuluyor."
    };
  }
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
1. **localStorage'dan gelen veriler**:
   - Quiz sonuçları (quizResults)
   - Çalışma geçmişi (studyHistory) 
   - Performans verileri (performanceData)
   - Flashcard ilerlemesi (flashcardProgress)

2. **Mevcut durum analizi**:
   - Toplam flashcard sayısı
   - İncelenen kart sayısı
   - Öğrenilen kart sayısı (güven seviyesi 4+)
   - Tekrar gereken kart sayısı

3. **Çalışma modu tercihleri** ve hedef süre

## ÇALIŞMA MODU ÖNERİLERİ:
- **'review' (Tekrar)**: Yeni öğrenilen kavramları pekiştirmesi gereken öğrenciler için
- **'new' (Yeni)**: Yeni konular keşfetmesi gereken veya yüksek performanslı öğrenciler için
- **'difficult' (Zor)**: Belirli konularda zorlanan veya düşük güven seviyesine sahip öğrenciler için

## KONU ÖNERİLERİ:
- localStorage'daki quiz sonuçlarından zayıf konulara odaklan
- Flashcard verilerinde düşük güven seviyesine sahip konuları önceliklendir
- Konu zorluk ilerlemesini göz önünde bulundur
- **Dersin konusuna uygun konulara odaklan** - Öğrencinin çalıştığı derse göre konular öner

## ÇALIŞMA STRATEJİSİ:
- Spesifik, uygulanabilir tavsiyeler ver
- Zaman kısıtlamalarını göz önünde bulundur
- Aralıklı tekrar prensiplerini dahil et
- **Türkçe açıklamalar yap**
- **localStorage verilerine dayalı öneriler ver**
- **Günlük hayattan örnekler ver**
- **Motivasyon ver**

## ÖNEMLİ KURALLAR:
- **Sadece Türkçe konuş**
- **Samimi ve dostane ol**
- **Öğrenciyi cesaretlendir**
- **Pratik öneriler ver**
- **Humor kullan** (ama abartma)
- **Dersin konusuna uygun öneriler ver**

## ÖĞRENCİ BİLGİLERİ:
Kullanıcı ID: {{{userId}}}
Ders: {{{subject}}}
Mevcut Çalışma Modu: {{{studyMode}}}
Hedef Çalışma Süresi: {{{targetStudyTime}}} dakika

localStorage'dan gelen tüm verileri analiz et ve kapsamlı bir öneri ver. Öğrenciye sanki gerçek bir öğretmenle konuşuyormuş gibi hitap et!`,
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
