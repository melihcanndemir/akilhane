import { NextRequest, NextResponse } from 'next/server';
import { QuestionRepository } from '@/lib/database/repositories/question-repository';
import { initializeDatabase } from '@/lib/database/connection';
import { shouldUseDemoData, getDemoQuestions, getAllDemoQuestions } from '@/data/demo-data';
import { checkAuth } from '@/lib/supabase';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Demo mode control
    if (shouldUseDemoData()) {
      return NextResponse.json(
        { error: 'Demo modunda yeni soru eklenemez' },
        { status: 403 }
      );
    }

    // 🔍 Session control
    console.log('🔐 Questions API - Checking authentication for POST...');
    const { isLoggedIn } = await checkAuth();
    
    if (!isLoggedIn) {
      console.log('❌ Questions API - No session found for POST');
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor!' },
        { status: 401 }
      );
    }

    console.log('✅ Questions API - Session found for POST');
    
    // Initialize database if not already done
    initializeDatabase();

    const body = await request.json();
    const { 
      subject, 
      topic, 
      type, 
      difficulty, 
      text, 
      options, 
      correctAnswer, 
      explanation, 
      formula, 
      createdBy 
    } = body;

    // Validate required fields
    if (!subject || !topic || !type || !difficulty || !text || !options || !correctAnswer || !explanation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate options structure
    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Options must be an array with at least 2 items' },
        { status: 400 }
      );
    }

    // Validate that exactly one option is correct
    const correctOptions = options.filter(opt => opt.isCorrect);
    if (correctOptions.length !== 1) {
      return NextResponse.json(
        { error: 'Exactly one option must be marked as correct' },
        { status: 400 }
      );
    }

    // Create question
    const questionId = await QuestionRepository.createQuestion(
      subject,
      topic,
      type,
      difficulty,
      text,
      options,
      correctAnswer,
      explanation,
      formula,
      createdBy
    );

    return NextResponse.json(
      { 
        message: 'Question created successfully',
        questionId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating question:', error);
    return NextResponse.json(
      { error: `Failed to create question: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const limit = searchParams.get('limit');
    const difficulty = searchParams.get('difficulty');

    // Demo mode control
    if (shouldUseDemoData()) {
      let demoQuestions;
      
      if (subjectId) {
        demoQuestions = getDemoQuestions(subjectId);
      } else {
        demoQuestions = getAllDemoQuestions();
      }

      // Apply filters
      if (difficulty) {
        demoQuestions = demoQuestions.filter((q: any) => q.difficulty === difficulty);
      }

      if (limit) {
        demoQuestions = demoQuestions.slice(0, parseInt(limit));
      }

      return NextResponse.json(demoQuestions, { status: 200 });
    }

    // 🔍 Session control
    console.log('🔐 Questions API - Checking authentication for GET...');
    const { isLoggedIn, user } = await checkAuth();
    
    if (!isLoggedIn) {
      console.log('❌ Questions API - No session found for GET, returning empty data');
      return NextResponse.json([], { status: 200 });
    }

    console.log('✅ Questions API - Session found for GET, user:', user?.id);
    
    // Initialize database if not already done
    initializeDatabase();

    // Get questions from database with user filtering
    let questions;
    const userId = user?.id;
    
    if (subjectId) {
      questions = await QuestionRepository.getQuestionsBySubject(subjectId, limit ? parseInt(limit) : undefined, userId);
    } else {
      questions = await QuestionRepository.getRandomQuestions('', limit ? parseInt(limit) : 10, difficulty as any, userId);
    }

    // Apply filters
    if (difficulty) {
      questions = questions.filter((q: any) => q.difficulty === difficulty);
    }

    if (limit) {
      questions = questions.slice(0, parseInt(limit));
    }

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error('❌ Error getting questions:', error);
    
    // If there is an error, return demo data
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    let demoQuestions = getAllDemoQuestions();
    
    if (subjectId) {
      demoQuestions = getDemoQuestions(subjectId);
    }
    
    return NextResponse.json(demoQuestions, { status: 200 });
  }
} 