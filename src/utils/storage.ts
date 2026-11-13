import { Sentence, SentenceProgress } from '../types';
import { DEFAULT_SENTENCES } from '../constants';

const SENTENCES_KEY = 'scene_shadow_zootopia_sentences';
const PROGRESS_KEY = 'scene_shadow_zootopia_progress';

let memorySentences: Sentence[] = [...DEFAULT_SENTENCES];
let memoryProgress: Record<number, SentenceProgress> = {};

export function loadSentences(): Sentence[] {
  try {
    const raw = localStorage.getItem(SENTENCES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migrated = parsed.map((item: Sentence) => {
          if (item.id === 7 && item.end <= 130.0) {
            return { ...item, end: 131.5 };
          }
          return item;
        });
        memorySentences = migrated;
        return migrated;
      }
    }
  } catch (e) {
    console.warn('localStorage read error for sentences:', e);
  }
  return memorySentences;
}

export function saveSentences(sentences: Sentence[]): void {
  memorySentences = sentences;
  try {
    localStorage.setItem(SENTENCES_KEY, JSON.stringify(sentences));
  } catch (e) {
    console.warn('localStorage write error for sentences:', e);
  }
}

export function loadProgress(): Record<number, SentenceProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        memoryProgress = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('localStorage read error for progress:', e);
  }
  return memoryProgress;
}

export function saveProgress(progress: Record<number, SentenceProgress>): void {
  memoryProgress = progress;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('localStorage write error for progress:', e);
  }
}

export function getOrCreateSentenceProgress(
  progressMap: Record<number, SentenceProgress>,
  id: number
): SentenceProgress {
  if (progressMap[id]) {
    return progressMap[id];
  }
  return {
    id,
    plays: 0,
    recordings: 0,
    selfCheck: [null, null, null],
    status: 'new',
  };
}
