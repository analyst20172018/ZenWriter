export type ThemeMode = 'light' | 'dark' | 'sepia';

export interface EditorState {
  content: string;
  wordCount: number;
  readingTime: number; // in minutes
  lastSaved: Date | null;
}

export interface AIState {
  isGenerating: boolean;
  error: string | null;
  suggestion: string | null;
  mode: 'idle' | 'continue' | 'improve' | 'thesaurus';
}

export interface SelectionRange {
  start: number;
  end: number;
  text: string;
}