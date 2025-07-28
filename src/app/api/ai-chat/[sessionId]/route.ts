import { NextRequest, NextResponse } from 'next/server';
import { AiChatRepository } from '@/lib/database/repositories/ai-chat-repository';

// GET /api/ai-chat/[sessionId] - Get all messages for a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    console.log('🔍 API: Session GET request received');
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('🔍 API: Session GET - sessionId:', sessionId, 'userId:', userId);

    if (!userId) {
      console.log('❌ API: Session GET - UserId is missing');
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    console.log('🔍 API: Session GET - About to call AiChatRepository.getMessagesBySessionId');
    const messages = await AiChatRepository.getMessagesBySessionId(sessionId, userId);
    console.log('✅ API: Session GET - Messages returned:', messages?.length || 0);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('❌ API: Session GET - Error fetching AI chat messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/ai-chat/[sessionId] - Delete a chat session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    console.log('🔍 API: Session DELETE request received');
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('🔍 API: Session DELETE - sessionId:', sessionId, 'userId:', userId);

    if (!userId) {
      console.log('❌ API: Session DELETE - UserId is missing');
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    console.log('🔍 API: Session DELETE - About to call AiChatRepository.deleteSession');
    const success = await AiChatRepository.deleteSession(sessionId, userId);

    if (!success) {
      console.log('❌ API: Session DELETE - Failed to delete session');
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    console.log('✅ API: Session DELETE - Session deleted successfully');
    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('❌ API: Session DELETE - Error deleting AI chat session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/ai-chat/[sessionId] - Update session title
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    console.log('🔍 API: Session PUT request received');
    const { sessionId } = await params;
    const { title, userId } = await request.json();
    
    console.log('🔍 API: Session PUT - sessionId:', sessionId, 'title:', title, 'userId:', userId);

    if (!userId) {
      console.log('❌ API: Session PUT - UserId is missing');
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    if (!title) {
      console.log('❌ API: Session PUT - Title is missing');
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    console.log('🔍 API: Session PUT - About to call AiChatRepository.updateSessionTitle');
    await AiChatRepository.updateSessionTitle(sessionId, title, userId);
    console.log('✅ API: Session PUT - Session title updated successfully');

    return NextResponse.json({ message: 'Session title updated successfully' });
  } catch (error) {
    console.error('❌ API: Session PUT - Error updating AI chat session title:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 