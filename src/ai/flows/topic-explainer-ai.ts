"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const TopicExplainerInputSchema = z.object({
  topic: z.string().describe("The specific topic to explain."),
  subject: z
    .string()
    .describe("The subject area (e.g., mathematics, physics, chemistry)."),
  step: z
    .enum(["tanitim", "ogrenme", "pekistirme", "uygulama", "degerlendirme"])
    .describe("The learning step to generate content for."),
  difficulty: z
    .enum(["easy", "medium", "hard"])
    .describe("The difficulty level of the content."),
  estimatedTime: z
    .number()
    .describe("Estimated time in minutes for this step."),
});

export type TopicExplainerInput = z.infer<typeof TopicExplainerInputSchema>;

const TopicExplainerOutputSchema = z.object({
  title: z.string().describe("The title for this learning step."),
  content: z.string().describe("The main educational content for this step."),
  examples: z.array(z.string()).describe("Relevant examples for this step."),
  tips: z.array(z.string()).describe("Learning tips for this step."),
  visualDescription: z
    .string()
    .describe("Description for AI-generated visual aid."),
  confidence: z
    .number()
    .describe("AI confidence in the generated content (0-1)."),
});

export type TopicExplainerOutput = z.infer<typeof TopicExplainerOutputSchema>;

export async function generateTopicStepContent(
  input: TopicExplainerInput,
): Promise<TopicExplainerOutput> {
  try {
    return await topicExplainerFlow(input);
  } catch {
    // Return fallback content
    return {
      title: `${input.topic} ${
        input.step === "tanitim"
          ? "Tanıtım"
          : input.step === "ogrenme"
            ? "Öğrenme"
            : input.step === "pekistirme"
              ? "Pekiştirme"
              : input.step === "uygulama"
                ? "Uygulama"
                : "Değerlendirme"
      }`,
      content: `${input.topic} konusunun ${input.step} aşamasında öğrenilmesi gereken temel kavramlar ve uygulamalar.`,
      examples: [
        `${input.topic} konusunun günlük hayattaki uygulamaları`,
        `${input.topic} ile ilgili temel kavramlar`,
        `${input.topic} konusunun diğer konularla ilişkisi`,
      ],
      tips: [
        `${input.topic} konusunu adım adım öğrenin`,
        "Her kavramı tam anlamadan geçmeyin",
        "Bol bol pratik yapın",
      ],
      visualDescription: `${input.topic} konusu için görsel yardımcı`,
      confidence: 0.3,
    };
  }
}

const prompt = ai.definePrompt({
  name: "topicExplainerPrompt",
  input: { schema: TopicExplainerInputSchema },
  output: { schema: TopicExplainerOutputSchema },
  prompt: `Sen bir uzman eğitimcisin. Öğrencilere konuları adım adım öğretmek için AI destekli içerik üretiyorsun.

KONU: {{{topic}}}
DERS: {{{subject}}}
ADIM: {{{step}}}
ZORLUK: {{{difficulty}}}
TAHMINİ SÜRE: {{{estimatedTime}}} dakika

## GÖREVİN:

### ADIM TÜRLERİ:
- **tanitim**: Konuya giriş ve motivasyon - "Bu konuyu neden öğreniyoruz?"
- **ogrenme**: Ana kavramları öğrenme - "Temel bilgileri öğrenelim"
- **pekistirme**: Kavramları pekiştirme - "Öğrendiklerimizi sağlamlaştıralım"
- **uygulama**: Basit uygulamalar - "Öğrendiklerimizi kullanalım"
- **degerlendirme**: Öğrendiklerini test etme - "Ne kadar öğrendik?"

### ZORLUK SEVİYELERİ:
- **easy**: Temel kavramlar, basit örnekler
- **medium**: Orta seviye uygulamalar, problem çözme
- **hard**: İleri seviye, karmaşık senaryolar

## ÇIKTI FORMATI:

### BAŞLIK:
- Adım türüne uygun, açıklayıcı başlık
- Örnek: "Matematik Temel Kavramları Tanıtım", "Geometri Öğrenme"

### İÇERİK (MARKDOWN FORMATINDA):
- Konuya özel, detaylı açıklama
- Öğrenci seviyesine uygun dil
- Pratik örneklerle desteklenmiş
- Motivasyonu artıran yaklaşım
- **Markdown formatında yaz:**
  - \`#\` başlıklar için
  - \`**kalın**\` önemli kavramlar için
  - \`*italik*\` vurgu için
  - \`\`\` kod blokları için
  - \`-\` liste maddeleri için
  - \`>\` alıntılar için

### ÖRNEKLER (3-5 adet):
- Konuya özel, güncel örnekler
- Farklı zorluk seviyelerinde
- Gerçek hayat uygulamaları
- **Markdown formatında yaz:**
  - \`**Örnek 1:**\` şeklinde başlık
  - Açıklama ve detaylar
  - Kod örnekleri için \`\`\` kullan

### İPUÇLARI (3-5 adet):
- Öğrenme stratejileri
- Sık yapılan hatalar
- Etkili çalışma yöntemleri
- **Markdown formatında yaz:**
  - \`**💡 İpucu:**\` şeklinde başlık
  - Açıklama ve detaylar

### GÖRSEL AÇIKLAMA:
- AI tarafından üretilecek görsel için açıklama
- Konuya özel, anlaşılır
- MUTLAKA konuya özel semboller, logolar, elementler içermeli
- Generic görsel olmamalı, spesifik olmalı
- Örnek: "Python logosunun bulunduğu, bir yılan figürünün kod satırları arasında kıvrıldığı, modern ve teknolojik bir görsel"
- Örnek: "Matematik sembollerinin (toplama, çıkarma, çarpma, bölme) renkli ve eğlenceli bir şekilde gösterildiği, etrafında sayılar ve geometrik şekillerin uçuştuğu bir görsel"
- Örnek: "Trigonometri sembollerinin (sin, cos, tan) ve birim çemberin merkezde yer aldığı, açıların ve trigonometrik fonksiyonların görsel olarak gösterildiği eğitimsel bir diyagram"

## ÖNEMLİ KURALLAR:
- Türkçe içerik üret
- Öğrenci dostu dil kullan
- Konuya özel, dinamik içerik
- Motivasyonu artır
- Pratik odaklı yaklaşım
- Zorluk seviyesine uygun

Şimdi bu konu için AI destekli içerik üret!`,
});

const topicExplainerFlow = ai.defineFlow(
  {
    name: "topicExplainerFlow",
    inputSchema: TopicExplainerInputSchema,
    outputSchema: TopicExplainerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
