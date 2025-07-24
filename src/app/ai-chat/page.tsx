'use client';

import { useSearchParams } from 'next/navigation';
import AiChatComponent from '@/components/ai-chat';

export default function AiChatPage() {
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') || 'Genel';
  const context = searchParams.get('context') || undefined;

  return <AiChatComponent subject={subject} context={context} />;
} 