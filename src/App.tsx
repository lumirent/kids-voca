import { useEffect, useState } from 'react';
import DeckControls from './components/DeckControls';
import Flashcard from './components/Flashcard';
import Home from './components/Home';
import Quiz from './components/Quiz';
import QuizResult from './components/QuizResult';
import Statistics from './components/Statistics';
import TopBar from './components/TopBar';
import { useIncorrectWords } from './hooks/useIncorrectWords'; // New import
import { useLearningStats } from './hooks/useLearningStats';
import { useVocabulary } from './hooks/useVocabulary';
import type { AppMode, Word } from './types';

function App() {
  const { allWords, isLoading, error } = useVocabulary();
  const [mode, setMode] = useState<AppMode>('home');
  const [currentDeck, setCurrentDeck] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  // Integrate hooks
  const { stats, recordAnswer, resetStats } = useLearningStats(mode);
  const { incorrectWords, addIncorrectWord, removeIncorrectWord } =
    useIncorrectWords();

  // Initialize currentDeck once allWords is loaded
  useEffect(() => {
    if (allWords.length > 0 && currentDeck.length === 0) {
      setCurrentDeck(allWords);
    }
  }, [allWords, currentDeck.length]);

  if (error) {
    alert(
      '단어 데이터를 불러오지 못했습니다. 데이터베이스 설정을 확인해주세요.',
    );
  }

  // --- Navigation & State Reset ---
  const startLearnMode = () => {
    if (allWords.length === 0) return alert('단어 데이터가 없습니다.');
    setCurrentDeck([...allWords]);
    setCurrentIndex(0);
    setMode('learn');
  };

  const startQuizMode = () => {
    if (allWords.length === 0) return alert('단어 데이터가 없습니다.');
    setCurrentDeck([...allWords].sort(() => 0.5 - Math.random()));
    setCurrentIndex(0);

    setQuizScore(0);
    setMode('quiz');
  };

  const startReviewMode = () => {
    if (incorrectWords.length === 0) return;
    setCurrentDeck([...incorrectWords]);
    setCurrentIndex(0);
    setMode('review');
  };

  const startStatsMode = () => {
    setMode('stats');
  };

  const goHome = () => {
    setMode('home');
  };

  // --- Deck Controls ---
  const handleNext = () => {
    if (currentIndex < currentDeck.length - 1) {
      setCurrentIndex(currentIndex + 1);
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
        setMode('quiz-result');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-primary/20">
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
          onStartReview={startReviewMode}
          onStartStats={startStatsMode} // New prop
          wrongAnswersCount={incorrectWords.length}
        />
      )}

      {!isLoading && (mode === 'learn' || mode === 'review') && (
        <div className="flex flex-col min-h-screen">
          <TopBar
            title={mode === 'learn' ? '단어 학습' : '오답 복습'}
            onHome={goHome}
          />
          <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-2xl mx-auto gap-8">
            <Flashcard
              key={`${mode}-${currentIndex}-${shuffleTrigger}`}
              wordItem={currentDeck[currentIndex]}
              onMarkCorrectInReview={
                mode === 'review'
                  ? (wordId) => {
                      removeIncorrectWord(wordId);
                      handleNext();
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
          <TopBar title="단어 퀴즈" onHome={goHome} />
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
            />
          </main>
        </div>
      )}

      {mode === 'quiz-result' && (
        <div className="flex flex-col min-h-screen">
          <TopBar title="퀴즈 결과" onHome={goHome} />
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
          <Statistics stats={stats} onReset={resetStats} onHome={goHome} />
        </div>
      )}
    </div>
  );
}
export default App;
