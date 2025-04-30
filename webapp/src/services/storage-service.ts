// webapp/src/services/storage-service.ts

import { Flashcard, FlashcardReview, ReviewDifficulty } from '../types';

// Constants for localStorage keys
const FLASHCARDS_KEY = 'flashcards';
const REVIEWS_KEY = 'flashcard_reviews';

/**
 * Storage service for flashcards and reviews
 * Handles saving, loading, updating, and deleting flashcards from localStorage
 * Also handles storing and retrieving review data
 */
export class StorageService {
  /**
   * Get all flashcards from localStorage
   * @returns Array of all stored flashcards
   */
  static getFlashcards(): Flashcard[] {
    try {
      const data = localStorage.getItem(FLASHCARDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting flashcards:', error);
      return [];
    }
  }

  /**
   * Save a new flashcard to localStorage
   * @param flashcard Flashcard to save
   * @returns The saved flashcard with generated ID
   */
  static saveFlashcard(flashcard: Omit<Flashcard, 'id' | 'createdAt'>): Flashcard {
    try {
      const flashcards = this.getFlashcards();
      
      // Validate flashcard data
      if (!flashcard.front || flashcard.front.trim() === '') {
        throw new Error('Flashcard front cannot be empty');
      }
      
      // Create new flashcard with ID and createdAt
      const newFlashcard: Flashcard = {
        ...flashcard,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        tags: Array.isArray(flashcard.tags) ? flashcard.tags : []
      };
      
      // Add to existing flashcards and save
      flashcards.push(newFlashcard);
      localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(flashcards));
      
      return newFlashcard;
    } catch (error) {
      console.error('Error saving flashcard:', error);
      throw error;
    }
  }

  /**
   * Get a specific flashcard by ID
   * @param id Flashcard ID
   * @returns The flashcard or null if not found
   */
  static getFlashcardById(id: string): Flashcard | null {
    try {
      const flashcards = this.getFlashcards();
      return flashcards.find(card => card.id === id) || null;
    } catch (error) {
      console.error('Error getting flashcard by ID:', error);
      return null;
    }
  }

  /**
   * Update an existing flashcard
   * @param updatedFlashcard Flashcard with updates
   * @returns The updated flashcard or null if not found
   */
  static updateFlashcard(updatedFlashcard: Flashcard): Flashcard | null {
    try {
      const flashcards = this.getFlashcards();
      const index = flashcards.findIndex(card => card.id === updatedFlashcard.id);
      
      if (index === -1) {
        return null;
      }
      
      // Validate flashcard data
      if (!updatedFlashcard.front || updatedFlashcard.front.trim() === '') {
        throw new Error('Flashcard front cannot be empty');
      }
      
      // Update the flashcard
      flashcards[index] = {
        ...updatedFlashcard,
        tags: Array.isArray(updatedFlashcard.tags) ? updatedFlashcard.tags : []
      };
      
      localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(flashcards));
      return flashcards[index];
    } catch (error) {
      console.error('Error updating flashcard:', error);
      throw error;
    }
  }

  /**
   * Delete a flashcard by ID
   * @param id Flashcard ID to delete
   * @returns true if deleted, false if not found
   */
  static deleteFlashcard(id: string): boolean {
    try {
      const flashcards = this.getFlashcards();
      const initialLength = flashcards.length;
      const filteredFlashcards = flashcards.filter(card => card.id !== id);
      
      if (filteredFlashcards.length === initialLength) {
        return false;
      }
      
      localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(filteredFlashcards));
      return true;
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      return false;
    }
  }

  /**
   * Get all flashcard reviews
   * @returns Array of all flashcard reviews
   */
  static getReviews(): FlashcardReview[] {
    try {
      const data = localStorage.getItem(REVIEWS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting reviews:', error);
      return [];
    }
  }

  /**
   * Save a new flashcard review
   * @param flashcardId ID of the reviewed flashcard
   * @param difficulty Difficulty rating
   * @returns The saved review
   */
  static saveReview(flashcardId: string, difficulty: ReviewDifficulty): FlashcardReview {
    try {
      const reviews = this.getReviews();
      
      // Create new review
      const newReview: FlashcardReview = {
        flashcardId,
        reviewedAt: new Date().toISOString(),
        difficulty
      };
      
      // Save the review
      reviews.push(newReview);
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
      
      // Update the flashcard's lastReviewed field
      const flashcard = this.getFlashcardById(flashcardId);
      if (flashcard) {
        this.updateFlashcard({
          ...flashcard,
          lastReviewed: newReview.reviewedAt
        });
      }
      
      return newReview;
    } catch (error) {
      console.error('Error saving review:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a specific flashcard
   * @param flashcardId Flashcard ID
   * @returns Array of reviews for the flashcard
   */
  static getReviewsForFlashcard(flashcardId: string): FlashcardReview[] {
    try {
      const reviews = this.getReviews();
      return reviews.filter(review => review.flashcardId === flashcardId);
    } catch (error) {
      console.error('Error getting reviews for flashcard:', error);
      return [];
    }
  }

  /**
   * Generate a unique ID for a flashcard
   * @returns Unique ID string
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}