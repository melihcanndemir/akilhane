import { NextRequest, NextResponse } from 'next/server';
import { QuestionRepository } from '@/lib/database/repositories/question-repository';
import { initializeDatabase } from '@/lib/database/connection';

export async function POST(request: NextRequest) {
  try {
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
    // Initialize database if not already done
    initializeDatabase();

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty') as 'Easy' | 'Medium' | 'Hard' | null;
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const random = searchParams.get('random') === 'true';
    const count = searchParams.get('count') ? parseInt(searchParams.get('count')!) : 10;

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject parameter is required' },
        { status: 400 }
      );
    }

    let questions;

    if (random) {
      // Get random questions for quiz
      questions = await QuestionRepository.getRandomQuestions(subject, count, difficulty || undefined);
    } else if (search) {
      // Search questions
      questions = await QuestionRepository.searchQuestions(subject, search, limit);
    } else if (topic) {
      // Get questions by topic
      questions = await QuestionRepository.getQuestionsByTopic(subject, topic, limit);
    } else if (difficulty) {
      // Get questions by difficulty
      questions = await QuestionRepository.getQuestionsByDifficulty(subject, difficulty, limit);
    } else {
      // Get all questions for subject
      questions = await QuestionRepository.getQuestionsBySubject(subject, limit);
    }

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error('❌ Error getting questions:', error);
    
    // Return empty array instead of error for better UX
    return NextResponse.json([], { status: 200 });
  }
} 