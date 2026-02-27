import { useCallback, useEffect, useState } from 'react';
import type { Word } from '../types';

const INCORRECT_WORDS_KEY = 'kids-voca-incorrect-words';

// Helper to get initial incorrect words from localStorage
const getInitialIncorrectWords = (): Word[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const saved = localStorage.getItem(INCORRECT_WORDS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse incorrect words from localStorage', e);
      return [];
    }
  }
  return [];
};

export const useIncorrectWords = () => {
  const [incorrectWords, setIncorrectWords] = useState<Word[]>(
    getInitialIncorrectWords,
  );

  // Persist incorrect words whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(INCORRECT_WORDS_KEY, JSON.stringify(incorrectWords));
    }
  }, [incorrectWords]);

  const addIncorrectWord = useCallback((wordItem: Word) => {
    setIncorrectWords((prev) => {
      // Prevent adding duplicates
      if (!prev.some((w) => w.id === wordItem.id)) {
        return [...prev, wordItem];
      }
      return prev;
    });
  }, []);

  const removeIncorrectWord = useCallback((wordId: number) => {
    setIncorrectWords((prev) => prev.filter((w) => w.id !== wordId));
  }, []);

  const clearIncorrectWords = useCallback(() => {
    setIncorrectWords([]);
  }, []);

  return {
    incorrectWords,
    addIncorrectWord,
    removeIncorrectWord,
    clearIncorrectWords,
  };
};
