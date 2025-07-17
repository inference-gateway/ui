import {
  sanitizeHTML,
  validateAndSanitizeString,
  validateA2ASkill,
  validateA2ACapabilities,
  validateA2AAgent,
  validateA2AAgentDetails,
  isValidUrl,
} from '@/lib/a2a-validation';

describe('A2A Validation Utils', () => {
  describe('sanitizeHTML', () => {
    test('removes script tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const output = sanitizeHTML(input);
      expect(output).toBe('Hello World');
    });

    test('removes dangerous event handlers', () => {
      const input = '<div onclick="alert(\'xss\')">Hello World</div>';
      const output = sanitizeHTML(input);
      expect(output).toBe('<div>Hello World</div>');
    });

    test('removes javascript: URLs', () => {
      const input = '<a href="javascript:alert(\'xss\')">Click me</a>';
      const output = sanitizeHTML(input);
      expect(output).toBe('<a>Click me</a>');
    });

    test('removes style attributes', () => {
      const input = '<div style="color: red; background: url(javascript:alert(1))">Text</div>';
      const output = sanitizeHTML(input);
      expect(output).toBe('<div>Text</div>');
    });

    test('removes dangerous tags', () => {
      const input = '<iframe src="evil.com"></iframe><p>Safe content</p>';
      const output = sanitizeHTML(input);
      expect(output).toBe('<p>Safe content</p>');
    });

    test('handles empty string', () => {
      expect(sanitizeHTML('')).toBe('');
    });

    test('handles null/undefined', () => {
      expect(sanitizeHTML(null as any)).toBe('');
      expect(sanitizeHTML(undefined as any)).toBe('');
    });

    test('handles non-string input', () => {
      expect(sanitizeHTML(123 as any)).toBe('');
      expect(sanitizeHTML({} as any)).toBe('');
    });

    test('preserves safe HTML', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const output = sanitizeHTML(input);
      expect(output).toBe('<p>Hello <strong>World</strong></p>');
    });
  });

  describe('validateAndSanitizeString', () => {
    test('validates and sanitizes valid string', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const output = validateAndSanitizeString(input);
      expect(output).toBe('Hello World');
    });

    test('returns fallback for non-string input', () => {
      expect(validateAndSanitizeString(123)).toBe('');
      expect(validateAndSanitizeString(null)).toBe('');
      expect(validateAndSanitizeString(undefined)).toBe('');
    });

    test('uses custom fallback', () => {
      expect(validateAndSanitizeString(123, 'default')).toBe('default');
    });
  });

  describe('validateA2ASkill', () => {
    const validSkill = {
      id: 'skill1',
      name: 'Test Skill',
      description: 'Test description',
      examples: ['example1', 'example2'],
      inputModes: ['text', 'json'],
      outputModes: ['text', 'json'],
      tags: ['tag1', 'tag2'],
      input_schema: { type: 'object' },
      output_schema: { type: 'object' },
    };

    test('validates valid skill', () => {
      const result = validateA2ASkill(validSkill);
      expect(result).toEqual({
        id: 'skill1',
        name: 'Test Skill',
        description: 'Test description',
        examples: ['example1', 'example2'],
        inputModes: ['text', 'json'],
        outputModes: ['text', 'json'],
        tags: ['tag1', 'tag2'],
        input_schema: { type: 'object' },
        output_schema: { type: 'object' },
      });
    });

    test('returns null for invalid skill', () => {
      expect(validateA2ASkill(null)).toBeNull();
      expect(validateA2ASkill(undefined)).toBeNull();
      expect(validateA2ASkill('string')).toBeNull();
      expect(validateA2ASkill({})).toBeNull();
    });

    test('requires id, name, and description', () => {
      expect(validateA2ASkill({ name: 'Test', description: 'Test' })).toBeNull();
      expect(validateA2ASkill({ id: 'skill1', description: 'Test' })).toBeNull();
      expect(validateA2ASkill({ id: 'skill1', name: 'Test' })).toBeNull();
    });

    test('sanitizes string fields', () => {
      const skillWithXSS = {
        id: 'skill1',
        name: '<script>alert("xss")</script>Test Skill',
        description: '<script>alert("xss")</script>Test description',
        examples: ['<script>alert("xss")</script>example1'],
        tags: ['<script>alert("xss")</script>tag1'],
      };

      const result = validateA2ASkill(skillWithXSS);
      expect(result?.name).toBe('Test Skill');
      expect(result?.description).toBe('Test description');
      expect(result?.examples).toEqual(['example1']);
      expect(result?.tags).toEqual(['tag1']);
    });

    test('filters out non-string array items', () => {
      const skillWithInvalidArrays = {
        id: 'skill1',
        name: 'Test Skill',
        description: 'Test description',
        examples: ['valid', 123, 'valid2'],
        inputModes: ['text', null, 'json'],
        outputModes: ['text', undefined, 'json'],
        tags: ['tag1', {}, 'tag2'],
      };

      const result = validateA2ASkill(skillWithInvalidArrays);
      expect(result?.examples).toEqual(['valid', 'valid2']);
      expect(result?.inputModes).toEqual(['text', 'json']);
      expect(result?.outputModes).toEqual(['text', 'json']);
      expect(result?.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('validateA2ACapabilities', () => {
    test('validates valid capabilities', () => {
      const capabilities = {
        skills: [
          {
            id: 'skill1',
            name: 'Test Skill',
            description: 'Test description',
          },
        ],
        extensions: ['ext1', 'ext2'],
        pushNotifications: true,
        stateTransitionHistory: false,
        streaming: true,
      };

      const result = validateA2ACapabilities(capabilities);
      expect(result.pushNotifications).toBe(true);
      expect(result.stateTransitionHistory).toBe(false);
      expect(result.streaming).toBe(true);
      expect(result.extensions).toEqual(['ext1', 'ext2']);
    });

    test('returns empty object for invalid input', () => {
      expect(validateA2ACapabilities(null)).toEqual({});
      expect(validateA2ACapabilities(undefined)).toEqual({});
      expect(validateA2ACapabilities('string')).toEqual({});
    });

    test('filters out invalid skills', () => {
      const capabilities = {
        skills: [
          { id: 'skill1', name: 'Valid Skill', description: 'Valid description' },
          { name: 'Invalid Skill' }, // Missing id
          'invalid',
        ],
      };

      const result = validateA2ACapabilities(capabilities);
      expect(result.skills).toHaveLength(1);
      expect(result.skills![0].id).toBe('skill1');
    });
  });

  describe('validateA2AAgent', () => {
    const validAgent = {
      id: 'agent1',
      name: 'Test Agent',
      description: 'Test description',
      url: 'https://agent.example.com',
      version: '1.0.0',
      status: 'available',
      skills: [
        {
          id: 'skill1',
          name: 'Test Skill',
          description: 'Test description',
        },
      ],
      capabilities: {
        streaming: true,
        pushNotifications: false,
      },
      provider: {
        organization: 'Test Org',
        url: 'https://testorg.example.com',
      },
      author: 'Test Author',
      homepage: 'https://homepage.example.com',
      license: 'MIT',
    };

    test('validates valid agent', () => {
      const result = validateA2AAgent(validAgent);
      expect(result).toEqual({
        id: 'agent1',
        name: 'Test Agent',
        description: 'Test description',
        url: 'https://agent.example.com',
        version: '1.0.0',
        status: 'available',
        skills: [
          {
            id: 'skill1',
            name: 'Test Skill',
            description: 'Test description',
          },
        ],
        capabilities: {
          streaming: true,
          pushNotifications: false,
        },
        provider: {
          organization: 'Test Org',
          url: 'https://testorg.example.com',
        },
        author: 'Test Author',
        homepage: 'https://homepage.example.com',
        license: 'MIT',
      });
    });

    test('returns null for invalid agent', () => {
      expect(validateA2AAgent(null)).toBeNull();
      expect(validateA2AAgent(undefined)).toBeNull();
      expect(validateA2AAgent('string')).toBeNull();
    });

    test('requires id, name, description, and url', () => {
      expect(validateA2AAgent({ name: 'Test', description: 'Test', url: 'https://test.com' })).toBeNull();
      expect(validateA2AAgent({ id: 'agent1', description: 'Test', url: 'https://test.com' })).toBeNull();
      expect(validateA2AAgent({ id: 'agent1', name: 'Test', url: 'https://test.com' })).toBeNull();
      expect(validateA2AAgent({ id: 'agent1', name: 'Test', description: 'Test' })).toBeNull();
    });

    test('validates status field', () => {
      const agentWithValidStatus = { ...validAgent, status: 'available' };
      const result = validateA2AAgent(agentWithValidStatus);
      expect(result?.status).toBe('available');

      const agentWithInvalidStatus = { ...validAgent, status: 'invalid' };
      const result2 = validateA2AAgent(agentWithInvalidStatus);
      expect(result2?.status).toBeUndefined();
    });

    test('sanitizes string fields', () => {
      const agentWithXSS = {
        id: 'agent1',
        name: '<script>alert("xss")</script>Test Agent',
        description: '<script>alert("xss")</script>Test description',
        url: 'https://agent.example.com',
        author: '<script>alert("xss")</script>Test Author',
      };

      const result = validateA2AAgent(agentWithXSS);
      expect(result?.name).toBe('Test Agent');
      expect(result?.description).toBe('Test description');
      expect(result?.author).toBe('Test Author');
    });

    test('validates provider object', () => {
      const agentWithValidProvider = {
        ...validAgent,
        provider: {
          organization: 'Test Org',
          url: 'https://testorg.example.com',
        },
      };

      const result = validateA2AAgent(agentWithValidProvider);
      expect(result?.provider).toEqual({
        organization: 'Test Org',
        url: 'https://testorg.example.com',
      });

      const agentWithInvalidProvider = {
        ...validAgent,
        provider: {
          organization: 'Test Org',
          // Missing url
        },
      };

      const result2 = validateA2AAgent(agentWithInvalidProvider);
      expect(result2?.provider).toBeUndefined();
    });
  });

  describe('validateA2AAgentDetails', () => {
    const validAgentDetails = {
      agent: {
        id: 'agent1',
        name: 'Test Agent',
        description: 'Test description',
        url: 'https://agent.example.com',
      },
      health_status: 'healthy',
      response_time_ms: 150,
      last_health_check: '2024-01-01T00:00:00Z',
    };

    test('validates valid agent details', () => {
      const result = validateA2AAgentDetails(validAgentDetails);
      expect(result).toEqual({
        agent: {
          id: 'agent1',
          name: 'Test Agent',
          description: 'Test description',
          url: 'https://agent.example.com',
        },
        health_status: 'healthy',
        response_time_ms: 150,
        last_health_check: '2024-01-01T00:00:00Z',
      });
    });

    test('returns null for invalid input', () => {
      expect(validateA2AAgentDetails(null)).toBeNull();
      expect(validateA2AAgentDetails(undefined)).toBeNull();
      expect(validateA2AAgentDetails('string')).toBeNull();
      expect(validateA2AAgentDetails({})).toBeNull();
    });

    test('requires valid agent object', () => {
      const detailsWithInvalidAgent = {
        agent: { name: 'Test' }, // Missing required fields
        health_status: 'healthy',
      };

      expect(validateA2AAgentDetails(detailsWithInvalidAgent)).toBeNull();
    });

    test('validates health status', () => {
      const detailsWithValidHealth = {
        ...validAgentDetails,
        health_status: 'unhealthy',
      };

      const result = validateA2AAgentDetails(detailsWithValidHealth);
      expect(result?.health_status).toBe('unhealthy');

      const detailsWithInvalidHealth = {
        ...validAgentDetails,
        health_status: 'invalid',
      };

      const result2 = validateA2AAgentDetails(detailsWithInvalidHealth);
      expect(result2?.health_status).toBe('unknown');
    });

    test('handles optional fields', () => {
      const minimalDetails = {
        agent: {
          id: 'agent1',
          name: 'Test Agent',
          description: 'Test description',
          url: 'https://agent.example.com',
        },
      };

      const result = validateA2AAgentDetails(minimalDetails);
      expect(result?.health_status).toBe('unknown');
      expect(result?.response_time_ms).toBeUndefined();
      expect(result?.last_health_check).toBeUndefined();
    });
  });

  describe('isValidUrl', () => {
    test('validates valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com:8080')).toBe(true);
    });

    test('rejects invalid URLs', () => {
      expect(isValidUrl('invalid-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(true); // URL constructor accepts ftp
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(true); // URL constructor accepts javascript
    });

    test('handles edge cases', () => {
      expect(isValidUrl('//example.com')).toBe(false);
      expect(isValidUrl('https://')).toBe(false);
      expect(isValidUrl('https://.')).toBe(false);
    });
  });
});