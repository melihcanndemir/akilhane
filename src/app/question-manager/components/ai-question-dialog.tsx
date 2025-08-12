"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { 
  Subject, 
  AIGeneratedQuestion, 
  AIGenerationResult 
} from "@/types/question-manager";

interface AIQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  onGenerate: (formData: any) => Promise<void>;
  onApprove: (questions: AIGeneratedQuestion[]) => Promise<void>;
  isGenerating: boolean;
  isCreating: boolean;
  aiGeneratedQuestions: AIGeneratedQuestion[];
  aiGenerationResult: AIGenerationResult | null;
}

export default function AIQuestionDialog({
  open,
  onOpenChange,
  subjects,
  onGenerate,
  onApprove,
  isGenerating,
  isCreating,
  aiGeneratedQuestions,
  aiGenerationResult,
}: AIQuestionDialogProps) {
  const [activeAITab, setActiveAITab] = useState<string>("generate");
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedAIQuestions, setSelectedAIQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [aiFormData, setAIFormData] = useState({
    subject: "",
    topic: "",
    type: "multiple-choice" as
      | "multiple-choice"
      | "true-false"
      | "calculation"
      | "case-study",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    count: 5,
    guidelines: "",
  });

  const handleAIGenerate = async () => {
    await onGenerate(aiFormData);
    setActiveAITab("review");
  };

  const handleApproveAIQuestions = async () => {
    const questionsToAdd = aiGeneratedQuestions.filter((_, idx) =>
      selectedAIQuestions.has(idx),
    );
    await onApprove(questionsToAdd);
  };

  const toggleAIQuestionSelection = (index: number) => {
    const newSelection = new Set(selectedAIQuestions);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedAIQuestions(newSelection);
  };

  const selectAllAIQuestions = () => {
    if (selectedAIQuestions.size === aiGeneratedQuestions.length) {
      setSelectedAIQuestions(new Set());
    } else {
      setSelectedAIQuestions(
        new Set(aiGeneratedQuestions.map((_, idx) => idx)),
      );
    }
  };

  const resetDialog = () => {
    setSelectedAIQuestions(new Set());
    setActiveAITab("generate");
    setShowAnswers(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          resetDialog();
        }
      }}
    >
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] w-[98vw] max-w-[98vw] h-[95vh] sm:h-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI ile Soru Oluştur
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeAITab}
          onValueChange={setActiveAITab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Oluştur</TabsTrigger>
            <TabsTrigger
              value="review"
              disabled={aiGeneratedQuestions.length === 0}
            >
              İncele ({aiGeneratedQuestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="generate"
            className="space-y-2 sm:space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto"
          >
            <div className="grid gap-2 sm:gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <Label htmlFor="ai-subject">Ders</Label>
                  <Select
                    value={aiFormData.subject}
                    onValueChange={(value) => {
                      setAIFormData({ ...aiFormData, subject: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ders seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ai-topic">Konu</Label>
                  <Input
                    id="ai-topic"
                    value={aiFormData.topic}
                    onChange={(e) =>
                      setAIFormData({ ...aiFormData, topic: e.target.value })
                    }
                    placeholder="Örn: Türev ve İntegral"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <Label htmlFor="ai-type">Soru Tipi</Label>
                  <Select
                    value={aiFormData.type}
                    onValueChange={(value) =>
                      setAIFormData({
                        ...aiFormData,
                        type: value as
                          | "multiple-choice"
                          | "true-false"
                          | "calculation"
                          | "case-study",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">
                        Çoktan Seçmeli
                      </SelectItem>
                      <SelectItem value="true-false">Doğru/Yanlış</SelectItem>
                      <SelectItem value="calculation">Hesaplama</SelectItem>
                      <SelectItem value="case-study">
                        Vaka Çalışması
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ai-difficulty">Zorluk</Label>
                  <Select
                    value={aiFormData.difficulty}
                    onValueChange={(value) =>
                      setAIFormData({
                        ...aiFormData,
                        difficulty: value as "Easy" | "Medium" | "Hard",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Kolay</SelectItem>
                      <SelectItem value="Medium">Orta</SelectItem>
                      <SelectItem value="Hard">Zor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ai-count">Soru Sayısı</Label>
                  <Input
                    id="ai-count"
                    type="number"
                    min="1"
                    max="25"
                    value={aiFormData.count}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setAIFormData({
                        ...aiFormData,
                        count: Math.min(Math.max(value, 1), 25),
                      });
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Token limiti nedeniyle maksimum 25 soru üretilebilir.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="ai-guidelines" className="text-sm">
                  Ek Yönergeler (Opsiyonel)
                </Label>
                <Textarea
                  id="ai-guidelines"
                  value={aiFormData.guidelines}
                  onChange={(e) =>
                    setAIFormData({
                      ...aiFormData,
                      guidelines: e.target.value,
                    })
                  }
                  placeholder="AI'ya ek talimatlar verebilirsiniz. Örn: Gerçek hayat örnekleri kullan, görsel tasvirler ekle..."
                  rows={2}
                  className="min-h-[60px] sm:min-h-[80px]"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  AI tarafından oluşturulan sorular otomatik olarak kalite
                  kontrolünden geçirilecek ve onayınız alındıktan sonra soru
                  bankasına eklenecektir.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleAIGenerate}
                disabled={
                  isGenerating || !aiFormData.subject || !aiFormData.topic
                }
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-10 sm:h-10 shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    <span className="text-xs sm:text-sm">Sorular Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span className="text-xs sm:text-sm">AI ile Soru Oluştur</span>
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="review"
            className="space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto"
          >
            {aiGenerationResult && aiGeneratedQuestions.length > 0 ? (
              <>
                <div className="flex flex-col gap-3 mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">
                      Oluşturulan Sorular
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {aiGenerationResult.metadata.subject} -{" "}
                      {aiGenerationResult.metadata.topic}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium">Kalite Puanı:</span>
                      <Badge
                        variant={
                          aiGenerationResult.qualityScore > 0.8
                            ? "default"
                            : aiGenerationResult.qualityScore > 0.6
                              ? "secondary"
                              : "destructive"
                        }
                        className="ml-2 text-xs"
                      >
                        {(aiGenerationResult.qualityScore * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAnswers(!showAnswers)}
                        className="h-8 text-xs w-full sm:w-auto"
                      >
                        {showAnswers ? "Cevapları Gizle" : "Cevapları Göster"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllAIQuestions}
                        className="h-8 text-xs w-full sm:w-auto"
                      >
                        {selectedAIQuestions.size ===
                        aiGeneratedQuestions.length
                          ? "Hiçbirini Seçme"
                          : "Tümünü Seç"}
                      </Button>
                    </div>
                  </div>
                </div>

                <Progress
                  value={aiGenerationResult.qualityScore * 100}
                  className="mb-4"
                />

                {aiGenerationResult.suggestions.length > 0 && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>İyileştirme Önerileri:</strong>
                      <ul className="list-disc list-inside mt-2">
                        {aiGenerationResult.suggestions.map(
                          (suggestion, idx) => (
                            <li key={idx} className="text-sm">
                              {suggestion}
                            </li>
                          ),
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <ScrollArea className="h-[250px] sm:h-[400px] pr-2 sm:pr-4">
                  <div className="space-y-4">
                    {aiGeneratedQuestions.map((question, idx) => (
                      <div
                        key={idx}
                        className={`cursor-pointer transition-all p-4 border rounded-lg ${
                          selectedAIQuestions.has(idx)
                            ? "ring-2 ring-purple-600 bg-purple-50/50 dark:bg-purple-950/20"
                            : ""
                        }`}
                        onClick={() => toggleAIQuestionSelection(idx)}
                      >
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Checkbox
                              checked={selectedAIQuestions.has(idx)}
                              onCheckedChange={() =>
                                toggleAIQuestionSelection(idx)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="scale-75 sm:scale-100"
                            />
                            <Badge variant="outline" className="text-xs">
                              {question.difficulty}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {question.topic}
                            </Badge>
                          </div>
                          {selectedAIQuestions.has(idx) && (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                          )}
                        </div>

                        <h4 className="font-medium mb-2 text-sm sm:text-base">
                          {question.text}
                        </h4>

                        {question.options.length > 0 && (
                          <div className="space-y-1 mb-2 sm:mb-3">
                            {question.options.map((option, optIdx) => (
                              <div
                                key={optIdx}
                                className={`text-xs sm:text-sm p-1.5 sm:p-2 rounded ${
                                  showAnswers && option.isCorrect
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                                    : "bg-gray-100 dark:bg-gray-800"
                                }`}
                              >
                                {showAnswers && option.isCorrect && (
                                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-1" />
                                )}
                                {String.fromCharCode(65 + optIdx)}){" "}
                                {option.text}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="border-t pt-2 sm:pt-3">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            <strong>Açıklama:</strong>{" "}
                            {question.explanation}
                          </p>
                          {question.learningObjective && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              <strong>Öğrenme Hedefi:</strong>{" "}
                              {question.learningObjective}
                            </p>
                          )}
                          {question.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {question.keywords.map((keyword, kIdx) => (
                                <Badge
                                  key={kIdx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex flex-col gap-3 pt-3 sm:pt-4 border-t">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    {selectedAIQuestions.size} / {aiGeneratedQuestions.length}{" "}
                    soru seçildi
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm"
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={handleApproveAIQuestions}
                      disabled={selectedAIQuestions.size === 0 || isCreating}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm shadow-lg"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">
                            Ekleniyor...
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">
                            Soruları Ekle
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="w-16 h-16 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Henüz soru oluşturulmadı
                </h3>
                <p className="text-muted-foreground mb-4">
                  AI ile soru oluşturmak için &quot;Oluştur&quot; sekmesini
                  kullanın
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveAITab("generate")}
                >
                  Soru Oluştur
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
