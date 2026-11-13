import React, { useEffect } from 'react';
import { Sentence, SentenceProgress } from '../types';
import { CreditLine } from './CreditLine';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Sparkles,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface FinishScreenProps {
  sentences: Sentence[];
  progressMap: Record<number, SentenceProgress>;
  onPracticeSentence: (index: number) => void;
  onRestartAll: () => void;
  onOpenList: () => void;
}

export const FinishScreen: React.FC<FinishScreenProps> = ({
  sentences,
  progressMap,
  onPracticeSentence,
  onRestartAll,
  onOpenList,
}) => {
  // Fire celebratory confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  }, []);

  // Compute stats
  const completedSentences = sentences.filter((s) => {
    const p = progressMap[s.id];
    return p?.status === 'done' || (p?.recordings && p.recordings > 0);
  });

  const totalRecordings = Object.values(progressMap).reduce(
    (acc, cur) => acc + (cur.recordings || 0),
    0
  );

  // Find sentences marked 😐 (needs work) in any self check question
  const sentencesNeedingWork = sentences
    .map((s, idx) => ({ sentence: s, index: idx, prog: progressMap[s.id] }))
    .filter((item) => {
      const checks = item.prog?.selfCheck || [];
      return checks.includes('needs_work');
    });

  return (
    <div className="flex flex-col gap-5 animate-fadeIn pb-8">
      {/* Celebration Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 p-6 text-white text-center shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
          <Trophy className="w-9 h-9 text-amber-300 animate-bounce" />
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight mb-1">
          Great Job! 🎉
        </h2>
        <p className="text-blue-100 text-sm font-medium">
          주토피아 쉐도잉 세션을 멋지게 완주했습니다!
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/20">
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <div className="text-2xl font-black text-white">
              {completedSentences.length} / {sentences.length}
            </div>
            <div className="text-xs text-blue-100/90 font-medium">Sentences Practiced</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <div className="text-2xl font-black text-amber-300">
              {totalRecordings}
            </div>
            <div className="text-xs text-blue-100/90 font-medium">Total Voice Recordings</div>
          </div>
        </div>
      </div>

      {/* Sentences marked 😐 Section (Section 5 requirement) */}
      {sentencesNeedingWork.length > 0 && (
        <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Sentences to Review (😐)
              </h3>
              <p className="text-xs text-amber-700">
                스스로 점검에서 아쉬웠던 문장들입니다. 한 번 더 연습해보세요!
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {sentencesNeedingWork.map(({ sentence, index }) => (
              <div
                key={sentence.id}
                className="bg-white p-3 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-2 shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-bold text-slate-800">
                      #{index + 1} {sentence.speaker}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {sentence.text}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {sentence.korean}
                  </p>
                </div>

                <button
                  onClick={() => onPracticeSentence(index)}
                  className="min-h-[40px] px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer flex-shrink-0"
                >
                  <span>Practice again</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All sentences recap */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Session Summary / 전체 문장 현황
        </h3>

        <div className="flex flex-col gap-2">
          {sentences.map((sentence, idx) => {
            const prog = progressMap[sentence.id];
            const isDone = prog?.status === 'done';
            const isPracticed = prog?.status === 'practiced';

            return (
              <div
                key={sentence.id}
                onClick={() => onPracticeSentence(idx)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 flex items-center justify-between gap-2 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <span>#{idx + 1}</span>
                    <span>{sentence.speaker}</span>
                  </div>
                  <p className="text-xs text-slate-900 truncate">{sentence.text}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isDone ? (
                    <span className="text-xs font-bold text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      ★ Done
                    </span>
                  ) : isPracticed ? (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      ◐ Practiced
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      ☆ Not started
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={onRestartAll}
          className="w-full min-h-[52px] py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Practice Again from #1 / 처음부터 다시 연습</span>
        </button>

        <button
          onClick={onOpenList}
          className="w-full min-h-[48px] py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Back to Sentence List / 문장 목록으로 가기</span>
        </button>
      </div>

      {/* Mandatory one-line credit at the bottom of Finish screen (Section 0-3) */}
      <div className="mt-2 pt-2 border-t border-slate-200">
        <CreditLine />
      </div>
    </div>
  );
};
