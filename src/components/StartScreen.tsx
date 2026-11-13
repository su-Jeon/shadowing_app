import React from 'react';
import { MOVIE_INFO, EDUCATIONAL_NOTICE_EN, EDUCATIONAL_NOTICE_KO } from '../constants';
import { Play, Sparkles, ExternalLink, Settings2, BookOpen, Volume2, Mic, ArrowRight } from 'lucide-react';

interface StartScreenProps {
  onStartPractice: () => void;
  onOpenSentenceList: () => void;
  onOpenEdit: () => void;
  sentenceCount: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartPractice,
  onOpenSentenceList,
  onOpenEdit,
  sentenceCount,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-600 p-6 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Character badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
            🐰 Officer Judy
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/30 backdrop-blur-md text-xs font-semibold text-amber-100 border border-amber-300/30">
            🦊 Nick Wilde
          </span>
          <span className="ml-auto text-xs text-white/80 font-medium">
            ENG3088
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2 drop-shadow-sm">
          Scene Shadow: <span className="text-amber-300">Zootopia</span>
        </h1>
        <p className="text-blue-100 text-base font-medium mb-1">
          Listen. Copy. Speak at the same time.
        </p>
        <p className="text-blue-200/90 text-xs">
          듣고, 따라하고, 동시에 말하기 — 주토피아 아이스크림 가게 장면
        </p>

        <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/90">
          <div>
            <span className="text-white/70">Scene: </span>
            <span className="font-medium">Jumbo-pop at the ice cream shop</span>
          </div>
          <div className="font-mono bg-white/15 px-2.5 py-0.5 rounded-full">
            {MOVIE_INFO.formattedRange}
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={onStartPractice}
          className="group w-full min-h-[56px] py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-lg shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current text-amber-300 group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <div className="leading-tight">Start Practice</div>
            <div className="text-xs font-normal text-blue-100/90 leading-tight">연습 시작하기 ({sentenceCount}문장)</div>
          </div>
          <ArrowRight className="w-5 h-5 ml-auto text-blue-200" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSentenceList}
            className="flex-1 min-h-[48px] py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Sentence List / 목록</span>
          </button>

          <button
            onClick={onOpenEdit}
            className="flex-1 min-h-[48px] py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-amber-600" />
            <span>Edit Sentences / 문장 편집</span>
          </button>
        </div>
      </div>

      {/* What is Shadowing? Card */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">
            What is Shadowing? / 쉐도잉이란?
          </h2>
        </div>

        <ul className="space-y-3 text-sm text-slate-700">
          <li className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center mt-0.5">
              1
            </span>
            <div>
              <p className="font-medium text-slate-900">Listen to rhythm & emotion</p>
              <p className="text-xs text-slate-500">
                원어민의 자연스러운 감정과 리듬을 귀 기울여 들어요.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center mt-0.5">
              2
            </span>
            <div>
              <p className="font-medium text-slate-900">Repeat like a shadow</p>
              <p className="text-xs text-slate-500">
                그림자처럼 반 박자 뒤에 소리를 거의 동시에 따라 말해요.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mt-0.5">
              3
            </span>
            <div>
              <p className="font-medium text-slate-900">Master stress & intonation</p>
              <p className="text-xs text-slate-500">
                두려움 없이 강조 단어, 억양, 속도를 자연스럽게 체화해요.
              </p>
            </div>
          </li>
        </ul>

        {/* Why this scene tip */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-800">💡 Why Zootopia? </span>
          Judy가 Nick을 따뜻하게 도와주며 일상에서 자주 쓰는 감사, 제안, 놀람 표현(
          <span className="text-blue-600 font-medium">"I can't thank you enough."</span>,{' '}
          <span className="text-amber-600 font-medium">"Are you kidding me?"</span> 등)을
          생생하고 또렷한 발음으로 익힐 수 있습니다.
        </div>
      </div>

      {/* Educational Use & Source Card (Section 0-2 & 0-3) */}
      <div className="rounded-2xl bg-slate-100/90 p-5 border border-slate-200 text-slate-700 text-xs shadow-inner">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-slate-600" />
          <h3 className="font-bold text-sm text-slate-900">
            Educational Use & Source / 교육용 고지 및 출처
          </h3>
        </div>

        {/* Educational notice (Section 0-2) */}
        <div className="mb-4 pb-3 border-b border-slate-200/80 space-y-2">
          <p className="font-semibold text-slate-800">Educational use only / 교육 목적 전용</p>
          <p className="leading-relaxed text-slate-600">
            {EDUCATIONAL_NOTICE_EN}
          </p>
          <p className="leading-relaxed text-slate-600">
            {EDUCATIONAL_NOTICE_KO}
          </p>
        </div>

        {/* Metadata lines (Section 0-1) */}
        <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px] text-slate-600">
          <div>
            <span className="font-semibold text-slate-800">Movie Title:</span> {MOVIE_INFO.titleEn} ({MOVIE_INFO.titleKo})
          </div>
          <div>
            <span className="font-semibold text-slate-800">Release Year:</span> {MOVIE_INFO.releaseYear}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Director:</span> {MOVIE_INFO.director}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Screenplay:</span> {MOVIE_INFO.screenplay}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Production:</span> {MOVIE_INFO.production}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Distribution:</span> {MOVIE_INFO.distribution}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Scene:</span> {MOVIE_INFO.sceneDescription}
          </div>
          <div>
            <span className="font-semibold text-slate-800">YouTube Title:</span> {MOVIE_INFO.youtubeTitle}
          </div>
          <div>
            <span className="font-semibold text-slate-800">YouTube Channel:</span> {MOVIE_INFO.channelName}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Practice Range:</span> {MOVIE_INFO.formattedRange} ({MOVIE_INFO.startSeconds}s – {MOVIE_INFO.endSeconds}s)
          </div>
          <div>
            <span className="font-semibold text-slate-800">Made by:</span> {MOVIE_INFO.madeBy}
          </div>
          <div className="pt-2">
            <a
              href={MOVIE_INFO.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2"
            >
              Watch Original Clip on YouTube
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
