export interface Word {
  id: number;
  word: string;
  meaning: string;
  imageUrl: string;
}

export type AppMode =
  | 'home'
  | 'learn'
  | 'quiz'
  | 'spelling-quiz'
  | 'review'
  | 'quiz-result'
  | 'stats'
  | 'admin';

export type LearningMode = 'image-word' | 'word-meaning' | 'meaning-word';
