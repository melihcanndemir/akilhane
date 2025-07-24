import { NextRequest, NextResponse } from 'next/server';
import { saveQuizResult } from '@/services/performance-service';
import { initializeDatabase } from '@/lib/database/connection';

export async function POST(request: NextRequest) {
  try {
    // Initialize database if not already done
    initializeDatabase();

    const body = await request.json();
    const { userId, subject, score, totalQuestions, timeSpent, weakTopics } = body;

    // Validate required fields
    if (!userId || !subject || score === undefined || !totalQuestions || timeSpent === undefined || !weakTopics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save quiz result to database
    await saveQuizResult(userId, subject, score, totalQuestions, timeSpent, weakTopics);

    return NextResponse.json(
      { message: 'Quiz result saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error saving quiz result:', error);
    return NextResponse.json(
      { error: 'Failed to save quiz result' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Initialize database if not already done
    initializeDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const subject = searchParams.get('subject');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Import here to avoid circular dependency
    const { getAllPerformanceData, getPerformanceHistoryForSubject } = await import('@/services/performance-service');

    let data;
    if (subject) {
      // Get results for specific subject
      const results = await getPerformanceHistoryForSubject(subject, userId);
      data = { [subject]: results };
    } else {
      // Get all results
      data = await getAllPerformanceData(userId);
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('❌ Error getting quiz results:', error);
    return NextResponse.json(
      { error: 'Failed to get quiz results' },
      { status: 500 }
    );
  }
} 