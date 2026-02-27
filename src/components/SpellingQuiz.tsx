import { Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Word } from '../types';

interface SpellingQuizProps {
  wordItem: Word;
  onAnswer: (isCorrect: boolean, wordItem: Word) => void;
  speechRate?: number;
}

const SpellingQuiz = ({
  wordItem,
  onAnswer,
  speechRate = 0.9,
}: SpellingQuizProps) => {
  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const playWordSound = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordItem.word);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      window.speechSynthesis.speak(utterance);
    }
  }, [wordItem.word, speechRate]);

  useEffect(() => {
    if (!wordItem) return;

    const word = wordItem.word;
    const chars = word.split('');
    const maskableIndices = chars
      .map((c, i) => (/^[a-zA-Z]$/.test(c) ? i : -1))
      .filter((i) => i !== -1);

    if (maskableIndices.length > 0) {
      const numToHide = Math.max(
        1,
        Math.min(
          maskableIndices.length - 1,
          Math.ceil(maskableIndices.length * 0.4),
        ),
      );

      const hidden = [...maskableIndices]
        .sort(() => 0.5 - Math.random())
        .slice(0, numToHide)
        .sort((a, b) => a - b);

      setHiddenIndices(hidden);
      const initialValues: Record<number, string> = {};
      for (const idx of hidden) {
        initialValues[idx] = '';
      }
      setInputValues(initialValues);
    } else {
      setHiddenIndices([]);
      setInputValues({});
    }

    setIsSubmitted(false);
    setIsCorrect(null);
  }, [wordItem]);

  // Separate effect for focusing to ensure hiddenIndices is updated
  useEffect(() => {
    if (hiddenIndices.length > 0 && !isSubmitted) {
      const firstHiddenIdx = hiddenIndices[0];
      inputRefs.current[firstHiddenIdx]?.focus();
    }
  }, [hiddenIndices, isSubmitted]);

  const playFeedbackSound = (correct: boolean) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        correct ? 'Correct! Good job!' : `Oops! The word was ${wordItem.word}`,
      );
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSubmitted) return;

    // Check if all blanks are filled
    const allFilled = hiddenIndices.every(
      (idx) => inputValues[idx]?.trim().length > 0,
    );
    if (!allFilled) return;

    const fullAttempt = wordItem.word
      .split('')
      .map((char, idx) =>
        hiddenIndices.includes(idx) ? inputValues[idx] || '' : char,
      )
      .join('');

    const correct = fullAttempt.toLowerCase() === wordItem.word.toLowerCase();
    setIsSubmitted(true);
    setIsCorrect(correct);
    playFeedbackSound(correct);

    setTimeout(() => {
      onAnswer(correct, wordItem);
    }, 2000);
  };

  const handleInputChange = (index: number, value: string) => {
    if (isSubmitted) return;

    // Only allow single character
    const char = value.slice(-1).toLowerCase();
    if (char && !/^[a-z]$/.test(char)) return;

    const newInputValues = { ...inputValues, [index]: char };
    setInputValues(newInputValues);

    if (char) {
      // Move to next hidden input
      const nextIdx = hiddenIndices.find((idx) => idx > index);
      if (nextIdx !== undefined) {
        inputRefs.current[nextIdx]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !inputValues[index] && !isSubmitted) {
      // Move to previous hidden input
      const prevIdx = [...hiddenIndices].reverse().find((idx) => idx < index);
      if (prevIdx !== undefined) {
        inputRefs.current[prevIdx]?.focus();
      }
    } else if (e.key === 'Enter' && !isSubmitted) {
      handleSubmit();
    }
  };

  if (!wordItem) return null;

  return (
    <Card className="w-full max-w-xl mx-auto p-6 sm:p-8 flex flex-col items-center shadow-lg rounded-3xl border-2">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 text-center">
        이 단어의 스펠링을 완성해볼까요?
      </h2>

      <div className="w-48 h-48 sm:w-64 sm:h-64 mb-6 bg-slate-50 rounded-2xl flex items-center justify-center p-4 border-2 shadow-inner relative group">
        <img
          src={wordItem.imageUrl}
          alt="Spelling target"
          draggable="false"
          className="w-full h-full object-contain drop-shadow-sm"
        />
        <button
          type="button"
          onClick={playWordSound}
          className="absolute -bottom-4 -right-4 p-4 bg-white rounded-full shadow-lg border-2 border-primary text-primary hover:scale-110 active:scale-95 transition-transform z-10"
          aria-label="발음 듣기"
        >
          <Volume2 className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>

      <div className="mb-8 text-center flex flex-wrap justify-center items-center gap-y-6">
        {wordItem.word.split(' ').map((wordPart, wordIdx, wordsArr) => {
          const previousWordsLength = wordsArr
            .slice(0, wordIdx)
            .join(' ').length;
          const wordStartIdx = wordIdx === 0 ? 0 : previousWordsLength + 1;

          return (
            <div
              key={`word-${wordIdx}`}
              className="flex gap-2 sm:gap-3 items-center mx-2 sm:mx-4"
            >
              {wordPart.split('').map((char, charIdx) => {
                const globalIdx = wordStartIdx + charIdx;
                const isHidden = hiddenIndices.includes(globalIdx);
                const key = `char-${wordItem.id}-${globalIdx}`;

                if (isHidden) {
                  return (
                    <input
                      key={key}
                      ref={(el) => {
                        inputRefs.current[globalIdx] = el;
                      }}
                      type="text"
                      value={inputValues[globalIdx] || ''}
                      onChange={(e) =>
                        handleInputChange(globalIdx, e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(globalIdx, e)}
                      disabled={isSubmitted}
                      className={`w-10 h-12 sm:w-14 sm:h-16 text-3xl sm:text-4xl text-center font-mono font-bold rounded-xl border-b-4 focus:outline-none transition-all ${
                        isSubmitted
                          ? isCorrect
                            ? 'border-green-500 text-green-600 bg-green-50'
                            : 'border-red-500 text-red-600 bg-red-50'
                          : 'border-slate-300 focus:border-primary focus:bg-slate-50'
                      }`}
                      maxLength={1}
                    />
                  );
                }
                return (
                  <span
                    key={key}
                    className="text-4xl sm:text-5xl font-mono font-bold text-primary"
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mb-8 text-center">
        <p className="text-xl text-muted-foreground">{wordItem.meaning}</p>
      </div>

      <div className="w-full flex flex-col items-center gap-4">
        {isSubmitted && !isCorrect && (
          <div className="text-xl font-bold text-red-600 animate-in fade-in slide-in-from-top-2 mb-2">
            정답은:{' '}
            <span className="text-2xl underline decoration-double">
              {wordItem.word}
            </span>{' '}
            예요!
          </div>
        )}

        <Button
          onClick={() => handleSubmit()}
          size="lg"
          disabled={
            isSubmitted ||
            !hiddenIndices.every((idx) => inputValues[idx]?.trim().length > 0)
          }
          className="w-full max-w-sm h-14 text-xl rounded-2xl shadow-md transition-all active:scale-95"
        >
          {isSubmitted
            ? isCorrect
              ? '참 잘했어요!'
              : '아쉬워요!'
            : '정답 확인'}
        </Button>
      </div>
    </Card>
  );
};

export default SpellingQuiz;
