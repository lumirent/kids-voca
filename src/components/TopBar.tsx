import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  title: string;
  onHome: () => void;
}

const TopBar = ({ title, onHome }: TopBarProps) => {
  return (
    <header className="flex items-center justify-between p-4 bg-background border-b sticky top-0 z-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={onHome}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로
      </Button>
      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600">
        {title}
      </h2>
      <div className="w-20" /> {/* Spacer for centering */}
    </header>
  );
};

export default TopBar;
