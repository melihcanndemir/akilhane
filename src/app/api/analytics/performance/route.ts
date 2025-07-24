import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { subjects, questions } from '@/lib/database/schema';
import { eq, and, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get performance data from database
    const allSubjects = await db.select().from(subjects).where(eq(subjects.isActive, 1));
    
    // For now, return mock data structure - this will be enhanced when we add quiz results table
    const performanceData = allSubjects.map(subject => ({
      subject: subject.name,
      averageScore: Math.floor(Math.random() * 40) + 60, // Mock score between 60-100
      totalTests: Math.floor(Math.random() * 10) + 1, // Mock test count
      weakTopics: ['Konu 1', 'Konu 2', 'Konu 3'], // Mock weak topics
      lastUpdated: new Date().toISOString()
    }));

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json([], { status: 200 });
  }
} 