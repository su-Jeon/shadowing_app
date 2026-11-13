/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sentence, SentenceProgress, ScreenType } from './types';
import {
  loadSentences,
  saveSentences,
  loadProgress,
  saveProgress,
  getOrCreateSentenceProgress,
} from './utils/storage';
import { YouTubePlayer, YouTubePlayerHandle } from './components/YouTubePlayer';
import { StartScreen } from './components/StartScreen';
import { SentenceListScreen } from './components/SentenceListScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { EditScreen } from './components/EditScreen';
import { FinishScreen } from './components/FinishScreen';
import { MOVIE_INFO } from './constants';
import { Sparkles, Home, List, Settings2 } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('start');
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, SentenceProgress>>({});
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const playerRef = useRef<YouTubePlayerHandle | null>(null);

  // Load initial data from localStorage
  useEffect(() => {
    const loadedSentences = loadSentences();
    const loadedProgress = loadProgress();
    setSentences(loadedSentences);
    setProgressMap(loadedProgress);
  }, []);

  // Save sentences when updated
  const handleSaveSentences = (updated: Sentence[]) => {
    setSentences(updated);
    saveSentences(updated);
    if (currentSentenceIndex >= updated.length) {
      setCurrentSentenceIndex(Math.max(0, updated.length - 1));
    }
  };

  // Update progress for a sentence
  const handleUpdateProgress = (updated: SentenceProgress) => {
    setProgressMap((prev) => {
      const next = {
        ...prev,
        [updated.id]: updated,
      };
      saveProgress(next);
      return next;
    });
  };

  // Navigations
  const handleStartPractice = () => {
    if (sentences.length > 0) {
      setCurrentSentenceIndex(0);
      setScreen('practice');
    } else {
      setScreen('edit');
    }
  };

  const handleSelectSentence = (index: number) => {
    setCurrentSentenceIndex(index);
    setScreen('practice');
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
    } else {
      // Reached the end -> navigate to finish screen
      setScreen('finish');
    }
  };

  const handlePrevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(currentSentenceIndex - 1);
    }
  };

  const handleRestartAll = () => {
    setCurrentSentenceIndex(0);
    setScreen('practice');
  };

  // Pause playback when navigating away from practice/edit
  const handleNavigateScreen = (targetScreen: ScreenType) => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setScreen(targetScreen);
  };

  const showVideoPlayer = screen === 'list' || screen === 'practice' || screen === 'edit';
  const currentSentence = sentences[currentSentenceIndex];
  const currentProgress: SentenceProgress = currentSentence
    ? getOrCreateSentenceProgress(progressMap, currentSentence.id)
    : {
        id: 0,
        plays: 0,
        recordings: 0,
        selfCheck: [null, null, null],
        status: 'new',
      };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 antialiased font-sans flex justify-center selection:bg-blue-100 selection:text-blue-900">
      {/* Max 480px width mobile-portrait container centered on desktop */}
      <main className="w-full max-w-[480px] min-h-screen bg-slate-50 flex flex-col shadow-2xl relative border-x border-slate-200/80">
        {/* Top App Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div
            onClick={() => handleNavigateScreen('start')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
              SS
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Scene Shadow
              </div>
              <div className="text-[10px] text-amber-600 font-semibold leading-tight">
                Zootopia (주토피아)
              </div>
            </div>
          </div>

          {/* Quick Nav Bar */}
          <nav className="flex items-center gap-1" aria-label="Quick navigation">
            <button
              onClick={() => handleNavigateScreen('start')}
              title="Home"
              aria-label="Home"
              className={`p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                screen === 'start'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleNavigateScreen('list')}
              title="Sentence List"
              aria-label="Sentence List"
              className={`p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                screen === 'list'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleNavigateScreen('edit')}
              title="Edit Sentences"
              aria-label="Edit Sentences"
              className={`p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                screen === 'edit'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </nav>
        </header>

        {/* Top persistent YouTube Video Player for screens 2, 3, 4 */}
        <div
          className={`px-4 pt-3 transition-all duration-300 ${
            showVideoPlayer ? 'block' : 'hidden'
          }`}
        >
          <YouTubePlayer ref={playerRef} showCredit={true} />
        </div>

        {/* Screen Content */}
        <div className="p-4 flex-1">
          {screen === 'start' && (
            <StartScreen
              onStartPractice={handleStartPractice}
              onOpenSentenceList={() => handleNavigateScreen('list')}
              onOpenEdit={() => handleNavigateScreen('edit')}
              sentenceCount={sentences.length}
            />
          )}

          {screen === 'list' && (
            <SentenceListScreen
              sentences={sentences}
              progressMap={progressMap}
              onSelectSentence={handleSelectSentence}
              onGoBack={() => handleNavigateScreen('start')}
              onOpenEdit={() => handleNavigateScreen('edit')}
            />
          )}

          {screen === 'practice' && currentSentence && (
            <PracticeScreen
              sentence={currentSentence}
              index={currentSentenceIndex}
              totalSentences={sentences.length}
              progress={currentProgress}
              playerRef={playerRef}
              onUpdateProgress={handleUpdateProgress}
              onNext={handleNextSentence}
              onPrev={handlePrevSentence}
              onOpenList={() => handleNavigateScreen('list')}
            />
          )}

          {screen === 'edit' && (
            <EditScreen
              sentences={sentences}
              playerRef={playerRef}
              onSaveSentences={handleSaveSentences}
              onGoBack={() => handleNavigateScreen(sentences.length > 0 ? 'list' : 'start')}
            />
          )}

          {screen === 'finish' && (
            <FinishScreen
              sentences={sentences}
              progressMap={progressMap}
              onPracticeSentence={(idx) => {
                setCurrentSentenceIndex(idx);
                setScreen('practice');
              }}
              onRestartAll={handleRestartAll}
              onOpenList={() => handleNavigateScreen('list')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
