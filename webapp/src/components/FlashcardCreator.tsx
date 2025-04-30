// webapp/src/components/FlashcardCreator.tsx

import React, { useState } from 'react';
import { StorageService } from '../services/storage-service';

/**
 * Component for manually creating new flashcards
 */
const FlashcardCreator: React.FC = () => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Handle form submission to create a new flashcard
   * @param e Form submit event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate input
    if (!front.trim()) {
      setError('Front side cannot be empty');
      return;
    }
    
    if (!back.trim()) {
      setError('Back side cannot be empty');
      return;
    }
    
    // Process tags (comma-separated string to array)
    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    try {
      // Create the flashcard
      StorageService.saveFlashcard({
        front,
        back,
        tags: tagArray
      });
      
      // Show success message and reset form
      setSuccess('Flashcard created successfully!');
      setFront('');
      setBack('');
      setTags('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to create flashcard. Please try again.');
      console.error('Error creating flashcard:', err);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Flashcard</h2>
      
      {/* Success message */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Front side */}
        <div className="mb-4">
          <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-1">
            Front Side (Question)
          </label>
          <textarea
            id="front"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Enter the question or prompt"
          />
        </div>
        
        {/* Back side */}
        <div className="mb-4">
          <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-1">
            Back Side (Answer)
          </label>
          <textarea
            id="back"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Enter the answer"
          />
        </div>
        
        {/* Tags */}
        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. history, dates, important"
          />
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Create Flashcard
        </button>
      </form>
    </div>
  );
};

export default FlashcardCreator;