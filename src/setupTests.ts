
import '@testing-library/jest-dom';

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
