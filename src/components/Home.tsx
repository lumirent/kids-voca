import {
  BarChart,
  BookOpen,
  GraduationCap,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomeProps {
  onStartLearn: () => void;
  onStartQuiz: () => void;
  onStartSpellingQuiz: () => void;
  onStartReview: () => void;
  onStartStats: () => void; // New prop
  wrongAnswersCount: number;
}

const Home = ({
  onStartLearn,
  onStartQuiz,
  onStartSpellingQuiz,
  onStartReview,
  onStartStats, // New prop
  wrongAnswersCount,
}: HomeProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <GraduationCap size={80} className="text-primary" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
        재미있는 영단어 학습
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-12">
        그림과 소리로 영어를 시작해봐요!
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button
          size="lg"
          className="w-full text-lg h-16 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
          onClick={onStartLearn}
        >
          <BookOpen className="mr-2 h-6 w-6" /> 단어 학습하기
        </Button>
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
