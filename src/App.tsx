import { useEffect, useState } from 'react';
import Admin from './components/Admin';
import DeckControls from './components/DeckControls';
import Flashcard from './components/Flashcard';
import Home from './components/Home';
import Quiz from './components/Quiz';
import QuizResult from './components/QuizResult';
import SpellingQuiz from './components/SpellingQuiz';
import Statistics from './components/Statistics';
import TopBar from './components/TopBar';
import { useIncorrectWords } from './hooks/useIncorrectWords';
import { useLearningStats } from './hooks/useLearningStats';
import { useSpeechRate } from './hooks/useSpeechRate';
import { useStudyProgress } from './hooks/useStudyProgress';
import { useVocabulary } from './hooks/useVocabulary';
import type { AppMode, Word } from './types';
import { Toaster, toast } from 'sonner';
import { ConfirmDialog } from './components/ui/confirm-dialog';

function App() {
  const { allWords, isLoading, error } = useVocabulary();
  const [mode, setMode] = useState<AppMode>('home');
  const [currentDeck, setCurrentDeck] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [speechRate, setSpeechRate] = useSpeechRate();

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Integrate hooks
  const { stats, recordAnswer, resetStats } = useLearningStats(mode);
  const { incorrectWords, addIncorrectWord, removeIncorrectWord } =
    useIncorrectWords();
  const { saveProgress, getProgress, clearProgress } = useStudyProgress();

  // Initialize currentDeck once allWords is loaded (only if no deck exists)
  useEffect(() => {
    if (allWords.length > 0 && currentDeck.length === 0 && mode === 'home') {
      setCurrentDeck([...allWords].sort(() => 0.5 - Math.random()));
    }
  }, [allWords, currentDeck.length, mode]);

  // Persist progress whenever it changes
  useEffect(() => {
    if (['learn', 'quiz', 'spelling-quiz', 'review'].includes(mode)) {
      saveProgress(
        mode,
        currentDeck.map((w) => w.id),
        currentIndex,
        quizScore,
      );
    }
  }, [mode, currentIndex, currentDeck, quizScore, saveProgress]);

  useEffect(() => {
    if (error) {
      toast.error(
        '단어 데이터를 불러오지 못했습니다. 데이터베이스 설정을 확인해주세요.',
      );
    }
  }, [error]);

  // Helper to start or resume a mode
  const startMode = (targetMode: AppMode, baseWords: Word[]) => {
    if (baseWords.length === 0) {
      if (targetMode === 'review') return;
      toast.warning('단어 데이터가 없습니다.');
      return;
    }

    const saved = getProgress(targetMode);
    if (
      saved &&
      saved.deckIds.length > 0 &&
      saved.currentIndex < saved.deckIds.length
    ) {
      // Check for mismatch in word count (except for review mode)
      if (targetMode !== 'review' && baseWords.length > saved.deckIds.length) {
        setConfirmDialog({
          isOpen: true,
          title: '새로운 단어 추가됨',
          description: `새로운 단어가 추가되었습니다! (현재: ${saved.deckIds.length}개 -> 전체: ${baseWords.length}개)\n처음부터 다시 시작할까요? (취소를 누르면 이전 기록을 이어서 합니다)`,
          onConfirm: () => {
            clearProgress(targetMode);
            // Start fresh
            setCurrentDeck([...baseWords].sort(() => 0.5 - Math.random()));
            setCurrentIndex(0);
            setQuizScore(0);
            setMode(targetMode);
          },
        });
        return;
      }

      // Try to reconstruct the deck from IDs. We must ensure all words still exist.
      const reconstructedDeck = saved.deckIds
        .map((id) => allWords.find((w) => w.id === id))
        .filter(Boolean) as Word[];

      // If we could reconstruct the full deck, resume
      if (reconstructedDeck.length === saved.deckIds.length) {
        setCurrentDeck(reconstructedDeck);
        setCurrentIndex(saved.currentIndex);
        setQuizScore(saved.score || 0);
        setMode(targetMode);
        return;
      }
    }

    // Otherwise, start fresh
    setCurrentDeck([...baseWords].sort(() => 0.5 - Math.random()));
    setCurrentIndex(0);
    setQuizScore(0);
    setMode(targetMode);
  };

  const clearAllProgressData = () => {
    setConfirmDialog({
      isOpen: true,
      title: '진행 상황 초기화',
      description: '모든 학습 진행 상황을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      variant: 'destructive',
      onConfirm: () => {
        clearProgress('learn');
        clearProgress('quiz');
        clearProgress('spelling-quiz');
        clearProgress('review');
        toast.success('초기화되었습니다.');
      },
    });
  };

  // --- Navigation & State Reset ---
  const startLearnMode = () => {
    startMode('learn', allWords);
  };

  const startQuizMode = () => {
    startMode('quiz', allWords);
  };

  const startSpellingQuizMode = () => {
    startMode('spelling-quiz', allWords);
  };

  const startReviewMode = () => {
    startMode('review', incorrectWords);
  };

  const startStatsMode = () => {
    setMode('stats');
  };

  const startAdminMode = () => {
    setMode('admin');
  };

  const goHome = () => {
    setMode('home');
  };

  // --- Deck Controls ---
  const handleNext = () => {
    if (currentIndex < currentDeck.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // If we reach the end in learn or review mode, we can consider it finished
      if (mode === 'learn' || mode === 'review') {
        clearProgress(mode);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...currentDeck].sort(() => 0.5 - Math.random());
    setCurrentDeck(shuffled);
    setCurrentIndex(0);
    setShuffleTrigger((prev) => prev + 1);
    // Shuffle reset progress for the current mode
    saveProgress(
      mode,
      shuffled.map((w) => w.id),
      0,
      mode === 'quiz' || mode === 'spelling-quiz' ? 0 : quizScore,
    );
  };

  // --- Quiz Handling ---
  const handleQuizAnswer = (isCorrect: boolean, wordItem: Word) => {
    recordAnswer(isCorrect); // Record answer for statistics

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      // If a word was previously incorrect but now answered correctly, remove it from the incorrect list
      removeIncorrectWord(wordItem.id);
    } else {
      addIncorrectWord(wordItem);
    }

    setTimeout(() => {
      if (currentIndex < currentDeck.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const finishedMode = mode;
        setMode('quiz-result');
        clearProgress(finishedMode);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-primary/20">
      <Toaster position="top-center" richColors />
      {isLoading && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-opacity-50 border-solid mb-4" />
          <h2 className="text-xl font-semibold text-primary">
            데이터를 불러오는 중입니다...
          </h2>
          <p className="text-muted-foreground mt-2">Supabase 연결 중</p>
        </div>
      )}

      {!isLoading && mode === 'home' && (
        <Home
          onStartLearn={startLearnMode}
          onStartQuiz={startQuizMode}
          onStartSpellingQuiz={startSpellingQuizMode}
          onStartReview={startReviewMode}
          onStartStats={startStatsMode} // New prop
          onStartAdmin={startAdminMode}
          onResetProgress={clearAllProgressData}
          wrongAnswersCount={incorrectWords.length}
        />
      )}

      {!isLoading && (mode === 'learn' || mode === 'review') && (
        <div className="flex flex-col min-h-screen">
          <TopBar
            title={mode === 'learn' ? '단어 학습' : '오답 복습'}
            onHome={goHome}
            speechRate={speechRate}
            onSpeechRateChange={setSpeechRate}
          />
          <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-2xl mx-auto gap-8">
            <Flashcard
              key={`${mode}-${currentIndex}-${shuffleTrigger}`}
              wordItem={currentDeck[currentIndex]}
              speechRate={speechRate}
              onMarkCorrectInReview={
                mode === 'review'
                  ? (wordId) => {
                      removeIncorrectWord(wordId);
                      if (currentIndex < currentDeck.length - 1) {
                        handleNext();
                      } else {
                        // 마지막 카드인 경우: 남은 오답이 있으면 처음으로, 없으면 홈으로
                        if (incorrectWords.length > 1) {
                          setCurrentIndex(0);
                        } else {
                          goHome();
                        }
                      }
                    }
                  : undefined
              }
            />
            <DeckControls
              currentIndex={currentIndex}
              totalCount={currentDeck.length}
              onPrev={handlePrev}
              onNext={handleNext}
              onShuffle={handleShuffle}
            />
          </main>
        </div>
      )}

      {!isLoading && mode === 'quiz' && (
        <div className="flex flex-col min-h-screen">
          <TopBar
            title="단어 퀴즈"
            onHome={goHome}
            speechRate={speechRate}
            onSpeechRateChange={setSpeechRate}
          />
          <main className="flex-1 flex flex-col items-center p-4 sm:p-6 w-full max-w-3xl mx-auto">
            <div className="w-full flex justify-between items-center mb-6 text-sm font-medium text-muted-foreground">
              <span>
                문제 {currentIndex + 1} / {currentDeck.length}
              </span>
            </div>
            <Quiz
              wordItem={currentDeck[currentIndex]}
              allWords={allWords}
              onAnswer={handleQuizAnswer}
              speechRate={speechRate}
            />
          </main>
        </div>
      )}

      {!isLoading && mode === 'spelling-quiz' && (
        <div className="flex flex-col min-h-screen">
          <TopBar
            title="스펠링 퀴즈"
            onHome={goHome}
            speechRate={speechRate}
            onSpeechRateChange={setSpeechRate}
          />
          <main className="flex-1 flex flex-col items-center p-4 sm:p-6 w-full max-w-3xl mx-auto">
            <div className="w-full flex justify-between items-center mb-6 text-sm font-medium text-muted-foreground">
              <span>
                문제 {currentIndex + 1} / {currentDeck.length}
              </span>
            </div>
            <SpellingQuiz
              wordItem={currentDeck[currentIndex]}
              onAnswer={handleQuizAnswer}
              speechRate={speechRate}
            />
          </main>
        </div>
      )}

      {mode === 'quiz-result' && (
        <div className="flex flex-col min-h-screen">
          <TopBar
            title="퀴즈 결과"
            onHome={goHome}
            speechRate={speechRate}
            onSpeechRateChange={setSpeechRate}
          />
          <QuizResult
            score={quizScore}
            total={currentDeck.length}
            onRetry={startQuizMode}
            onReview={startReviewMode}
            wrongAnswersCount={incorrectWords.length}
          />
        </div>
      )}

      {!isLoading && mode === 'stats' && (
        <div className="flex flex-col min-h-screen">
          <TopBar
            title="학습 통계"
            onHome={goHome}
            speechRate={speechRate}
            onSpeechRateChange={setSpeechRate}
          />
          <Statistics stats={stats} onReset={resetStats} onHome={goHome} />
        </div>
      )}

      {!isLoading && mode === 'admin' && <Admin onBack={goHome} />}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: open }))
        }
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
      />
    </div>
  );
}
export default App;
