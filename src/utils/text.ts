export function cleanWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9']/g, '').trim();
}

export interface WordToken {
  original: string;
  isStress: boolean;
}

export function parseSentenceTokens(text: string, stressList: string[]): WordToken[] {
  const words = text.split(/\s+/).filter(Boolean);
  const normalizedStress = (stressList || []).flatMap((s) =>
    s.toLowerCase().split(/[\s,]+/).map((w) => cleanWord(w)).filter(Boolean)
  );

  return words.map((w) => {
    const cleaned = cleanWord(w);
    const isStress = normalizedStress.includes(cleaned);
    return {
      original: w,
      isStress,
    };
  });
}

export interface WordMatchResult {
  word: string;
  matched: boolean;
}

export function evaluateSpeechAgainstText(
  targetText: string,
  recognizedTranscript: string
): {
  results: WordMatchResult[];
  matchedCount: number;
  totalCount: number;
} {
  const targetWords = targetText.split(/\s+/).filter(Boolean);
  const spokenTokens = recognizedTranscript
    .toLowerCase()
    .split(/\s+/)
    .map(cleanWord)
    .filter(Boolean);

  const spokenSet = new Set(spokenTokens);

  let matchedCount = 0;
  const results: WordMatchResult[] = targetWords.map((rawWord) => {
    const cleaned = cleanWord(rawWord);
    // Exact or loose match in spoken tokens
    const isMatched = spokenSet.has(cleaned);
    if (isMatched) {
      matchedCount++;
    }
    return {
      word: rawWord,
      matched: isMatched,
    };
  });

  return {
    results,
    matchedCount,
    totalCount: targetWords.length,
  };
}
