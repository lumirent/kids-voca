import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock SpeechSynthesis if it doesn't exist in happy-dom
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
    },
    writable: true,
  });

  // @ts-expect-error
  global.SpeechSynthesisUtterance = class {
    text: string;
    lang: string = '';
    rate: number = 1;
    pitch: number = 1;
    volume: number = 1;
    onend: any = null;
    constructor(text: string) {
      this.text = text;
    }
  };
}
