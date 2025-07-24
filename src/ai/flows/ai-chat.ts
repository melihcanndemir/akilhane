'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiChatInputSchema = z.object({
  message: z.string().describe('Kullanıcının gönderdiği mesaj'),
  subject: z.string().describe('Hangi ders konusunda konuşuyoruz'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string()
  })).describe('Önceki konuşma geçmişi'),
  context: z.string().optional().describe('Ek bağlam bilgisi (soru, konu vs.)'),
});

export type AiChatInput = z.infer<typeof AiChatInputSchema>;

const AiChatOutputSchema = z.object({
  response: z.string().describe('AI\'nın cevabı'),
  confidence: z.number().describe('AI güven seviyesi (0-1)'),
  suggestedTopics: z.array(z.string()).describe('Önerilen konular'),
  followUpQuestions: z.array(z.string()).describe('Takip soruları'),
  learningTips: z.array(z.string()).describe('Öğrenme ipuçları'),
});

export type AiChatOutput = z.infer<typeof AiChatOutputSchema>;

export async function getAiChatResponse(
  input: AiChatInput
): Promise<AiChatOutput> {
  return aiChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatPrompt',
  input: {schema: AiChatInputSchema},
  output: {schema: AiChatOutputSchema},
  prompt: `Sen bir uzman öğretmensin ve öğrencinle doğal bir konuşma yapıyorsun.

## ÖĞRENCİNİN MESAJI:
{{{message}}}

## DERS KONUSU:
{{{subject}}}

## KONUŞMA GEÇMİŞİ:
{{{conversationHistory}}}

## EK BAĞLAM:
{{{context}}}

## GÖREVİN:
1. **Doğal ve samimi bir şekilde cevap ver** - Robot gibi değil, gerçek bir öğretmen gibi
2. **Önceki konuşmaları hatırla** - Geçmişte ne konuştuğunuzu unutma
3. **Öğrenciyi anla** - Sorununu, endişesini, merakını anlamaya çalış
4. **Eğitici ol** - Bilgi ver ama sıkıcı olma
5. **Motivasyon ver** - Öğrenciyi cesaretlendir

## CEVAP TARZIN:
- **Samimi ve dostane** ol
- **Türkçe** konuş
- **Örnekler** ver
- **Günlük hayattan** benzetmeler yap
- **Humor** kullan (ama abartma)
- **Öğrenciyi düşünmeye** teşvik et

## ÖNEMLİ:
- Önceki konuşmaları hatırla
- Tutarlı ol
- Öğrencinin seviyesine uygun konuş
- Asla "ben bir AI'yım" deme
- Doğal bir öğretmen gibi davran

Şimdi öğrencinle konuş!`,
});

const aiChatFlow = ai.defineFlow(
  {
    name: 'aiChatFlow',
    inputSchema: AiChatInputSchema,
    outputSchema: AiChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
); 