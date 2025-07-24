import { NextRequest, NextResponse } from 'next/server';
import { SubjectRepository } from '@/lib/database/repositories/subject-repository';
import { initializeDatabase } from '@/lib/database/connection';

export async function POST(request: NextRequest) {
  try {
    // Initialize database if not already done
    initializeDatabase();

    const body = await request.json();
    const { name, description, category, difficulty, createdBy } = body;

    // Validate required fields
    if (!name || !description || !category || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category, difficulty' },
        { status: 400 }
      );
    }

    // Validate difficulty
    if (!['Başlangıç', 'Orta', 'İleri'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Difficulty must be one of: Başlangıç, Orta, İleri' },
        { status: 400 }
      );
    }

    // Create subject
    const subjectId = await SubjectRepository.createSubject({
      name,
      description,
      category,
      difficulty,
      createdBy,
    });

    return NextResponse.json(
      { 
        message: 'Subject created successfully',
        subjectId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Initialize database if not already done
    initializeDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    // Build filters
    const filters: Record<string, string | boolean> = {};
    if (category) filters.category = category;
    if (difficulty) filters.difficulty = difficulty;
    if (isActive !== null) filters.isActive = isActive === 'true';
    if (search) filters.search = search;

    // Get subjects
    const subjects = await SubjectRepository.getAllSubjects(filters);

    return NextResponse.json(subjects, { status: 200 });
  } catch (error) {
    console.error('❌ Error getting subjects:', error);
    
    // Return empty array instead of error for better UX
    return NextResponse.json([], { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Initialize database if not already done
    initializeDatabase();

    const body = await request.json();
    const { id, name, description, category, difficulty, isActive } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    // Validate difficulty if provided
    if (difficulty && !['Başlangıç', 'Orta', 'İleri'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Difficulty must be one of: Başlangıç, Orta, İleri' },
        { status: 400 }
      );
    }

    // Update subject
    await SubjectRepository.updateSubject(id, {
      name,
      description,
      category,
      difficulty,
      isActive,
    });

    return NextResponse.json(
      { message: 'Subject updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error updating subject:', error);
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 }
    );
  }
} 