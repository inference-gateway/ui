import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import React from 'react';

// Add TextEncoder/TextDecoder polyfills for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.useFakeTimers();

const mockFn = () => jest.fn();

const sessionMock = {
  data: {
    user: {
      name: 'Test User',
      email: 'test@example.com',
    },
    expires: '1',
  },
  status: 'authenticated',
};

jest.mock('@/lib/logger', () => ({
  debug: mockFn(),
  info: mockFn(),
  warn: mockFn(),
  error: mockFn(),
}));

jest.mock('@/lib/storage', () => ({
  StorageServiceFactory: {
    createService: mockFn(),
  },
}));

jest.mock('@inference-gateway/sdk', () => ({
  InferenceGatewayClient: mockFn(),
  MessageRole: {
    user: 'user',
    assistant: 'assistant',
    system: 'system',
    tool: 'tool',
  },
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => sessionMock),
  getSession: jest.fn(() => Promise.resolve(sessionMock)),
  signIn: mockFn(),
  signOut: mockFn(),
}));

jest.mock('react-markdown', () => {
  const MockReactMarkdown = ({ children }: { children: React.ReactNode }) => children;
  MockReactMarkdown.displayName = 'MockReactMarkdown';
  return MockReactMarkdown;
});

const MockComponent = ({ children }: { children: React.ReactNode }) => children;

jest.mock('react-syntax-highlighter', () => ({
  Prism: MockComponent,
  default: MockComponent,
}));

jest.mock('react-syntax-highlighter/dist/esm/styles/hljs', () => ({
  dark: () => ({}),
}));

jest.mock('@/lib/api', () => ({
  fetchModels: mockFn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});
