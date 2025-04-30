// webapp/src/components/ReviewStats.tsx

import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage-service';
import { ReviewDifficulty } from '../types';

/**
 * Component for displaying flashcard review statistics
 */
const ReviewStats: React.FC = () => {
  const [stats, setStats] = useState({
    totalCards: 0,
    reviewedCards: 0,
    totalReviews: 0,
    difficultyBreakdown: {
      [ReviewDifficulty.EASY]: 0,
      [ReviewDifficulty.MEDIUM]: 0,
      [ReviewDifficulty.HARD]: 0
    },
    averageReviewsPerCard: 0,
    reviewsLast7Days: 0,
    reviewsLast30Days: 0
  });

  useEffect(() => {
    calculateStats();
  }, []);

  /**
   * Calculate statistics from flashcards and reviews
   */
  const calculateStats = () => {
    const flashcards = StorageService.getFlashcards();
    const reviews = StorageService.getReviews();
    
    // Count cards that have been reviewed at least once
    const reviewedCardIds = new Set(reviews.map(review => review.flashcardId));
    const reviewedCards = reviewedCardIds.size;
    
    // Count reviews by difficulty
    const difficultyBreakdown = {
      [ReviewDifficulty.EASY]: 0,
      [ReviewDifficulty.MEDIUM]: 0,
      [ReviewDifficulty.HARD]: 0
    };
    
    reviews.forEach(review => {
      difficultyBreakdown[review.difficulty]++;
    });
    
    // Calculate averages
    const averageReviewsPerCard = reviewedCards > 0 
      ? (reviews.length / reviewedCards).toFixed(1) 
      : '0';
    
    // Count reviews in recent time periods
    const now = new Date();
    const last7Days = new Date();
    last7Days.setDate(now.getDate() - 7);
    
    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);
    
    const reviewsLast7Days = reviews.filter(review => 
      new Date(review.reviewedAt) >= last7Days
    ).length;
    
    const reviewsLast30Days = reviews.filter(review => 
      new Date(review.reviewedAt) >= last30Days
    ).length;
    
    setStats({
      totalCards: flashcards.length,
      reviewedCards,
      totalReviews: reviews.length,
      difficultyBreakdown,
      averageReviewsPerCard: parseFloat(averageReviewsPerCard),
      reviewsLast7Days,
      reviewsLast30Days
    });
  };

  /**
   * Calculate percentage for a difficulty level
   * @param difficulty Difficulty level
   * @returns Percentage string
   */
  const getPercentage = (difficulty: ReviewDifficulty): string => {
    if (stats.totalReviews === 0) return '0%';
    return `${Math.round((stats.difficultyBreakdown[difficulty] / stats.totalReviews) * 100)}%`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Review Statistics</h2>
      
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-blue-700 font-medium">Total Flashcards</p>
          <p className="text-3xl font-bold text-blue-900">{stats.totalCards}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <p className="text-sm text-purple-700 font-medium">Total Reviews</p>
          <p className="text-3xl font-bold text-purple-900">{stats.totalReviews}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-green-700 font-medium">Cards Reviewed</p>
          <p className="text-3xl font-bold text-green-900">{stats.reviewedCards}</p>
        </div>
      </div>
      
      {/* Recent activity */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Last 7 days</p>
            <p className="text-2xl font-semibold">{stats.reviewsLast7Days} reviews</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last 30 days</p>
            <p className="text-2xl font-semibold">{stats.reviewsLast30Days} reviews</p>
          </div>
        </div>
      </div>
      
      {/* Difficulty breakdown */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-3">Difficulty Breakdown</h3>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div className="flex rounded-full h-4 overflow-hidden">
            <div 
              className="bg-green-500 h-full" 
              style={{ width: getPercentage(ReviewDifficulty.EASY) }}
            ></div>
            <div 
              className="bg-yellow-500 h-full" 
              style={{ width: getPercentage(ReviewDifficulty.MEDIUM) }}
            ></div>
            <div 
              className="bg-red-500 h-full" 
              style={{ width: getPercentage(ReviewDifficulty.HARD) }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">
              Easy: {stats.difficultyBreakdown[ReviewDifficulty.EASY]} ({getPercentage(ReviewDifficulty.EASY)})
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm">
              Medium: {stats.difficultyBreakdown[ReviewDifficulty.MEDIUM]} ({getPercentage(ReviewDifficulty.MEDIUM)})
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm">
              Hard: {stats.difficultyBreakdown[ReviewDifficulty.HARD]} ({getPercentage(ReviewDifficulty.HARD)})
            </span>
          </div>
        </div>
      </div>
      
      {/* Average */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Average Reviews Per Card</p>
          <p className="text-2xl font-semibold">{stats.averageReviewsPerCard}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;