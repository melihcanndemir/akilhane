import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logError } from "@/lib/error-logger";

// Create Supabase client (using anon key, same as other working APIs)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// GET - Get flashcards for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const subject = searchParams.get("subject");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    let query = supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Filter by subject if provided
    if (subject && subject !== "all") {
      query = query.eq("subject", subject);
    }

    const { data, error } = await query;

    if (error) {
      logError("Supabase error fetching flashcards", error, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        userId,
        subject,
      });

      // If table doesn't exist, return empty array instead of error
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return NextResponse.json([]);
      }

      return NextResponse.json(
        { error: "Failed to fetch flashcards", details: error.message, code: error.code },
        { status: 500 },
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    logError("API error in GET flashcards", error, { userId: request.url });
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

// POST - Create a new flashcard
export async function POST(request: NextRequest) {
  try {

    const body = await request.json();

    const {
      userId,
      question,
      answer,
      explanation,
      topic,
      difficulty,
      subject,
      confidence = 0,
      reviewCount = 0,
    } = body;

    if (!userId || !question || !answer || !subject) {
      return NextResponse.json(
        { error: "Missing required fields: userId, question, answer, subject" },
        { status: 400 },
      );
    }

    const flashcardData = {
      user_id: userId,
      question,
      answer,
      explanation: explanation || "",
      topic: topic || "",
      difficulty: difficulty || "medium",
      subject,
      confidence,
      review_count: reviewCount,
      last_reviewed: null,
      next_review: null,
    };

    const { data, error } = await supabase
      .from("flashcards")
      .insert([flashcardData])
      .select()
      .single();

    if (error) {
      logError("Supabase insert error creating flashcard", error, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        flashcardData,
        userIdType: typeof flashcardData.user_id,
        userIdValue: flashcardData.user_id,
      });

      // Handle specific errors
      if (error.code === "42P01") {
        return NextResponse.json(
          { error: "Flashcards table does not exist. Please run the migration scripts." },
          { status: 500 },
        );
      }

      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Duplicate flashcard detected" },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Failed to create flashcard", details: error.message, code: error.code },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logError("API error in POST flashcards", error, { requestBody: request.body });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update a flashcard
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, updates } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Flashcard ID and User ID are required" },
        { status: 400 },
      );
    }

    // Supabase will automatically update updated_at via trigger
    const updateData = {
      ...updates,
    };

    const { data, error } = await supabase
      .from("flashcards")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      logError("Supabase error updating flashcard", error, { id, userId, updates });
      return NextResponse.json(
        { error: "Failed to update flashcard" },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Flashcard not found or access denied" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    logError("API error in PUT flashcards", error, { id: request.body });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a flashcard
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Flashcard ID and User ID are required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("flashcards")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      logError("Supabase error deleting flashcard", error, { id, userId });
      return NextResponse.json(
        { error: "Failed to delete flashcard" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("API error in DELETE flashcards", error, { id: request.url });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
