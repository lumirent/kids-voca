import { useCallback, useEffect, useState } from 'react';
import type { AppMode } from '../types';

const PROGRESS_KEY = 'kids-voca-study-progress';

interface ProgressData {
  deckIds: number[];
  currentIndex: number;
  score: number;
}

type ModeProgress = Partial<Record<AppMode, ProgressData>>;

const getInitialProgress = (): ModeProgress => {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse study progress', e);
      return {};
    }
  }
  return {};
};

export const useStudyProgress = () => {
  const [progress, setProgress] = useState<ModeProgress>(getInitialProgress);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  const saveProgress = useCallback(
    (mode: AppMode, deckIds: number[], currentIndex: number, score = 0) => {
      setProgress((prev) => ({
        ...prev,
        [mode]: { deckIds, currentIndex, score },
      }));
    },
    [],
  );

  const getProgress = useCallback(
    (mode: AppMode) => {
      return progress[mode];
    },
    [progress],
  );

  const clearProgress = useCallback((mode: AppMode) => {
    setProgress((prev) => {
      const next = { ...prev };
      delete next[mode];
      return next;
    });
  }, []);

  return { saveProgress, getProgress, clearProgress };
};
