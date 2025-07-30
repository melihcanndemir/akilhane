// components/ai/ai-chat-client.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAiChatResponse, AiChatInput } from '@/ai/flows/ai-chat'; 
import { User, Sparkles, BrainCircuit, Lightbulb, Loader2, Plus, ChevronDown, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { supabase } from '@/lib/supabase';
import AiChatHistory from './ai-chat-history';
import localStorageService from '@/services/localStorage-service';

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

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  isActive: boolean;
}

export default function AiChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubject, setCurrentSubject] = useState('Genel'); 
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Handle scroll events to show/hide scroll button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent scroll from bubbling to parent
    if (!messagesContainerRef.current) return;
    const isNear = isNearBottom();
    setShowScrollButton(!isNear);
  };

  // Only auto-scroll if user is already near bottom
  useEffect(() => {
    // Remove automatic scrolling - let user control it manually
    // if (isNearBottom()) {
    //   scrollToBottom();
    // }
  }, [messages]);

  // Debug: Log messages state changes
  useEffect(() => {
    console.log('📊 Messages state updated:', messages.length, 'messages');
    messages.forEach((msg, index) => {
      console.log(`  ${index + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`);
    });
  }, [messages]);
  
  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
    }
  };

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

  // Load subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Close subject selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.subject-selector')) {
        setShowSubjectSelector(false);
      }
    };

    if (showSubjectSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSubjectSelector]);
  
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
      if (!session) {
        // Create local session if not authenticated
        const sessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorageService.saveAIChatSession({
          sessionId,
          userId: 'guest',
          subject: currentSubject,
          title: `AI Tutor - ${currentSubject}`,
          messages: [],
          lastMessageAt: new Date().toISOString()
        });
        console.log('✅ Created local session:', sessionId);
        return sessionId;
      }
      
      // Try to create session in Supabase
      try {
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
        }
      } catch {
        console.log('❌ Failed to create Supabase session, using localStorage');
      }
      
      // Fallback to localStorage if Supabase fails
      const sessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorageService.saveAIChatSession({
        sessionId,
        userId: session.user.id,
        subject: currentSubject,
        title: `AI Tutor - ${currentSubject}`,
        messages: [],
        lastMessageAt: new Date().toISOString()
      });
      return sessionId;
    } catch {
      console.error('❌ Error creating session');
      return null;
    }
  };

  const saveMessageToHistory = async (role: 'user' | 'assistant', content: string, sessionId?: string) => {
    try {
      const targetSessionId = sessionId || currentSessionId;
      if (!targetSessionId) {
        console.log('❌ No session ID provided for saveMessageToHistory');
        return;
      }

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
      
      // If no userId, use 'guest' for localStorage
      if (!userId) {
        userId = 'guest';
      }
      
      // Try to save to Supabase first (only if user is authenticated)
      if (userId !== 'guest') {
        try {
          const response = await fetch(`/api/ai-chat/${targetSessionId}/messages`, {
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

          if (response.ok) {
            console.log('✅ Message saved to Supabase');
            return; // Successfully saved to Supabase
          }
        } catch {
          console.log('❌ Failed to save to Supabase, falling back to localStorage');
        }
      }
      
      // Fallback to localStorage if Supabase fails or user is guest
      try {
        localStorageService.addMessageToSession(targetSessionId, {
          role,
          content
        });
        console.log('✅ Message saved to localStorage');
      } catch (error) {
        console.error('❌ Failed to save to localStorage:', error);
      }
    } catch {
      console.error('❌ Error saving message');
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      // Try to load from Supabase first
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
      
      if (userId) {
        try {
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
            console.log('✅ Loaded session from Supabase:', sessionId, 'with', formattedMessages.length, 'messages');
            return;
          } else {
            console.log('❌ Supabase session not found, trying localStorage');
          }
        } catch {
          console.log('❌ Failed to load from Supabase, trying localStorage');
        }
      }
      
      // Fallback to localStorage
      try {
        const localSession = localStorageService.getAIChatSession(sessionId);
        if (localSession) {
          const formattedMessages: Message[] = localSession.messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
          }));
          setMessages(formattedMessages);
          setCurrentSessionId(sessionId);
          console.log('✅ Loaded session from localStorage:', sessionId, 'with', formattedMessages.length, 'messages');
        } else {
          console.log('❌ Session not found in localStorage:', sessionId);
          // Set empty messages but keep the session ID
          setMessages([]);
          setCurrentSessionId(sessionId);
        }
      } catch {
        console.error('❌ Failed to load session from localStorage');
        // Set empty messages but keep the session ID
        setMessages([]);
        setCurrentSessionId(sessionId);
      }
    } catch {
      console.error('❌ Error loading session');
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    console.log('🔍 handleSessionSelect called with sessionId:', sessionId);
    
    // Debug: Check localStorage sessions
    const allSessions = localStorageService.getAIChatSessions();
    console.log('📋 All localStorage sessions:', allSessions);
    
    const targetSession = localStorageService.getAIChatSession(sessionId);
    console.log('🎯 Target session:', targetSession);
    
    loadSessionMessages(sessionId);
  };

  const handleSendMessage = async (messageContent: string) => {
    console.log('🚀 handleSendMessage called with:', messageContent);
    console.log('🔍 Current session ID:', currentSessionId);
    if (!messageContent.trim() || isLoading) {
      console.log('❌ Early return - message empty or loading');
      return;
    }

    // Create new session if no current session (for both authenticated and guest users)
    let sessionIdToUse = currentSessionId;
    if (!currentSessionId) {
      console.log('🔐 Creating new session');
      const newSessionId = await createNewSession();
      if (newSessionId) {
        setCurrentSessionId(newSessionId);
        sessionIdToUse = newSessionId;
        console.log('✅ Session created:', newSessionId);
      } else {
        console.log('❌ Failed to create session, but continuing without session');
      }
    } else {
      console.log('🔍 Using existing session:', currentSessionId);
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
    };

    const updatedMessages = [...messages, newUserMessage];
    console.log('📝 Setting messages with user message:', updatedMessages.length, 'messages');

    setMessages(updatedMessages);
    setIsLoading(true);
    setSuggestions(null);

    // Save user message to history if session exists
    if (sessionIdToUse) {
      console.log('💾 Saving user message to session:', sessionIdToUse);
      await saveMessageToHistory('user', messageContent, sessionIdToUse);
    } else {
      console.log('❌ No session ID, skipping save');
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
      console.log('🤖 Calling AI with input:', chatInput.message);
      const result = await getAiChatResponse(chatInput);
      console.log('✅ AI response received:', result.response.substring(0, 50) + '...');
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
      };

      console.log('📝 Adding assistant message to chat');
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message to history if session exists
      if (sessionIdToUse) {
        console.log('💾 Saving assistant message to session:', sessionIdToUse);
        await saveMessageToHistory('assistant', result.response, sessionIdToUse);
      } else {
        console.log('❌ No session ID, skipping assistant save');
      }
      
      setSuggestions({
        suggestedTopics: result.suggestedTopics,
        followUpQuestions: result.followUpQuestions,
        learningTips: result.learningTips,
      });
    } catch (error) {
      console.error('❌ Error in AI chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('🏁 handleSendMessage completed');
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

  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 150; // pixels from bottom - increased threshold
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 pt-0">
      <Card className="w-full max-w-5xl h-[calc(100vh-4rem)] flex flex-col shadow-2xl mt-2 border-gradient-question p-0">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between text-lg md:text-xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-base">AI Tutor</span>
                <div className="relative subject-selector">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSubjectSelector(!showSubjectSelector)}
                    className="gap-1 sm:gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 text-xs sm:text-sm h-8 sm:h-9 w-20 sm:w-24 justify-center"
                  >
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{currentSubject}</span>
                    <span className="sm:hidden">{currentSubject.length > 8 ? currentSubject.substring(0, 8) + '...' : currentSubject}</span>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  
                  {/* Subject Selector Dropdown */}
                  {showSubjectSelector && (
                    <div className="absolute top-full left-0 mt-1 w-48 sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-2">
                          Ders Seçin
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentSubject('Genel');
                            setShowSubjectSelector(false);
                            setMessages([
                              {
                                id: 'init',
                                role: 'assistant',
                                content: `Merhaba! Ben AkılHane AI Tutor'ınız. Genel konularda aklınıza takılan her şeyi sorabilirsiniz. Hadi başlayalım!`
                              }
                            ]);
                          }}
                          className="w-full justify-start text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm"
                        >
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          Genel
                        </Button>
                        {subjects.map((subject) => (
                          <Button
                            key={subject.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentSubject(subject.name);
                              setShowSubjectSelector(false);
                              setMessages([
                                {
                                  id: 'init',
                                  role: 'assistant',
                                  content: `Merhaba! Ben AkılHane AI Tutor'ınız. ${subject.name} dersiyle ilgili aklınıza takılan her şeyi sorabilirsiniz. Hadi başlayalım!`
                                }
                              ]);
                            }}
                            className="w-full justify-start text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm"
                          >
                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            <div className="flex-1 text-left">
                              <div className="font-medium">{subject.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {subject.description}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-1 sm:gap-2">
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
                  className="gap-1 sm:gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Yeni</span>
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-3 md:p-6 space-y-6" onScroll={handleScroll} ref={messagesContainerRef}>
          {messages.map(message => (
            <div key={message.id} className={`flex items-start gap-3 md:gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-blue-200">
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-800"><Sparkles className="text-blue-500" /></AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl rounded-2xl px-4 py-3 shadow-sm ${ message.role === 'user' ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-br-none' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-bl-none'}`}>
                {message.role === 'assistant' ? (
                  <div className="max-w-none text-white">
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
          
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              onClick={() => scrollToBottom()}
              size="sm"
              className="fixed bottom-24 right-4 z-10 rounded-full w-12 h-12 p-0 shadow-lg bg-blue-500 hover:bg-blue-600 text-white"
              aria-label="Scroll to latest message"
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
          )}
        </CardContent>
        <div className="border-t p-4 bg-white dark:bg-gray-950">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 md:gap-4">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="AI Tutor'a bir soru sor..." className="flex-1" disabled={isLoading} />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
            >
              {isLoading ? (<Loader2 className="h-4 w-4 animate-spin" />) : ('Gönder')}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}