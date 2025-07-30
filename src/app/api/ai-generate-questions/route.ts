import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions, type QuestionGenerationInput } from '@/ai/flows/question-generator';
import { supabase } from '@/lib/supabase';
import { shouldUseDemoData } from '@/data/demo-data';

export const runtime = 'nodejs';

// Mock question generation for demo/development when API key is not available
function generateMockQuestions(input: QuestionGenerationInput) {
  const questions = [];
  const typeTemplates = {
    'multiple-choice': {
      tr: [
        {
          text: `${input.topic} konusunda temel bir kavram nedir?`,
          options: [
            { text: 'Doğru cevap', isCorrect: true },
            { text: 'Yanlış seçenek 1', isCorrect: false },
            { text: 'Yanlış seçenek 2', isCorrect: false },
            { text: 'Yanlış seçenek 3', isCorrect: false },
          ],
        },
        {
          text: `Aşağıdakilerden hangisi ${input.topic} ile ilgilidir?`,
          options: [
            { text: 'İlgili kavram', isCorrect: true },
            { text: 'İlgisiz kavram 1', isCorrect: false },
            { text: 'İlgisiz kavram 2', isCorrect: false },
            { text: 'İlgisiz kavram 3', isCorrect: false },
          ],
        },
      ],
      en: [
        {
          text: `What is a fundamental concept in ${input.topic}?`,
          options: [
            { text: 'Correct answer', isCorrect: true },
            { text: 'Wrong option 1', isCorrect: false },
            { text: 'Wrong option 2', isCorrect: false },
            { text: 'Wrong option 3', isCorrect: false },
          ],
        },
      ],
    },
    'true-false': {
      tr: [
        {
          text: `${input.topic} konusu ${input.subject} dersinin bir parçasıdır.`,
          options: [
            { text: 'Doğru', isCorrect: true },
            { text: 'Yanlış', isCorrect: false },
          ],
        },
      ],
      en: [
        {
          text: `${input.topic} is a part of ${input.subject} course.`,
          options: [
            { text: 'True', isCorrect: true },
            { text: 'False', isCorrect: false },
          ],
        },
      ],
    },
    'calculation': {
      tr: [
        {
          text: `${input.topic} konusunda bir hesaplama sorusu: Basit bir örnek problem çözünüz.`,
          options: [],
          formula: 'x = a + b',
        },
      ],
      en: [
        {
          text: `A calculation question about ${input.topic}: Solve a simple example problem.`,
          options: [],
          formula: 'x = a + b',
        },
      ],
    },
    'case-study': {
      tr: [
        {
          text: `${input.topic} konusunda bir vaka çalışması: Gerçek hayattan bir örnek üzerinden analiz yapınız.`,
          options: [],
        },
      ],
      en: [
        {
          text: `A case study about ${input.topic}: Analyze through a real-life example.`,
          options: [],
        },
      ],
    },
  };

  const templates = typeTemplates[input.type][input.language || 'tr'] || typeTemplates[input.type]['tr'];
  
  for (let i = 0; i < Math.min(input.count, templates.length); i++) {
    const template = templates[i % templates.length];
    questions.push({
      text: template.text,
      options: template.options || [],
      explanation: input.language === 'en' 
        ? `This question tests understanding of ${input.topic} in ${input.subject}.`
        : `Bu soru ${input.subject} dersindeki ${input.topic} konusunun anlaşılmasını test eder.`,
      topic: input.topic,
      formula: template.formula,
      difficulty: input.difficulty,
      keywords: [input.subject, input.topic],
      learningObjective: input.language === 'en'
        ? `Understanding ${input.topic} concepts`
        : `${input.topic} kavramlarını anlama`,
    });
  }

  return {
    questions,
    metadata: {
      totalGenerated: questions.length,
      subject: input.subject,
      topic: input.topic,
      averageDifficulty: input.difficulty,
      generationTimestamp: new Date().toISOString(),
    },
    qualityScore: 0.75, // Mock quality score
    suggestions: input.language === 'en' 
      ? ['This is a demo generation. Connect to Google AI for better results.']
      : ['Bu bir demo üretimdir. Daha iyi sonuçlar için Google AI\'ya bağlanın.'],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as QuestionGenerationInput;
    
    // Validate input
    if (!body.subject || !body.topic || !body.difficulty || !body.type || !body.count) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, topic, difficulty, type, count' },
        { status: 400 }
      );
    }

    // Check authentication (optional for demo mode)
    if (!shouldUseDemoData()) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('⚠️ No authentication found, allowing anonymous AI generation');
      }
    }

    console.log('🤖 AI Question Generation Request:', {
      subject: body.subject,
      topic: body.topic,
      type: body.type,
      difficulty: body.difficulty,
      count: body.count,
    });

    let result;
    
    // Check if Google AI API key is available
    const hasApiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    
    if (!hasApiKey || shouldUseDemoData()) {
      console.log('📝 Using mock question generation (no API key or demo mode)');
      result = generateMockQuestions(body);
    } else {
      try {
        // Call the AI generation flow
        result = await generateQuestions(body);
      } catch (aiError) {
        console.error('AI generation failed, falling back to mock:', aiError);
        result = generateMockQuestions(body);
      }
    }

    // Log generation for monitoring
    if (!shouldUseDemoData()) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from('ai_generation_logs').insert({
            user_id: session.user.id,
            generation_type: 'question',
            subject: body.subject,
            topic: body.topic,
            count: result.questions.length,
            quality_score: result.qualityScore,
            metadata: {
              difficulty: body.difficulty,
              type: body.type,
              language: body.language || 'tr',
            },
            created_at: new Date().toISOString(),
          });
        }
      } catch (logError) {
        console.error('Failed to log AI generation:', logError);
        // Don't fail the request if logging fails
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Question Generation Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}