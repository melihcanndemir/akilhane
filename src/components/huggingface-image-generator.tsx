"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Image,
  Loader2,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HuggingFaceImageGeneratorProps {
  description: string;
  topic: string;
  subject: string;
  onImageGenerated?: (imageUrl: string) => void;
}

const HuggingFaceImageGenerator: React.FC<HuggingFaceImageGeneratorProps> = ({
  description,
  topic,
  subject,
  onImageGenerated,
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = async () => {
    try {
      setIsGenerating(true);
      setIsLoading(true);

      console.log("🚀 Pollinations.ai görsel üretimi başlatılıyor...");

      // Backend API ile görsel üretimi
      const response = await fetch("/api/generate-image-hf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: description,
          topic,
          subject,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Pollinations.ai API yanıtı:", data);

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        onImageGenerated?.(data.imageUrl);

        toast({
          title: "AI Görsel Hazır",
          description: `${topic} konusu için Pollinations.ai görsel başarıyla üretildi.`,
        });
      } else {
        throw new Error("Görsel URL alınamadı");
      }
    } catch (error) {
      console.error("💥 Pollinations.ai Image generation error:", error);

      let errorMessage = "AI görsel üretilirken bir hata oluştu.";

      if (error instanceof Error) {
        if (error.message.includes("API token")) {
          errorMessage = "Pollinations.ai API token bulunamadı.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage =
            "Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Görsel Üretim Hatası",
        description: errorMessage,
        variant: "destructive",
      });

      // Fallback görsel
      setGeneratedImage("/api/placeholder-image");
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `${topic}-${subject}-pollinations-ai-gorsel.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Görsel İndirildi",
        description: "Pollinations.ai görsel başarıyla indirildi.",
      });
    }
  };

  const regenerateImage = () => {
    setGeneratedImage(null);
    generateImage();
  };

  return (
    <Card className="shadow-lg border-purple-200 dark:border-purple-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
              Pollinations.ai Görsel Üretici
            </CardTitle>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            🎨 Pollinations.ai
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Görsel Açıklaması */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
            AI Görsel Açıklaması:
          </h4>
          <p className="text-sm text-purple-700 dark:text-purple-400">
            {description}
          </p>
        </div>

        {/* Görsel Üretim Butonu */}
        {!generatedImage && (
          <Button
            onClick={generateImage}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Pollinations.ai Görsel Üretiliyor...
              </>
            ) : (
              <>
                <Image className="w-4 h-4 mr-2" />
                Pollinations.ai Görsel Üret
              </>
            )}
          </Button>
        )}

        {/* Üretilen Görsel */}
        {generatedImage && (
          <div className="space-y-4">
            <div className="relative">
              {showImage ? (
                <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 rounded-lg flex items-center justify-center overflow-hidden">
                  {isLoading ? (
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        Görsel yükleniyor...
                      </p>
                    </div>
                  ) : (
                    <img
                      src={generatedImage}
                      alt={`${topic} konusu için Pollinations.ai üretilen görsel`}
                      className="w-full h-full object-cover rounded-lg"
                      onLoad={() => setIsLoading(false)}
                      onError={() => {
                        setIsLoading(false);
                        setGeneratedImage("/api/placeholder-image");
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Görsel gizlendi
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Görsel Kontrolleri */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowImage(!showImage)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {showImage ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {showImage ? "Gizle" : "Göster"}
              </Button>

              <Button
                onClick={downloadImage}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                İndir
              </Button>

              <Button
                onClick={regenerateImage}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Yeniden Üret
              </Button>
            </div>

            {/* Görsel Bilgileri */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>Pollinations.ai tarafından üretilen görsel</p>
              <p>
                Konu: {topic} | Ders: {subject}
              </p>
            </div>
          </div>
        )}

        {/* Bilgi */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="font-medium mb-1">ℹ️ Pollinations.ai Görsel Üretimi:</p>
          <ul className="space-y-1 text-xs">
            <li>• Tamamen ücretsiz AI görsel üretimi</li>
            <li>• Yüksek kaliteli ve hızlı</li>
            <li>• API key gerektirmez</li>
            <li>• 768x768 çözünürlük</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default HuggingFaceImageGenerator;
