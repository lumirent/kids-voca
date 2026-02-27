import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DeckControlsProps {
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
  currentIndex: number;
  totalCount: number;
}

const DeckControls = ({
  onPrev,
  onNext,
  onShuffle,
  currentIndex,
  totalCount,
}: DeckControlsProps) => {
  const progressPercentage = ((currentIndex + 1) / totalCount) * 100;
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-6 mt-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm font-medium text-slate-500 font-sans px-1">
          <span>학습 진행률</span>
          <span>
            {currentIndex + 1} / {totalCount}
          </span>
        </div>
        <Progress
          value={progressPercentage}
          className="h-4 rounded-full bg-slate-200"
        />
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full border-2 text-slate-600 hover:bg-slate-100 hover:text-primary transition-colors"
          onClick={onPrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-8 w-8" />
        </Button>

        <Button
          size="icon"
          className="h-20 w-20 rounded-full shadow-lg text-white hover:scale-110 active:scale-95 transition-all bg-primary hover:bg-primary/90"
          onClick={onShuffle}
          title="단어 섞기"
        >
          <Shuffle className="h-10 w-10" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full border-2 text-slate-600 hover:bg-slate-100 hover:text-primary transition-colors"
          onClick={onNext}
          disabled={currentIndex === totalCount - 1}
        >
          <ArrowRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};

export default DeckControls;
