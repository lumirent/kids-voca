import type { LucideIcon } from 'lucide-react';
import {
  BarChart,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  Languages,
  RotateCcw,
  Settings,
  Trash2,
  Type,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LearningMode } from '@/types';

interface HomeProps {
  onStartLearn: (mode: LearningMode) => void;
  onStartQuiz: () => void;
  onStartSpellingQuiz: () => void;
  onStartReview: () => void;
  onStartStats: () => void;
  onStartAdmin: () => void;
  onResetProgress: () => void;
  wrongAnswersCount: number;
  learningMode: LearningMode;
  onLearningModeChange: (mode: LearningMode) => void;
}

const Home = ({
  onStartLearn,
  onStartQuiz,
  onStartSpellingQuiz,
  onStartReview,
  onStartStats, // New prop
  onStartAdmin,
  onResetProgress,
  wrongAnswersCount,
  learningMode,
  onLearningModeChange,
}: HomeProps) => {
  const modes: {
    id: LearningMode;
    label: string;
    icon: LucideIcon;
    description: string;
  }[] = [
    {
      id: 'image-word',
      label: '그림 → 단어',
      icon: ImageIcon,
      description: '그림을 보고 단어를 맞춰요',
    },
    {
      id: 'word-meaning',
      label: '단어 → 뜻',
      icon: Type,
      description: '영단어를 보고 뜻을 맞춰요',
    },
    {
      id: 'meaning-word',
      label: '뜻 → 단어',
      icon: Languages,
      description: '뜻을 보고 영단어를 맞춰요',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onResetProgress}
          className="text-slate-400 hover:text-red-500"
          title="진행 상황 초기화"
        >
          <Trash2 size={24} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onStartAdmin}
          className="text-slate-400 hover:text-slate-600"
        >
          <Settings size={24} />
        </Button>
      </div>
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <GraduationCap size={80} className="text-primary" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
        재미있는 영단어 학습
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8">
        그림과 소리로 영어를 시작해봐요!
      </p>

      <div className="flex flex-col gap-6 w-full max-w-sm mb-12">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-500 text-left px-1">
            학습 모드 선택
          </p>
          <div className="grid grid-cols-1 gap-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onLearningModeChange(mode.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  learningMode === mode.id
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${learningMode === mode.id ? 'bg-primary text-white' : 'bg-slate-100'}`}
                >
                  <mode.icon size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm">{mode.label}</p>
                  <p className="text-xs opacity-70">{mode.description}</p>
                </div>
                {learningMode === mode.id && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        <Button
          size="lg"
          className="w-full text-lg h-16 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 font-bold"
          onClick={() => onStartLearn(learningMode)}
        >
          <BookOpen className="mr-2 h-6 w-6" /> 학습 시작하기
        </Button>

        <div className="h-px bg-slate-200 my-2" />

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="secondary"
            size="lg"
            className="w-full text-lg h-16 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 bg-orange-100 text-orange-600 hover:bg-orange-200"
            onClick={onStartQuiz}
          >
            <HelpCircle className="mr-2 h-6 w-6" /> 단어 퀴즈
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full text-lg h-16 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 bg-purple-100 text-purple-600 hover:bg-purple-200"
            onClick={onStartSpellingQuiz}
          >
            <GraduationCap className="mr-2 h-6 w-6" /> 스펠링 퀴즈
          </Button>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="w-full text-lg h-16 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          onClick={onStartStats} // New button for stats
        >
          <BarChart className="mr-2 h-6 w-6" /> 학습 통계
        </Button>

        {wrongAnswersCount > 0 && (
          <Button
            variant="outline"
            size="lg"
            className="w-full text-lg h-16 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all active:scale-95 mt-4"
            onClick={onStartReview}
          >
            <RotateCcw className="mr-2 h-6 w-6" /> 오답 복습하기 (
            {wrongAnswersCount})
          </Button>
        )}
      </div>
    </div>
  );
};

export default Home;
