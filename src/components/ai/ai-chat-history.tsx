"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  History,
  Search,
  Trash2,
  MessageSquare,
  Calendar,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import localStorageService from "@/services/localStorage-service";

interface AiChatSession {
  id: string;
  userId: string;
  sessionId: string;
  subject: string;
  title?: string | undefined;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    image?: string;
  } | undefined;
}

interface AiChatHistoryProps {
  onSessionSelect: (sessionId: string) => void;
  currentSessionId?: string | undefined;
}

export default function AiChatHistory({
  onSessionSelect,
  currentSessionId,
}: AiChatHistoryProps) {
  const [sessions, setSessions] = useState<AiChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchSessions = async (search?: string) => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let allSessions: AiChatSession[] = [];

      // Try to fetch from Supabase first
      if (user) {
        try {
          const url = search
            ? `/api/ai-chat?search=${encodeURIComponent(search)}&userId=${user.id}`
            : `/api/ai-chat?userId=${user.id}`;

          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();
            allSessions = data;
          }
        } catch {}
      }

      // Get sessions from localStorage
      const localSessions = localStorageService.getAIChatSessions();

      // Convert localStorage sessions to the expected format
      const localFormattedSessions: AiChatSession[] = localSessions.map(
        (session) => {
          const lastMessage = session.messages && session.messages.length > 0
            ? session.messages[session.messages.length - 1]
            : undefined;

          return {
            id: session.id,
            userId: session.userId,
            sessionId: session.sessionId,
            subject: session.subject,
            title: session.title || undefined,
            messageCount: session.messages?.length || 0,
            lastMessageAt: session.lastMessageAt,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              ...(lastMessage.image && { image: lastMessage.image }),
            } : undefined,
          };
        },
      );

      // Combine Supabase and localStorage sessions
      const combinedSessions = [...allSessions, ...localFormattedSessions];

      // Sort by last message date (newest first)
      combinedSessions.sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime(),
      );

      setSessions(combinedSessions);
    } catch {
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      // Get user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let deletedFromSupabase = false;

      // Try to delete from Supabase first
      if (user) {
        try {
          const response = await fetch(
            `/api/ai-chat/${sessionId}?userId=${user.id}`,
            {
              method: "DELETE",
            },
          );

          if (response.ok) {
            deletedFromSupabase = true;
          }
        } catch {}
      }

      // Try to delete from localStorage
      try {
        const deletedFromLocal =
          localStorageService.deleteAIChatSession(sessionId);
        if (deletedFromLocal || deletedFromSupabase) {
          toast({
            title: "Başarılı",
            description: "Konuşma geçmişi silindi.",
          });
          fetchSessions(searchTerm);
        } else {
          toast({
            title: "Hata",
            description: "Konuşma geçmişi bulunamadı.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Hata",
          description: "Konuşma geçmişi silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Hata",
        description: "Konuşma geçmişi silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = () => {
    fetchSessions(searchTerm);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return "Az önce";
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} gün önce`;
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      fetchSessions();
    }
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 sm:gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 text-xs sm:text-sm h-8 sm:h-9"
        >
          <History className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Geçmiş</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="
  max-w-6xl
  max-h-[98vh]
  overflow-hidden
  flex
  flex-col
  w-[94vw] ml-[3vw] mr-[3vw] mx-auto
  lg:w-auto lg:mx-auto
  p-3 sm:p-4 lg:p-6
"
      >
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <DialogTitle className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <History className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <span className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                AI Tutor Geçmişi
              </span>
              <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">
                Önceki konuşmalarınızı görüntüleyin ve devam edin
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 mb-6 lg:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            <Input
              placeholder="Konuşma geçmişinde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 lg:h-12 lg:text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800"
            />
          </div>
          <Button
            onClick={handleSearch}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 lg:h-12 lg:px-6"
          >
            <Search className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline ml-2">Ara</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
                Yükleniyor...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Konuşma geçmişi getiriliyor
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm
                  ? "Arama sonucu bulunamadı"
                  : "Henüz konuşma geçmişi yok"}
              </h3>
              <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {searchTerm
                  ? "Arama kriterlerinize uygun konuşma bulunamadı. Farklı kelimeler deneyin."
                  : "AI Tutor ile ilk konuşmanızı başlatın ve burada görünecek."}
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <Card
                key={session.sessionId}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 ${
                  currentSessionId === session.sessionId
                    ? "ring-2 ring-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                }`}
                onClick={() => {
                  onSessionSelect(session.sessionId);
                  setIsDialogOpen(false);
                }}
              >
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header with icon and title */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                          <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm lg:text-base truncate text-gray-900 dark:text-gray-100">
                            {session.title || `AI Tutor - ${session.subject}`}
                          </h3>
                          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 truncate">
                            {session.subject} konusunda sohbet
                          </p>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1 text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="font-medium">
                            {session.messageCount} mesaj
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="font-medium">
                            {formatDate(session.lastMessageAt)}
                          </span>
                        </div>
                      </div>

                      {/* Last message preview */}
                      {session.lastMessage && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Son mesaj:
                          </p>
                          <div className="flex items-start gap-2">
                            {session.lastMessage.image && (
                              <Image
                                src={session.lastMessage.image}
                                alt="Son mesaj resmi"
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                              />
                            )}
                            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 flex-1">
                              {session.lastMessage.content}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Subject badge */}
                      <div className="flex items-center gap-1 mt-2">
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                        >
                          {session.subject}
                        </Badge>
                        {session.messageCount > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs font-medium text-green-600 border-green-300 dark:text-green-400 dark:border-green-700"
                          >
                            Aktif
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.sessionId);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 lg:p-2"
                    >
                      <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
