import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Word } from '../types';

interface QuizProps {
  wordItem: Word;
  allWords: Word[];
  onAnswer: (isCorrect: boolean, wordItem: Word) => void;
}

const Quiz = ({ wordItem, allWords, onAnswer }: QuizProps) => {
  const [options, setOptions] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [_isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (!wordItem || !allWords) return;

    // Generate 4 random distractors
    const otherWords = allWords.filter((w) => w.id !== wordItem.id);
    const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 4);

    // Combine with correct answer and shuffle options
    const allOptions = [...distractors, wordItem].sort(
      () => 0.5 - Math.random(),
    );
    setOptions(allOptions);

    // Reset state for new question
    setSelectedWord(null);
    setIsCorrect(null);
  }, [wordItem, allWords]);

  const playFeedbackSound = (correct: boolean) => {
    // In a real app we would use actual distinct sfxs, here we simulate with SpeechSynthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        correct ? 'Correct! Good job!' : 'Oops, try again next time.',
      );
      utterance.lang = 'en-US';
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOptionClick = (optionWord: string) => {
    if (selectedWord) return; // Prevent multiple clicks

    setSelectedWord(optionWord);
    const correct = optionWord === wordItem.word;
    setIsCorrect(correct);
    playFeedbackSound(correct);

    // Pass result to parent after brief delay to show feedback animation
    setTimeout(() => {
      onAnswer(correct, wordItem);
    }, 1500);
  };

  if (!wordItem) return null;

  return (
    <Card className="w-full max-w-xl mx-auto p-6 sm:p-8 flex flex-col items-center shadow-lg rounded-3xl border-2">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 text-center">
        이 그림에 맞는 단어는 무엇일까요?
      </h2>

      <div className="w-48 h-48 sm:w-64 sm:h-64 mb-8 bg-slate-50 rounded-2xl flex items-center justify-center p-4 border-2 shadow-inner">
        <img
          src={wordItem.imageUrl}
          alt="Quiz target"
          draggable="false"
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => {
          let btnVariant: 'outline' | 'default' | 'destructive' = 'outline';
          let extraClass =
            'h-16 text-xl sm:text-2xl rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95';
          let Icon = null;

          if (selectedWord) {
            if (opt.word === wordItem.word) {
              btnVariant = 'default';
              extraClass +=
                ' bg-green-500 hover:bg-green-600 text-white border-green-600 animate-bounce';
              Icon = <CheckCircle2 className="w-6 h-6 ml-2" />;
            } else if (
              opt.word === selectedWord &&
              opt.word !== wordItem.word
            ) {
              btnVariant = 'destructive';
              extraClass += ' border-red-600 animate-pulse';
              Icon = <XCircle className="w-6 h-6 ml-2" />;
            } else {
              extraClass += ' opacity-50';
            }
          }

          return (
            <Button
              key={opt.id}
              variant={btnVariant}
              className={extraClass}
              onClick={() => handleOptionClick(opt.word)}
              disabled={!!selectedWord}
            >
              {opt.word}
              {Icon}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default Quiz;
