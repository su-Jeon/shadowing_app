import React, { useState } from 'react';
import { Sentence, SentenceProgress } from '../types';
import { Eye, EyeOff, Play, CheckCircle2, ChevronRight, Settings2, PlusCircle, ArrowLeft } from 'lucide-react';

interface SentenceListScreenProps {
  sentences: Sentence[];
  progressMap: Record<number, SentenceProgress>;
  onSelectSentence: (index: number) => void;
  onGoBack: () => void;
  onOpenEdit: () => void;
}

export const SentenceListScreen: React.FC<SentenceListScreenProps> = ({
  sentences,
  progressMap,
  onSelectSentence,
  onGoBack,
  onOpenEdit,
}) => {
  const [hideAllText, setHideAllText] = useState(false);

  // Render progress mark: ☆ not started, ◐ practiced, ★ done
  const renderProgressMark = (progress?: SentenceProgress) => {
    const status = progress?.status || 'new';
    if (status === 'done') {
      return (
        <span className="inline-flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          ★ Done
        </span>
      );
    }
    if (status === 'practiced') {
      return (
        <span className="inline-flex items-center gap-1 text-blue-600 font-bold text-sm bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          ◐ Practiced
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-sm bg-slate-100 px-2 py-0.5 rounded-full">
        ☆ Not started
      </span>
    );
  };

  const getSpeakerStyle = (speaker: string) => {
    const lower = speaker.toLowerCase();
    if (lower.includes('judy')) {
      return {
        bg: 'bg-blue-100 text-blue-800 border-blue-200',
        badge: '🐰 Judy',
      };
    }
    if (lower.includes('nick')) {
      return {
        bg: 'bg-orange-100 text-orange-800 border-orange-200',
        badge: '🦊 Nick',
      };
    }
    return {
      bg: 'bg-purple-100 text-purple-800 border-purple-200',
      badge: speaker,
    };
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn pb-6">
      {/* Header action bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          onClick={onGoBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Home / 홈
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideAllText(!hideAllText)}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
          >
            {hideAllText ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {hideAllText ? 'Show All' : 'Hide All'}
          </button>

          <button
            onClick={onOpenEdit}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Edit / 편집
          </button>
        </div>
      </div>

      {/* Title & Stats */}
      <div className="px-1 flex items-baseline justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Practice Sentences</h2>
          <p className="text-xs text-slate-500">연습할 문장을 선택해 쉐도잉을 시작하세요.</p>
        </div>
        <span className="text-xs font-medium text-slate-500">
          Total: {sentences.length} sentences
        </span>
      </div>

      {/* Sentence List or Empty State */}
      {sentences.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-600 font-medium mb-3">
            No sentences yet. Tap Edit Sentences to add some.
          </p>
          <p className="text-xs text-slate-400 mb-4">
            등록된 연습 문장이 없습니다. 문장 편집에서 새로운 문장을 추가해보세요.
          </p>
          <button
            onClick={onOpenEdit}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Edit Sentences / 문장 편집
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sentences.map((sentence, index) => {
            const prog = progressMap[sentence.id];
            const speakerStyle = getSpeakerStyle(sentence.speaker);

            return (
              <div
                key={sentence.id}
                onClick={() => onSelectSentence(index)}
                className="group relative bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer text-left"
              >
                {/* Top line: number, speaker badge, and progress mark */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${speakerStyle.bg}`}
                    >
                      {speakerStyle.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      {sentence.start.toFixed(1)}s – {sentence.end.toFixed(1)}s
                    </span>
                    {renderProgressMark(prog)}
                  </div>
                </div>

                {/* Sentence English text */}
                <div className="my-1.5">
                  {hideAllText ? (
                    <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    <p className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {sentence.text}
                    </p>
                  )}
                </div>

                {/* Korean Meaning */}
                <p className="text-xs text-slate-500 mb-1">
                  {sentence.korean}
                </p>

                {/* Action footer hint */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {prog?.recordings ? `Recorded ${prog.recordings} time(s)` : 'Tap to start shadowing'}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                    Practice <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
