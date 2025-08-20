"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { logError } from "@/lib/error-logger";

const FlashcardGenerationInputSchema = z.object({
  subject: z.string().describe("The subject for which to generate flashcards"),
  topic: z.string().describe("The specific topic within the subject"),
  difficulty: z
    .enum(["Easy", "Medium", "Hard"])
    .describe("The difficulty level of flashcards to generate"),
  count: z.number().min(1).max(20).describe("Number of flashcards to generate"),
  language: z
    .enum(["tr", "en"])
    .default("tr")
    .describe("Language for the flashcards"),
  guidelines: z
    .string()
    .optional()
    .describe("Additional guidelines or requirements for flashcard generation"),
  existingFlashcards: z
    .array(z.string())
    .optional()
    .describe("Existing flashcard questions to avoid duplicates"),
});

export type FlashcardGenerationInput = z.infer<
  typeof FlashcardGenerationInputSchema
>;

const GeneratedFlashcardSchema = z.object({
  question: z.string().describe("The question text for the front of the flashcard"),
  answer: z.string().describe("The answer text for the back of the flashcard"),
  explanation: z
    .string()
    .describe("Detailed explanation of the answer for better understanding"),
  topic: z.string().describe("The specific topic this flashcard covers"),
  difficulty: z
    .enum(["Easy", "Medium", "Hard"])
    .describe("Actual difficulty of the generated flashcard"),
  keywords: z
    .array(z.string())
    .describe("Key concepts covered in the flashcard"),
  learningObjective: z
    .string()
    .describe("What the student should learn from this flashcard"),
  relatedConcepts: z
    .array(z.string())
    .optional()
    .describe("Related concepts that connect to this flashcard"),
});

const FlashcardGenerationOutputSchema = z.object({
  flashcards: z.array(GeneratedFlashcardSchema).describe("Generated flashcards"),
  metadata: z.object({
    totalGenerated: z.number().describe("Total number of flashcards generated"),
    subject: z.string().describe("Subject of the flashcards"),
    topic: z.string().describe("Topic of the flashcards"),
    averageDifficulty: z.string().describe("Average difficulty level"),
    generationTimestamp: z
      .string()
      .describe("When the flashcards were generated"),
    aiModel: z.string().describe("AI model used for generation"),
  }),
  qualityScore: z
    .number()
    .min(0)
    .max(1)
    .describe("Overall quality score of generated flashcards"),
  suggestions: z
    .array(z.string())
    .describe("Suggestions for improving flashcard quality"),
  studyTips: z
    .array(z.string())
    .describe("Study tips for using these flashcards effectively"),
});

export type FlashcardGenerationOutput = z.infer<
  typeof FlashcardGenerationOutputSchema
>;

export async function generateFlashcards(
  input: FlashcardGenerationInput,
): Promise<FlashcardGenerationOutput> {
  try {
    const response = await flashcardGenerationFlow(input);
    return response;
  } catch (error) {
    logError("Flashcard generation error", error, { function: "generateFlashcards" });
    throw new Error("Failed to generate flashcards");
  }
}

const flashcardGenerationFlow = ai.defineFlow(
  {
    name: "flashcardGenerator",
    inputSchema: FlashcardGenerationInputSchema,
    outputSchema: FlashcardGenerationOutputSchema,
  },
  async (input) => {
    const { subject, topic, difficulty, count, language, guidelines } = input;

    // Check if AI is properly configured
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
      throw new Error("AI API key not configured. Please set GEMINI_API_KEY environment variable.");
    }

    // Create the prompt for AI generation
    const prompt = `
    Sen bir eğitim uzmanısın. ${subject} dersinin ${topic} konusu için ${count} adet ${difficulty} seviyesinde flashcard üretmen gerekiyor.

    ${guidelines ? `Özel yönergeler: ${guidelines}` : ""}

    Her flashcard için:
    - Soru: Ön yüzde görünecek, net ve anlaşılır
    - Cevap: Arka yüzde görünecek, doğru ve kapsamlı
    - Açıklama: Öğrencinin konuyu daha iyi anlaması için detaylı açıklama
    - Zorluk: ${difficulty} seviyesine uygun
    - Anahtar kelimeler: Flashcard'da geçen önemli kavramlar
    - Öğrenme hedefi: Bu flashcard'dan ne öğrenilecek

    Dil: ${language === "tr" ? "Türkçe" : "İngilizce"}
    Konu: ${topic}
    Ders: ${subject}
    Zorluk: ${difficulty}
    Kart sayısı: ${count}

    Flashcard'ları JSON formatında üret ve her birinin kaliteli, eğitici ve öğrenci dostu olmasına dikkat et.
    
    IMPORTANT: Return ONLY a valid JSON array with this exact structure for each flashcard:
    [
      {
        "question": "The question text (in Turkish)",
        "answer": "The answer text (in Turkish)", 
        "explanation": "Detailed explanation in Turkish",
        "topic": "The specific topic",
        "difficulty": "${difficulty}",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "learningObjective": "What the student should learn",
        "relatedConcepts": ["concept1", "concept2"]
      }
    ]
    `;

    try {
      // Use the AI flow to generate flashcards
      const aiResponse = await ai.generate(prompt);

      if (!aiResponse.text) {
        throw new Error("AI response is empty");
      }

      // Parse the AI response
      let parsedFlashcards: z.infer<typeof GeneratedFlashcardSchema>[];

      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedFlashcards = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON array found, try to parse the entire response
          parsedFlashcards = JSON.parse(aiResponse.text);
        }
      } catch (parseError) {
        logError("Failed to parse AI response", parseError, {
          rawResponse: aiResponse.text,
          function: "flashcardGenerationFlow",
        });

        // Fallback: create flashcards from the raw text
        const fallbackFlashcards: z.infer<typeof GeneratedFlashcardSchema>[] = [];
        const lines = aiResponse.text.split('\n').filter((line: string) => line.trim());

        for (let i = 0; i < Math.min(count, Math.floor(lines.length / 3)); i++) {
          const question = lines[i * 3] || `Soru ${i + 1}`;
          const answer = lines[i * 3 + 1] || `Cevap ${i + 1}`;
          const explanation = lines[i * 3 + 2] || `Açıklama ${i + 1}`;

          fallbackFlashcards.push({
            question: question.replace(/^[0-9\-\.\s]+/, '').trim(),
            answer: answer.replace(/^[0-9\-\.\s]+/, '').trim(),
            explanation: explanation.replace(/^[0-9\-\.\s]+/, '').trim(),
            topic: "AI Generated",
            difficulty: "Medium" as const,
            keywords: ["AI", "Generated", "Flashcard"],
            learningObjective: "AI tarafından üretilen flashcard ile öğrenme",
            relatedConcepts: [],
          });
        }

        parsedFlashcards = fallbackFlashcards;
      }

      // Validate and process the flashcards
      const validatedFlashcards: z.infer<typeof GeneratedFlashcardSchema>[] = [];

      for (const card of parsedFlashcards) {
        try {
          // Validate each flashcard against the schema
          const validatedCard = GeneratedFlashcardSchema.parse({
            question: card.question || "Soru metni bulunamadı",
            answer: card.answer || "Cevap metni bulunamadı",
            explanation: card.explanation || "Açıklama bulunamadı",
            topic: card.topic || "Genel Konu",
            difficulty: card.difficulty || "Medium",
            keywords: Array.isArray(card.keywords) ? card.keywords : ["AI", "Generated"],
            learningObjective: card.learningObjective || "AI tarafından üretilen flashcard",
            relatedConcepts: Array.isArray(card.relatedConcepts) ? card.relatedConcepts : [],
          });

          validatedFlashcards.push(validatedCard);

          if (validatedFlashcards.length >= count) { break; }
        } catch (validationError) {
          logError("Invalid flashcard format", validationError, {
            card,
            function: "flashcardGenerationFlow",
          });
          // Skip invalid cards
        }
      }

      // Ensure we have the requested number of flashcards
      while (validatedFlashcards.length < count) {
        validatedFlashcards.push({
          question: `Ek Soru ${validatedFlashcards.length + 1}`,
          answer: `Ek Cevap ${validatedFlashcards.length + 1}`,
          explanation: `Bu flashcard AI tarafından üretilmiştir.`,
          topic: "AI Generated",
          difficulty: "Medium" as const,
          keywords: ["AI", "Generated", "Flashcard"],
          learningObjective: "AI tarafından üretilen flashcard ile öğrenme",
          relatedConcepts: [],
        });
      }

      const generatedFlashcards = validatedFlashcards.slice(0, count);

      // Calculate quality score
      const qualityScore = calculateQualityScore(generatedFlashcards);

      // Generate suggestions and study tips
      const suggestions = generateSuggestions(qualityScore);
      const studyTips = generateStudyTips(subject, topic, difficulty);

      return {
        flashcards: generatedFlashcards,
        metadata: {
          totalGenerated: generatedFlashcards.length,
          subject,
          topic,
          averageDifficulty: difficulty,
          generationTimestamp: new Date().toISOString(),
          aiModel: "Google Gemini AI",
        },
        qualityScore,
        suggestions,
        studyTips,
      };

    } catch (error) {
      logError("AI generation error", error, {
        function: "flashcardGenerationFlow",
        subject,
        topic,
        difficulty,
        count,
      });

      // Return fallback flashcards if AI fails
      const fallbackFlashcards: z.infer<typeof GeneratedFlashcardSchema>[] = [];

      for (let i = 0; i < count; i++) {
        fallbackFlashcards.push({
          question: `AI Hatası: Soru ${i + 1} üretilemedi`,
          answer: `AI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.`,
          explanation: `Teknik bir sorun nedeniyle AI flashcard üretimi başarısız oldu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.`,
          topic: "AI Error",
          difficulty: "Medium" as const,
          keywords: ["AI", "Error", "Fallback"],
          learningObjective: "AI hatalarını anlamak ve alternatif çözümler bulmak",
          relatedConcepts: [],
        });
      }

      return {
        flashcards: fallbackFlashcards,
        metadata: {
          totalGenerated: fallbackFlashcards.length,
          subject,
          topic,
          averageDifficulty: difficulty,
          generationTimestamp: new Date().toISOString(),
          aiModel: "Fallback - AI Error",
        },
        qualityScore: 0.1,
        suggestions: ["AI servisi yapılandırılmamış veya hata oluştu"],
        studyTips: ["Lütfen sistem yöneticisi ile iletişime geçin"],
      };
    }
  },
);

function calculateQualityScore(
  flashcards: z.infer<typeof GeneratedFlashcardSchema>[],
): number {
  if (flashcards.length === 0) { return 0; }

  let totalScore = 0;

  flashcards.forEach((flashcard) => {
    let cardScore = 0;

    // Question quality (0-25 points)
    if (flashcard.question.length > 10 && flashcard.question.length < 200) {
      cardScore += 25;
    } else if (flashcard.question.length > 5 && flashcard.question.length < 300) {
      cardScore += 20;
    } else {
      cardScore += 10;
    }

    // Answer quality (0-25 points)
    if (flashcard.answer.length > 15 && flashcard.answer.length < 300) {
      cardScore += 25;
    } else if (flashcard.answer.length > 10 && flashcard.answer.length < 400) {
      cardScore += 20;
    } else {
      cardScore += 10;
    }

    // Explanation quality (0-25 points)
    if (flashcard.explanation.length > 20) {
      cardScore += 25;
    } else if (flashcard.explanation.length > 10) {
      cardScore += 20;
    } else {
      cardScore += 10;
    }

    // Keywords and learning objectives (0-25 points)
    if (flashcard.keywords.length >= 3 && flashcard.learningObjective.length > 10) {
      cardScore += 25;
    } else if (flashcard.keywords.length >= 2 && flashcard.learningObjective.length > 5) {
      cardScore += 20;
    } else {
      cardScore += 10;
    }

    totalScore += cardScore;
  });

  // Convert to 0-1 scale
  return Math.min(1, totalScore / (flashcards.length * 100));
}

function generateSuggestions(
  qualityScore: number,
): string[] {
  const suggestions: string[] = [];

  if (qualityScore < 0.7) {
    suggestions.push("Flashcard'ların açıklama kısımlarını daha detaylı hale getirin");
    suggestions.push("Her flashcard için en az 3 anahtar kelime ekleyin");
    suggestions.push("Öğrenme hedeflerini daha spesifik hale getirin");
  }

  if (qualityScore < 0.8) {
    suggestions.push("Soru ve cevap uzunluklarını optimize edin");
    suggestions.push("İlgili kavramları bağlantılandırın");
  }

  if (qualityScore >= 0.9) {
    suggestions.push("Mükemmel! Flashcard'larınız çok kaliteli");
    suggestions.push("Bu seti diğer öğrencilerle paylaşmayı düşünün");
  }

  return suggestions;
}

function generateStudyTips(
  subject: string,
  topic: string,
  difficulty: string,
): string[] {
  const tips: string[] = [
    `${subject} dersinde ${topic} konusundan her gün en az 5 flashcard çalışın`,
    "Flashcard'ları karıştırarak çalışın, sırayla değil",
    "Zor gelen kartları daha sık tekrarlayın",
    "Her flashcard'ı çalıştıktan sonra kendinize puan verin (1-5)",
    "Haftalık olarak ilerlemenizi takip edin",
    "Yanlış yanıtladığınız kartları ayrı bir gruba alın",
    `${subject} dersinde konu ile ilgili pratik yapın, sadece teorik çalışmayın`,
  ];

  if (difficulty === "Hard") {
    tips.push("Zor kartları günde birkaç kez tekrarlayın");
    tips.push("İlgili konuları da gözden geçirin");
  }

  return tips;
}
