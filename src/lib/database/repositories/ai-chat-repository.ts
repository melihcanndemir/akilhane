import { supabase } from '@/lib/supabase';

export interface AiChatMessage {
  id: string;
  userId: string;
  sessionId: string;
  subject: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  createdAt: string;
}

export interface AiChatSession {
  id: string;
  userId: string;
  sessionId: string;
  subject: string;
  title?: string | undefined;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

// Supabase data types
type SupabaseSessionData = {
  id: string;
  user_id: string;
  session_id: string;
  subject: string;
  title?: string;
  message_count: number;
  last_message_at: string;
  created_at: string;
  updated_at: string;
};

type SupabaseMessageData = {
  id: string;
  user_id: string;
  session_id: string;
  subject: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  created_at: string;
};

export class AiChatRepository {
  // Create a new chat session
  static async createSession(userId: string, subject: string, title?: string): Promise<AiChatSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const insertData = {
      user_id: userId,
      session_id: sessionId,
      subject,
      title: title || `AI Tutor - ${subject}`,
      message_count: 0,
      last_message_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    const mappedSession = this.mapSessionFromSupabase(data);
    return mappedSession;
  }

  // Get all sessions for a user
  static async getSessionsByUser(userId: string): Promise<AiChatSession[]> {
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) {throw new Error(`Failed to get sessions: ${error.message}`);}
    return data.map(this.mapSessionFromSupabase);
  }

  // Get a specific session by sessionId
  static async getSessionBySessionId(sessionId: string): Promise<AiChatSession | null> {
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {return null;} // No rows returned
      throw new Error(`Failed to get session: ${error.message}`);
    }
    return this.mapSessionFromSupabase(data);
  }

  // Get all messages for a session
  static async getMessagesBySessionId(sessionId: string, userId: string): Promise<AiChatMessage[]> {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error) {throw new Error(`Failed to get messages: ${error.message}`);}
    return data.map(this.mapMessageFromSupabase);
  }

  // Add a message to the chat history
  static async addMessage(
    userId: string,
    sessionId: string,
    subject: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<AiChatMessage> {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .insert({
        user_id: userId,
        session_id: sessionId,
        subject,
        role,
        content,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {throw new Error(`Failed to add message: ${error.message}`);}

    // Update session message count and last message time
    const currentSession = await this.getSessionBySessionId(sessionId);
    if (currentSession) {
      await supabase
        .from('ai_chat_sessions')
        .update({
          message_count: currentSession.messageCount + 1,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);
    }

    return this.mapMessageFromSupabase(data);
  }

  // Update session title
  static async updateSessionTitle(sessionId: string, title: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_chat_sessions')
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    if (error) {throw new Error(`Failed to update session title: ${error.message}`);}
  }

  // Delete a session and all its messages
  static async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      // Delete all messages in the session
      const { error: messagesError } = await supabase
        .from('ai_chat_history')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', userId);

      if (messagesError) {throw messagesError;}

      // Delete the session
      const { error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', userId);

      if (sessionError) {throw sessionError;}

      return true;
    } catch {
      return false;
    }
  }

  // Search sessions by title or content
  static async searchSessions(userId: string, searchTerm: string): Promise<AiChatSession[]> {
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) {throw new Error(`Failed to search sessions: ${error.message}`);}

    // Filter sessions that contain the search term in title or have messages with the term
    const filteredSessions = [];

    for (const session of data) {
      const messages = await this.getMessagesBySessionId(session.session_id, userId);
      const hasMatchingContent = messages.some(msg =>
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      if (session.title?.toLowerCase().includes(searchTerm.toLowerCase()) || hasMatchingContent) {
        filteredSessions.push(this.mapSessionFromSupabase(session));
      }
    }

    return filteredSessions;
  }

  // Get recent sessions (last 10)
  static async getRecentSessions(userId: string, limit: number = 10): Promise<AiChatSession[]> {

    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get recent sessions: ${error.message}`);
    }

    const mappedSessions = data.map(this.mapSessionFromSupabase);
    return mappedSessions;
  }

  // Helper methods to map Supabase data to our interfaces
  private static mapSessionFromSupabase(data: SupabaseSessionData): AiChatSession {
    return {
      id: data.id,
      userId: data.user_id,
      sessionId: data.session_id,
      subject: data.subject,
      title: data.title,
      messageCount: data.message_count,
      lastMessageAt: data.last_message_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapMessageFromSupabase(data: SupabaseMessageData): AiChatMessage {
    return {
      id: data.id,
      userId: data.user_id,
      sessionId: data.session_id,
      subject: data.subject,
      role: data.role,
      content: data.content,
      timestamp: data.timestamp,
      createdAt: data.created_at,
    };
  }
}
