import React, { useState } from 'react';
import { Sentence } from '../types';
import { MOVIE_INFO, DEFAULT_SENTENCES } from '../constants';
import { YouTubePlayerHandle } from './YouTubePlayer';
import {
  Plus,
  Play,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Check,
  Edit2,
  X,
  ArrowLeft,
} from 'lucide-react';

interface EditScreenProps {
  sentences: Sentence[];
  playerRef: React.RefObject<YouTubePlayerHandle | null>;
  onSaveSentences: (updated: Sentence[]) => void;
  onGoBack: () => void;
}

export const EditScreen: React.FC<EditScreenProps> = ({
  sentences,
  playerRef,
  onSaveSentences,
  onGoBack,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form fields
  const [speaker, setSpeaker] = useState('Judy');
  const [text, setText] = useState('');
  const [korean, setKorean] = useState('');
  const [stressInput, setStressInput] = useState('');
  const [startTime, setStartTime] = useState<string>('92.0');
  const [endTime, setEndTime] = useState<string>('95.0');

  // Warnings / Validation error
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setSpeaker('Judy');
    setText('');
    setKorean('');
    setStressInput('');
    setStartTime('92.0');
    setEndTime('95.0');
    setFormError(null);
  };

  const handleEditItem = (item: Sentence) => {
    setEditingId(item.id);
    setSpeaker(item.speaker);
    setText(item.text);
    setKorean(item.korean);
    setStressInput((item.stress || []).join(', '));
    setStartTime(item.start.toFixed(1));
    setEndTime(item.end.toFixed(1));
    setFormError(null);
    // Scroll form into view if needed
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Set Start = now / Set End = now
  const handleSetStartNow = () => {
    if (playerRef.current) {
      const now = playerRef.current.getCurrentTime();
      setStartTime(now.toFixed(1));
    }
  };

  const handleSetEndNow = () => {
    if (playerRef.current) {
      const now = playerRef.current.getCurrentTime();
      setEndTime(now.toFixed(1));
    }
  };

  // Test playback of current segment
  const handleTestSegment = () => {
    const start = parseFloat(startTime);
    const end = parseFloat(endTime);
    if (isNaN(start) || isNaN(end) || end <= start) {
      setFormError('Start and End times must be valid numbers, and End must be after Start.');
      return;
    }
    if (playerRef.current) {
      playerRef.current.playSegment(start, end, false);
    }
  };

  // Validate and submit Add / Update
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const start = parseFloat(startTime);
    const end = parseFloat(endTime);

    if (!text.trim()) {
      setFormError('Please enter the English sentence text.');
      return;
    }
    if (isNaN(start) || isNaN(end)) {
      setFormError('Start and End times must be valid numbers.');
      return;
    }
    if (end <= start) {
      setFormError('End time must be greater than Start time.');
      return;
    }
    if (start < MOVIE_INFO.startSeconds || end > MOVIE_INFO.endSeconds) {
      setFormError(
        `Start and End must be within the practice clip range [${MOVIE_INFO.startSeconds}s – ${MOVIE_INFO.endSeconds}s].`
      );
      return;
    }

    const stressArr = stressInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingId !== null) {
      // Update existing
      const updated = sentences.map((item) => {
        if (item.id === editingId) {
          return {
            ...item,
            speaker: speaker.trim() || 'Speaker',
            text: text.trim(),
            korean: korean.trim(),
            stress: stressArr,
            start,
            end,
          };
        }
        return item;
      });
      onSaveSentences(updated);
    } else {
      // Create new
      const newId = sentences.length > 0 ? Math.max(...sentences.map((s) => s.id)) + 1 : 1;
      const newSentence: Sentence = {
        id: newId,
        speaker: speaker.trim() || 'Speaker',
        text: text.trim(),
        korean: korean.trim(),
        stress: stressArr,
        start,
        end,
      };
      onSaveSentences([...sentences, newSentence]);
    }

    resetForm();
  };

  // Delete sentence
  const handleDelete = (id: number) => {
    if (confirm('Delete this sentence? / 이 문장을 삭제하시겠습니까?')) {
      onSaveSentences(sentences.filter((s) => s.id !== id));
      if (editingId === id) {
        resetForm();
      }
    }
  };

  // Move Up / Down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sentences.length) return;

    const copy = [...sentences];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onSaveSentences(copy);
  };

  // Export JSON
  const handleExport = () => {
    const jsonStr = JSON.stringify(sentences, null, 2);
    navigator.clipboard
      .writeText(jsonStr)
      .then(() => {
        setCopiedNotice(true);
        setTimeout(() => setCopiedNotice(false), 2500);
      })
      .catch(() => {
        alert('Failed to copy to clipboard.');
      });
  };

  // Import JSON
  const handleImportSubmit = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Imported data must be an array of sentences.');
      }
      for (const item of parsed) {
        if (typeof item.text !== 'string' || typeof item.start !== 'number' || typeof item.end !== 'number') {
          throw new Error('Each sentence must include text, start, and end properties.');
        }
      }
      onSaveSentences(parsed);
      setImportModalOpen(false);
      setImportJsonText('');
      alert('Sentences imported successfully! / 문장이 성공적으로 적용되었습니다.');
    } catch (e: any) {
      setImportError(e.message || 'Invalid JSON format.');
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm('Reset to the original 8 Zootopia sentences? / 주토피아 기본 문장으로 복원하시겠습니까?')) {
      onSaveSentences(DEFAULT_SENTENCES);
      resetForm();
    }
  };

  // Length warning check
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const startNum = parseFloat(startTime) || 0;
  const endNum = parseFloat(endTime) || 0;
  const duration = endNum > startNum ? endNum - startNum : 0;
  const showGentleWarning = duration > 4.0 || wordCount > 12;

  return (
    <div className="flex flex-col gap-4 animate-fadeIn pb-8">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onGoBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back / 돌아가기
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>{copiedNotice ? 'Copied! ✓' : 'Export JSON'}</span>
          </button>

          <button
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-amber-600" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Edit Form Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {editingId !== null ? <Edit2 className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-blue-600" />}
            <span>{editingId !== null ? 'Edit Sentence / 문장 수정' : 'Add Sentence / 새 문장 추가'}</span>
          </h3>
          {editingId !== null && (
            <button
              onClick={resetForm}
              className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
            >
              Cancel Edit / 취소
            </button>
          )}
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
          {formError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Speaker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Speaker / 화자
            </label>
            <div className="flex gap-2">
              {['Judy', 'Nick'].map((spk) => (
                <button
                  key={spk}
                  type="button"
                  onClick={() => setSpeaker(spk)}
                  className={`min-h-[40px] px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    speaker === spk
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {spk === 'Judy' ? '🐰 Judy' : '🦊 Nick'}
                </button>
              ))}
              <input
                type="text"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="Or custom speaker"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* English Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              English Sentence / 영어 문장
            </label>
            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Well, I don't want to cause you any trouble."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Korean Meaning */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Korean Meaning / 한국어 뜻
            </label>
            <input
              type="text"
              value={korean}
              onChange={(e) => setKorean(e.target.value)}
              placeholder="e.g. 음, 곤란하게 해 드리고 싶진 않아요."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Stress words */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stress Words / 강조 단어 (쉼표 구분)
            </label>
            <input
              type="text"
              value={stressInput}
              onChange={(e) => setStressInput(e.target.value)}
              placeholder="e.g. trouble, cause"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Time fields with Set Start/End = now buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Start Time */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600">
                Start Time (sec) / 시작 초
              </label>
              <input
                type="number"
                step="0.1"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
              />
              <button
                type="button"
                onClick={handleSetStartNow}
                className="min-h-[36px] py-1 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
              >
                Set Start = now
              </button>
            </div>

            {/* End Time */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600">
                End Time (sec) / 종료 초
              </label>
              <input
                type="number"
                step="0.1"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
              />
              <button
                type="button"
                onClick={handleSetEndNow}
                className="min-h-[36px] py-1 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
              >
                Set End = now
              </button>
            </div>
          </div>

          {/* Gentle Warning rule */}
          {showGentleWarning && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-bold">Friendly tip: </span>
                This sentence is {duration.toFixed(1)}s and {wordCount} words. Sentences over 4
                seconds or 12 words may be harder for learners to shadow in one breath!
              </div>
            </div>
          )}

          {/* Action Row: Test Segment & Save Button */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleTestSegment}
              className="flex-1 min-h-[48px] py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-blue-600" />
              <span>Test Segment / 구간 테스트</span>
            </button>

            <button
              type="submit"
              className="flex-1 min-h-[48px] py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingId !== null ? 'Save Changes / 저장' : 'Add Sentence / 추가'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Current Sentences Management List */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Current Sentences ({sentences.length})
          </h3>
          <button
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to Default
          </button>
        </div>

        {sentences.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No sentences yet. Use the form above to add one.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {sentences.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {item.speaker}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.start.toFixed(1)}s – {item.end.toFixed(1)}s
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {item.text}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {item.korean}
                  </p>
                </div>

                {/* Management tools: Test, Edit, Move up/down, Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (playerRef.current) {
                        playerRef.current.playSegment(item.start, item.end, false);
                      }
                    }}
                    title="Play segment"
                    aria-label="Play segment"
                    className="p-2 text-blue-600 hover:bg-blue-100/80 rounded-lg cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <button
                    onClick={() => handleEditItem(item)}
                    title="Edit sentence"
                    aria-label="Edit sentence"
                    className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    title="Move up"
                    aria-label="Move up"
                    className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === sentences.length - 1}
                    title="Move down"
                    aria-label="Move down"
                    className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Delete sentence"
                    aria-label="Delete sentence"
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-amber-600" />
                Import Sentences JSON
              </h3>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste your sentence array JSON below. This will replace the current list.
            </p>

            {importError && (
              <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {importError}
              </div>
            )}

            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="[ { id: 1, speaker: 'Judy', text: '...', start: 92.0, end: 94.4 } ]"
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              >
                Apply JSON / 적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
