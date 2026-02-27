import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudyProgress } from '../hooks/useStudyProgress';

describe('useStudyProgress', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return empty progress initially', () => {
    const { result } = renderHook(() => useStudyProgress());
    expect(result.current.getProgress('quiz')).toBeUndefined();
  });

  it('should save and retrieve progress', () => {
    const { result } = renderHook(() => useStudyProgress());

    act(() => {
      result.current.saveProgress('quiz', [1, 2, 3], 1, 5);
    });

    const progress = result.current.getProgress('quiz');
    expect(progress).toEqual({
      deckIds: [1, 2, 3],
      currentIndex: 1,
      score: 5,
    });
  });

  it('should persist progress to localStorage', () => {
    const { result } = renderHook(() => useStudyProgress());

    act(() => {
      result.current.saveProgress('spelling-quiz', [10, 20], 0, 0);
    });

    const saved = JSON.parse(
      localStorage.getItem('kids-voca-study-progress') || '{}',
    );
    expect(saved['spelling-quiz']).toEqual({
      deckIds: [10, 20],
      currentIndex: 0,
      score: 0,
    });
  });

  it('should clear progress', () => {
    const { result } = renderHook(() => useStudyProgress());

    act(() => {
      result.current.saveProgress('learn', [1, 2], 1);
    });

    act(() => {
      result.current.clearProgress('learn');
    });

    expect(result.current.getProgress('learn')).toBeUndefined();

    const saved = JSON.parse(
      localStorage.getItem('kids-voca-study-progress') || '{}',
    );
    expect(saved.learn).toBeUndefined();
  });
});
