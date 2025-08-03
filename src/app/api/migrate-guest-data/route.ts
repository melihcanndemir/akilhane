import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: User must be logged in to migrate data" },
        { status: 401 },
      );
    }

    // Get the guest data from request body
    const guestData = await request.json();

    if (!guestData?.user?.isGuest) {
      return NextResponse.json(
        { error: "Invalid guest data format" },
        { status: 400 },
      );
    }

    const {
      quizResults = [],
      flashcardProgress = {},
      performanceData = [],
      aiRecommendations = [],
      settings = {},
    } = guestData;

    // Start a transaction-like migration process
    const migrationResults: {
      quizResults: number;
      flashcardProgress: number;
      performanceData: number;
      aiRecommendations: number;
      errors: string[];
    } = {
      quizResults: 0,
      flashcardProgress: 0,
      performanceData: 0,
      aiRecommendations: 0,
      errors: [],
    };

    // Migrate quiz results
    if (quizResults.length > 0) {
      try {
        const formattedQuizResults = quizResults.map(
          (result: {
            createdAt: string;
            weakTopics: string[];
            totalQuestions: number;
            timeSpent: number;
          }) => ({
            ...result,
            userId: user.id, // Replace guest user ID with Supabase user ID
            user_id: user.id,
            created_at: result.createdAt,
            weak_topics: JSON.stringify(result.weakTopics),
            total_questions: result.totalQuestions,
            time_spent: result.timeSpent,
          }),
        );

        // Note: This would require implementing actual database operations
        // For now, we'll store in user metadata or implement proper DB calls
        const { error: quizError } = await supabase
          .from("quiz_results")
          .insert(formattedQuizResults);

        if (!quizError) {
          migrationResults.quizResults = formattedQuizResults.length;
        } else {
          migrationResults.errors.push(`Quiz results: ${quizError.message}`);
        }
      } catch (error) {
        migrationResults.errors.push(
          `Quiz results migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    // Migrate performance data
    if (performanceData.length > 0) {
      try {
        const formattedPerformanceData = performanceData.map(
          (perf: {
            averageScore: number;
            totalTests: number;
            averageTimeSpent: number;
            weakTopics: string[];
            lastUpdated: string;
          }) => ({
            ...perf,
            userId: user.id,
            user_id: user.id,
            average_score: perf.averageScore,
            total_tests: perf.totalTests,
            average_time_spent: perf.averageTimeSpent,
            weak_topics: JSON.stringify(perf.weakTopics),
            last_updated: perf.lastUpdated,
          }),
        );

        const { error: perfError } = await supabase
          .from("performance_analytics")
          .insert(formattedPerformanceData);

        if (!perfError) {
          migrationResults.performanceData = formattedPerformanceData.length;
        } else {
          migrationResults.errors.push(
            `Performance data: ${perfError.message}`,
          );
        }
      } catch (error) {
        migrationResults.errors.push(
          `Performance data migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    // Migrate flashcard progress
    if (Object.keys(flashcardProgress).length > 0) {
      try {
        const formattedFlashcardProgress = Object.values(flashcardProgress).map(
          (progress: unknown) => {
            const p = progress as {
              cardId: string;
              isKnown: boolean;
              reviewCount: number;
              lastReviewed: string;
              nextReview: string;
              createdAt: string;
              updatedAt: string;
            };
            return {
              ...p,
              userId: user.id,
              user_id: user.id,
              card_id: p.cardId,
              is_known: p.isKnown,
              review_count: p.reviewCount,
              last_reviewed: p.lastReviewed,
              next_review: p.nextReview,
              created_at: p.createdAt,
              updated_at: p.updatedAt,
            };
          },
        );

        const { error: flashcardError } = await supabase
          .from("flashcard_progress")
          .insert(formattedFlashcardProgress);

        if (!flashcardError) {
          migrationResults.flashcardProgress =
            formattedFlashcardProgress.length;
        } else {
          migrationResults.errors.push(
            `Flashcard progress: ${flashcardError.message}`,
          );
        }
      } catch (error) {
        migrationResults.errors.push(
          `Flashcard progress migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    // Migrate AI recommendations
    if (aiRecommendations.length > 0) {
      try {
        const formattedAIRecommendations = aiRecommendations.map(
          (rec: { recommendedDifficulty: string; createdAt: string }) => ({
            ...rec,
            userId: user.id,
            user_id: user.id,
            recommended_difficulty: rec.recommendedDifficulty,
            created_at: rec.createdAt,
          }),
        );

        const { error: aiError } = await supabase
          .from("ai_recommendations")
          .insert(formattedAIRecommendations);

        if (!aiError) {
          migrationResults.aiRecommendations =
            formattedAIRecommendations.length;
        } else {
          migrationResults.errors.push(
            `AI recommendations: ${aiError.message}`,
          );
        }
      } catch (error) {
        migrationResults.errors.push(
          `AI recommendations migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    // Store user preferences in metadata
    if (settings && Object.keys(settings).length > 0) {
      try {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            guest_migration_completed: true,
            migrated_settings: settings,
            migration_date: new Date().toISOString(),
          },
        });

        if (metadataError) {
          migrationResults.errors.push(
            `Metadata update: ${metadataError.message}`,
          );
        }
      } catch (error) {
        migrationResults.errors.push(
          `Metadata migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    // Return migration results
    return NextResponse.json({
      success: true,
      message: "Guest data migration completed",
      results: migrationResults,
      totalMigrated:
        migrationResults.quizResults +
        migrationResults.performanceData +
        migrationResults.flashcardProgress +
        migrationResults.aiRecommendations,
      hasErrors: migrationResults.errors.length > 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Migration failed",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    );
  }
}
