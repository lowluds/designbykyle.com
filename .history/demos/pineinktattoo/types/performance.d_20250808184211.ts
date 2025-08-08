// TypeScript declarations for Performance API

interface PerformanceEntry {
  readonly duration: number;
  readonly entryType: string;
  readonly name: string;
  readonly startTime: number;
  // Additional properties for specific entry types
  readonly processingStart?: number;
  readonly hadRecentInput?: boolean;
  readonly value?: number;
}

interface Window {
  instgrm?: {
    Embeds: {
      process(): void;
    };
  };
}

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process(): void;
      };
    };
  }
}

export {};
