import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logError } from "@/lib/error-logger";

// Interface for flashcard update data
interface FlashcardUpdate {
  id: string;
  question?: string;
  answer?: string;
  explanation?: string;
  topic?: string;
  difficulty?: string;
  subject?: string;
  confidence?: number;
  review_count?: number;
  last_reviewed?: string | null;
  next_review?: string | null;
}

// POST - Bulk create flashcards (for migration or AI generation)
export async function POST(request: NextRequest) {
  let userId: string | undefined;

  try {
    const body = await request.json();
    const { userId: extractedUserId, flashcards } = body;
    userId = extractedUserId;

    if (!userId || !Array.isArray(flashcards) || flashcards.length === 0) {
      return NextResponse.json(
        { error: "User ID and flashcards array are required" },
        { status: 400 },
      );
    }

    // Validate each flashcard has required fields
    const invalidFlashcards = flashcards.filter(
      (fc) => !fc.question || !fc.answer || !fc.subject,
    );

    if (invalidFlashcards.length > 0) {
      return NextResponse.json(
        { error: "All flashcards must have question, answer, and subject" },
        { status: 400 },
      );
    }

    // Prepare flashcards data for Supabase
    const flashcardData = flashcards.map((fc) => ({
      user_id: userId,
      question: fc.question,
      answer: fc.answer,
      explanation: fc.explanation || "",
      topic: fc.topic || "",
      difficulty: fc.difficulty || "medium",
      subject: fc.subject,
      confidence: fc.confidence || 0,
      review_count: fc.reviewCount || 0,
      last_reviewed: fc.lastReviewed || null,
      next_review: fc.nextReview || null,
    }));

    const { data, error } = await supabase
      .from("flashcards")
      .insert(flashcardData)
      .select();

    if (error) {
      logError("Supabase bulk insert error", error, { userId, flashcardCount: flashcardData.length });
      return NextResponse.json(
        { error: "Failed to create flashcards", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      created: data?.length || 0,
      flashcards: data || [],
    }, { status: 201 });
  } catch (error) {
    logError("Flashcard bulk creation API error", error, { userId });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Bulk update flashcard progress
export async function PUT(request: NextRequest) {
  let userId: string | undefined;
  let updates: FlashcardUpdate[] | undefined;

  try {
    const body = await request.json();
    const { userId: extractedUserId, updates: extractedUpdates } = body;
    userId = extractedUserId;
    updates = extractedUpdates;

    if (!userId || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "User ID and updates array are required" },
        { status: 400 },
      );
    }

    const results = [];
    const errors = [];

    // Process updates in batches for better performance
    for (const update of updates) {
      const { id, ...updateData } = update;

      if (!id) {
        errors.push({ error: "Missing flashcard ID", update });
        continue;
      }

      try {
        const { data, error } = await supabase
          .from("flashcards")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) {
          errors.push({ id, error: error.message });
        } else {
          results.push(data);
        }
      } catch {
        errors.push({ id, error: "Update failed" });
      }
    }

    return NextResponse.json({
      success: true,
      updated: results.length,
      errorCount: errors.length,
      results,
      errors,
    });
  } catch (error) {
    logError("Flashcard bulk update API error", error, { userId, updateCount: updates?.length });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
