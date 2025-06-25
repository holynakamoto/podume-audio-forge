
import '@testing-library/jest-dom';

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock File and FileReader
global.File = class MockFile {
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
} as any;

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
