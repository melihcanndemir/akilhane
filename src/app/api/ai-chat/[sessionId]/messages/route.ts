import { NextRequest, NextResponse } from 'next/server';
import { AiChatRepository } from '@/lib/database/repositories/ai-chat-repository';

// POST /api/ai-chat/[sessionId]/messages - Add a message to a session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    console.log('🔍 API: Messages POST request received');
    const { sessionId } = await params;
    const { role, content, subject, userId } = await request.json();
    
    console.log('🔍 API: Messages request body:', { sessionId, role, content, subject, userId });

    if (!userId) {
      console.log('❌ API: Messages - UserId is missing');
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    if (!role || !content || !subject) {
      console.log('❌ API: Messages - Missing required fields');
      return NextResponse.json({ 
        error: 'Role, content, and subject are required' 
      }, { status: 400 });
    }

    if (role !== 'user' && role !== 'assistant') {
      console.log('❌ API: Messages - Invalid role');
      return NextResponse.json({ 
        error: 'Role must be either "user" or "assistant"' 
      }, { status: 400 });
    }

    console.log('🔍 API: Messages - About to call AiChatRepository.addMessage');
    const message = await AiChatRepository.addMessage(
      userId,
      sessionId,
      subject,
      role,
      content
    );

    console.log('✅ API: Messages - Message added successfully:', message);
    return NextResponse.json(message);
  } catch (error) {
    console.error('❌ API: Messages - Error adding AI chat message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 