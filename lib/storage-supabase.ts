import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '@/lib/logger';
import type { StorageOptions, StorageService, ChatSession, Message } from '@/types/chat';

interface SupabaseChatSession {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  user_id: string;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class SupabaseStorageService implements StorageService {
  private supabase: SupabaseClient;
  private userId: string;

  constructor(options?: StorageOptions) {
    if (!options?.supabase) {
      throw new Error('Supabase configuration is required');
    }

    if (!options?.userId) {
      throw new Error('User ID is required for Supabase storage');
    }

    this.userId = options.userId;
    this.supabase = createClient(options.supabase.url, options.supabase.anonKey);

    logger.debug('SupabaseStorageService initialized', {
      url: options.supabase.url,
      userId: this.userId,
    });
  }

  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get chat sessions from Supabase', { error });
        return [];
      }

      if (!data || data.length === 0) {
        logger.debug('No chat sessions found in Supabase', { userId: this.userId });
        return [];
      }

      const sessions: ChatSession[] = data.map((session: SupabaseChatSession) => ({
        id: session.id,
        title: session.title,
        messages: session.messages || [],
        createdAt: session.created_at,
        tokenUsage: session.token_usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      }));

      logger.debug('Loaded chat sessions from Supabase', {
        userId: this.userId,
        count: sessions.length,
      });

      return sessions;
    } catch (error) {
      logger.error('Error getting chat sessions from Supabase', { error, userId: this.userId });
      return [];
    }
  }

  async saveChatSessions(sessions: ChatSession[]): Promise<void> {
    try {
      const supabaseSessions: SupabaseChatSession[] = sessions.map(session => ({
        id: session.id,
        title: session.title,
        messages: session.messages || [],
        created_at: session.createdAt || new Date().toISOString(),
        user_id: this.userId,
        token_usage: session.tokenUsage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      }));

      const { error } = await this.supabase.from('chat_sessions').upsert(supabaseSessions);

      if (error) {
        logger.error('Failed to save chat sessions to Supabase', { error, userId: this.userId });
        throw error;
      }

      logger.debug('Saved chat sessions to Supabase', {
        userId: this.userId,
        count: sessions.length,
      });
    } catch (error) {
      logger.error('Error saving chat sessions to Supabase', { error, userId: this.userId });
      throw error;
    }
  }

  async getActiveChatId(): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('active_chat_id')
        .eq('user_id', this.userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found"
        logger.error('Failed to get active chat ID from Supabase', { error, userId: this.userId });
        return '';
      }

      const activeId = data?.active_chat_id || '';
      logger.debug('Got active chat ID from Supabase', { userId: this.userId, activeId });
      return activeId;
    } catch (error) {
      logger.error('Error getting active chat ID from Supabase', { error, userId: this.userId });
      return '';
    }
  }

  async saveActiveChatId(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.from('user_preferences').upsert({
        user_id: this.userId,
        active_chat_id: id,
      });

      if (error) {
        logger.error('Failed to save active chat ID to Supabase', { error, userId: this.userId });
        throw error;
      }

      logger.debug('Saved active chat ID to Supabase', { userId: this.userId, id });
    } catch (error) {
      logger.error('Error saving active chat ID to Supabase', { error, userId: this.userId });
      throw error;
    }
  }

  async getSelectedModel(): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('selected_model')
        .eq('user_id', this.userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found"
        logger.error('Failed to get selected model from Supabase', { error, userId: this.userId });
        return '';
      }

      const model = data?.selected_model || '';
      logger.debug('Got selected model from Supabase', { userId: this.userId, model });
      return model;
    } catch (error) {
      logger.error('Error getting selected model from Supabase', { error, userId: this.userId });
      return '';
    }
  }

  async saveSelectedModel(model: string): Promise<void> {
    try {
      const { error } = await this.supabase.from('user_preferences').upsert({
        user_id: this.userId,
        selected_model: model,
      });

      if (error) {
        logger.error('Failed to save selected model to Supabase', { error, userId: this.userId });
        throw error;
      }

      logger.debug('Saved selected model to Supabase', { userId: this.userId, model });
    } catch (error) {
      logger.error('Error saving selected model to Supabase', { error, userId: this.userId });
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear chat sessions
      const { error: sessionsError } = await this.supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', this.userId);

      if (sessionsError) {
        logger.error('Failed to clear chat sessions from Supabase', {
          error: sessionsError,
          userId: this.userId,
        });
      }

      // Clear user preferences
      const { error: preferencesError } = await this.supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', this.userId);

      if (preferencesError) {
        logger.error('Failed to clear user preferences from Supabase', {
          error: preferencesError,
          userId: this.userId,
        });
      }

      logger.debug('Cleared all data from Supabase', { userId: this.userId });
    } catch (error) {
      logger.error('Error clearing data from Supabase', { error, userId: this.userId });
      throw error;
    }
  }
}
