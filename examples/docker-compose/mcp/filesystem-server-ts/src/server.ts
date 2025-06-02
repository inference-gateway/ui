import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FilesystemMCPServer {
  private server: Server;
  private baseDir: string;
  private connections: Map<string, boolean> = new Map();

  constructor(baseDir: string = '/tmp/mcp-filesystem') {
    this.baseDir = baseDir;
    this.server = new Server(
      {
        name: 'filesystem-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.ensureBaseDir();
  }

  // Track connection state for HTTP-based sessions
  public initializeSession(sessionId: string): void {
    this.connections.set(sessionId, true);
  }

  public isSessionConnected(sessionId: string): boolean {
    return this.connections.get(sessionId) === true;
  }

  public closeSession(sessionId: string): void {
    this.connections.delete(sessionId);
  }

  private async ensureBaseDir(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create base directory:', error);
    }
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
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
            description: 'List contents of a directory',
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
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'read_file':
            return await this.readFile(args as { path: string });

          case 'write_file':
            return await this.writeFile(args as { path: string; content: string });

          case 'delete_file':
            return await this.deleteFile(args as { path: string });

          case 'list_directory':
            return await this.listDirectory(args as { path: string });

          case 'create_directory':
            return await this.createDirectory(args as { path: string });

          case 'file_exists':
            return await this.fileExists(args as { path: string });

          case 'get_file_info':
            return await this.getFileInfo(args as { path: string });

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        } as CallToolResult;
      }
    });
  }

  private resolvePath(inputPath: string): string {
    const resolvedPath = path.resolve(this.baseDir, inputPath);

    // Security check: ensure path is within baseDir
    if (!resolvedPath.startsWith(this.baseDir)) {
      throw new Error('Path is outside allowed directory');
    }

    return resolvedPath;
  }

  private async readFile(args: { path: string }): Promise<CallToolResult> {
    const filePath = this.resolvePath(args.path);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to read file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async writeFile(args: { path: string; content: string }): Promise<CallToolResult> {
    const filePath = this.resolvePath(args.path);

    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(filePath, args.content, 'utf-8');
      return {
        content: [
          {
            type: 'text',
            text: `Successfully wrote ${args.content.length} characters to ${args.path}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to write file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async deleteFile(args: { path: string }): Promise<CallToolResult> {
    const filePath = this.resolvePath(args.path);

    try {
      await fs.unlink(filePath);
      return {
        content: [
          {
            type: 'text',
            text: `Successfully deleted ${args.path}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async listDirectory(args: { path: string }): Promise<CallToolResult> {
    const dirPath = this.resolvePath(args.path);

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const items = entries.map(entry => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(items, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to list directory: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async createDirectory(args: { path: string }): Promise<CallToolResult> {
    const dirPath = this.resolvePath(args.path);

    try {
      await fs.mkdir(dirPath, { recursive: true });
      return {
        content: [
          {
            type: 'text',
            text: `Successfully created directory ${args.path}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to create directory: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async deleteDirectory(args: {
    path: string;
    force?: boolean;
    recursive?: boolean;
  }): Promise<CallToolResult> {
    const dirPath = this.resolvePath(args.path);

    try {
      await fs.rm(dirPath, { recursive: args.recursive, force: args.force });
      return {
        content: [
          {
            type: 'text',
            text: `Successfully deleted directory ${args.path}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to delete directory: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async fileExists(args: { path: string }): Promise<CallToolResult> {
    const filePath = this.resolvePath(args.path);

    try {
      await fs.access(filePath);
      return {
        content: [
          {
            type: 'text',
            text: `${args.path} exists`,
          },
        ],
      };
    } catch {
      return {
        content: [
          {
            type: 'text',
            text: `${args.path} does not exist`,
          },
        ],
      };
    }
  }

  private async getFileInfo(args: { path: string }): Promise<CallToolResult> {
    const filePath = this.resolvePath(args.path);

    try {
      const stats = await fs.stat(filePath);
      const info = {
        path: args.path,
        size: stats.size,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        accessed: stats.atime.toISOString(),
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to get file info: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public async callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult> {
    switch (name) {
      case 'read_file':
        return this.readFile(args as { path: string });
      case 'write_file':
        return this.writeFile(args as { path: string; content: string });
      case 'delete_file':
        return this.deleteFile(args as { path: string });
      case 'list_directory':
        return this.listDirectory(args as { path: string });
      case 'create_directory':
        return this.createDirectory(args as { path: string });
      case 'delete_directory':
        return this.deleteDirectory(args as { path: string; force?: boolean; recursive?: boolean });
      case 'file_exists':
        return this.fileExists(args as { path: string });
      case 'get_file_info':
        return this.getFileInfo(args as { path: string });
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  public getServer(): Server {
    return this.server;
  }
}
