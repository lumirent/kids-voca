import { ArrowLeft, Rabbit, Turtle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  title: string;
  onHome: () => void;
  speechRate?: number;
  onSpeechRateChange?: (rate: number) => void;
}

const TopBar = ({
  title,
  onHome,
  speechRate = 0.9,
  onSpeechRateChange,
}: TopBarProps) => {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between p-4 bg-background border-b sticky top-0 z-10 gap-4 sm:gap-0">
      <div className="flex items-center justify-between w-full sm:w-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onHome}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로
        </Button>
        <h2 className="sm:hidden text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600">
          {title}
        </h2>
        <div className="w-8 sm:hidden" />{' '}
        {/* Spacer for centering title on mobile */}
      </div>

      <h2 className="hidden sm:block text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600">
        {title}
      </h2>

      <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full shadow-inner w-full sm:w-auto">
        <Turtle size={18} className="text-slate-500" />
        <input
          type="range"
          min="0.4"
          max="1.5"
          step="0.1"
          value={speechRate}
          onChange={(e) => onSpeechRateChange?.(parseFloat(e.target.value))}
          className="w-full sm:w-32 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-primary"
          aria-label="말하기 속도 조절"
        />
        <Rabbit size={18} className="text-slate-500" />
        <span className="text-xs font-bold text-primary min-w-[2.5rem] text-center">
          {speechRate.toFixed(1)}x
        </span>
      </div>
    </header>
  );
};

export default TopBar;
