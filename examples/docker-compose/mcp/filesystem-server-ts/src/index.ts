import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { FilesystemMCPServer } from './server';
import {
  JSONRPCMessage,
  JSONRPCResponse,
  JSONRPCError,
  EmptyResultSchema,
} from '@modelcontextprotocol/sdk/types.js';

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_DIR = process.env.MCP_BASE_DIR || '/tmp/mcp-files';

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

const mcpServer = new FilesystemMCPServer(BASE_DIR);
const server = mcpServer.getServer();

app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), baseDir: BASE_DIR });
});

app.get('/mcp', (req: express.Request, res: express.Response) => {
  res.json({
    name: 'filesystem-server',
    version: '1.0.0',
    description: 'MCP server for filesystem operations',
    capabilities: {
      tools: {},
    },
  });
});

app.post('/mcp', async (req: express.Request, res: express.Response) => {
  try {
    const request = req.body as JSONRPCMessage;

    const sessionId = (req.headers['mcp-session-id'] as string) || `session-${Date.now()}`;
    res.setHeader('mcp-session-id', sessionId);

    let response: JSONRPCResponse | JSONRPCError;

    if ('method' in request && request.method) {
      if (request.method === 'initialize') {
        if ('id' in request && request.id !== undefined) {
          mcpServer.initializeSession(sessionId);
          response = {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
              },
              serverInfo: {
                name: 'filesystem-server',
                version: '1.0.0',
              },
            },
          } as JSONRPCResponse;
        } else {
          response = {
            jsonrpc: '2.0',
            id: 1,
            error: {
              code: -32602,
              message: 'Initialize request must have an ID',
            },
          } as JSONRPCError;
        }
      } else if (request.method === 'initialized') {
        if (!('id' in request) || request.id === undefined) {
          res.status(200).end();
          return;
        } else {
          response = {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32602,
              message: 'Initialized should be a notification, not a request',
            },
          } as JSONRPCError;
        }
      } else if ('id' in request && request.id !== undefined) {
        if (!mcpServer.isSessionConnected(sessionId)) {
          response = {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32603,
              message: 'Not connected - send initialize request first',
            },
          } as JSONRPCError;
        } else {
          const serverRequest = {
            method: request.method,
            params: request.params || {},
          };

          try {
            if (request.method === 'tools/list') {
              const result = {
                tools: [
                  {
                    name: 'read_file',
                    description: 'Read the contents of a file',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'string',
                          description: 'Path to the file to read',
                        },
                      },
                      required: ['path'],
                    },
                  },
                  {
                    name: 'write_file',
                    description: 'Write content to a file',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'string',
                          description: 'Path to the file to write',
                        },
                        content: {
                          type: 'string',
                          description: 'Content to write to the file',
                        },
                      },
                      required: ['path', 'content'],
                    },
                  },
                  {
                    name: 'delete_file',
                    description: 'Delete a file',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'string',
                          description: 'Path to the file to delete',
                        },
                      },
                      required: ['path'],
                    },
                  },
                  {
                    name: 'list_directory',
                    description: 'List the contents of a directory',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'string',
                          description: 'Path to the directory to list',
                        },
                      },
                      required: ['path'],
                    },
                  },
                  {
                    name: 'create_directory',
                    description: 'Create a new directory',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'string',
                          description: 'Path to the directory to create',
                        },
                      },
                      required: ['path'],
                    },
                  },
                  {
                    name: 'delete_directory',
                    description: 'Delete a directory',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'string',
                          description: 'Path to the directory to delete',
                        },
                        force: {
                          type: 'boolean',
                          description: 'Force delete the directory and its contents',
                          default: false,
                        },
                        recusive: {
                          type: 'boolean',
                          description: 'Recursively delete the directory and its contents',
                          default: false,
                        },
                      },
                      required: ['path'],
                    },
                  },
                  {
                    name: 'file_exists',
                    description: 'Check if a file or directory exists',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'string',
                          description: 'Path to check for existence',
                        },
                      },
                      required: ['path'],
                    },
                  },
                  {
                    name: 'get_file_info',
                    description: 'Get information about a file or directory',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'string',
                          description: 'Path to get information about',
                        },
                      },
                      required: ['path'],
                    },
                  },
                ],
              };
              response = {
                jsonrpc: '2.0',
                id: request.id,
                result,
              } as JSONRPCResponse;
            } else if (request.method === 'tools/call') {
              const result = await mcpServer.callTool(
                request.params?.name as string,
                request.params?.arguments as Record<string, unknown>
              );
              response = {
                jsonrpc: '2.0',
                id: request.id,
                result,
              } as JSONRPCResponse;
            } else {
              const result = await server.request(serverRequest, EmptyResultSchema);
              response = {
                jsonrpc: '2.0',
                id: request.id,
                result,
              } as JSONRPCResponse;
            }
          } catch (error) {
            response = {
              jsonrpc: '2.0',
              id: request.id,
              error: {
                code: -32603,
                message: error instanceof Error ? error.message : 'Internal server error',
              },
            } as JSONRPCError;
          }
        }
      } else {
        try {
          await server.notification({
            method: request.method,
            params: request.params || {},
          });
          res.status(200).end();
          return;
        } catch (notificationError) {
          res.status(500).json({
            error:
              notificationError instanceof Error
                ? notificationError.message
                : 'Internal server error',
          });
          return;
        }
      }
    } else {
      const id = 'id' in request && request.id !== undefined ? request.id : 1;
      response = {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: 'Method not found',
        },
      } as JSONRPCError;
    }

    res.json(response);
  } catch {
    const errorResponse: JSONRPCError = {
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: -32700,
        message: 'Parse error',
      },
    };
    res.status(400).json(errorResponse);
  }
});

app.post('/mcp/tools/list', async (req: express.Request, res: express.Response) => {
  const jsonRpcRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {},
  };

  req.body = jsonRpcRequest;
  return app._router.handle(req, res, () => {
    res.status(404).json({ error: 'Route not found' });
  });
});

app.post('/mcp/tools/call', async (req: express.Request, res: express.Response) => {
  const { name, arguments: args } = req.body;
  const jsonRpcRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name,
      arguments: args,
    },
  };

  req.body = jsonRpcRequest;
  return app._router.handle(req, res, () => {
    res.status(404).json({ error: 'Route not found' });
  });
});

app.listen(PORT, () => {
  console.log(`MCP Filesystem Server running on port ${PORT}`);
  console.log(`Base directory: ${BASE_DIR}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});

export default app;
