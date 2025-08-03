import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { QuestionRepository } from "@/lib/database/repositories/question-repository";
import { initializeDatabase } from "@/lib/database/connection";
import { shouldUseDemoData, getDemoQuestions } from "@/data/demo-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, difficulty, questionCount = 10 } = body;

    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 },
      );
    }

    // Demo mode check - Server-side check with header
    const demoHeader = request.headers.get("x-demo-mode") === "true";
    const isDemoMode = demoHeader;

    if (isDemoMode) {
      // Map subject name to subject ID
      const subjectNameToId = {
        Matematik: "subj_matematik_001",
        Fizik: "subj_fizik_002",
        Kimya: "subj_kimya_003",
        Tarih: "subj_tarih_004",
        Biyoloji: "subj_biyoloji_005",
        "Türk Dili ve Edebiyatı": "subj_edebiyat_006",
        İngilizce: "subj_ingilizce_007",
      };

      const subjectId =
        subjectNameToId[subject as keyof typeof subjectNameToId] || subject;

      const demoQuestions = getDemoQuestions(subjectId);

      // Apply difficulty filter
      let filteredQuestions = demoQuestions;
      if (difficulty && difficulty !== "all") {
        filteredQuestions = demoQuestions.filter(
          (q) => q.difficulty === difficulty,
        );
      }

      // Limit questions and shuffle
      const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(
        0,
        Math.min(questionCount, shuffled.length),
      );

      if (selectedQuestions.length === 0) {
        return NextResponse.json(
          {
            error: `No questions found for subject "${subject}". Available subjects: ${Object.keys(subjectNameToId).join(", ")}`,
          },
          { status: 404 },
        );
      }

      return NextResponse.json({
        questions: selectedQuestions,
        totalQuestions: selectedQuestions.length,
        subject,
        difficulty: difficulty || "all",
      });
    }

    // Normal API flow
    initializeDatabase();

    const questions = await QuestionRepository.getRandomQuestions(
      subject,
      questionCount,
      difficulty === "all" ? undefined : difficulty,
    );

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions found for this subject" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      questions,
      totalQuestions: questions.length,
      subject,
      difficulty: difficulty || "all",
    });
  } catch {
    // Check if demo mode should be used in case of error
    if (shouldUseDemoData()) {
      const body = await request.json();
      const { subject } = body;

      if (subject) {
        const demoQuestions = getDemoQuestions(subject);
        const shuffled = demoQuestions
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        return NextResponse.json({
          questions: shuffled,
          totalQuestions: shuffled.length,
          subject,
          difficulty: "all",
        });
      }
    }

    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Initialize database if not already done
    initializeDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const subject = searchParams.get("subject");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Import here to avoid circular dependency
    const { getAllPerformanceData, getPerformanceHistoryForSubject } =
      await import("@/services/performance-service");

    let data;
    if (subject) {
      // Get results for specific subject
      const results = await getPerformanceHistoryForSubject(subject, userId);
      data = { [subject]: results };
    } else {
      // Get all results
      data = await getAllPerformanceData(userId);
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to get quiz results" },
      { status: 500 },
    );
  }
}
