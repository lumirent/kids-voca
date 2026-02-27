import { Volume2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import type { Word } from '../types';

interface FlashcardProps {
  wordItem: Word;
  onMarkCorrectInReview?: (wordId: number) => void; // New optional prop for review mode
  speechRate?: number;
}

const Flashcard = ({
  wordItem,
  onMarkCorrectInReview,
  speechRate = 0.9,
}: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const playAudio = useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent) => {
      if (e) e.stopPropagation(); // prevent flipping the card when clicking the speaker button
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(wordItem.word);
        utterance.lang = 'en-US';
        utterance.rate = speechRate; // Use global speech rate
        window.speechSynthesis.speak(utterance);
      }
    },
    [wordItem.word, speechRate],
  );

  // Reset flip state when the wordItem changes (next/prev word)
  useEffect(() => {
    if (wordItem) {
      setIsFlipped(false);
    }
  }, [wordItem]);

  // When card flips to the back, auto-play pronunciation
  useEffect(() => {
    if (isFlipped) {
      playAudio();
    }
  }, [isFlipped, playAudio]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (!wordItem) return null;

  return (
    <button
      type="button"
      className="w-full max-w-sm perspective-1000 mx-auto cursor-pointer block p-0 border-none bg-transparent text-inherit font-inherit"
      onClick={handleFlip}
    >
      <div
        className={`relative w-full aspect-4/5 sm:aspect-square transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front of the card (Image) */}
        <Card className="absolute w-full h-full backface-hidden overflow-hidden border-2 shadow-lg flex flex-col items-center justify-center p-6 bg-white rounded-3xl">
          <div className="relative w-full h-full flex-1 flex items-center justify-center mb-6">
            <img
              src={wordItem.imageUrl}
              alt="word illustration"
              className="w-full h-full object-contain drop-shadow-md"
              draggable="false"
            />
          </div>
          <div className="text-sm font-medium text-muted-foreground animate-bounce mt-auto bg-slate-100 px-4 py-2 rounded-full">
            클릭해서 뒤집기 👆
          </div>
        </Card>

        {/* Back of the card (Text & Audio) */}
        <Card className="absolute w-full h-full backface-hidden rotate-y-180 border-2 shadow-lg flex flex-col items-center justify-center p-6 bg-linear-to-br from-blue-50 to-indigo-100 rounded-3xl">
          {/* biome-ignore lint/a11y/useSemanticElements: Using div with role="button" inside another button is a compromise for this card design */}
          <div
            className="mb-8 p-5 rounded-full bg-white shadow-md hover:shadow-lg transition-transform hover:scale-110 active:scale-95 text-primary"
            onClick={playAudio}
            aria-label="발음 듣기"
            title="발음 듣기"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                playAudio(e);
              }
            }}
          >
            <Volume2 size={56} strokeWidth={2.5} />
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-5xl sm:text-6xl font-black text-slate-800 tracking-tight">
              {wordItem.word}
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">
              {wordItem.meaning}
            </h2>
          </div>
          {onMarkCorrectInReview && (
            <button
              type="button"
              className="mt-8 px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-md hover:bg-green-600 transition-colors active:scale-95"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card from flipping back
                onMarkCorrectInReview(wordItem.id);
              }}
            >
              알아요! (오답 목록에서 제거)
            </button>
          )}
        </Card>
      </div>
    </button>
  );
};

export default Flashcard;
