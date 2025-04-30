// webapp/src/services/spaced-repetition.ts

import { Flashcard, FlashcardReview, ReviewDifficulty } from '../types';
import { StorageService } from './storage-service';

/**
 * Service that implements spaced repetition algorithm for flashcard scheduling
 */
export class SpacedRepetitionService {
  // Base intervals in days for each difficulty level
  private static readonly BASE_INTERVALS = {
    [ReviewDifficulty.EASY]: 7,    // 7 days for easy cards
    [ReviewDifficulty.MEDIUM]: 3,  // 3 days for medium cards
    [ReviewDifficulty.HARD]: 1     // 1 day for hard cards
  };

  // Maximum interval in days
  private static readonly MAX_INTERVAL = 365;

  /**
   * Get all flashcards due for review
   * @returns Array of flashcards due for review
   */
  static getDueFlashcards(): Flashcard[] {
    const allFlashcards = StorageService.getFlashcards();
    const now = new Date();
    
    return allFlashcards.filter(flashcard => {
      // If the flashcard has never been reviewed, it's due
      if (!flashcard.lastReviewed) {
        return true;
      }
      
      const interval = this.getNextReviewInterval(flashcard);
      const lastReviewedDate = new Date(flashcard.lastReviewed);
      const dueDate = new Date(lastReviewedDate);
      dueDate.setDate(lastReviewedDate.getDate() + interval);
      
      return now >= dueDate;
    });
  }

  /**
   * Calculate the next review interval for a flashcard
   * @param flashcard Flashcard to calculate interval for
   * @returns Interval in days
   */
  static getNextReviewInterval(flashcard: Flashcard): number {
    const reviews = StorageService.getReviewsForFlashcard(flashcard.id);
    
    // If the flashcard has never been reviewed, return a default interval
    if (reviews.length === 0) {
      return 1; // Default to 1 day for new cards
    }
    
    // Sort reviews by date (oldest to newest)
    const sortedReviews = [...reviews].sort((a, b) => 
      new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime()
    );
    
    // Get the most recent review
    const latestReview = sortedReviews[sortedReviews.length - 1];
    
    // Calculate the interval based on the most recent review difficulty
    return this.calculateInterval(sortedReviews, latestReview.difficulty);
  }

  /**
   * Calculate the interval based on review history and latest difficulty
   * @param reviews Review history for a flashcard
   * @param latestDifficulty Most recent difficulty rating
   * @returns Interval in days
   */
  private static calculateInterval(reviews: FlashcardReview[], latestDifficulty: ReviewDifficulty): number {
    // Get consecutive reviews with the same difficulty
    let consecutiveCount = 1;
    let i = reviews.length - 1;
    
    while (i > 0 && reviews[i].difficulty === reviews[i - 1].difficulty) {
      consecutiveCount++;
      i--;
    }
    
    // Base interval for the difficulty level
    const baseInterval = this.BASE_INTERVALS[latestDifficulty];
    
    // Calculate interval with exponential backoff for consecutive easy/medium ratings
    let interval = baseInterval;
    
    if (latestDifficulty === ReviewDifficulty.EASY || latestDifficulty === ReviewDifficulty.MEDIUM) {
      interval = baseInterval * Math.pow(2, consecutiveCount - 1);
    }
    
    // Cap the interval at the maximum value
    return Math.min(interval, this.MAX_INTERVAL);
  }

  /**
   * Get next flashcards for review session
   * @param count Number of flashcards to retrieve
   * @returns Array of flashcards for review
   */
  static getNextReviewBatch(count: number = 10): Flashcard[] {
    const dueFlashcards = this.getDueFlashcards();
    
    // Sort flashcards prioritizing:
    // 1. Never reviewed cards
    // 2. Cards with harder last review
    // 3. Cards that are most overdue
    const sortedFlashcards = [...dueFlashcards].sort((a, b) => {
      // Never reviewed cards come first
      if (!a.lastReviewed && b.lastReviewed) return -1;
      if (a.lastReviewed && !b.lastReviewed) return 1;
      if (!a.lastReviewed && !b.lastReviewed) return 0;
      
      // Both cards have been reviewed, check difficulty of last review
      const aReviews = StorageService.getReviewsForFlashcard(a.id);
      const bReviews = StorageService.getReviewsForFlashcard(b.id);
      
      if (aReviews.length > 0 && bReviews.length > 0) {
        const aLastReview = aReviews[aReviews.length - 1];
        const bLastReview = bReviews[bReviews.length - 1];
        
        // Prioritize by difficulty (hard > medium > easy)
        if (aLastReview.difficulty !== bLastReview.difficulty) {
          if (aLastReview.difficulty === ReviewDifficulty.HARD) return -1;
          if (bLastReview.difficulty === ReviewDifficulty.HARD) return 1;
          if (aLastReview.difficulty === ReviewDifficulty.MEDIUM) return -1;
          if (bLastReview.difficulty === ReviewDifficulty.MEDIUM) return 1;
        }
      }
      
      // Sort by how overdue the card is
      const aLastReviewed = new Date(a.lastReviewed!).getTime();
      const bLastReviewed = new Date(b.lastReviewed!).getTime();
      return aLastReviewed - bLastReviewed;
    });
    
    // Return the requested number of cards (or all if less than count)
    return sortedFlashcards.slice(0, count);
  }
}