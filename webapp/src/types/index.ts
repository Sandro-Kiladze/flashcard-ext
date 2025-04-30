// webapp/src/types/index.ts

/**
 * Flashcard data structure
 * 
 * AF: A flashcard represents a question-answer pair with optional tags and hint
 * RI: Flashcard must have non-empty `front`, `id`; tags must be a string array
 */
export interface Flashcard {
    id: string;
    front: string;
    back: string;
    tags: string[];
    createdAt: string;
    lastReviewed?: string;
  }
  
  /**
   * Review data for spaced repetition
   */
  export interface FlashcardReview {
    flashcardId: string;
    reviewedAt: string;
    difficulty: ReviewDifficulty;
  }
  
  /**
   * Difficulty rating for a flashcard review
   */
  export enum ReviewDifficulty {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard'
  }
  
  /**
   * Gesture type for webcam-based reviews
   */
  export enum GestureType {
    THUMBS_UP = 'thumbs_up',   // Easy
    FLAT_HAND = 'flat_hand',   // Medium
    THUMBS_DOWN = 'thumbs_down', // Hard
    NONE = 'none'              // No gesture detected
  }
  
  /**
   * Review mode for flashcards
   */
  export enum ReviewMode {
    MANUAL = 'manual',
    GESTURE = 'gesture'
  }
  
  /**
   * Statistics for flashcard reviews
   */
  export interface ReviewStats {
    totalReviews: number;
    byDifficulty: {
      [ReviewDifficulty.EASY]: number;
      [ReviewDifficulty.MEDIUM]: number;
      [ReviewDifficulty.HARD]: number;
    };
    averageResponseTime: number;
  }