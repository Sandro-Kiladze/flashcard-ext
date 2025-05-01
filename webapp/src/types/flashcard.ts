export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  label: 'easy' | 'hard' | 'incorrect' | null;
} 