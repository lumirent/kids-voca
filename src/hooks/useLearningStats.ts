import { useCallback, useEffect, useRef, useState } from 'react';

const STATS_KEY = 'kids-voca-learning-stats';

export interface LearningStats {
  totalStudyTime: number; // in seconds
  totalSessions: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  firstStudyDate: string;
}

const getInitialStats = (): LearningStats => {
  if (typeof window === 'undefined') {
    // For SSR or environments without localStorage
    return {
      totalStudyTime: 0,
      totalSessions: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      firstStudyDate: '',
    };
  }
  const saved = localStorage.getItem(STATS_KEY);
  if (saved) {
    try {
      const parsedStats = JSON.parse(saved);
      // Ensure all fields exist for compatibility with new versions
      return {
        totalStudyTime: parsedStats.totalStudyTime || 0,
        totalSessions: parsedStats.totalSessions || 0,
        totalQuestionsAnswered: parsedStats.totalQuestionsAnswered || 0,
        totalCorrectAnswers: parsedStats.totalCorrectAnswers || 0,
        firstStudyDate: parsedStats.firstStudyDate || new Date().toISOString(),
      };
    } catch (e) {
      console.error('Failed to parse learning stats from localStorage', e);
      // Fallback to default if parsing fails
    }
  }
  return {
    totalStudyTime: 0,
    totalSessions: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    firstStudyDate: new Date().toISOString(),
  };
};

export const useLearningStats = (currentMode: string) => {
  const [stats, setStats] = useState<LearningStats>(getInitialStats);
  const sessionStartTimeRef = useRef<number | null>(null);
  const previousModeRef = useRef<string>('home'); // Track previous mode to detect changes

  // Persist stats whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }
  }, [stats]);

  // Effect to manage session timing based on mode changes
  useEffect(() => {
    const isStudyMode = ['learn', 'quiz', 'review'].includes(currentMode);
    const wasStudyMode = ['learn', 'quiz', 'review'].includes(
      previousModeRef.current,
    );

    if (isStudyMode && !wasStudyMode) {
      // Entering a study mode
      sessionStartTimeRef.current = Date.now();
      setStats((s) => ({
        ...s,
        // Only increment totalSessions if transitioning from a non-study mode to a study mode
        totalSessions: s.totalSessions + 1,
        // Set first study date if it's the very first session
        firstStudyDate: s.firstStudyDate || new Date().toISOString(),
      }));
    } else if (
      !isStudyMode &&
      wasStudyMode &&
      sessionStartTimeRef.current !== null
    ) {
      // Exiting a study mode (e.g., going home or to quiz-result)
      const duration = (Date.now() - sessionStartTimeRef.current) / 1000; // in seconds
      setStats((s) => ({
        ...s,
        totalStudyTime: s.totalStudyTime + duration,
      }));
      sessionStartTimeRef.current = null;
    }

    previousModeRef.current = currentMode;
  }, [currentMode]);

  const recordAnswer = useCallback((isCorrect: boolean) => {
    setStats((s) => ({
      ...s,
      totalQuestionsAnswered: s.totalQuestionsAnswered + 1,
      totalCorrectAnswers: isCorrect
        ? s.totalCorrectAnswers + 1
        : s.totalCorrectAnswers,
    }));
  }, []);

  const resetStats = useCallback(() => {
    const initialStats: LearningStats = {
      totalStudyTime: 0,
      totalSessions: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      firstStudyDate: new Date().toISOString(), // Reset to current date
    };
    setStats(initialStats);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STATS_KEY, JSON.stringify(initialStats));
    }
  }, []);

  return { stats, recordAnswer, resetStats };
};
