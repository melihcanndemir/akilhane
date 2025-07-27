import { NextRequest, NextResponse } from 'next/server';
import { SubjectRepository } from '@/lib/database/repositories/subject-repository';
import { initializeDatabase } from '@/lib/database/connection';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Initialize database if not already done
    initializeDatabase();

    const subject = await SubjectRepository.getSubjectById(id);

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subject, { status: 200 });
  } catch (error) {
    console.error('❌ Error getting subject:', error);
    return NextResponse.json(
      { error: 'Failed to get subject' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Initialize database if not already done
    initializeDatabase();

    const body = await request.json();
    const { name, description, category, difficulty, isActive } = body;

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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Initialize database if not already done
    initializeDatabase();

    await SubjectRepository.deleteSubject(id);

    return NextResponse.json(
      { message: 'Subject deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error deleting subject:', error);
    
    // Check if it's a business logic error
    if (error instanceof Error && error.message.includes('existing questions')) {
      return NextResponse.json(
        { error: 'Cannot delete subject with existing questions' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Initialize database if not already done
    initializeDatabase();

    const body = await request.json();
    const { action } = body;

    if (action === 'toggle-active') {
      await SubjectRepository.toggleActive(id);
      return NextResponse.json(
        { message: 'Subject active status toggled successfully' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Error performing action on subject:', error);
    return NextResponse.json(
      { error: 'Failed to perform action on subject' },
      { status: 500 }
    );
  }
} 