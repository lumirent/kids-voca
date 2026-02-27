import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Word } from '../types';

interface SpellingQuizProps {
  wordItem: Word;
  onAnswer: (isCorrect: boolean, wordItem: Word) => void;
}

const SpellingQuiz = ({ wordItem, onAnswer }: SpellingQuizProps) => {
  const [userInput, setUserInput] = useState('');
  const [maskedWord, setMaskedWord] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!wordItem) return;

    // Generate masked word
    const word = wordItem.word;
    const chars = word.split('');
    const maskableIndices = chars
      .map((c, i) => (/^[a-zA-Z]$/.test(c) ? i : -1))
      .filter((i) => i !== -1);

    if (maskableIndices.length > 0) {
      // Hide approximately 40% of letters, at least 1, at most length - 1
      const numToHide = Math.max(
        1,
        Math.min(
          maskableIndices.length - 1,
          Math.ceil(maskableIndices.length * 0.4),
        ),
      );

      const hiddenIndices = [...maskableIndices]
        .sort(() => 0.5 - Math.random())
        .slice(0, numToHide);

      const masked = chars
        .map((c, i) => (hiddenIndices.includes(i) ? '_' : c))
        .join(' '); // Add spaces for better readability
      setMaskedWord(masked);
    } else {
      setMaskedWord(word);
    }

    // Reset state
    setUserInput('');
    setIsSubmitted(false);
    setIsCorrect(null);

    // Focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [wordItem]);

  const playFeedbackSound = (correct: boolean) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        correct ? 'Correct! Good job!' : `Oops! The word was ${wordItem.word}`,
      );
      utterance.lang = 'en-US';
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSubmitted || !userInput.trim()) return;

    const correct =
      userInput.trim().toLowerCase() === wordItem.word.toLowerCase();
    setIsSubmitted(true);
    setIsCorrect(correct);
    playFeedbackSound(correct);

    setTimeout(() => {
      onAnswer(correct, wordItem);
    }, 2000);
  };

  if (!wordItem) return null;

  return (
    <Card className="w-full max-w-xl mx-auto p-6 sm:p-8 flex flex-col items-center shadow-lg rounded-3xl border-2">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 text-center">
        이 단어의 스펠링을 완성해볼까요?
      </h2>

      <div className="w-48 h-48 sm:w-64 sm:h-64 mb-8 bg-slate-50 rounded-2xl flex items-center justify-center p-4 border-2 shadow-inner">
        <img
          src={wordItem.imageUrl}
          alt="Spelling target"
          draggable="false"
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>

      <div className="mb-8 text-center">
        <p className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-primary mb-2">
          {maskedWord}
        </p>
        <p className="text-xl text-muted-foreground">{wordItem.meaning}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center gap-4"
      >
        <div className="relative w-full max-w-sm">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isSubmitted}
            placeholder="여기에 스펠링을 입력하세요"
            className={`w-full h-16 text-2xl text-center rounded-2xl border-4 focus:outline-none transition-all ${
              isSubmitted
                ? isCorrect
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-red-500 bg-red-50 text-red-700'
                : 'border-slate-200 focus:border-primary'
            }`}
          />
          {isSubmitted && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isCorrect ? (
                <CheckCircle2 className="w-8 h-8 text-green-500 animate-bounce" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500 animate-pulse" />
              )}
            </div>
          )}
        </div>

        {isSubmitted && !isCorrect && (
          <div className="text-xl font-bold text-red-600 animate-in fade-in slide-in-from-top-2">
            정답은:{' '}
            <span className="text-2xl underline decoration-double">
              {wordItem.word}
            </span>{' '}
            예요!
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitted || !userInput.trim()}
          className="w-full max-w-sm h-14 text-xl rounded-2xl shadow-md transition-all active:scale-95"
        >
          {isSubmitted
            ? isCorrect
              ? '참 잘했어요!'
              : '아쉬워요!'
            : '정답 확인'}
        </Button>
      </form>
    </Card>
  );
};

export default SpellingQuiz;
