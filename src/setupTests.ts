
import '@testing-library/jest-dom';
import { server } from './__mocks__/firecrawl-server';

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Stop MSW server after all tests
afterAll(() => {
  server.close();
});

// Mock window.URL.createObjectURL
Object.defineProperty(global.URL, 'createObjectURL', {
  value: jest.fn(() => 'mocked-url'),
  writable: true,
});

Object.defineProperty(global.URL, 'revokeObjectURL', {
  value: jest.fn(),
  writable: true,
});

// Mock File and FileReader
class MockFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  content: any;

  constructor(content: any[], name: string, options: any = {}) {
    this.content = content;
    this.name = name;
    this.size = content.length;
    this.type = options.type || '';
    this.lastModified = Date.now();
  }

  slice(start?: number, end?: number) {
    return new MockFile(this.content.slice(start, end), this.name, { type: this.type });
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(this.content.length));
  }
}

Object.defineProperty(global, 'File', {
  value: MockFile,
  writable: true,
});

// Mock console methods to reduce test noise
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock fetch for tests that don't use MSW
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};
