import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { MOVIE_INFO } from '../constants';
import { CreditLine } from './CreditLine';
import { ExternalLink, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface YouTubePlayerHandle {
  playSegment: (start: number, end: number, loop?: boolean, playbackRate?: number, onSegmentEnd?: () => void) => void;
  pause: () => void;
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  isPlaying: boolean;
  isReady: boolean;
}

interface YouTubePlayerProps {
  onReadyCallback?: () => void;
  showCredit?: boolean;
}

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  ({ onReadyCallback, showCredit = true }, ref) => {
    const containerIdRef = useRef(`yt-player-${Math.random().toString(36).substring(2, 9)}`);
    const playerRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const segmentIntervalRef = useRef<number | null>(null);
    const loopTimeoutRef = useRef<number | null>(null);
    const activeSegmentRef = useRef<{
      start: number;
      end: number;
      loop: boolean;
      rate: number;
      onEnd?: () => void;
    } | null>(null);

    const clearTimers = useCallback(() => {
      if (segmentIntervalRef.current !== null) {
        window.clearInterval(segmentIntervalRef.current);
        segmentIntervalRef.current = null;
      }
      if (loopTimeoutRef.current !== null) {
        window.clearTimeout(loopTimeoutRef.current);
        loopTimeoutRef.current = null;
      }
    }, []);

    const pause = useCallback(() => {
      clearTimers();
      activeSegmentRef.current = null;
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {
          console.warn('Error pausing player:', e);
        }
      }
      setIsPlaying(false);
    }, [clearTimers]);

    const playSegment = useCallback(
      (start: number, end: number, loop = false, playbackRate = 1.0, onSegmentEnd?: () => void) => {
        clearTimers();
        if (!playerRef.current) return;

        activeSegmentRef.current = { start, end, loop, rate: playbackRate, onEnd: onSegmentEnd };

        try {
          if (typeof playerRef.current.setPlaybackRate === 'function') {
            playerRef.current.setPlaybackRate(playbackRate);
          }
          if (typeof playerRef.current.seekTo === 'function') {
            playerRef.current.seekTo(start, true);
          }
          if (typeof playerRef.current.playVideo === 'function') {
            playerRef.current.playVideo();
          }
          setIsPlaying(true);

          segmentIntervalRef.current = window.setInterval(() => {
            if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') {
              return;
            }
            const current = playerRef.current.getCurrentTime();
            if (current >= end) {
              // Pause segment
              playerRef.current.pauseVideo();
              setIsPlaying(false);

              if (activeSegmentRef.current?.onEnd) {
                activeSegmentRef.current.onEnd();
              }

              if (activeSegmentRef.current?.loop) {
                // Clear segment interval and wait 1.5s for user to speak
                if (segmentIntervalRef.current !== null) {
                  window.clearInterval(segmentIntervalRef.current);
                  segmentIntervalRef.current = null;
                }
                loopTimeoutRef.current = window.setTimeout(() => {
                  if (activeSegmentRef.current && activeSegmentRef.current.loop) {
                    playSegment(
                      activeSegmentRef.current.start,
                      activeSegmentRef.current.end,
                      true,
                      activeSegmentRef.current.rate,
                      activeSegmentRef.current.onEnd
                    );
                  }
                }, 1500);
              } else {
                clearTimers();
                activeSegmentRef.current = null;
              }
            }
          }, 100);
        } catch (err) {
          console.error('Error in playSegment:', err);
        }
      },
      [clearTimers]
    );

    const getCurrentTime = useCallback((): number => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          return playerRef.current.getCurrentTime();
        } catch (e) {
          return 0;
        }
      }
      return 0;
    }, []);

    const seekTo = useCallback((seconds: number) => {
      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        try {
          playerRef.current.seekTo(seconds, true);
        } catch (e) {
          console.warn('Seek error:', e);
        }
      }
    }, []);

    const setPlaybackRate = useCallback((rate: number) => {
      if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
        try {
          playerRef.current.setPlaybackRate(rate);
          if (activeSegmentRef.current) {
            activeSegmentRef.current.rate = rate;
          }
        } catch (e) {
          console.warn('Playback rate error:', e);
        }
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        playSegment,
        pause,
        getCurrentTime,
        seekTo,
        setPlaybackRate,
        isPlaying,
        isReady,
      }),
      [playSegment, pause, getCurrentTime, seekTo, setPlaybackRate, isPlaying, isReady]
    );

    // Initialize YouTube API and Player
    useEffect(() => {
      let isMounted = true;

      const initPlayer = () => {
        if (!isMounted) return;
        if (!window.YT || !window.YT.Player) return;

        try {
          playerRef.current = new window.YT.Player(containerIdRef.current, {
            videoId: MOVIE_INFO.videoId,
            playerVars: {
              start: MOVIE_INFO.startSeconds,
              end: MOVIE_INFO.endSeconds,
              playsinline: 1,
              rel: 0,
              modestbranding: 1,
              controls: 1,
              cc_load_policy: 0,
            },
            events: {
              onReady: () => {
                if (!isMounted) return;
                setIsReady(true);
                onReadyCallback?.();
              },
              onStateChange: (event: any) => {
                if (!isMounted) return;
                // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
                if (event.data === 1) {
                  setIsPlaying(true);
                } else if (event.data === 2 || event.data === 0) {
                  setIsPlaying(false);
                }
              },
              onError: (event: any) => {
                if (!isMounted) return;
                console.warn('YouTube Player error code:', event.data);
                // 101 or 150: embed restricted / not allowed
                setHasError(true);
                setErrorMessage(
                  "This video can't play inside the app. Tap to open it on YouTube."
                );
              },
            },
          });
        } catch (err) {
          console.error('Failed to create YT.Player:', err);
          setHasError(true);
        }
      };

      if (!window.YT || !window.YT.Player) {
        const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
        if (!existingScript) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const prevReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevReady) prevReady();
          initPlayer();
        };
      } else {
        initPlayer();
      }

      return () => {
        isMounted = false;
        clearTimers();
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          try {
            playerRef.current.destroy();
          } catch (e) {
            // ignore
          }
        }
      };
    }, [clearTimers, onReadyCallback]);

    return (
      <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {hasError ? (
            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white z-20">
              <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-sm font-semibold mb-1">
                {errorMessage || "This video can't play inside the app. Tap to open it on YouTube."}
              </p>
              <p className="text-xs text-slate-400 mb-4">
                이 영상은 외부 재생이 제한될 수 있습니다. 아래 버튼을 눌러 YouTube에서 직접 열고 쉐도잉과 녹음을 계속하세요!
              </p>
              <a
                href={`${MOVIE_INFO.youtubeUrl}&t=${MOVIE_INFO.startSeconds}s`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                Open on YouTube ({MOVIE_INFO.formattedRange})
              </a>
            </div>
          ) : null}

          {/* YouTube iframe container */}
          <div id={containerIdRef.current} className="w-full h-full" />
        </div>

        {/* Fallback helper link & Mandatory one-line credit */}
        {showCredit && (
          <div className="bg-slate-50 border-t border-slate-200">
            <CreditLine />
          </div>
        )}
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';
