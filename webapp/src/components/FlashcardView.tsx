// webapp/src/components/FlashcardView.tsx

import React, { useState } from 'react';
import { Flashcard, ReviewDifficulty } from '../types';

interface FlashcardViewProps {
  flashcard: Flashcard;
  onReview: (difficulty: ReviewDifficulty) => void;
  showButtons: boolean;
}

/**
 * Component for displaying a single flashcard with flip animation
 * Handles card flipping and difficulty rating buttons
 */
const FlashcardView: React.FC<FlashcardViewProps> = ({ 
  flashcard, 
  onReview, 
  showButtons = true 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  /**
   * Toggle the flashcard flip state
   */
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  /**
   * Handle review difficulty selection
   * @param difficulty Selected difficulty level
   */
  const handleReview = (difficulty: ReviewDifficulty) => {
    onReview(difficulty);
    // Reset the card to front side for next card
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Flashcard */}
      <div 
        className={`cursor-pointer perspective-1000 relative h-64 w-full transition-transform duration-500 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
        data-testid="flashcard"
      >
        {/* Front side */}
        <div 
          className={`absolute w-full h-full backface-hidden bg-white border-2 border-gray-200 rounded-xl shadow-lg p-6 flex flex-col justify-between transition-all duration-500 ${
            isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          data-testid="flashcard-front"
        >
          <div className="flex-grow flex items-center justify-center">
            <p className="text-xl text-center">{flashcard.front}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {flashcard.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                data-testid={`tag-${tag}`}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="text-center mt-4 text-sm text-gray-500">
            Click to flip
          </div>
        </div>

        {/* Back side */}
        <div 
          className={`absolute w-full h-full backface-hidden bg-white border-2 border-gray-200 rounded-xl shadow-lg p-6 flex flex-col justify-between rotate-y-180 transition-all duration-500 ${
            isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          data-testid="flashcard-back"
        >
          <div className="flex-grow flex items-center justify-center">
            <p className="text-xl text-center">{flashcard.back}</p>
          </div>
          <div className="text-center mt-4 text-sm text-gray-500">
            Click to flip back
          </div>
        </div>
      </div>

      {/* Review buttons */}
      {showButtons && (
        <div className="flex justify-between mt-6">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors"
            onClick={() => handleReview(ReviewDifficulty.HARD)}
            data-testid="button-hard"
          >
            Hard
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition-colors"
            onClick={() => handleReview(ReviewDifficulty.MEDIUM)}
            data-testid="button-medium"
          >
            Medium
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors"
            onClick={() => handleReview(ReviewDifficulty.EASY)}
            data-testid="button-easy"
          >
            Easy
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashcardView;