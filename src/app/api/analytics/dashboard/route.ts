import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { quizResults, users } from '@/lib/database/schema';
import { sql, avg, sum, count, desc, gt } from 'drizzle-orm';

interface WeakTopic {
  [key: string]: number;
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    return new NextResponse('User ID is required', { status: 401 });
  }

  try {
    const userResults = await db
      .select({
        score: quizResults.score,
        timeSpent: quizResults.timeSpent,
        totalQuestions: quizResults.totalQuestions,
        weakTopics: quizResults.weakTopics,
        createdAt: quizResults.createdAt,
      })
      .from(quizResults)
      .where(sql`${quizResults.userId} = ${userId}`)
      .orderBy(desc(quizResults.createdAt));

    if (userResults.length === 0) {
      return NextResponse.json({
        totalQuestions: 0,
        correctAnswers: 0,
        averageScore: 0,
        studyTime: 0,
        strongTopics: [],
        weakTopics: [],
      });
    }

    const totalTests = userResults.length;
    const totalTimeMinutes = Math.round(userResults.reduce((acc, r) => acc + (r.timeSpent || 0), 0) / 60);
    const totalQuestionsSum = userResults.reduce((acc, r) => acc + (r.totalQuestions || 0), 0);
    const averageScore = Math.round(userResults.reduce((acc, r) => acc + (r.score || 0), 0) / totalTests);
    
    const correctAnswers = Math.round(totalQuestionsSum * (averageScore / 100));

    const allTopics = new Map<string, { total: number; correct: number }>();
    const allWeakTopics = new Map<string, number>();

    for (const result of userResults) {
        try {
            const topics: Record<string, number> = JSON.parse(result.weakTopics || '{}');
            for(const topic in topics) {
                allWeakTopics.set(topic, (allWeakTopics.get(topic) || 0) + 1);
            }
        } catch (e) { /* ignore */ }
    }
    
    const sortedWeakTopics = Array.from(allWeakTopics.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([topic]) => topic);
    
    // This is a simplified logic. A real app might analyze correct answers per topic.
    const strongTopics = Array.from(allWeakTopics.keys()).filter(topic => !sortedWeakTopics.includes(topic));

    const response = {
      totalQuestions: totalQuestionsSum,
      correctAnswers: correctAnswers,
      averageScore: averageScore,
      studyTime: totalTimeMinutes,
      streak: 5, // Mock data for now
      rank: 1, // Mock data for now
      totalUsers: 1, // Mock data for now
      improvement: 5, // Mock data for now
      weakTopics: sortedWeakTopics.slice(0, 3),
      strongTopics: strongTopics.slice(0, 3),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching analytics dashboard data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 