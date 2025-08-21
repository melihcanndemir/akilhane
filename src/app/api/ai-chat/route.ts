import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AiChatRepository } from "@/lib/database/repositories/ai-chat-repository";
import { logError } from "@/lib/error-logger";

// GET /api/ai-chat - Get all chat sessions for the user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "UserId required" }, { status: 400 });
    }

    const searchTerm = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "10");

    let sessions;
    if (searchTerm) {
      sessions = await AiChatRepository.searchSessions(userId, searchTerm);
    } else {
      sessions = await AiChatRepository.getRecentSessions(userId, limit);
    }

    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/ai-chat - Create a new chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { subject, title, userId } = body;

    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "UserId is required" },
        { status: 400 },
      );
    }

    try {
      const session = await AiChatRepository.createSession(
        userId,
        subject,
        title,
      );

      // Ensure sessionId is returned for compatibility
      const response = {
        ...session,
        sessionId: session.sessionId,
      };

      // Session created successfully - no need to log success in production
      return NextResponse.json(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logError("Session creation failed", error, { userId, subject, title });
      return NextResponse.json(
        { error: "Failed to create session", details: errorMessage },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
