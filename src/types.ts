export interface Sentence {
  id: number;
  speaker: string;
  text: string;
  korean: string;
  stress: string[];
  start: number;
  end: number;
}

export type SelfCheckRating = 'great' | 'good' | 'needs_work' | null;

export interface SentenceProgress {
  id: number;
  plays: number;
  recordings: number;
  selfCheck: [SelfCheckRating, SelfCheckRating, SelfCheckRating];
  status: 'new' | 'practiced' | 'done';
  lastRecordedAt?: number;
}

export type StepId = 1 | 2 | 3 | 4;

export interface StepGuide {
  id: StepId;
  name: string;
  koreanName: string;
  instruction: string;
  koreanInstruction: string;
  defaultHideText: boolean;
}

export type ScreenType = 'start' | 'list' | 'practice' | 'edit' | 'finish';
