import { isA2ATool, isMCPTool } from '@/lib/tools';
import { ChatCompletionToolType } from '@inference-gateway/sdk';

describe('Tool Type Detection', () => {
  describe('isA2ATool', () => {
    test('should return true for tools with a2a_ prefix', () => {
      expect(isA2ATool('a2a_query_agent_card')).toBe(true);
      expect(isA2ATool('a2a_submit_task_to_agent')).toBe(true);
      expect(isA2ATool('a2a_custom_tool')).toBe(true);
    });

    test('should return false for tools without a2a_ prefix', () => {
      expect(isA2ATool('web_search')).toBe(false);
      expect(isA2ATool('fetch_page')).toBe(false);
      expect(isA2ATool('mcp_tool')).toBe(false);
      expect(isA2ATool('regular_tool')).toBe(false);
    });

    test('should return false for empty or undefined tool names', () => {
      expect(isA2ATool('')).toBe(false);
      expect(isA2ATool('a2a')).toBe(false); // No underscore
    });

    test('should be case sensitive', () => {
      expect(isA2ATool('A2A_tool')).toBe(false);
      expect(isA2ATool('a2A_tool')).toBe(false);
    });
  });

  describe('isMCPTool', () => {
    test('should return true for tools with mcp_ prefix', () => {
      expect(isMCPTool('mcp_filesystem_read')).toBe(true);
      expect(isMCPTool('mcp_database_query')).toBe(true);
      expect(isMCPTool('mcp_custom_action')).toBe(true);
    });

    test('should return false for tools without mcp_ prefix', () => {
      expect(isMCPTool('web_search')).toBe(false);
      expect(isMCPTool('fetch_page')).toBe(false);
      expect(isMCPTool('a2a_tool')).toBe(false);
      expect(isMCPTool('regular_tool')).toBe(false);
    });

    test('should return false for empty or undefined tool names', () => {
      expect(isMCPTool('')).toBe(false);
      expect(isMCPTool('mcp')).toBe(false); // No underscore
    });

    test('should be case sensitive', () => {
      expect(isMCPTool('MCP_tool')).toBe(false);
      expect(isMCPTool('mcP_tool')).toBe(false);
    });

    test('should ignore the tools parameter (deprecated)', () => {
      const mockTools = [
        {
          type: 'function' as ChatCompletionToolType,
          function: {
            name: 'web_search',
            description: 'Search the web',
            parameters: {} as Record<string, never>,
            strict: false,
          },
        },
      ];

      // Even if a tool is in the tools array, prefix detection takes precedence
      expect(isMCPTool('mcp_custom_tool', mockTools)).toBe(true);
      expect(isMCPTool('web_search', mockTools)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('should correctly identify different tool types', () => {
      const testCases = [
        { name: 'a2a_query_agent', expectedA2A: true, expectedMCP: false },
        { name: 'mcp_filesystem_read', expectedA2A: false, expectedMCP: true },
        { name: 'web_search', expectedA2A: false, expectedMCP: false },
        { name: 'fetch_page', expectedA2A: false, expectedMCP: false },
        { name: 'custom_tool', expectedA2A: false, expectedMCP: false },
      ];

      testCases.forEach(({ name, expectedA2A, expectedMCP }) => {
        expect(isA2ATool(name)).toBe(expectedA2A);
        expect(isMCPTool(name)).toBe(expectedMCP);
      });
    });

    test('should handle edge cases', () => {
      const edgeCases = [
        'a2a_',
        'mcp_',
        '_a2a_tool',
        '_mcp_tool',
        'tool_a2a_suffix',
        'tool_mcp_suffix',
      ];

      edgeCases.forEach(toolName => {
        const isA2A = isA2ATool(toolName);
        const isMCP = isMCPTool(toolName);
        
        // Only tools starting with the exact prefix should be detected
        expect(isA2A).toBe(toolName.startsWith('a2a_'));
        expect(isMCP).toBe(toolName.startsWith('mcp_'));
      });
    });
  });
});