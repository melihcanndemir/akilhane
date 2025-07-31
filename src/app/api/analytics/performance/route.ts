import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { quizResults } from '@/lib/database/schema';
import { sql } from 'drizzle-orm';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

interface WeakTopic {
  [key: string]: number;
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json([]);
  }

  try {
    // 1. Get all results for the user
    const userResults = await db
      .select({
        subject: quizResults.subject,
        score: quizResults.score,
        totalQuestions: quizResults.totalQuestions,
        weakTopics: quizResults.weakTopics,
      })
      .from(quizResults)
      .where(sql`${quizResults.userId} = ${userId}`);

    if (userResults.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Process the data in code
    const performanceMap = new Map<string, { scores: number[]; totalQuestions: number[]; weakTopics: WeakTopic }>();

    for (const result of userResults) {
      if (!performanceMap.has(result.subject)) {
        performanceMap.set(result.subject, { scores: [], totalQuestions: [], weakTopics: {} });
      }

      const entry = performanceMap.get(result.subject)!;
      entry.scores.push(result.score);
      entry.totalQuestions.push(result.totalQuestions);

      try {
        const topics = JSON.parse(result.weakTopics || '{}');
        for (const topic in topics) {
          entry.weakTopics[topic] = (entry.weakTopics[topic] || 0) + topics[topic];
        }
      } catch {
        // Ignore if weakTopics is not valid JSON
      }
    }

    // 3. Format the output
    const performanceData = Array.from(performanceMap.entries()).map(([subject, data]) => {
      const percentages = data.scores.map((score, index) => {
        const total = data.totalQuestions[index];
        return total && total > 0 ? (score / total) * 100 : 0;
      });
      const averageScore = percentages.reduce((a, b) => a + b, 0) / percentages.length;
      const sortedWeakTopics = Object.entries(data.weakTopics)
        .sort(([, a], [, b]) => b - a)
        .map(([topic]) => topic);

      return {
        subject,
        averageScore: Math.round(averageScore),
        totalTests: data.scores.length,
        weakTopics: sortedWeakTopics.slice(0, 3), // Return top 3 weak topics
        lastUpdated: new Date().toISOString(),
      };
    });

    return NextResponse.json(performanceData);

  } catch {
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
  }
}
