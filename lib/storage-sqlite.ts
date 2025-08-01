import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import logger from '@/lib/logger';
import type { StorageOptions, StorageService, Message } from '@/types/chat';
import { ChatSession, MessageRole } from '@/types/chat';

interface DatabaseRow {
  [key: string]: unknown;
}

export class SqliteStorageService implements StorageService {
  private db: Database;
  private userId?: string;

  constructor(options?: StorageOptions) {
    this.userId = options?.userId;

    if (!options?.connectionUrl) {
      throw new Error('SQLite connection URL is required');
    }

    // Parse SQLite connection URLs
    // Supported formats:
    // - sqlite:./database.db
    // - sqlite://./database.db 
    // - file:./database.db
    // - sqlite::memory: (in-memory)
    const connectionUrl = options.connectionUrl;
    let dbPath: string;

    if (connectionUrl === 'sqlite::memory:') {
      dbPath = ':memory:';
    } else if (connectionUrl.startsWith('sqlite://')) {
      dbPath = connectionUrl.replace('sqlite://', '');
    } else if (connectionUrl.startsWith('sqlite:')) {
      dbPath = connectionUrl.replace('sqlite:', '');
    } else if (connectionUrl.startsWith('file:')) {
      dbPath = connectionUrl.replace('file:', '');
    } else {
      // Assume it's a direct file path
      dbPath = connectionUrl;
    }

    this.db = new Database(dbPath, OPEN_READWRITE | OPEN_CREATE, (err) => {
      if (err) {
        logger.error('Failed to initialize SQLite database', {
          userId: this.userId,
          dbPath,
          error: err.message,
        });
        throw err;
      }

      logger.debug('SQLite storage service initialized', {
        userId: this.userId,
        dbPath,
      });

      // Initialize database schema
      this.initializeSchema();
    });
  }

  private initializeSchema(): void {
    // Use serialize to ensure schema creation happens in order
    this.db.serialize(() => {
      // Enable foreign key constraints
      this.db.run('PRAGMA foreign_keys = ON');

      // Create tables in the correct order (parent tables first)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          title TEXT NOT NULL,
          created_at TEXT NOT NULL,
          prompt_tokens INTEGER DEFAULT 0,
          completion_tokens INTEGER DEFAULT 0,
          total_tokens INTEGER DEFAULT 0
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT,
          model TEXT,
          tool_calls TEXT,
          tool_call_id TEXT,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          user_id TEXT PRIMARY KEY,
          active_chat_id TEXT,
          selected_model TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for better performance
      this.db.run('CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id)');
      this.db.run('CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC)');
      this.db.run('CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id)');
      this.db.run('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)');

      logger.debug('SQLite schema initialized successfully', {
        userId: this.userId,
      });
    });
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return new Promise((resolve, reject) => {
      let query: string;
      let params: (string | null)[];

      if (this.userId) {
        query = `
          SELECT id, title, created_at, prompt_tokens, completion_tokens, total_tokens
          FROM chat_sessions
          WHERE user_id = ?
          ORDER BY created_at DESC
        `;
        params = [this.userId];
      } else {
        query = `
          SELECT id, title, created_at, prompt_tokens, completion_tokens, total_tokens
          FROM chat_sessions
          WHERE user_id IS NULL OR user_id = ''
          ORDER BY created_at DESC
        `;
        params = [];
      }

      this.db.all(query, params, (err, rows: DatabaseRow[]) => {
        if (err) {
          logger.error('Failed to get chat sessions from SQLite', {
            userId: this.userId,
            error: err.message,
          });
          reject(err);
          return;
        }

        // Get messages for each session
        const sessionIds = rows.map(row => row.id as string);
        if (sessionIds.length === 0) {
          resolve([]);
          return;
        }

        const messagesQuery = `
          SELECT id, session_id, role, content, model, tool_calls, tool_call_id, name
          FROM messages
          WHERE session_id IN (${sessionIds.map(() => '?').join(',')})
          ORDER BY created_at ASC
        `;

        this.db.all(messagesQuery, sessionIds, (err, messageRows: DatabaseRow[]) => {
          if (err) {
            logger.error('Failed to get messages from SQLite', {
              userId: this.userId,
              error: err.message,
            });
            reject(err);
            return;
          }

          // Group messages by session
          const messagesBySession = new Map<string, Message[]>();
          messageRows.forEach((msgRow) => {
            const sessionId = msgRow.session_id as string;
            if (!messagesBySession.has(sessionId)) {
              messagesBySession.set(sessionId, []);
            }

            const message: Message = {
              id: msgRow.id as string,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              role: msgRow.role as any,
              content: msgRow.content as string,
              model: msgRow.model === null ? undefined : (msgRow.model as string | undefined),
              tool_calls: msgRow.tool_calls ? JSON.parse(msgRow.tool_calls as string) : undefined,
              tool_call_id: msgRow.tool_call_id === null ? undefined : (msgRow.tool_call_id as string | undefined),
            };

            const messages = messagesBySession.get(sessionId);
            if (messages) {
              messages.push(message);
            }
          });

          const sessions: ChatSession[] = rows.map((row) => ({
            id: row.id as string,
            title: row.title as string,
            messages: messagesBySession.get(row.id as string) || [],
            createdAt: row.created_at as string,
            tokenUsage: {
              prompt_tokens: (row.prompt_tokens as number) || 0,
              completion_tokens: (row.completion_tokens as number) || 0,
              total_tokens: (row.total_tokens as number) || 0,
            },
          }));

          logger.debug('Loaded chat sessions from SQLite', {
            userId: this.userId,
            count: sessions.length,
          });

          resolve(sessions);
        });
      });
    });
  }

  async saveChatSessions(sessions: ChatSession[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            logger.error('Failed to begin SQLite transaction', {
              userId: this.userId,
              error: err.message,
            });
            reject(err);
            return;
          }

          // Get existing sessions to determine which to delete
          const existingSessionsQuery = this.userId
            ? 'SELECT id FROM chat_sessions WHERE user_id = ?'
            : 'SELECT id FROM chat_sessions WHERE user_id IS NULL OR user_id = ""';

          this.db.all(
            existingSessionsQuery,
            this.userId ? [this.userId] : [],
            (err, existingRows: DatabaseRow[]) => {
              if (err) {
                this.db.run('ROLLBACK');
                reject(err);
                return;
              }

              const existingSessionIds = new Set(existingRows.map(row => row.id as string));
              const newSessionIds = new Set(sessions.map(session => session.id));

              // Delete sessions that no longer exist
              const sessionsToDelete = [...existingSessionIds].filter(id => !newSessionIds.has(id));
              let deletePromises = 0;
              let deleteCompleted = 0;

              const checkDeleteCompletion = () => {
                deleteCompleted++;
                if (deleteCompleted === deletePromises) {
                  // All deletes completed, now insert/update sessions
                  this.insertOrUpdateSessions(sessions, resolve, reject);
                }
              };

              if (sessionsToDelete.length > 0) {
                deletePromises = sessionsToDelete.length;
                sessionsToDelete.forEach(sessionId => {
                  this.db.run('DELETE FROM chat_sessions WHERE id = ?', [sessionId], (err) => {
                    if (err) {
                      this.db.run('ROLLBACK');
                      reject(err);
                      return;
                    }
                    checkDeleteCompletion();
                  });
                });
              } else {
                // No sessions to delete, proceed to insert/update
                this.insertOrUpdateSessions(sessions, resolve, reject);
              }
            }
          );
        });
      });
    });
  }

  private insertOrUpdateSessions(
    sessions: ChatSession[],
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    let sessionPromises = 0;
    let sessionCompleted = 0;

    const checkSessionCompletion = () => {
      sessionCompleted++;
      if (sessionCompleted === sessionPromises) {
        // All sessions completed, commit transaction
        this.db.run('COMMIT', (err) => {
          if (err) {
            logger.error('Failed to commit SQLite transaction', {
              userId: this.userId,
              error: err.message,
            });
            reject(err);
            return;
          }

          logger.debug('Saved chat sessions to SQLite', {
            userId: this.userId,
            count: sessions.length,
          });

          resolve();
        });
      }
    };

    if (sessions.length === 0) {
      checkSessionCompletion();
      return;
    }

    sessionPromises = sessions.length;

    sessions.forEach(session => {
      const sessionQuery = `
        INSERT OR REPLACE INTO chat_sessions (id, user_id, title, created_at, prompt_tokens, completion_tokens, total_tokens)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(
        sessionQuery,
        [
          session.id,
          this.userId || null,
          session.title,
          session.createdAt || new Date().toISOString(),
          session.tokenUsage?.prompt_tokens || 0,
          session.tokenUsage?.completion_tokens || 0,
          session.tokenUsage?.total_tokens || 0,
        ],
        (err) => {
          if (err) {
            this.db.run('ROLLBACK');
            reject(err);
            return;
          }

          // Delete existing messages for this session and insert new ones
          this.db.run('DELETE FROM messages WHERE session_id = ?', [session.id], (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              reject(err);
              return;
            }

            let messagePromises = 0;
            let messageCompleted = 0;

            const checkMessageCompletion = () => {
              messageCompleted++;
              if (messageCompleted === messagePromises) {
                checkSessionCompletion();
              }
            };

            if (session.messages.length === 0) {
              checkSessionCompletion();
              return;
            }

            messagePromises = session.messages.length;

            session.messages.forEach(message => {
              const messageQuery = `
                INSERT OR REPLACE INTO messages (id, session_id, role, content, model, tool_calls, tool_call_id, name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `;

              this.db.run(
                messageQuery,
                [
                  message.id,
                  session.id,
                  message.role,
                  message.content || null,
                  message.model || null,
                  message.tool_calls ? JSON.stringify(message.tool_calls) : null,
                  message.tool_call_id || null,
                  'name' in message && message.name ? message.name : null,
                ],
                (err) => {
                  if (err) {
                    this.db.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  checkMessageCompletion();
                }
              );
            });
          });
        }
      );
    });
  }

  async getActiveChatId(): Promise<string> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT active_chat_id 
        FROM user_preferences 
        WHERE user_id = ?
      `;

      this.db.get(query, [this.userId || ''], (err, row: DatabaseRow | undefined) => {
        if (err) {
          logger.error('Failed to get active chat ID from SQLite', {
            userId: this.userId,
            error: err.message,
          });
          reject(err);
          return;
        }

        if (row && row.active_chat_id) {
          const activeChatId = row.active_chat_id as string;
          logger.debug('Found active chat ID in SQLite', {
            userId: this.userId,
            activeChatId,
          });
          resolve(activeChatId);
          return;
        }

        // No active chat found, try to get the first session
        this.getChatSessions()
          .then(sessions => {
            if (sessions.length > 0) {
              const firstSessionId = sessions[0].id;
              this.saveActiveChatId(firstSessionId)
                .then(() => {
                  logger.debug('Set first session as active chat', {
                    userId: this.userId,
                    activeChatId: firstSessionId,
                  });
                  resolve(firstSessionId);
                })
                .catch(reject);
            } else {
              logger.debug('No active chat ID found and no sessions available', {
                userId: this.userId,
              });
              resolve('');
            }
          })
          .catch(reject);
      });
    });
  }

  async saveActiveChatId(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            logger.error('Failed to begin transaction for active chat ID', {
              userId: this.userId,
              error: err.message,
            });
            reject(err);
            return;
          }

          const upsertQuery = `
            INSERT OR REPLACE INTO user_preferences (user_id, active_chat_id, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
          `;

          this.db.run(upsertQuery, [this.userId || '', id], (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              logger.error('Failed to save active chat ID to SQLite', {
                userId: this.userId,
                activeChatId: id,
                error: err.message,
              });
              reject(err);
              return;
            }

            this.db.run('COMMIT', (err) => {
              if (err) {
                logger.error('Failed to commit active chat ID transaction', {
                  userId: this.userId,
                  error: err.message,
                });
                reject(err);
                return;
              }

              logger.debug('Saved active chat ID to SQLite', {
                userId: this.userId,
                activeChatId: id,
              });

              resolve();
            });
          });
        });
      });
    });
  }

  async getSelectedModel(): Promise<string> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT selected_model 
        FROM user_preferences 
        WHERE user_id = ?
      `;

      this.db.get(query, [this.userId || ''], (err, row: DatabaseRow | undefined) => {
        if (err) {
          logger.error('Failed to get selected model from SQLite', {
            userId: this.userId,
            error: err.message,
          });
          reject(err);
          return;
        }

        if (row && row.selected_model) {
          const selectedModel = row.selected_model as string;
          logger.debug('Found selected model in SQLite', {
            userId: this.userId,
            selectedModel,
          });
          resolve(selectedModel);
        } else {
          logger.debug('No selected model found in SQLite', {
            userId: this.userId,
          });
          resolve('');
        }
      });
    });
  }

  async saveSelectedModel(model: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT OR REPLACE INTO user_preferences (user_id, selected_model, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `;

      this.db.run(query, [this.userId || '', model], (err) => {
        if (err) {
          logger.error('Failed to save selected model to SQLite', {
            userId: this.userId,
            selectedModel: model,
            error: err.message,
          });
          reject(err);
          return;
        }

        logger.debug('Saved selected model to SQLite', {
          userId: this.userId,
          selectedModel: model,
        });

        resolve();
      });
    });
  }

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            logger.error('Failed to begin clear transaction', {
              userId: this.userId,
              error: err.message,
            });
            reject(err);
            return;
          }

          const chatSessionsQuery = this.userId
            ? 'DELETE FROM chat_sessions WHERE user_id = ?'
            : 'DELETE FROM chat_sessions WHERE user_id IS NULL OR user_id = ""';

          const preferencesQuery = this.userId
            ? 'DELETE FROM user_preferences WHERE user_id = ?'
            : 'DELETE FROM user_preferences WHERE user_id IS NULL OR user_id = ""';

          const params = this.userId ? [this.userId] : [];

          this.db.run(chatSessionsQuery, params, (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              logger.error('Failed to clear chat sessions from SQLite', {
                userId: this.userId,
                error: err.message,
              });
              reject(err);
              return;
            }

            this.db.run(preferencesQuery, params, (err) => {
              if (err) {
                this.db.run('ROLLBACK');
                logger.error('Failed to clear user preferences from SQLite', {
                  userId: this.userId,
                  error: err.message,
                });
                reject(err);
                return;
              }

              this.db.run('COMMIT', (err) => {
                if (err) {
                  logger.error('Failed to commit clear transaction', {
                    userId: this.userId,
                    error: err.message,
                  });
                  reject(err);
                  return;
                }

                logger.debug('Cleared chat data from SQLite', {
                  userId: this.userId,
                });

                resolve();
              });
            });
          });
        });
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          logger.error('Failed to close SQLite database', {
            userId: this.userId,
            error: err.message,
          });
          reject(err);
          return;
        }

        logger.debug('SQLite database connection closed', {
          userId: this.userId,
        });

        resolve();
      });
    });
  }
}