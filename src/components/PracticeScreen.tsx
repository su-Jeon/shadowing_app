import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sentence, SentenceProgress, StepId, SelfCheckRating } from '../types';
import { STEP_GUIDES } from '../constants';
import { YouTubePlayerHandle } from './YouTubePlayer';
import { parseSentenceTokens, evaluateSpeechAgainstText, WordMatchResult } from '../utils/text';
import {
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Mic,
  Square,
  Volume2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  List,
  Wand2,
} from 'lucide-react';

interface PracticeScreenProps {
  sentence: Sentence;
  index: number;
  totalSentences: number;
  progress: SentenceProgress;
  playerRef: React.RefObject<YouTubePlayerHandle | null>;
  onUpdateProgress: (updated: SentenceProgress) => void;
  onNext: () => void;
  onPrev: () => void;
  onOpenList: () => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  sentence,
  index,
  totalSentences,
  progress,
  playerRef,
  onUpdateProgress,
  onNext,
  onPrev,
  onOpenList,
}) => {
  // Step guide: 1, 2, 3, 4
  const [currentStep, setCurrentStep] = useState<StepId>(1);

  // Text visibility
  const [hideText, setHideText] = useState<boolean>(true);
  const [hideKorean, setHideKorean] = useState<boolean>(false);

  // Playback state
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isPlayingClip, setIsPlayingClip] = useState<boolean>(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [micDenied, setMicDenied] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Self check answers: [speed, stress, intonation]
  const [selfCheck, setSelfCheck] = useState<[SelfCheckRating, SelfCheckRating, SelfCheckRating]>(
    progress.selfCheck || [null, null, null]
  );

  // Speech recognition (Web Speech API)
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const [recognitionResult, setRecognitionResult] = useState<{
    results: WordMatchResult[];
    matchedCount: number;
    totalCount: number;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recognitionInstanceRef = useRef<any>(null);

  // Initialize Web Speech API detection
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setIsSpeechSupported(true);
    }
  }, []);

  // Sync state when sentence changes
  useEffect(() => {
    setSelfCheck(progress.selfCheck || [null, null, null]);
    setAudioUrl(null);
    setRecognitionResult(null);
    // Reset to Step 1 on sentence change
    setCurrentStep(1);
    setHideText(STEP_GUIDES[0].defaultHideText);
    setIsPlayingClip(false);
    if (playerRef.current) {
      playerRef.current.pause();
    }
  }, [sentence.id]);

  // When step changes, update default text visibility
  const handleStepChange = (stepId: StepId) => {
    setCurrentStep(stepId);
    const stepGuide = STEP_GUIDES.find((s) => s.id === stepId);
    if (stepGuide) {
      setHideText(stepGuide.defaultHideText);
    }
  };

  // Play segment via player
  const handlePlay = useCallback(() => {
    if (!playerRef.current) return;

    if (isPlayingClip) {
      playerRef.current.pause();
      setIsPlayingClip(false);
      return;
    }

    setIsPlayingClip(true);
    onUpdateProgress({
      ...progress,
      plays: progress.plays + 1,
    });

    playerRef.current.playSegment(
      sentence.start,
      sentence.end,
      isLooping,
      playbackRate,
      () => {
        if (!isLooping) {
          setIsPlayingClip(false);
        }
      }
    );
  }, [isPlayingClip, isLooping, playbackRate, sentence, progress, onUpdateProgress, playerRef]);

  // Speed toggle
  const handleSetSpeed = (speed: number) => {
    setPlaybackRate(speed);
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(speed);
    }
  };

  // Recording handler
  const handleStartRecording = async () => {
    if (isRecording) {
      // Manual stop
      stopRecordingSession();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicDenied(false);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Update progress status
        const newRecordings = progress.recordings + 1;
        const newStatus = currentStep === 4 ? 'done' : progress.status === 'new' ? 'practiced' : progress.status;
        onUpdateProgress({
          ...progress,
          recordings: newRecordings,
          status: newStatus,
          lastRecordedAt: Date.now(),
        });

        // Release mic tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPlayingClip(true);

      // Play the sentence once during recording (loop is ignored while recording)
      if (playerRef.current) {
        playerRef.current.playSegment(
          sentence.start,
          sentence.end,
          false,
          playbackRate,
          () => {
            // Stop recording 1 second after sentence ends
            setTimeout(() => {
              stopRecordingSession();
            }, 1000);
          }
        );
      }
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      setMicDenied(true);
      setIsRecording(false);
      setIsPlayingClip(false);
    }
  };

  const stopRecordingSession = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }
    setIsRecording(false);
    setIsPlayingClip(false);
  };

  // Play learner's voice recording
  const handlePlayMyVoice = () => {
    if (!audioUrl) return;

    if (isPlayingAudio && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    setIsPlayingAudio(true);

    audio.onended = () => {
      setIsPlayingAudio(false);
    };

    audio.play().catch((err) => {
      console.warn('Error playing voice audio:', err);
      setIsPlayingAudio(false);
    });
  };

  // Play original clip segment right after
  const handlePlayOriginal = () => {
    if (!playerRef.current) return;
    if (isPlayingAudio && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    }
    playerRef.current.playSegment(sentence.start, sentence.end, false, playbackRate, () => {
      setIsPlayingClip(false);
    });
    setIsPlayingClip(true);
  };

  // Self check handler
  const handleSelfCheckRating = (questionIndex: 0 | 1 | 2, rating: SelfCheckRating) => {
    const updated: [SelfCheckRating, SelfCheckRating, SelfCheckRating] = [...selfCheck];
    updated[questionIndex] = rating;
    setSelfCheck(updated);

    onUpdateProgress({
      ...progress,
      selfCheck: updated,
    });
  };

  // Web Speech API Word Check
  const handleCheckWordsWithSpeech = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    if (isRecognizing) {
      if (recognitionInstanceRef.current) {
        try {
          recognitionInstanceRef.current.stop();
        } catch (e) {}
      }
      setIsRecognizing(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognitionInstanceRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecognizing(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        const evaluated = evaluateSpeechAgainstText(sentence.text, transcript);
        setRecognitionResult(evaluated);
        setIsRecognizing(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecognizing(false);
      };

      recognition.onend = () => {
        setIsRecognizing(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
      setIsRecognizing(false);
    }
  };

  // Prepare tokens for stress bolding
  const tokens = parseSentenceTokens(sentence.text, sentence.stress);
  const activeStepGuide = STEP_GUIDES.find((s) => s.id === currentStep) || STEP_GUIDES[0];

  const speakerTheme = sentence.speaker.toLowerCase().includes('nick')
    ? {
        name: 'Nick Wilde',
        badge: '🦊 Nick',
        badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
        activeTabColor: 'bg-orange-500 text-white',
      }
    : {
        name: 'Officer Judy Hopps',
        badge: '🐰 Judy',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        activeTabColor: 'bg-blue-600 text-white',
      };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn pb-8">
      {/* Top Navigation & Counter */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onOpenList}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
        >
          <List className="w-3.5 h-3.5" />
          Sentences ({index + 1}/{totalSentences})
        </button>

        {/* ◀ ▶ arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={index === 0}
            aria-label="Previous sentence"
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-1.5">
            {index + 1} / {totalSentences}
          </span>
          <button
            onClick={onNext}
            aria-label="Next sentence"
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Practice Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 flex flex-col gap-4">
        {/* Speaker badge & Quick toggles */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${speakerTheme.badgeColor}`}
          >
            {speakerTheme.badge}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setHideText(!hideText)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg px-2.5 py-1 transition-colors cursor-pointer"
            >
              {hideText ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{hideText ? 'Show Text / 자막 보기' : 'Hide Text / 문장 숨기기'}</span>
            </button>
          </div>
        </div>

        {/* Large Sentence Text (at least 22px) */}
        <div className="min-h-[72px] flex items-center justify-center p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
          {hideText ? (
            <div className="text-center py-2">
              <span className="inline-block px-4 py-1.5 rounded-full bg-slate-200/70 text-slate-500 text-sm font-medium">
                🙈 Text is hidden for shadowing / 소리에 집중하세요
              </span>
            </div>
          ) : (
            <p
              className="text-center text-slate-900 font-semibold leading-relaxed tracking-wide select-text"
              style={{ fontSize: '22px' }}
            >
              {tokens.map((token, i) => (
                <span
                  key={i}
                  className={
                    token.isStress
                      ? 'font-extrabold text-blue-700 underline decoration-blue-300 decoration-2 underline-offset-4'
                      : 'font-normal'
                  }
                >
                  {token.original}{' '}
                </span>
              ))}
            </p>
          )}
        </div>

        {/* Korean Meaning (small, gray, can be hidden) */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex-1">
            {hideKorean ? (
              <span className="text-slate-400 italic">Korean meaning hidden</span>
            ) : (
              <span>{sentence.korean}</span>
            )}
          </div>
          <button
            onClick={() => setHideKorean(!hideKorean)}
            className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer ml-2"
          >
            {hideKorean ? 'Show Korean' : 'Hide Korean'}
          </button>
        </div>

        {/* Control Row: Play, Loop, Speed (0.5x, 0.75x, 1.0x) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          {/* Play/Pause Button (min 48px height) */}
          <button
            onClick={handlePlay}
            className={`flex-1 min-h-[48px] px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              isPlayingClip
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isPlayingClip ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause / 일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Play Clip / 재생</span>
              </>
            )}
          </button>

          {/* Loop toggle button */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`min-h-[48px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isLooping
                ? 'bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-400/20'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Repeat className={`w-4 h-4 ${isLooping ? 'text-blue-600 animate-spin-slow' : ''}`} />
            <span>Loop / 반복</span>
          </button>

          {/* Speed Buttons: 0.5x / 0.75x / 1.0x */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            {[0.5, 0.75, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSetSpeed(rate)}
                className={`min-h-[38px] px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  playbackRate === rate
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {rate}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step Guide (4 tabs in order) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Shadowing Steps / 쉐도잉 4단계
          </span>
          <span className="text-xs text-blue-600 font-semibold">
            {activeStepGuide.name}
          </span>
        </div>

        {/* 4 Tabs */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {STEP_GUIDES.map((step) => {
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => handleStepChange(step.id)}
                className={`min-h-[44px] py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20 ring-2 ring-blue-600/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-medium'
                }`}
              >
                <span className="text-xs leading-tight">Step {step.id}</span>
                <span className="text-[10px] opacity-90 truncate max-w-full">
                  {step.name.split(' ')[1] || step.koreanName.split(':')[1]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step Instruction Line (English + Korean) */}
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-slate-700 text-xs">
          <p className="font-semibold text-blue-900 mb-0.5">
            {activeStepGuide.instruction}
          </p>
          <p className="text-blue-700/80">
            {activeStepGuide.koreanInstruction}
          </p>
        </div>
      </div>

      {/* Recording Area */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-red-500" />
            Record & Compare / 녹음 및 비교
          </h3>
          {progress.recordings > 0 && (
            <span className="text-xs text-slate-500">
              Recorded {progress.recordings} time{progress.recordings > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Mic denied warning */}
        {micDenied && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">Mic is off. You can still listen and shadow out loud.</p>
              <p className="text-amber-700">
                마이크 권한이 꺼져 있습니다. 소리 내어 쉐도잉을 계속할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* Record Action Button (min 48px tall) */}
        <button
          onClick={handleStartRecording}
          className={`w-full min-h-[52px] py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
          }`}
        >
          {isRecording ? (
            <>
              <Square className="w-5 h-5 fill-current" />
              <span>Recording Now... Tap to Stop / 녹음 중 (탭하여 정지)</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 text-red-600" />
              <span>🎙 Record My Voice / 녹음하기</span>
            </>
          )}
        </button>

        {/* Playback Buttons: ▶ My Voice & ▶ Original */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handlePlayMyVoice}
            disabled={!audioUrl}
            className={`min-h-[48px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              !audioUrl
                ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                : isPlayingAudio
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
            }`}
          >
            <Volume2 className="w-4 h-4 text-indigo-500" />
            <span>▶ My Voice / 내 목소리</span>
          </button>

          <button
            onClick={handlePlayOriginal}
            className="min-h-[48px] py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-blue-600" />
            <span>▶ Original / 원음 듣기</span>
          </button>
        </div>
      </div>

      {/* Web Speech API: Word Check (optional) */}
      {isSpeechSupported && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
              Check My Words / 단어 정확도 확인
            </h4>
            <span className="text-[11px] text-slate-400">Web Speech API</span>
          </div>

          <p className="text-xs text-slate-500">
            마이크로 문장을 말해보세요. 단어 단위로 일치 여부를 편안하게 점검해줍니다.
          </p>

          <button
            onClick={handleCheckWordsWithSpeech}
            className={`min-h-[48px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isRecognizing
                ? 'bg-indigo-600 text-white animate-pulse'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>
              {isRecognizing
                ? 'Listening... Speak now! / 듣고 있어요...'
                : 'Check My Words / 단어 체크 시작'}
            </span>
          </button>

          {/* Word match visualization */}
          {recognitionResult && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-2">
              <div className="font-semibold text-slate-700">
                You said {recognitionResult.matchedCount} of {recognitionResult.totalCount} words!
              </div>

              {/* Color coded words: green for matched, gray with underline for missed */}
              <div className="flex flex-wrap gap-1.5 text-sm font-medium">
                {recognitionResult.results.map((res, idx) => (
                  <span
                    key={idx}
                    className={
                      res.matched
                        ? 'text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded'
                        : 'text-slate-400 underline decoration-slate-300 decoration-2 px-1 py-0.5'
                    }
                  >
                    {res.word}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                잘하셨어요! 놓친 단어는 원음 클립과 비교하며 한 번 더 연습해보세요.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Self-check (after recording), each with 😀 / 🙂 / 😐 buttons */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            Self-Check / 스스로 점검하기
          </h4>
          <span className="text-[11px] text-slate-400">선택 후 자동 저장</span>
        </div>

        {/* Question 1: Speed */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
          <div className="text-xs font-medium text-slate-700">
            1. Did I keep up with the speed?
            <span className="block text-[11px] text-slate-400">속도를 잘 맞추었나요?</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { id: 'great', label: '😀 Fast & matched' },
              { id: 'good', label: '🙂 Almost' },
              { id: 'needs_work', label: '😐 A bit slow' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelfCheckRating(0, opt.id as SelfCheckRating)}
                className={`min-h-[40px] py-1 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  selfCheck[0] === opt.id
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Stress */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
          <div className="text-xs font-medium text-slate-700">
            2. Did I stress the bold words?
            <span className="block text-[11px] text-slate-400">강조 단어에 힘을 주었나요?</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { id: 'great', label: '😀 Clear stress' },
              { id: 'good', label: '🙂 Fair' },
              { id: 'needs_work', label: '😐 Missed' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelfCheckRating(1, opt.id as SelfCheckRating)}
                className={`min-h-[40px] py-1 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  selfCheck[1] === opt.id
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 3: Intonation */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
          <div className="text-xs font-medium text-slate-700">
            3. Did my voice go up and down like the actor?
            <span className="block text-[11px] text-slate-400">배우처럼 억양(음높이)을 살렸나요?</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { id: 'great', label: '😀 Very natural' },
              { id: 'good', label: '🙂 Good' },
              { id: 'needs_work', label: '😐 Flat tone' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelfCheckRating(2, opt.id as SelfCheckRating)}
                className={`min-h-[40px] py-1 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  selfCheck[2] === opt.id
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer: Next ▶ */}
      <button
        onClick={onNext}
        className="w-full min-h-[54px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <span>
          {index < totalSentences - 1
            ? 'Next Sentence ▶ / 다음 문장'
            : 'Finish Practice 🎉 / 연습 완료'}
        </span>
      </button>
    </div>
  );
};
