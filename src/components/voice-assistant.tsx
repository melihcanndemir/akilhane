'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
  onQuestionRead?: (question: string) => void;
  onAnswerRead?: (answer: string) => void;
  onTranscript?: (transcript: string) => void;
  currentQuestion?: string;
  currentAnswer?: string;
  aiTutorOutput?: string;
  isListening?: boolean;
  onListeningChange?: (listening: boolean) => void;
  show?: boolean;
  mode?: 'assistant' | 'dictation'; // assistant: sesli komutlar, dictation: sesli yazma
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onCommand,
  onQuestionRead,
  onAnswerRead,
  onTranscript,
  currentQuestion,
  currentAnswer,
  aiTutorOutput,
  isListening = false,
  onListeningChange,
  show = true,
  mode = 'assistant'
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isReadingQuestion, setIsReadingQuestion] = useState(false);
  const [isReadingAnswer, setIsReadingAnswer] = useState(false);
  const [isReadingAiTutor, setIsReadingAiTutor] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Convert markdown to plain text for speech
  const markdownToPlainText = (markdown: string): string => {
    return markdown
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
  };

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      const hasSynthesis = 'speechSynthesis' in window;
      setIsSupported(hasRecognition && hasSynthesis);
    };

    checkSupport();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    if (!recognition) return;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'tr-TR';

    recognition.onstart = () => {
      console.log('🎤 Sesli asistan dinlemeye başladı');
      onListeningChange?.(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        handleCommand(finalTranscript.toLowerCase());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Sesli asistan hatası:', event.error);
      onListeningChange?.(false);
    };

    recognition.onend = () => {
      console.log('🎤 Sesli asistan dinlemeyi durdurdu');
      onListeningChange?.(false);
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isSupported, onListeningChange]);

  // Initialize speech synthesis
  useEffect(() => {
    if (!isSupported) return;
    synthesisRef.current = window.speechSynthesis;
  }, [isSupported]);

  const handleCommand = (command: string) => {
    console.log('🎤 Komut algılandı:', command);
    
    if (mode === 'dictation') {
      // Sesli yazma modu - transcript'i direkt gönder
      if (onTranscript) {
        onTranscript(command);
      }
      return;
    }
    
    // Sesli asistan modu - komutları işle
    if (onTranscript) {
      // AI Chat komutları
      if (command.includes('gönder') || command.includes('send')) {
        onCommand?.('send');
        return;
      } else if (command.includes('temizle') || command.includes('clear')) {
        onCommand?.('clear');
        return;
      } else if (command.includes('yardım') || command.includes('help')) {
        onCommand?.('help');
        return;
      } else if (command.includes('soru') && command.includes('sor')) {
        onCommand?.('question');
        return;
      } else if (command.includes('açıkla') || command.includes('açıklama')) {
        onCommand?.('explain');
        return;
      } else {
        // Eğer özel komut değilse, transcript olarak gönder
        onTranscript(command);
        return;
      }
    }
    
    // Quiz/Flashcard komutları
    if (command.includes('cevap') || command.includes('yanıt')) {
      if (currentAnswer) {
        speakText(currentAnswer, 'answer');
      }
    } else if (command.includes('soru') || command.includes('oku')) {
      if (currentQuestion) {
        speakText(currentQuestion, 'question');
      }
    } else if (command.includes('ai') && command.includes('oku') || command.includes('tutor') && command.includes('oku')) {
      if (aiTutorOutput) {
        const plainText = markdownToPlainText(aiTutorOutput);
        speakText(plainText, 'ai-tutor');
      } else {
        speakText('AI Tutor çıktısı henüz mevcut değil. Önce AI yardımı isteyin.', 'help');
      }
    } else if (command.includes('açıkla') || command.includes('açıklama')) {
      if (currentAnswer) {
        speakText(`Cevap: ${currentAnswer}`, 'answer');
      } else if (aiTutorOutput) {
        const plainText = markdownToPlainText(aiTutorOutput);
        speakText(plainText, 'ai-tutor');
      }
    } else if (command.includes('sonraki') || command.includes('ileri')) {
      onCommand?.('next');
    } else if (command.includes('önceki') || command.includes('geri')) {
      onCommand?.('previous');
    } else if (command.includes('karıştır') || command.includes('shuffle')) {
      onCommand?.('shuffle');
    } else if (command.includes('çevir') || command.includes('flip') || command.includes('döndür')) {
      onCommand?.('flip');
    } else if (command.includes('göster') || command.includes('show')) {
      onCommand?.('show');
    } else if (command.includes('gizle') || command.includes('hide')) {
      onCommand?.('hide');
    } else if (command.includes('dur') || command.includes('stop')) {
      stopSpeaking();
    } else if (command.includes('yardım') || command.includes('komutlar')) {
      speakText('Mevcut komutlar: soru oku, cevap oku, AI oku, sonraki, önceki, karıştır, çevir, göster, gizle, dur, yardım', 'help');
    }
  };

  const speakText = (text: string, type: 'question' | 'answer' | 'help' | 'ai-tutor' = 'question') => {
    if (!synthesisRef.current) return;

    // Stop any current speech
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (type === 'question') setIsReadingQuestion(true);
      if (type === 'answer') setIsReadingAnswer(true);
      if (type === 'ai-tutor') setIsReadingAiTutor(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsReadingQuestion(false);
      setIsReadingAnswer(false);
      setIsReadingAiTutor(false);
    };

    utterance.onerror = (event) => {
      console.error('Sesli okuma hatası:', event.error);
      setIsSpeaking(false);
      setIsReadingQuestion(false);
      setIsReadingAnswer(false);
      setIsReadingAiTutor(false);
    };

    synthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      setIsReadingQuestion(false);
      setIsReadingAnswer(false);
      setIsReadingAiTutor(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (currentQuestion) {
      speakText(currentQuestion, 'question');
    }
  };

  if (!isSupported) {
    return show ? (
      <div className="fixed bottom-6 left-6 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 max-w-sm">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <MicOff className="w-5 h-5" />
          <span className="text-sm font-medium">Sesli Asistan Desteklenmiyor</span>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          Tarayıcınız sesli asistan özelliğini desteklemiyor. Chrome, Edge veya Safari kullanın.
        </p>
      </div>
    ) : null;
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Main voice assistant button */}
      <motion.div
        key="main-button"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="relative"
      >
        <Button
          onClick={toggleListening}
          size="lg"
          className={`rounded-full w-16 h-16 shadow-lg transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : mode === 'dictation' 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-500 hover:bg-blue-600'
          }`}
          title={mode === 'dictation' ? 'Sesli Yazma' : 'Sesli Asistan'}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        {/* Status indicator */}
        {isListening && (
          <motion.div
            key="status-indicator"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"
          />
        )}
      </motion.div>

      {/* Control buttons */}
      {(isSpeaking || currentQuestion) && (
        <motion.div
          key="control-buttons"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="absolute bottom-20 left-0 flex flex-col gap-2"
        >
          {/* Speak question button */}
          {currentQuestion && (
            <Button
              key="speak-question"
              onClick={() => speakText(currentQuestion!, 'question')}
              size="sm"
              variant="outline"
              className={`rounded-full w-12 h-12 shadow-lg ${
                isReadingQuestion ? 'bg-green-100 border-green-300' : ''
              }`}
              disabled={isSpeaking && !isReadingQuestion}
            >
              {isReadingQuestion ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          )}

          {/* Speak answer button */}
          {currentAnswer && (
            <Button
              key="speak-answer"
              onClick={() => speakText(currentAnswer!, 'answer')}
              size="sm"
              variant="outline"
              className={`rounded-full w-12 h-12 shadow-lg ${
                isReadingAnswer ? 'bg-green-100 border-green-300' : ''
              }`}
              disabled={isSpeaking && !isReadingAnswer}
            >
              {isReadingAnswer ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          )}

          {/* Speak AI Tutor output button */}
          {aiTutorOutput && (
            <Button
              key="speak-ai-tutor"
              onClick={() => {
                const plainText = markdownToPlainText(aiTutorOutput);
                speakText(plainText, 'ai-tutor');
              }}
              size="sm"
              variant="outline"
              className={`rounded-full w-12 h-12 shadow-lg ${
                isReadingAiTutor ? 'bg-purple-100 border-purple-300' : ''
              }`}
              disabled={isSpeaking && !isReadingAiTutor}
              title="AI Tutor Çıktısını Oku"
            >
              {isReadingAiTutor ? <Pause className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
            </Button>
          )}

          {/* Stop speaking button */}
          {isSpeaking && (
            <Button
              key="stop-speaking"
              onClick={stopSpeaking}
              size="sm"
              variant="outline"
              className="rounded-full w-12 h-12 shadow-lg bg-red-100 border-red-300"
            >
              <VolumeX className="w-4 h-4" />
            </Button>
          )}
        </motion.div>
      )}

      {/* Transcript display */}
      {transcript && (
        <motion.div
          key="transcript-display"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="absolute bottom-20 left-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg max-w-xs"
        >
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Algılanan Komut
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{transcript}</p>
        </motion.div>
      )}

      {/* Help tooltip */}
      {isListening && (
        <motion.div
          key="help-tooltip"
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          className="absolute bottom-20 left-0 max-w-sm"
        >
          <div className="relative">
            {/* Modern gradient background */}
            <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-blue-900/30 dark:to-indigo-900/40 rounded-2xl p-4 shadow-2xl border border-white/20 dark:border-gray-700/50 backdrop-blur-sm">
              {/* Decorative elements */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse delay-300"></div>
              
              {/* Header with modern design */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-blue-200/50 dark:border-blue-700/30">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">
                    Sesli Komutlar
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {mode === 'dictation' ? 'Yazma Modu' : 'Asistan Modu'}
                  </p>
                </div>
              </div>

              {/* Commands with modern styling */}
              <div className="space-y-2">
                {mode === 'dictation' ? (
                  <>
                    <div key="dictation-mode" className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200/50 dark:border-green-700/30">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Sesli Yazma Modu Aktif</span>
                    </div>
                    <div key="dictation-info" className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      Konuştuğunuz her şey yazıya dönüştürülür
                    </div>
                    <div key="dictation-send" className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">"Gönder"</span> diyerek mesajı gönderebilirsiniz
                    </div>
                  </>
                ) : onTranscript ? (
                  <>
                    <div key="send" className="flex items-center gap-3 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">"Gönder"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Mesajı gönder</span>
                      </span>
                    </div>
                    <div key="clear" className="flex items-center gap-3 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-red-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-red-600 dark:text-red-400">"Temizle"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Sohbeti temizle</span>
                      </span>
                    </div>
                    <div key="help" className="flex items-center gap-3 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-purple-600 dark:text-purple-400">"Yardım"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Komutları göster</span>
                      </span>
                    </div>
                    <div key="question" className="flex items-center gap-3 p-2 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-green-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-green-600 dark:text-green-400">"Soru sor"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Soru sor</span>
                      </span>
                    </div>
                    <div key="explain" className="flex items-center gap-3 p-2 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-orange-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-orange-600 dark:text-orange-400">"Açıkla"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Konu açıklaması iste</span>
                      </span>
                    </div>
                    <div key="other" className="mt-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/30">
                      <span className="text-xs text-gray-600 dark:text-gray-400 italic">
                        Diğer sözler mesaj olarak gönderilir
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div key="read-question" className="flex items-center gap-3 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">"Soru oku"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Mevcut soruyu sesli oku</span>
                      </span>
                    </div>
                    <div key="read-answer" className="flex items-center gap-3 p-2 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-green-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-green-600 dark:text-green-400">"Cevap oku"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Cevabı sesli oku</span>
                      </span>
                    </div>
                    <div key="read-ai-tutor" className="flex items-center gap-3 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-purple-600 dark:text-purple-400">"AI oku"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - AI Tutor çıktısını sesli oku</span>
                      </span>
                    </div>
                    <div key="next" className="flex items-center gap-3 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-purple-600 dark:text-purple-400">"Sonraki"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Sonraki soruya geç</span>
                      </span>
                    </div>
                    <div key="previous" className="flex items-center gap-3 p-2 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-orange-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-orange-600 dark:text-orange-400">"Önceki"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Önceki soruya geç</span>
                      </span>
                    </div>
                    <div key="shuffle" className="flex items-center gap-3 p-2 hover:bg-pink-50 dark:hover:bg-pink-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-pink-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-pink-600 dark:text-pink-400">"Karıştır"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Soruları karıştır</span>
                      </span>
                    </div>
                    <div key="flip" className="flex items-center gap-3 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">"Çevir"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Flashcard'ı çevir</span>
                      </span>
                    </div>
                    <div key="show" className="flex items-center gap-3 p-2 hover:bg-teal-50 dark:hover:bg-teal-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-teal-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-teal-600 dark:text-teal-400">"Göster"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Cevabı göster</span>
                      </span>
                    </div>
                    <div key="hide" className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-gray-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">"Gizle"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Cevabı gizle</span>
                      </span>
                    </div>
                    <div key="stop" className="flex items-center gap-3 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors group">
                      <div className="w-2 h-2 bg-red-500 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-semibold text-red-600 dark:text-red-400">"Dur"</span>
                        <span className="text-gray-500 dark:text-gray-400"> - Sesli okumayı durdur</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceAssistant;