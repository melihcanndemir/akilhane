import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: User must be logged in to migrate data' },
        { status: 401 }
      );
    }

    // Get the guest data from request body
    const guestData = await request.json();
    
    if (!guestData || !guestData.user || !guestData.user.isGuest) {
      return NextResponse.json(
        { error: 'Invalid guest data format' },
        { status: 400 }
      );
    }

    const { 
      quizResults = [], 
      flashcardProgress = {}, 
      performanceData = [], 
      aiRecommendations = [],
      settings = {}
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
      errors: []
    };

    // Migrate quiz results
    if (quizResults.length > 0) {
      try {
        const formattedQuizResults = quizResults.map((result: any) => ({
          ...result,
          userId: user.id, // Replace guest user ID with Supabase user ID
          user_id: user.id,
          created_at: result.createdAt,
          weak_topics: JSON.stringify(result.weakTopics),
          total_questions: result.totalQuestions,
          time_spent: result.timeSpent
        }));

        // Note: This would require implementing actual database operations
        // For now, we'll store in user metadata or implement proper DB calls
        const { error: quizError } = await supabase
          .from('quiz_results')
          .insert(formattedQuizResults);
        
        if (!quizError) {
          migrationResults.quizResults = formattedQuizResults.length;
        } else {
          migrationResults.errors.push(`Quiz results: ${quizError.message}`);
        }
      } catch (error: any) {
        migrationResults.errors.push(`Quiz results migration failed: ${error.message}`);
      }
    }

    // Migrate performance data
    if (performanceData.length > 0) {
      try {
        const formattedPerformanceData = performanceData.map((perf: any) => ({
          ...perf,
          userId: user.id,
          user_id: user.id,
          average_score: perf.averageScore,
          total_tests: perf.totalTests,
          average_time_spent: perf.averageTimeSpent,
          weak_topics: JSON.stringify(perf.weakTopics),
          last_updated: perf.lastUpdated
        }));

        const { error: perfError } = await supabase
          .from('performance_analytics')
          .insert(formattedPerformanceData);
        
        if (!perfError) {
          migrationResults.performanceData = formattedPerformanceData.length;
        } else {
          migrationResults.errors.push(`Performance data: ${perfError.message}`);
        }
      } catch (error: any) {
        migrationResults.errors.push(`Performance data migration failed: ${error.message}`);
      }
    }

    // Migrate flashcard progress
    if (Object.keys(flashcardProgress).length > 0) {
      try {
        const formattedFlashcardProgress = Object.values(flashcardProgress).map((progress: any) => ({
          ...progress,
          userId: user.id,
          user_id: user.id,
          card_id: progress.cardId,
          is_known: progress.isKnown,
          review_count: progress.reviewCount,
          last_reviewed: progress.lastReviewed,
          next_review: progress.nextReview,
          created_at: progress.createdAt,
          updated_at: progress.updatedAt
        }));

        const { error: flashcardError } = await supabase
          .from('flashcard_progress')
          .insert(formattedFlashcardProgress);
        
        if (!flashcardError) {
          migrationResults.flashcardProgress = formattedFlashcardProgress.length;
        } else {
          migrationResults.errors.push(`Flashcard progress: ${flashcardError.message}`);
        }
      } catch (error: any) {
        migrationResults.errors.push(`Flashcard progress migration failed: ${error.message}`);
      }
    }

    // Migrate AI recommendations
    if (aiRecommendations.length > 0) {
      try {
        const formattedAIRecommendations = aiRecommendations.map((rec: any) => ({
          ...rec,
          userId: user.id,
          user_id: user.id,
          recommended_difficulty: rec.recommendedDifficulty,
          created_at: rec.createdAt
        }));

        const { error: aiError } = await supabase
          .from('ai_recommendations')
          .insert(formattedAIRecommendations);
        
        if (!aiError) {
          migrationResults.aiRecommendations = formattedAIRecommendations.length;
        } else {
          migrationResults.errors.push(`AI recommendations: ${aiError.message}`);
        }
      } catch (error: any) {
        migrationResults.errors.push(`AI recommendations migration failed: ${error.message}`);
      }
    }

    // Store user preferences in metadata
    if (settings && Object.keys(settings).length > 0) {
      try {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            guest_migration_completed: true,
            migrated_settings: settings,
            migration_date: new Date().toISOString()
          }
        });

        if (metadataError) {
          migrationResults.errors.push(`Metadata update: ${metadataError.message}`);
        }
      } catch (error: any) {
        migrationResults.errors.push(`Metadata migration failed: ${error.message}`);
      }
    }

    // Return migration results
    return NextResponse.json({
      success: true,
      message: 'Guest data migration completed',
      results: migrationResults,
      totalMigrated: migrationResults.quizResults + 
                   migrationResults.performanceData + 
                   migrationResults.flashcardProgress + 
                   migrationResults.aiRecommendations,
      hasErrors: migrationResults.errors.length > 0
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        message: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
} 