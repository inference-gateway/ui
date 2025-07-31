import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import React from 'react';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

global.Request = class MockRequest {
  url: string;
  method: string;
  headers: Map<string, string>;

  constructor(input: string | URL, init: RequestInit = {}) {
    this.url = typeof input === 'string' ? input : input.toString();
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries((init.headers as Record<string, string>) || {}));
  }
} as unknown as typeof Request;

global.Response = class MockResponse {
  body: BodyInit | null;
  status: number;
  headers: Map<string, string>;
  ok: boolean;

  constructor(body: BodyInit | null, init: ResponseInit = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.headers = new Map(Object.entries((init.headers as Record<string, string>) || {}));
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    if (typeof this.body === 'string') {
      return JSON.parse(this.body);
    }
    return this.body;
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }

  static json(data: unknown, init: ResponseInit = {}) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...((init.headers as Record<string, string>) || {}),
      },
    });
  }
} as unknown as typeof Response;

(global as Record<string, unknown>).NextResponse = {
  json: (data: unknown, init: ResponseInit = {}) => {
    const MockResponseClass = global.Response as unknown as new (
      body: string,
      init: ResponseInit
    ) => Response;
    return new MockResponseClass(JSON.stringify(data), {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...((init.headers as Record<string, string>) || {}),
      },
    });
  },
};

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
