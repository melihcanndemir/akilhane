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
    // Check if AI is properly configured
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
      console.error("AI API key not found");
      return {
        response: "AI servisi yapılandırılmamış. Lütfen sistem yöneticisi ile iletişime geçin.",
        confidence: 0.0,
        suggestedTopics: [],
        followUpQuestions: [],
        learningTips: [],
      };
    }

    const response = await aiChatFlow(input);
    return response;
  } catch (error) {
    console.error("AI Chat Error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Üzgünüm, bir hata oluştu ve isteğinizi işleyemedim. Lütfen daha sonra tekrar deneyin.";
    
    if (error instanceof Error) {
      if (error.message.includes("rate limit") || error.message.includes("quota")) {
        errorMessage = "AI servisi şu anda yoğun. Lütfen birkaç dakika sonra tekrar deneyin.";
      } else if (error.message.includes("API key") || error.message.includes("authentication")) {
        errorMessage = "AI servisi yapılandırma hatası. Lütfen sistem yöneticisi ile iletişime geçin.";
      } else if (error.message.includes("network") || error.message.includes("timeout")) {
        errorMessage = "Bağlantı sorunu yaşanıyor. Lütfen internet bağlantınızı kontrol edin.";
      }
    }
    
    return {
      response: errorMessage,
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
    4.  Eğer konu görsel açıklama gerektiriyorsa, "Bu konu için bir görsel oluşturabilirim" gibi ifadeler kullan.

    ## İŞLEM ADIMLARI
    - **ADIM 1: SORUYU CEVAPLA:** İlk olarak, öğrencinin sorusuna odaklan ve tatmin edici bir yanıt oluştur. Bilmiyorsan, bilmediğini söyle ama konuyu araştırmasına yardımcı ol.
    - **ADIM 2: ÖĞRETMEN GİBİ DAVRAN:** Cevabını verdikten sonra samimi, teşvik edici ve öğretmen tarzı bir dil kullan. Konuyu pekiştirmek için ek materyaller sun.
    - **ADIM 3: GÖRSEL ÖNERİSİ:** Eğer konu matematik formülleri, biyoloji diyagramları, fizik şemaları, kimya molekülleri gibi görsel açıklama gerektiriyorsa, "Bu konu için bir görsel oluşturabilirim" veya "Bu konuyu görsel olarak açıklayabilirim" gibi ifadeler kullan.
    - **ADIM 4: ETKİLEŞİMİ SÜRDÜR:** Öğrencinin sorabileceği mantıklı takip soruları ('followUpQuestions') ve ilgili konular ('suggestedTopics') önererek sohbeti canlı tut.

    ## DİKKAT EDİLECEKLER
    - **ASLA** soruyu görmezden gelip genel bir "Merhaba, nasıfsın?" mesajı atma.
    - **ÖNCELİK HER ZAMAN SORUYU CEVAPLAMAKTIR.** Rol yapmak ikincil görevindir.
    - Konuşma geçmişini ('conversationHistory') dikkate alarak tutarlı ol.
    - Asla "Ben bir yapay zekayım" deme.
    - Görsel gerektiren konularda mutlaka görsel önerisi yap.

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
