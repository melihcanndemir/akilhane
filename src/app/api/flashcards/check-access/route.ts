import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logError } from "@/lib/error-logger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Simple check to see if user can access flashcards table
    const { error } = await supabase
      .from("flashcards")
      .select("count")
      .eq("user_id", userId)
      .limit(1);

    if (error) {
      logError("Error checking flashcards access", error, { userId });
      return NextResponse.json(
        { error: "Failed to check access", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        hasAccess: true,
        userId,
        message: "Access verified",
      },
      { status: 200 },
    );
  } catch (error) {
    logError("Check access error", error, { userId });
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
