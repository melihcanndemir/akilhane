'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAiChatResponse, type AiChatOutput } from '../ai/flows/ai-chat';
import {
  Mic,
  Send,
} from 'lucide-react';
import VoiceAssistant from './voice-assistant';
import MobileNav from './mobile-nav';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiChatProps {
  subject: string;
  context?: string;
}

const AiChatComponent: React.FC<AiChatProps> = ({ subject, context }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AiChatOutput | null>(null);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'assistant' | 'dictation'>('assistant');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Merhaba! Ben ${subject} konusunda sana yardım etmek için buradayım. 🎓\n\nNe konuda yardıma ihtiyacın var? Sorularını sorabilir, konuları tartışabiliriz. Ben önceki konuşmalarımızı da hatırlarım! 💬`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  }, [subject]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) {return;}

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Convert messages to conversation history format
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      const response = await getAiChatResponse({
        message: inputMessage,
        subject,
        conversationHistory,
        context,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setAiResponse(response);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Üzgünüm, şu anda cevap veremiyorum. Lütfen biraz sonra tekrar dene. 😔',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setAiResponse(null);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInputMessage(transcript);
    // Auto-send after voice input
    setTimeout(() => {
      sendMessage();
    }, 500);
  };

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {

    switch (command) {
      case 'send':
        if (inputMessage.trim()) {
          sendMessage();
        }
        break;
      case 'clear':
        clearChat();
        break;
      case 'help':
        // Add help message
        const helpMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sesli komutlar:\n• "Gönder" - Mesajı gönder\n• "Temizle" - Sohbeti temizle\n• "Yardım" - Bu mesajı göster\n• "Soru" - Soru sor\n• "Açıkla" - Konu açıklaması iste',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, helpMessage]);
        break;
      case 'question':
        setInputMessage('Bu konu hakkında bir soru sorabilir misin?');
        break;
      case 'explain':
        setInputMessage('Bu konuyu detaylı açıklayabilir misin?');
        break;
      default:
        // Unknown command
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Responsive Navigation Bar */}
      <MobileNav />

      <div className="p-4">
        <div className="max-w-4xl mx-auto h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-lg p-4 border-b">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">🤖</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                    AI Öğretmen - {subject}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Önceki konuşmaları hatırlayan akıllı asistan
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Voice Mode Toggle */}
                {showVoiceAssistant && (
                  <button
                    onClick={() => setVoiceMode(voiceMode === 'assistant' ? 'dictation' : 'assistant')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      voiceMode === 'dictation'
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                    }`}
                    title={voiceMode === 'assistant' ? 'Sesli Asistan Modu' : 'Sesli Yazma Modu'}
                  >
                    {voiceMode === 'dictation' ? '📝' : '🤖'}
                    {voiceMode === 'dictation' ? 'Yazma' : 'Asistan'}
                  </button>
                )}

                <button
                  onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    showVoiceAssistant
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                  }`}
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                  {showVoiceAssistant ? 'Sesli Asistanı Kapat' : 'Sesli Asistan'}
                </button>
                <button
                  onClick={clearChat}
                  className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                >
                  Sohbeti Temizle
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 bg-white dark:bg-gray-800 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator - FIX APPLIED */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">AI düşünüyor...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* AI Response Details - ALL KEYS FIXED */}
          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t border-blue-200 dark:border-blue-700"
            >
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Suggested Topics */}
                  <div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                      💡 Önerilen Konular
                    </h4>
                    <div className="space-y-1">
                      {aiResponse.suggestedTopics.slice(0, 3).map((topic, index) => (
                        <div
                          key={`suggested-topic-${Date.now()}-${index}`}
                          className="text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded"
                        >
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Follow Up Questions */}
                  <div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                      ❓ Takip Soruları
                    </h4>
                    <div className="space-y-1">
                      {aiResponse.followUpQuestions.slice(0, 2).map((question, index) => (
                        <div
                          key={`followup-question-${Date.now()}-${index}`}
                          className="text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                          onClick={() => setInputMessage(question)}
                        >
                          {question}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning Tips */}
                  <div>
                    <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                      🎯 Öğrenme İpuçları
                    </h4>
                    <div className="space-y-1">
                      {aiResponse.learningTips.slice(0, 2).map((tip, index) => (
                        <div
                          key={`learning-tip-${Date.now()}-${index}`}
                          className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-800 px-2 py-1 rounded"
                        >
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Input */}
          <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-lg p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajını yaz..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center p-3 sm:px-6 sm:py-3 sm:gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span className="hidden sm:inline">Gönder</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              AI güven seviyesi: {aiResponse ? Math.round(aiResponse.confidence * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant
        onCommand={handleVoiceCommand}
        onTranscript={handleVoiceTranscript}
        isListening={isListening}
        onListeningChange={setIsListening}
        show={showVoiceAssistant}
        mode={voiceMode}
      />
    </div>
  );
};

export default AiChatComponent;
