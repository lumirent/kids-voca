import { ArrowLeft, RefreshCw } from 'lucide-react';
import type React from 'react';
import type { LearningStats } from '../hooks/useLearningStats';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { useState } from 'react';
import { ConfirmDialog } from './ui/confirm-dialog';

interface StatisticsProps {
  stats: LearningStats;
  onReset: () => void;
  onHome: () => void;
}

const Statistics: React.FC<StatisticsProps> = ({ stats, onReset, onHome }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts = [];
    if (hours > 0) parts.push(`${hours}시간`);
    if (minutes > 0) parts.push(`${minutes}분`);
    if (remainingSeconds > 0 || parts.length === 0)
      parts.push(`${remainingSeconds}초`); // Show seconds if no hours/minutes

    return parts.join(' ');
  };

  const calculateAccuracy = (totalCorrect: number, totalQuestions: number) => {
    if (totalQuestions === 0) return '0%';
    return `${((totalCorrect / totalQuestions) * 100).toFixed(1)}%`;
  };

  const averageStudyTime =
    stats.totalSessions > 0 ? stats.totalStudyTime / stats.totalSessions : 0;

  const firstStudyDate = stats.firstStudyDate
    ? new Date(stats.firstStudyDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const handleReset = () => {
    setConfirmOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary">학습 통계</h1>
        <Button variant="outline" size="icon" onClick={onHome}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              누적 학습 시간
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <title>누적 학습 시간 아이콘</title>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(stats.totalStudyTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSessions} 세션 학습
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 푼 문제 수</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <title>총 푼 문제 수 아이콘</title>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalQuestionsAnswered}개
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCorrectAnswers}개 정답
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 정답률</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <title>평균 정답률 아이콘</title>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateAccuracy(
                stats.totalCorrectAnswers,
                stats.totalQuestionsAnswered,
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              평균 학습 시간: {formatTime(averageStudyTime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">학습 시작일</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <title>학습 시작일 아이콘</title>
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{firstStudyDate}</div>
            <p className="text-xs text-muted-foreground">첫 학습 세션 기록</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          variant="destructive"
          onClick={handleReset}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> 통계 초기화
        </Button>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="통계 초기화"
        description="모든 학습 통계를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        variant="destructive"
        onConfirm={() => {
          onReset();
          toast.success('통계가 초기화되었습니다.');
        }}
      />
    </div>
  );
};

export default Statistics;
