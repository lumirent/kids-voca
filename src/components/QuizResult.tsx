import { Button } from '@/components/ui/button';

interface QuizResultProps {
  score: number;
  total: number;
  onRetry: () => void;
  onReview: () => void;
  wrongAnswersCount: number;
}

const QuizResult = ({
  score,
  total,
  onRetry,
  onReview,
  wrongAnswersCount,
}: QuizResultProps) => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 text-center pb-20">
      <h2 className="text-5xl md:text-6xl mb-6">🎉</h2>
      <h3 className="text-3xl font-bold text-slate-800 mb-8">퀴즈 완료!</h3>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-sm w-full mb-8">
        <p className="text-lg text-slate-500 mb-2">맞힌 개수</p>
        <div className="text-5xl font-black text-primary">
          {score}
          <span className="text-3xl text-slate-300 mx-2">/</span>
          <span className="text-3xl text-slate-400">{total}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Button
          size="lg"
          className="w-full text-lg h-14 rounded-xl"
          onClick={onRetry}
        >
          다시 풀기
        </Button>
        {wrongAnswersCount > 0 && (
          <Button
            variant="secondary"
            size="lg"
            className="w-full text-lg h-14 rounded-xl text-red-600 bg-red-50 hover:bg-red-100"
            onClick={onReview}
          >
            오답 복습하기 ({wrongAnswersCount})
          </Button>
        )}
      </div>
    </main>
  );
};

export default QuizResult;
