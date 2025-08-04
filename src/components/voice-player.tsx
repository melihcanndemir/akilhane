"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoicePlayerProps {
  text: string;
  autoPlay?: boolean;
  speed?: number;
  language?: string;
  voice?: string;
  className?: string;
  showControls?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

const VoicePlayer: React.FC<VoicePlayerProps> = ({
  text,
  autoPlay = false,
  speed = 1,
  language = "tr-TR",
  className = "",
  showControls = true,
  onPlay,
  onPause,
  onEnd,
}) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if speech synthesis is supported
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
      loadVoices();
    } else {
      setIsSupported(false);
      toast({
        title: "Seslendirme Desteklenmiyor",
        description: "Tarayıcınız seslendirme özelliğini desteklemiyor.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Load available voices
  const loadVoices = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Select Turkish voice if available
      const turkishVoice = voices.find(v =>
        v.lang.includes("tr") || v.lang.includes("TR"),
      );
      setSelectedVoice(turkishVoice || voices[0] || null);
    }
  };

  // Handle voices loaded
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && isSupported && text) {
      handlePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text, isSupported]);

  const handlePlay = () => {
    if (!isSupported || !text) {return;}

    try {
      // Stop any current speech
      window.speechSynthesis.cancel();

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Set properties
      utterance.lang = language;
      utterance.rate = currentSpeed;
      utterance.volume = isMuted ? 0 : 1;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        onPlay?.();
      };

      utterance.onend = () => {
        setIsPlaying(false);
        onEnd?.();
      };

      utterance.onpause = () => {
        setIsPlaying(false);
        onPause?.();
      };

      utterance.onresume = () => {
        setIsPlaying(true);
        onPlay?.();
      };

      utterance.onerror = () => {
        // Speech synthesis error handling
        setIsPlaying(false);
        toast({
          title: "Seslendirme Hatası",
          description: "Seslendirme sırasında bir hata oluştu.",
          variant: "destructive",
        });
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);

      toast({
        title: "Seslendirme Başladı",
        description: "Metin seslendiriliyor...",
      });
    } catch {
      // Speech synthesis error handling
      toast({
        title: "Seslendirme Hatası",
        description: "Seslendirme başlatılamadı.",
        variant: "destructive",
      });
    }
  };

  const handlePause = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (isPlaying) {
        window.speechSynthesis.pause();
      } else {
        window.speechSynthesis.resume();
      }
    }
  };

  const handleStop = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    if (newSpeed !== undefined) {
      setCurrentSpeed(newSpeed);

      // Update current utterance if playing
      if (isPlaying && utteranceRef.current) {
        utteranceRef.current.rate = newSpeed;
      }
    }
  };

  const handleVoiceChange = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);

    // Update current utterance if playing
    if (isPlaying && utteranceRef.current) {
      utteranceRef.current.voice = voice;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);

    // Update current utterance if playing
    if (utteranceRef.current) {
      utteranceRef.current.volume = !isMuted ? 0 : 1;
    }
  };

  if (!isSupported) {
    return (
      <div className={`p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg ${className}`}>
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Seslendirme özelliği bu tarayıcıda desteklenmiyor.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={!text}
            size="sm"
            variant="outline"
            className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isPlaying ? "Duraklat" : "Oynat"}
          </Button>

          <Button
            onClick={handleStop}
            disabled={!isPlaying}
            size="sm"
            variant="outline"
            className="hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
            Durdur
          </Button>

          <Button
            onClick={toggleMute}
            size="sm"
            variant="outline"
            className="hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 hover:text-white"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>

                     <Button
             onClick={() => setShowSettings(!showSettings)}
             size="sm"
             variant="outline"
             className="hidden md:flex hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:text-white"
           >
             <Settings className="w-4 h-4" />
           </Button>
        </div>

                 <div className="flex items-center gap-1 sm:gap-2">
           <Badge variant="outline" className="text-xs px-1 sm:px-2 hidden sm:block">
             {currentSpeed}x
           </Badge>
           {selectedVoice && (
             <Badge variant="secondary" className="text-xs px-1 sm:px-2 hidden sm:block">
               {selectedVoice.name}
             </Badge>
           )}
         </div>
      </div>

             {/* Settings Panel - Desktop Only */}
       {showControls && showSettings && (
         <div className="hidden md:block border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
           {/* Speed Control */}
           <div>
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
               Ses Hızı: {currentSpeed}x
             </label>
             <Slider
               value={[currentSpeed]}
               onValueChange={handleSpeedChange}
               max={2}
               min={0.5}
               step={0.1}
               className="w-full"
             />
           </div>

           {/* Voice Selection */}
           {availableVoices.length > 0 && (
             <div>
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                 Ses Seçimi
               </label>
               <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                 {availableVoices.map((voice) => (
                   <Button
                     key={voice.name}
                     onClick={() => handleVoiceChange(voice)}
                     size="sm"
                     variant={selectedVoice?.name === voice.name ? "default" : "outline"}
                     className="text-xs justify-start"
                   >
                     {voice.name} ({voice.lang})
                   </Button>
                 ))}
               </div>
             </div>
           )}

           {/* Text Preview */}
           <div>
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
               Seslendirilecek Metin
             </label>
             <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-32 overflow-y-auto">
               <p className="text-sm text-gray-600 dark:text-gray-400">
                 {text || "Seslendirilecek metin yok"}
               </p>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default VoicePlayer;
