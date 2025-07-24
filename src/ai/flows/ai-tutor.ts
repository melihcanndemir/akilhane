'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTutorInputSchema = z.object({
  question: z.string().describe('The question text that the user is trying to solve.'),
  subject: z.string().describe('The subject area of the question.'),
  topic: z.string().describe('The specific topic of the question.'),
  userAnswer: z.string().optional().describe('The user\'s current answer attempt (optional).'),
  difficulty: z.enum(['Kolay', 'Orta', 'Zor']).optional().describe('The difficulty level of the question.'),
  options: z.array(z.object({
    text: z.string(),
    isCorrect: z.boolean()
  })).optional().describe('The multiple choice options for the question.'),
  correctAnswer: z.string().optional().describe('The correct answer text.'),
  explanation: z.string().optional().describe('The standard explanation for the correct answer.'),
  step: z.enum(['hint', 'explanation', 'step-by-step', 'concept-review']).describe('What type of help the user needs.'),
});

export type AiTutorInput = z.infer<typeof AiTutorInputSchema>;

const AiTutorOutputSchema = z.object({
  help: z.string().describe('The help content based on the requested step type.'),
  confidence: z.number().optional().describe('AI confidence in the explanation (0-1).'),
});

export type AiTutorOutput = z.infer<typeof AiTutorOutputSchema>;

// Difficulty translation function
function translateDifficulty(difficulty: string): string {
  const difficultyMap: Record<string, string> = {
    'Easy': 'Kolay',
    'Medium': 'Orta',
    'Hard': 'Zor',
    'easy': 'Kolay',
    'medium': 'Orta',
    'hard': 'Zor',
    'EASY': 'Kolay',
    'MEDIUM': 'Orta',
    'HARD': 'Zor'
  };
  
  return difficultyMap[difficulty] || difficulty;
}

export async function getAiTutorHelp(
  input: AiTutorInput
): Promise<AiTutorOutput> {
  try {
    // Translate difficulty from English to Turkish
    const translatedInput = {
      ...input,
      difficulty: input.difficulty ? translateDifficulty(input.difficulty) : input.difficulty
    };
    
    return await aiTutorFlow(translatedInput);
  } catch (error) {
    console.error('❌ AI Tutor error:', error);
    
    // Return fallback response
    return {
      help: 'Şu anda AI asistanına erişilemiyor. Lütfen daha sonra tekrar deneyin.',
      confidence: 0
    };
  }
}

const prompt = ai.definePrompt({
  name: 'aiTutorPrompt',
  input: {schema: AiTutorInputSchema},
  output: {schema: AiTutorOutputSchema},
  prompt: `Sen bir uzman öğretmensin. Öğrencinin soruyu çözmesine yardım etmek için ipuçları, detaylı açıklamalar ve adım adım rehberlik sağlamalısın.

Öğrenci şu anda şu soruyu çözmeye çalışıyor:
Soru: {{{question}}}
Konu: {{{topic}}}
Ders: {{{subject}}}
Zorluk: {{{difficulty}}}
Doğru Cevap: {{{correctAnswer}}}

Yardım türü: {{{step}}}

## GÖREVİN:

### İPUCU (hint) isteniyorsa:
- Cevabı doğrudan verme
- Öğrenciyi doğru yöne yönlendir
- Anahtar kelimeleri vurgula
- Mantıksal düşünme sürecini tetikle

### DETAYLI AÇIKLAMA isteniyorsa:
- Konunun temel kavramlarını öğret
- Neden bu cevabın doğru olduğunu açıkla
- Diğer seçeneklerin neden yanlış olduğunu belirt
- Gerçek hayat örnekleri kullan

### ADIM ADIM REHBER isteniyorsa:
- Soruyu nasıl analiz edeceğini göster
- Mantıksal düşünme sürecini adım adım açıkla
- Kritik noktaları vurgula

### KAVRAM İNCELEMESİ isteniyorsa:
- Bu konuyla ilgili temel kavramları özetle
- Önemli formülleri ve tanımları hatırlat
- Sık yapılan hataları belirt

## ÖNEMLİ KURALLAR:
- Asla doğru cevabı doğrudan verme
- Öğrenciyi düşünmeye teşvik et
- Anlaşılır ve basit dil kullan
- Türkçe açıklamalar yap
- Örneklerle destekle

Öğrencinin mevcut cevabı: {{{userAnswer}}}

Şimdi öğrenciye yardım et!`,
});

const aiTutorFlow = ai.defineFlow(
  {
    name: 'aiTutorFlow',
    inputSchema: AiTutorInputSchema,
    outputSchema: AiTutorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
); 