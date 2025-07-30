import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions, type QuestionGenerationInput } from '@/ai/flows/question-generator';
import { supabase } from '@/lib/supabase';
import { shouldUseDemoData } from '@/data/demo-data';

export const runtime = 'nodejs';

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

    // Call the AI generation flow
    const result = await generateQuestions(body);

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