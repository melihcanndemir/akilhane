import { NextRequest, NextResponse } from 'next/server';
import { QuestionRepository } from '@/lib/database/repositories/question-repository';
import { initializeDatabase } from '@/lib/database/connection';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize database if not already done
    initializeDatabase();

    const { id } = params;

    // Get question by ID
    const questions = await QuestionRepository.getQuestionsBySubject(''); // This needs to be updated to get by ID
    const question = questions.find(q => q.id === id);

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question, { status: 200 });
  } catch (error) {
    console.error('❌ Error getting question:', error);
    return NextResponse.json(
      { error: 'Failed to get question' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize database if not already done
    initializeDatabase();

    const { id } = params;
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
      formula 
    } = body;

    // Validate options if provided
    if (options) {
      if (!Array.isArray(options) || options.length < 2) {
        return NextResponse.json(
          { error: 'Options must be an array with at least 2 items' },
          { status: 400 }
        );
      }

      const correctOptions = options.filter(opt => opt.isCorrect);
      if (correctOptions.length !== 1) {
        return NextResponse.json(
          { error: 'Exactly one option must be marked as correct' },
          { status: 400 }
        );
      }
    }

    // Update question
    await QuestionRepository.updateQuestion(id, {
      subject,
      topic,
      type,
      difficulty,
      text,
      options,
      correctAnswer,
      explanation,
      formula,
    });

    return NextResponse.json(
      { message: 'Question updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize database if not already done
    initializeDatabase();

    const { id } = params;

    // Delete question (soft delete)
    await QuestionRepository.deleteQuestion(id);

    return NextResponse.json(
      { message: 'Question deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
} 