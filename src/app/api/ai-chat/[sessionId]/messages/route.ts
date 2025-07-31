import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { AiChatRepository } from '@/lib/database/repositories/ai-chat-repository';

// POST /api/ai-chat/[sessionId]/messages - Add a message to a session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    const { role, content, subject, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    if (!role || !content || !subject) {
      return NextResponse.json({
        error: 'Role, content, and subject are required',
      }, { status: 400 });
    }

    if (role !== 'user' && role !== 'assistant') {
      return NextResponse.json({
        error: 'Role must be either "user" or "assistant"',
      }, { status: 400 });
    }

    const message = await AiChatRepository.addMessage(
      userId,
      sessionId,
      subject,
      role,
      content,
    );

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
