// components/ai/ai-chat-client.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AiChatInput } from '@/ai/flows/ai-chat';
import { getAiChatResponse } from '@/ai/flows/ai-chat';
import { User, Sparkles, BrainCircuit, Lightbulb, Loader2, Plus, ChevronDown, BookOpen, Mic, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { supabase } from '@/lib/supabase';
import AiChatHistory from './ai-chat-history';
import localStorageService from '@/services/localStorage-service';
import VoiceAssistant from '../voice-assistant';

// LocalStorage service for subjects
class SubjectLocalStorageService {
  private static readonly STORAGE_KEY = 'exam_training_subjects';

  static getSubjects(): unknown[] {
    if (typeof window === 'undefined') {return [];}
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

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

  // Voice Assistant states
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Handle scroll events to show/hide scroll button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent scroll from bubbling to parent
    if (!messagesContainerRef.current) {return;}
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

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      // Get user's custom subjects from localStorage
      const customSubjects = SubjectLocalStorageService.getSubjects() as Subject[];

      // Only show custom subjects, no demo subjects
      setSubjects(customSubjects);
    } catch {
      // Fallback to empty array on error
      setSubjects([]);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(Boolean(session));
    };
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((session) => {
      setIsAuthenticated(Boolean(session));
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
        content: `Merhaba! Ben AkılHane AI Tutor'ınız. ${currentSubject} dersiyle ilgili aklınıza takılan her şeyi sorabilirsiniz. Hadi başlayalım!`,
      },
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
          lastMessageAt: new Date().toISOString(),
        });
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
      }

      // Fallback to localStorage if Supabase fails
      const sessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorageService.saveAIChatSession({
        sessionId,
        userId: session.user.id,
        subject: currentSubject,
        title: `AI Tutor - ${currentSubject}`,
        messages: [],
        lastMessageAt: new Date().toISOString(),
      });
      return sessionId;
    } catch {
      //do nothing
      return null;
    }
  };

  const saveMessageToHistory = async (role: 'user' | 'assistant', content: string, sessionId?: string) => {
    try {
      const targetSessionId = sessionId || currentSessionId;
      if (!targetSessionId) {
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
              userId,
            }),
          });

          if (response.ok) {
            return; // Successfully saved to Supabase
          }
        } catch {
        }
      }

      // Fallback to localStorage if Supabase fails or user is guest
      try {
        localStorageService.addMessageToSession(targetSessionId, {
          role,
          content,
        });
      } catch {
        //do nothing
      }
    } catch {
      //do nothing
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
            return;
          } else {
          }
        } catch {
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
        } else {
          // Set empty messages but keep the session ID
          setMessages([]);
          setCurrentSessionId(sessionId);
        }
      } catch {
        // Set empty messages but keep the session ID
        setMessages([]);
        setCurrentSessionId(sessionId);
      }
    } catch {
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    loadSessionMessages(sessionId);
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) {
      return;
    }

    // Create new session if no current session (for both authenticated and guest users)
    let sessionIdToUse = currentSessionId;
    if (!currentSessionId) {
      const newSessionId = await createNewSession();
      if (newSessionId) {
        setCurrentSessionId(newSessionId);
        sessionIdToUse = newSessionId;
      } else {
      }
    } else {
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

    // Save user message to history if session exists
    if (sessionIdToUse) {
      await saveMessageToHistory('user', messageContent, sessionIdToUse);
    } else {
    }

    const chatInput: AiChatInput = {
      message: messageContent,
      subject: currentSubject,
      conversationHistory: updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString(),
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

      // Save assistant message to history if session exists
      if (sessionIdToUse) {
        await saveMessageToHistory('assistant', result.response, sessionIdToUse);
      } else {
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

  const isNearBottom = () => {
    if (!messagesContainerRef.current) {return true;}
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 150; // pixels from bottom - increased threshold
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Voice Assistant handlers
  const lastTranscriptRef = useRef<string>('');
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleVoiceTranscript = (transcript: string) => {
    // Capture the transcript immediately to avoid race condition
    const voiceTranscript = transcript.trim();

    if (!voiceTranscript || voiceTranscript === lastTranscriptRef.current) {
      return; // Skip empty or duplicate transcripts
    }

    // Update last transcript to prevent duplicates
    lastTranscriptRef.current = voiceTranscript;

    // Set input field to show what will be sent
    setInput(voiceTranscript);

    // Clear previous timeout to prevent multiple sends
    if (transcriptTimeoutRef.current) {
      clearTimeout(transcriptTimeoutRef.current);
    }

    // Debounced auto-send using captured transcript
    transcriptTimeoutRef.current = setTimeout(() => {
      // Double-check that we haven't received a newer transcript
      if (voiceTranscript === lastTranscriptRef.current) {
        handleSendMessage(voiceTranscript);
        setInput('');
        lastTranscriptRef.current = ''; // Reset for next input
      }
    }, 1200); // Increased delay for better stability
  };

  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case 'clear':
        setMessages([]);
        setSuggestions(null);
        break;
      default:
        // Unknown command
    }
  };

  useEffect(() => () => {
    if (transcriptTimeoutRef.current) {
      clearTimeout(transcriptTimeoutRef.current);
      transcriptTimeoutRef.current = null;
    }
  }, []);
  // Convert markdown to plain text for speech
  const markdownToPlainText = (markdown: string): string => markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/\n\s*\n/g, '. ') // Replace double newlines with periods
    .replace(/\n/g, ' ') // Replace single newlines with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Speak AI response
  const speakAIResponse = (messageId: string, content: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    // If already speaking this message, stop it
    if (speakingMessageId === messageId) {
      setSpeakingMessageId(null);
      return;
    }

    const plainText = markdownToPlainText(content);
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Try to find a male Turkish voice
    const voices = window.speechSynthesis.getVoices();
    const turkishVoices = voices.filter(voice =>
      voice.lang.includes('tr') || voice.lang.includes('TR'),
    );

    // Look for male voice keywords in Turkish voices
    const maleVoice = turkishVoices.find(voice =>
      voice.name.toLowerCase().includes('erkek') ||
      voice.name.toLowerCase().includes('male') ||
      voice.name.toLowerCase().includes('man') ||
      voice.name.toLowerCase().includes('ahmet') ||
      voice.name.toLowerCase().includes('mehmet') ||
      !voice.name.toLowerCase().includes('kadın') &&
      !voice.name.toLowerCase().includes('female') &&
      !voice.name.toLowerCase().includes('woman') &&
      !voice.name.toLowerCase().includes('ayşe') &&
      !voice.name.toLowerCase().includes('fatma'),
    );

    if (maleVoice) {
      utterance.voice = maleVoice;
      // Adjust pitch for more masculine sound
      utterance.pitch = 0.8;
    } else if (turkishVoices.length > 0 && turkishVoices[0]) {
      // Use any Turkish voice available
      utterance.voice = turkishVoices[0];
    }

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 pt-0">
      <Card className="w-full max-w-5xl h-[calc(100vh-4rem)] flex flex-col shadow-2xl mt-2 border-gradient-question p-0">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between text-lg md:text-xl">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Sparkles className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                <span className="text-sm sm:text-base flex-shrink-0">AI Tutor</span>
                <div className="relative subject-selector">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSubjectSelector(!showSubjectSelector)}
                    className="gap-1 sm:gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 text-xs sm:text-sm h-8 sm:h-9 min-w-[80px] sm:min-w-[100px] max-w-[120px] sm:max-w-[150px] justify-center"
                  >
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">{currentSubject}</span>
                    <span className="sm:hidden truncate">{currentSubject.length > 6 ? `${currentSubject.substring(0, 6)  }...` : currentSubject}</span>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
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
                                content: 'Merhaba! Ben AkılHane AI Tutor\'ınız. Genel konularda aklınıza takılan her şeyi sorabilirsiniz. Hadi başlayalım!',
                              },
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
                                  content: `Merhaba! Ben AkılHane AI Tutor'ınız. ${subject.name} dersiyle ilgili aklınıza takılan her şeyi sorabilirsiniz. Hadi başlayalım!`,
                                },
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
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
                className={`gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 ${
                  showVoiceAssistant
                    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 border-red-300'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 border-blue-300'
                }`}
              >
                <Mic className={`w-3 h-3 sm:w-4 sm:h-4 ${isListening ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{showVoiceAssistant ? 'Sesli Kapat' : 'Sesli Asistan'}</span>
              </Button>

              {isAuthenticated && (
                <>
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
                          content: `Merhaba! Ben AkılHane AI Tutor'ınız. ${currentSubject} dersiyle ilgili aklınıza takılan her şeyi sorabilirsiniz. Hadi başlayalım!`,
                        },
                      ]);
                    }}
                    className="gap-1 sm:gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Yeni</span>
                  </Button>
                </>
              )}
            </div>
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
              <div className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl rounded-2xl px-4 py-3 shadow-sm relative ${ message.role === 'user' ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-br-none' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-bl-none'}`}>
                {message.role === 'assistant' ? (
                  <div className="max-w-none text-white">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code({ className, children, ...props }: React.ComponentProps<'code'>) {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !className?.includes('language-');
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

                    {/* Voice Play Button for AI responses */}
                    <button
                      onClick={() => speakAIResponse(message.id, message.content)}
                      className="absolute bottom-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                                              title={speakingMessageId === message.id ? 'Sesi durdur' : 'AI yanıtını dinle'}
                    >
                      <Volume2 className={`w-3 h-3 ${speakingMessageId === message.id ? 'animate-pulse' : ''}`} />
                    </button>
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

      {/* Voice Assistant */}
      <VoiceAssistant
        onCommand={handleVoiceCommand}
        onTranscript={handleVoiceTranscript}
        isListening={isListening}
        onListeningChange={setIsListening}
        show={showVoiceAssistant}
        aiTutorOutput={messages.length > 0 ?
          messages.slice().reverse().find(msg => msg.role === 'assistant')?.content || '' : ''}
      />
    </div>
  );
}
