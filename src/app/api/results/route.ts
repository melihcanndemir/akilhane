import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { subjects } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    
    // Get active subjects
    const allSubjects = await db.select().from(subjects).where(eq(subjects.isActive, 1));
    
    // For now, return mock quiz results - this will be enhanced when we add quiz results table
    const mockResults = allSubjects.slice(0, limit).map((subject, index) => ({
      id: `result-${index + 1}`,
      subject: subject.name,
      score: Math.floor(Math.random() * 40) + 60, // Mock score between 60-100
      totalQuestions: Math.floor(Math.random() * 10) + 5, // Mock question count
      timeSpent: Math.floor(Math.random() * 1800) + 300, // Mock time in seconds (5-35 minutes)
      weakTopics: ['Konu 1', 'Konu 2'], // Mock weak topics
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Mock date within last 7 days
    }));

    return NextResponse.json(mockResults);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json([], { status: 200 });
  }
} 