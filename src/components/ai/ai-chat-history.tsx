'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { History, Search, Trash2, MessageSquare, Calendar, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AiChatSession {
  id: string;
  userId: string;
  sessionId: string;
  subject: string;
  title?: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

interface AiChatHistoryProps {
  onSessionSelect: (sessionId: string) => void;
  currentSessionId?: string | undefined;
}

export default function AiChatHistory({ onSessionSelect, currentSessionId }: AiChatHistoryProps) {
  const [sessions, setSessions] = useState<AiChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchSessions = async (search?: string) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSessions([]);
        return;
      }

      const url = search 
        ? `/api/ai-chat?search=${encodeURIComponent(search)}&userId=${user.id}`
        : `/api/ai-chat?userId=${user.id}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        console.error('Failed to fetch sessions');
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Hata",
          description: "Kullanıcı kimliği bulunamadı.",
          variant: "destructive",
        });
        return;
      }

      console.log('🔍 Deleting session:', { sessionId, userId: user.id });
      
      const response = await fetch(`/api/ai-chat/${sessionId}?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Konuşma geçmişi silindi.",
        });
        fetchSessions(searchTerm);
      } else {
        console.error('Failed to delete session:', response.status);
        toast({
          title: "Hata",
          description: "Konuşma geçmişi silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting session:', error);
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
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Az önce';
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
          className="gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
        >
          <History className="w-4 h-4" />
          Geçmiş
        </Button>
      </DialogTrigger>
      <DialogContent className="
  max-w-2xl
  max-h-[85vh]
  overflow-hidden
  flex
  flex-col
  w-[94vw] ml-[3vw] mr-[3vw] mx-auto
  lg:w-auto lg:mx-auto
  p-4 sm:p-6
">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            AI Tutor Geçmişi
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Konuşma geçmişinde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-purple-700 hover:to-blue-700">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Yükleniyor...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz konuşma geçmişi yok.'}
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <Card 
                key={session.sessionId} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentSessionId === session.sessionId ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => {
                  onSessionSelect(session.sessionId);
                  setIsDialogOpen(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <h3 className="font-medium text-sm truncate">
                          {session.title || `AI Tutor - ${session.subject}`}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{session.messageCount} mesaj</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(session.lastMessageAt)}</span>
                        </div>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs">
                        {session.subject}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.sessionId);
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
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