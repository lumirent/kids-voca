import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kids-voca-speech-rate';
const DEFAULT_RATE = 0.9;

export const useSpeechRate = () => {
  const [speechRate, setSpeechRate] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseFloat(saved) : DEFAULT_RATE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, speechRate.toString());
  }, [speechRate]);

  return [speechRate, setSpeechRate] as const;
};
