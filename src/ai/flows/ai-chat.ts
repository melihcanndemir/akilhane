"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const AiChatInputSchema = z.object({
  message: z.string().describe("Kullanıcının gönderdiği mesaj"),
  subject: z.string().describe("Hangi ders konusunda konuşuyoruz"),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        timestamp: z.string(),
      }),
    )
    .describe("Önceki konuşma geçmişi"),
  context: z.string().optional().describe("Ek bağlam bilgisi (soru, konu vs.)"),
});

export type AiChatInput = z.infer<typeof AiChatInputSchema>;

const AiChatOutputSchema = z.object({
  response: z.string().describe("AI'nın cevabı"),
  confidence: z.number().describe("AI güven seviyesi (0-1)"),
  suggestedTopics: z.array(z.string()).describe("Önerilen konular"),
  followUpQuestions: z
    .array(z.string())
    .describe("Öğrencinin AI'ya sorabileceği takip soruları"),
  learningTips: z.array(z.string()).describe("Öğrenme ipuçları"),
});

export type AiChatOutput = z.infer<typeof AiChatOutputSchema>;

export async function getAiChatResponse(
  input: AiChatInput,
): Promise<AiChatOutput> {
  try {
    const response = await aiChatFlow(input);
    return response;
  } catch {
    return {
      response:
        "Üzgünüm, bir hata oluştu ve isteğinizi işleyemedim. Lütfen daha sonra tekrar deneyin.",
      confidence: 0.1,
      suggestedTopics: [],
      followUpQuestions: [],
      learningTips: [],
    };
  }
}

const PromptInputSchema = z.object({
  ...AiChatInputSchema.shape,
  conversationHistory: z
    .string()
    .describe("Formata dönüştürülmüş konuşma geçmişi metni"),
});

const prompt = ai.definePrompt({
  name: "aiChatPrompt",
  input: { schema: PromptInputSchema },
  output: { schema: AiChatOutputSchema },
  prompt: `
    ## ROLÜN
    Sen, öğrencilere karmaşık konuları basit ve anlaşılır bir dille açıklayan uzman bir öğretmensin (AI Tutor). Seninle konuşan kişi bir öğrenci.

    ## ANA GÖREVİN (EN ÖNEMLİ)
    1.  Öğrencinin son mesajını ("ÖĞRENCİNİN SORUSU" bölümündeki) analiz et.
    2.  Bu soruya **DOĞRUDAN, NET ve EKSİKSİZ** bir cevap ver.
    3.  Cevabını verdikten sonra, konuyu pekiştirmek için ek bilgiler, örnekler veya sorular sun.

    ## İŞLEM ADIMLARI
    - **ADIM 1: SORUYU CEVAPLA:** İlk olarak, öğrencinin sorusuna odaklan ve tatmin edici bir yanıt oluştur. Bilmiyorsan, bilmediğini söyle ama konuyu araştırmasına yardımcı ol.
    - **ADIM 2: ÖĞRETMEN GİBİ DAVRAN:** Cevabını verdikten sonra samimi, teşvik edici ve öğretmen tarzı bir dil kullan. Konuyu pekiştirmek için ek materyaller sun.
    - **ADIM 3: ETKİLEŞİMİ SÜRDÜR:** Öğrencinin sorabileceği mantıklı takip soruları ('followUpQuestions') ve ilgili konular ('suggestedTopics') önererek sohbeti canlı tut.

    ## DİKKAT EDİLECEKLER
    - **ASLA** soruyu görmezden gelip genel bir "Merhaba, nasıfsın?" mesajı atma.
    - **ÖNCELİK HER ZAMAN SORUYU CEVAPLAMAKTIR.** Rol yapmak ikincil görevindir.
    - Konuşma geçmişini ('conversationHistory') dikkate alarak tutarlı ol.
    - Asla "Ben bir yapay zekayım" deme.

    ---

    ## Konuşma Bilgileri

    - **DERS KONUSU:** {{{subject}}}
    
    - **GEÇMİŞ KONUŞMA:**
    {{{conversationHistory}}}

    - **ÖĞRENCİNİN YENİ SORUSU:**
    {{{message}}}

    ---

    Şimdi, yukarıdaki talimatlara göre öğrencinin sorusunu cevapla.
  `,
});

const aiChatFlow = ai.defineFlow(
  {
    name: "aiChatFlow",
    inputSchema: AiChatInputSchema,
    outputSchema: AiChatOutputSchema,
  },
  async (input) => {
    const formattedHistory = input.conversationHistory
      .map((msg) => {
        const prefix = msg.role === "user" ? "Öğrenci" : "Öğretmen";
        return `${prefix}: ${msg.content}`;
      })
      .join("\n");

    const { output } = await prompt({
      ...input,
      conversationHistory: formattedHistory,
    });

    if (!output) {
      throw new Error("AI output was null or undefined.");
    }
    return output;
  },
);
