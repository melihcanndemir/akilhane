import { NextRequest, NextResponse } from 'next/server';
import { AiChatRepository } from '@/lib/database/repositories/ai-chat-repository';

// GET /api/ai-chat - Get all chat sessions for the user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      console.log('❌ API: No userId provided');
      return NextResponse.json({ error: 'UserId required' }, { status: 400 });
    }

    const searchTerm = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('🔍 API: Calling AiChatRepository.getRecentSessions with userId:', userId);
    let sessions;
    if (searchTerm) {
      sessions = await AiChatRepository.searchSessions(userId, searchTerm);
    } else {
      sessions = await AiChatRepository.getRecentSessions(userId, limit);
    }

    console.log('✅ API: Sessions returned:', sessions?.length || 0);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('❌ API: Error fetching AI chat sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/ai-chat - Create a new chat session
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: POST request received');
    const body = await request.json();
    console.log('🔍 API: Request body:', body);
    
    const { subject, title, userId } = body;

    if (!subject) {
      console.log('❌ API: Subject is missing');
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    if (!userId) {
      console.log('❌ API: UserId is missing');
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    console.log('🔍 API: Creating session for user:', userId, 'subject:', subject);
    console.log('🔍 API: About to call AiChatRepository.createSession');
    
    try {
      const session = await AiChatRepository.createSession(userId, subject, title);
      console.log('✅ API: Session created successfully:', session);
      return NextResponse.json(session);
    } catch (error) {
      console.error('❌ API: Error creating session:', error);
      console.error('❌ API: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to create session', details: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ API: Error parsing request or general error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 