import { Pool } from 'pg';
import logger from '@/lib/logger';
import { isValidUUID, isSafeString } from '@/lib/utils';
import type { StorageOptions, StorageService, Message } from '@/types/chat';
import { ChatSession } from '@/types/chat';

interface DatabaseRow {
  [key: string]: unknown;
}

export class PostgresStorageService implements StorageService {
  private pool: Pool;
  private userId?: string;

  constructor(options?: StorageOptions) {
    this.userId = options?.userId;

    // Validate user ID if provided
    if (this.userId && !isValidUUID(this.userId) && !isSafeString(this.userId, 255)) {
      throw new Error('Invalid user ID format - must be a valid UUID or safe string');
    }

    if (!options?.connectionUrl) {
      throw new Error('PostgreSQL connection URL is required');
    }

    // Get configuration from environment variables with fallbacks
    const maxConnections = parseInt(process.env.DB_POOL_SIZE || '10', 10);
    const idleTimeout = parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10);
    const connectionTimeout = parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10);

    this.pool = new Pool({
      connectionString: options.connectionUrl,
      max: maxConnections,
      idleTimeoutMillis: idleTimeout,
      connectionTimeoutMillis: connectionTimeout,
    });

    logger.debug('PostgreSQL storage service initialized', {
      userId: this.userId,
      hasConnectionUrl: !!options.connectionUrl,
      maxConnections,
      idleTimeout,
      connectionTimeout,
    });
  }

  private async getConnection() {
    try {
      return await this.pool.connect();
    } catch (error) {
      if (error instanceof Error && error.message.includes('pool exhausted')) {
        logger.error('Database connection pool exhausted', {
          userId: this.userId,
          poolInfo: {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount,
          },
        });
        throw new Error('Database connection pool exhausted, please try again later');
      }
      throw error;
    }
  }

  async getChatSessions(): Promise<ChatSession[]> {
    const client = await this.getConnection();
    try {
      const query = `
        SELECT 
          cs.id,
          cs.title,
          cs.created_at,
          cs.prompt_tokens,
          cs.completion_tokens,
          cs.total_tokens,
          COALESCE(
            json_agg(
              json_build_object(
                'id', m.id,
                'role', m.role,
                'content', m.content,
                'model', m.model,
                'tool_calls', m.tool_calls,
                'tool_call_id', m.tool_call_id,
                'name', m.name
              ) ORDER BY m.created_at
            ) FILTER (WHERE m.id IS NOT NULL),
            '[]'::json
          ) as messages
        FROM chat_sessions cs
        LEFT JOIN messages m ON cs.id = m.session_id
        WHERE ($1::text IS NULL OR cs.user_id = $1)
        GROUP BY cs.id, cs.title, cs.created_at, cs.prompt_tokens, cs.completion_tokens, cs.total_tokens
        ORDER BY cs.created_at DESC
      `;

      const result = await client.query(query, [this.userId || null]);

      const sessions: ChatSession[] = result.rows.map((row: DatabaseRow) => ({
        id: row.id as string,
        title: row.title as string,
        messages: Array.isArray(row.messages)
          ? row.messages.map(
              (msg: Record<string, unknown>): Message => ({
                id: msg.id as string,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                role: msg.role as any,
                content: msg.content as string,
                model: msg.model === null ? undefined : (msg.model as string | undefined),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                tool_calls: msg.tool_calls === null ? undefined : (msg.tool_calls as any),
                tool_call_id:
                  msg.tool_call_id === null ? undefined : (msg.tool_call_id as string | undefined),
              })
            )
          : [],
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : undefined,
        tokenUsage: {
          prompt_tokens: (row.prompt_tokens as number) || 0,
          completion_tokens: (row.completion_tokens as number) || 0,
          total_tokens: (row.total_tokens as number) || 0,
        },
      }));

      logger.debug('Loaded chat sessions from PostgreSQL', {
        userId: this.userId,
        count: sessions.length,
      });

      return sessions;
    } catch (error) {
      logger.error('Failed to get chat sessions from PostgreSQL', {
        userId: this.userId,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async saveChatSessions(sessions: ChatSession[]): Promise<void> {
    // Validate input sessions
    for (const session of sessions) {
      if (!isValidUUID(session.id)) {
        throw new Error(`Invalid session ID format: ${session.id}`);
      }
      if (!isSafeString(session.title, 500)) {
        throw new Error(`Invalid session title: ${session.title}`);
      }
      
      // Validate messages
      for (const message of session.messages) {
        if (!isValidUUID(message.id)) {
          throw new Error(`Invalid message ID format: ${message.id}`);
        }
        if (message.content && !isSafeString(message.content, 50000)) {
          throw new Error(`Invalid message content for message ${message.id}`);
        }
        if (message.model && !isSafeString(message.model, 100)) {
          throw new Error(`Invalid model name: ${message.model}`);
        }
      }
    }

    const client = await this.getConnection();

    try {
      await client.query('BEGIN');

      const existingSessionsQuery = this.userId
        ? 'SELECT id FROM chat_sessions WHERE user_id = $1'
        : 'SELECT id FROM chat_sessions WHERE user_id IS NULL';

      const existingResult = await client.query(
        existingSessionsQuery,
        this.userId ? [this.userId] : []
      );

      const existingSessionIds = new Set(existingResult.rows.map(row => row.id));
      const newSessionIds = new Set(sessions.map(session => session.id));

      const sessionsToDelete = [...existingSessionIds].filter(id => !newSessionIds.has(id));
      for (const sessionId of sessionsToDelete) {
        await client.query('DELETE FROM chat_sessions WHERE id = $1', [sessionId]);
      }

      for (const session of sessions) {
        const sessionQuery = `
          INSERT INTO chat_sessions (id, user_id, title, created_at, prompt_tokens, completion_tokens, total_tokens)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) 
          DO UPDATE SET 
            title = EXCLUDED.title,
            prompt_tokens = EXCLUDED.prompt_tokens,
            completion_tokens = EXCLUDED.completion_tokens,
            total_tokens = EXCLUDED.total_tokens
        `;

        await client.query(sessionQuery, [
          session.id,
          this.userId || null,
          session.title,
          session.createdAt ? new Date(session.createdAt) : new Date(),
          session.tokenUsage?.prompt_tokens || 0,
          session.tokenUsage?.completion_tokens || 0,
          session.tokenUsage?.total_tokens || 0,
        ]);

        await client.query('DELETE FROM messages WHERE session_id = $1', [session.id]);

        // Insert messages
        for (const message of session.messages) {
          const messageQuery = `
            INSERT INTO messages (id, session_id, role, content, model, tool_calls, tool_call_id, name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id)
            DO UPDATE SET
              role = EXCLUDED.role,
              content = EXCLUDED.content,
              model = EXCLUDED.model,
              tool_calls = EXCLUDED.tool_calls,
              tool_call_id = EXCLUDED.tool_call_id,
              name = EXCLUDED.name
          `;

          await client.query(messageQuery, [
            message.id,
            session.id,
            message.role,
            message.content || null,
            message.model || null,
            message.tool_calls ? JSON.stringify(message.tool_calls) : null,
            message.tool_call_id || null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (message as any).name || null,
          ]);
        }
      }

      await client.query('COMMIT');

      logger.debug('Saved chat sessions to PostgreSQL', {
        userId: this.userId,
        count: sessions.length,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to save chat sessions to PostgreSQL', {
        userId: this.userId,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async getActiveChatId(): Promise<string> {
    const client = await this.getConnection();
    try {
      const query = `
        SELECT active_chat_id 
        FROM user_preferences 
        WHERE user_id = $1
      `;

      const result = await client.query(query, [this.userId || '']);

      if (result.rows.length > 0 && result.rows[0].active_chat_id) {
        const activeChatId = result.rows[0].active_chat_id;
        logger.debug('Found active chat ID in PostgreSQL', {
          userId: this.userId,
          activeChatId,
        });
        return activeChatId;
      }

      const sessions = await this.getChatSessions();
      if (sessions.length > 0) {
        const firstSessionId = sessions[0].id;
        await this.saveActiveChatId(firstSessionId);
        logger.debug('Set first session as active chat', {
          userId: this.userId,
          activeChatId: firstSessionId,
        });
        return firstSessionId;
      }

      logger.debug('No active chat ID found and no sessions available', {
        userId: this.userId,
      });
      return '';
    } catch (error) {
      logger.error('Failed to get active chat ID from PostgreSQL', {
        userId: this.userId,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async saveActiveChatId(id: string): Promise<void> {
    // Validate input
    if (!isValidUUID(id)) {
      throw new Error(`Invalid chat ID format: ${id}`);
    }

    const client = await this.getConnection();
    try {
      await client.query('BEGIN');

      const upsertQuery = `
        INSERT INTO user_preferences (user_id, active_chat_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id) 
        DO UPDATE SET active_chat_id = $2, updated_at = CURRENT_TIMESTAMP
      `;

      await client.query(upsertQuery, [this.userId || '', id]);

      const checkQuery = `
        SELECT 1 FROM chat_sessions 
        WHERE id = $1 AND (user_id = $2 OR (user_id IS NULL AND $2 IS NULL))
      `;

      const checkResult = await client.query(checkQuery, [id, this.userId || null]);

      if (checkResult.rows.length === 0) {
        logger.warn('Active chat ID set for session that does not exist yet', {
          userId: this.userId,
          activeChatId: id,
          note: 'This may be due to a race condition between session creation and active chat setting',
        });
      }

      await client.query('COMMIT');

      logger.debug('Saved active chat ID to PostgreSQL', {
        userId: this.userId,
        activeChatId: id,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to save active chat ID to PostgreSQL', {
        userId: this.userId,
        activeChatId: id,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Saves chat sessions and sets the active chat ID in a single transaction
   * This prevents foreign key constraint violations and race conditions
   */
  async getSelectedModel(): Promise<string> {
    const client = await this.getConnection();
    try {
      const query = `
        SELECT selected_model 
        FROM user_preferences 
        WHERE user_id = $1
      `;

      const result = await client.query(query, [this.userId || '']);

      if (result.rows.length > 0 && result.rows[0].selected_model) {
        const selectedModel = result.rows[0].selected_model;
        logger.debug('Found selected model in PostgreSQL', {
          userId: this.userId,
          selectedModel,
        });
        return selectedModel;
      }

      logger.debug('No selected model found in PostgreSQL', {
        userId: this.userId,
      });
      return '';
    } catch (error) {
      logger.error('Failed to get selected model from PostgreSQL', {
        userId: this.userId,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async saveSelectedModel(model: string): Promise<void> {
    // Validate input
    if (!isSafeString(model, 100)) {
      throw new Error(`Invalid model name: ${model}`);
    }

    const client = await this.getConnection();
    try {
      const query = `
        INSERT INTO user_preferences (user_id, selected_model)
        VALUES ($1, $2)
        ON CONFLICT (user_id) 
        DO UPDATE SET selected_model = $2, updated_at = CURRENT_TIMESTAMP
      `;

      await client.query(query, [this.userId || '', model]);

      logger.debug('Saved selected model to PostgreSQL', {
        userId: this.userId,
        selectedModel: model,
      });
    } catch (error) {
      logger.error('Failed to save selected model to PostgreSQL', {
        userId: this.userId,
        selectedModel: model,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async clear(): Promise<void> {
    const client = await this.getConnection();
    try {
      await client.query('BEGIN');

      if (this.userId) {
        await client.query('DELETE FROM chat_sessions WHERE user_id = $1', [this.userId]);
        await client.query('DELETE FROM user_preferences WHERE user_id = $1', [this.userId]);
      } else {
        await client.query('DELETE FROM chat_sessions WHERE user_id IS NULL');
        await client.query("DELETE FROM user_preferences WHERE user_id = ''");
      }

      await client.query('COMMIT');

      logger.debug('Cleared chat data from PostgreSQL', {
        userId: this.userId,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to clear chat data from PostgreSQL', {
        userId: this.userId,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    logger.debug('PostgreSQL connection pool closed', {
      userId: this.userId,
    });
  }
}
