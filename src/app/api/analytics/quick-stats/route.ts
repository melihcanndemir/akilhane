import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { quizResults } from '@/lib/database/schema';
import { sql, avg, sum, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from a secure session (e.g., NextAuth, Supabase Auth).
    // For this project, we'll rely on a guest ID passed from the client via headers.
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      // Return zeroed stats if no user is identified.
      return NextResponse.json({
        totalTests: 0,
        averageScore: 0,
        totalTimeSpent: 0,
      });
    }

    const statsResult = await db
      .select({
        totalTests: count(quizResults.id),
        averageScore: avg(quizResults.score),
        totalTimeSpent: sum(quizResults.timeSpent),
      })
      .from(quizResults)
      .where(sql`${quizResults.userId} = ${userId}`);

    const stats = statsResult[0];

    // Handle the case where there are no results, avg and sum will be null
    return NextResponse.json({
      totalTests: stats.totalTests || 0,
      averageScore: stats.averageScore ? Math.round(Number(stats.averageScore)) : 0,
      totalTimeSpent: Number(stats.totalTimeSpent) || 0,
    });
    
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return NextResponse.json({ error: 'Failed to fetch quick stats' }, { status: 500 });
  }
} 