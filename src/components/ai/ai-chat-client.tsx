// components/ai/ai-chat-client.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAiChatResponse, AiChatInput } from '@/ai/flows/ai-chat'; 
import { User, Sparkles, BrainCircuit, Lightbulb, Loader2, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { supabase } from '@/lib/supabase';
import AiChatHistory from './ai-chat-history';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Suggestions {
  suggestedTopics: string[];
  followUpQuestions: string[];
  learningTips: string[];
}

export default function AiChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubject] = useState('Genel'); 
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    setMessages([
      {
        id: 'init',
        role: 'assistant',
        content: `Merhaba! Ben AkılHane AI Tutor'ınız. ${currentSubject} dersiyle ilgili aklınıza takılan her şeyi sorabilirsiniz. Hadi başlayalım!`
      }
    ]);
  }, [currentSubject]);

  const createNewSession = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: currentSubject,
          userId: session.user.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.sessionId;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  };

  const saveMessageToHistory = async (role: 'user' | 'assistant', content: string) => {
    try {
      // Try multiple ways to get user ID
      let userId: string | null = null;
      
      // Method 1: Try getSession first
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
      }
      
      // Method 2: If session failed, try getUser
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          userId = user.id;
        }
      }
      
      // Method 3: If both failed, try from session again
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          userId = session.user.id;
        }
      }
      
      if (!userId || !currentSessionId) {
        return;
      }
      
      const response = await fetch(`/api/ai-chat/${currentSessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          content,
          subject: currentSubject,
          userId: userId,
        }),
      });

      if (!response.ok) {
        // Failed to save message
      }
    } catch {
      // Error saving message
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      // Try multiple ways to get user ID
      let userId: string | null = null;
      
      // Method 1: Try getSession first
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
      }
      
      // Method 2: If session failed, try getUser
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          userId = user.id;
        }
      }
      
      if (!userId) {
        return;
      }

      const response = await fetch(`/api/ai-chat/${sessionId}?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        const formattedMessages: Message[] = data.messages.map((msg: { id: string; role: string; content: string }) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
        }));
        setMessages(formattedMessages);
        setCurrentSessionId(sessionId);
      }
    } catch {
      // Error loading session
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    loadSessionMessages(sessionId);
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    // Create new session if authenticated and no current session
    if (isAuthenticated && !currentSessionId) {
      const sessionId = await createNewSession();
      if (!sessionId) {
        return;
      }
      setCurrentSessionId(sessionId);
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
    };

    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setIsLoading(true);
    setSuggestions(null);

    // Save user message to history if authenticated
    if (isAuthenticated) {
      await saveMessageToHistory('user', messageContent);
    }

    const chatInput: AiChatInput = {
      message: messageContent,
      subject: currentSubject,
      conversationHistory: updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString()
      })),
    };

    try {
      const result = await getAiChatResponse(chatInput);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message to history if authenticated
      if (isAuthenticated) {
        await saveMessageToHistory('assistant', result.response);
      }
      
      setSuggestions({
        suggestedTopics: result.suggestedTopics,
        followUpQuestions: result.followUpQuestions,
        learningTips: result.learningTips,
      });
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
    setInput('');
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 pt-0">
      <Card className="w-full max-w-5xl h-[calc(100vh-4rem)] flex flex-col shadow-2xl mt-2">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between text-lg md:text-xl">
            <div className="flex items-center gap-3">
              <Sparkles className="text-blue-500" />
              <span>AI Tutor - {currentSubject}</span>
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <AiChatHistory
                  onSessionSelect={handleSessionSelect}
                  currentSessionId={currentSessionId || undefined}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentSessionId(null);
                    setMessages([
                      {
                        id: 'init',
                        role: 'assistant',
                        content: `Merhaba! Ben AkılHane AI Tutor'ınız. ${currentSubject} dersiyle ilgili aklınıza takılan her şeyi sorabilirsiniz. Hadi başlayalım!`
                      }
                    ]);
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Yeni
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-3 md:p-6 space-y-6">
          {messages.map(message => (
            <div key={message.id} className={`flex items-start gap-3 md:gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-blue-200">
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-800"><Sparkles className="text-blue-500" /></AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl rounded-2xl px-4 py-3 shadow-sm ${ message.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mb-2 prose-p:mb-2 prose-ul:mb-2 prose-ol:mb-2 prose-li:mb-1">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code({ className, children, ...props }: React.ComponentProps<'code'>) {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !className || !className.includes('language-');
                          return !isInline && match ? (
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-gray-300">
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10 border-2 border-blue-200"><AvatarFallback className="bg-blue-100 dark:bg-blue-800"><Sparkles className="text-blue-500" /></AvatarFallback></Avatar>
                <div className="rounded-2xl px-4 py-3 "><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
            </div>
          )}
          {suggestions && !isLoading && (
            <div className='space-y-4 pt-4'>
                {suggestions.followUpQuestions?.length > 0 && (
                     <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-500"/>Şunları Sorabilirsin:</h4>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.followUpQuestions.map((q, i) => ( <Badge key={i} variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSuggestionClick(q)}>{q}</Badge> ))}
                        </div>
                     </div>
                )}
                 {suggestions.suggestedTopics?.length > 0 && (
                     <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-purple-500"/>İlgili Konular:</h4>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.suggestedTopics.map((t, i) => ( <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => handleSuggestionClick(`Bana "${t}" konusunu anlatır mısın?`)}>{t}</Badge>))}
                        </div>
                     </div>
                )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="border-t p-4 bg-white dark:bg-gray-950">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 md:gap-4">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="AI Tutor'a bir soru sor..." className="flex-1" disabled={isLoading} />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (<Loader2 className="h-4 w-4 animate-spin" />) : ('Gönder')}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}