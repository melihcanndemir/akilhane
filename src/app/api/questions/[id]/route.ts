import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { questions } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

// GET a single question by ID (optional, but good practice)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const question = await db.select().from(questions).where(eq(questions.id, id));
    if (question.length === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    return NextResponse.json(question[0], { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

// UPDATE a question by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { subject, topic, type, difficulty, text, options, correctAnswer, explanation, formula } = body;

    // Basic validation
    if (!text || !topic || !explanation) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedQuestion = await db.update(questions).set({
        subject,
        topic,
        type,
        difficulty,
        text,
        options: JSON.stringify(options),
        correctAnswer,
        explanation,
        formula,
        updatedAt: new Date(),
    }).where(eq(questions.id, id)).returning();

    if (updatedQuestion.length === 0) {
      return NextResponse.json({ error: 'Question not found or failed to update' }, { status: 404 });
    }

    return NextResponse.json(updatedQuestion[0], { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

// DELETE a question by ID
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deletedQuestion = await db.delete(questions).where(eq(questions.id, id)).returning();

    if (deletedQuestion.length === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Question deleted successfully' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
