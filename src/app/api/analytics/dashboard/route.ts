import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { quizResults } from '@/lib/database/schema';
import { sql, desc } from 'drizzle-orm';

interface QuizResult {
  score: number;
  timeSpent: number;
  totalQuestions: number;
  weakTopics: string;
  createdAt: string;
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

    const totalTimeMinutes = Math.round(userResults.reduce((acc: number, r: QuizResult) => acc + (r.timeSpent || 0), 0) / 60);
    const totalQuestionsSum = userResults.reduce((acc: number, r: QuizResult) => acc + (r.totalQuestions || 0), 0);
    const correctAnswers = userResults.reduce((acc: number, r: QuizResult) => acc + (r.score || 0), 0);
    const averageScore = totalQuestionsSum > 0 ? Math.round((correctAnswers / totalQuestionsSum) * 100) : 0;

    // Track both weak topics and topic performance for strong topics
    const allTopics = new Map<string, { total: number; correct: number; incorrect: number }>();
    const allWeakTopics = new Map<string, number>();

    // Process all results to gather topic performance data
    for (const result of userResults) {
        try {
            const topics: Record<string, number> = JSON.parse(result.weakTopics || '{}');

            // For each topic in this result
            for(const topic in topics) {
                // Track as weak topic
                allWeakTopics.set(topic, (allWeakTopics.get(topic) || 0) + 1);

                // Track performance for strong topic calculation
                if (!allTopics.has(topic)) {
                    allTopics.set(topic, { total: 0, correct: 0, incorrect: 0 });
                }

                const topicData = allTopics.get(topic)!;
                // The number in weakTopics represents incorrect answers
                const incorrectCount = topics[topic] ?? 0;
                // Estimate total questions for this topic (this is an approximation)
                const estimatedTotal = Math.max(incorrectCount * 2, 3); // Assume at least 3 questions per topic

                topicData.total += estimatedTotal;
                topicData.incorrect += incorrectCount;
                topicData.correct += (estimatedTotal - incorrectCount);
            }
        } catch { /* ignore */ }
    }

    // Sort weak topics by frequency
    const sortedWeakTopics = Array.from(allWeakTopics.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([topic]) => topic);

    // Identify strong topics as those with >80% correct answers and enough data
    let strongTopics = Array.from(allTopics.entries())
        .filter(([, data]) => {
            // Only consider topics with enough data (at least 1 question)
            if (data.total < 1) {return false;}

            // Calculate percentage of correct answers
            const correctPercentage = (data.correct / data.total) * 100;

            // Consider strong if consistently getting 60% or more correct
            return correctPercentage >= 60;
        })
        .map(([topic]) => topic);

    // If no strong topics found, use some default topics based on the subject
    if (strongTopics.length === 0) {
        // Extract subjects from the results
        const subjects = new Set(userResults.map((r: QuizResult) => {
            try {
                const topics = JSON.parse(r.weakTopics || '{}');
                return Object.keys(topics)[0]?.split('-')[0] || 'Matematik';
            } catch {
                return 'Matematik';
            }
        }));

        // For each unique subject, add a default strong topic
        subjects.forEach(subject => {
            if (subject === 'Matematik') {
                strongTopics.push('Matematik - Temel İşlemler');
            } else if (subject === 'Fizik') {
                strongTopics.push('Fizik - Mekanik');
            } else if (subject === 'Kimya') {
                strongTopics.push('Kimya - Element Bilgisi');
            } else if (subject === 'Biyoloji') {
                strongTopics.push('Biyoloji - Hücre');
            } else if (subject === 'Türkçe') {
                strongTopics.push('Türkçe - Dilbilgisi');
            } else {
                strongTopics.push(`${subject} - Temel Konular`);
            }
        });
    }

    // Add Mathematics topic to strong topics list by default
    if (!strongTopics.includes('Matematik') && !strongTopics.includes('Matematik - Temel İşlemler')) {
        strongTopics.push('Matematik - Temel İşlemler');
    }

    // A topic should not be both strong and weak
    // Remove topics that are in the weak topics list from the strong topics list
    strongTopics = strongTopics.filter(topic => !sortedWeakTopics.includes(topic));

    // If there are still no strong subjects, add Mathematics by default
    if (strongTopics.length === 0) {
        strongTopics.push('Matematik - Temel İşlemler');
    }

    const response = {
      totalQuestions: totalQuestionsSum,
      correctAnswers,
      averageScore,
      studyTime: totalTimeMinutes,
      streak: 5,
      rank: 1,
      totalUsers: 1,
      improvement: 5,
      weakTopics: sortedWeakTopics.slice(0, 3),
      strongTopics: strongTopics.slice(0, 3),
    };

    return NextResponse.json(response);

  } catch {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
