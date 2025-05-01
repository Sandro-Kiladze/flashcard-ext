import { useState } from 'react';
import { Flashcard } from '../types/flashcard';
import GestureRecognition from './GestureRecognition';
import './Flashcard.css';

interface FlashcardProps {
  flashcard: Flashcard;
  onLabelChange: (id: string, label: Flashcard['label']) => void;
}

export default function FlashcardComponent({ flashcard, onLabelChange }: FlashcardProps) {
  const [isGestureActive, setIsGestureActive] = useState(false);

  const handleLabelChange = (newLabel: Flashcard['label']) => {
    // Only allow changing to a different label or removing the current one
    if (newLabel !== flashcard.label) {
      onLabelChange(flashcard.id, newLabel);
    } else {
      // Clicking the current label removes it
      onLabelChange(flashcard.id, null);
    }
  };

  const handleGestureDetected = (gesture: string) => {
    const labelMap = {
      'thumbs_up': 'easy',
      'thumbs_down': 'hard',
      'open_palm': 'incorrect'
    } as const;

    const newLabel = labelMap[gesture as keyof typeof labelMap] || null;
    
    // Only update if different from current label
    if (newLabel !== flashcard.label) {
      onLabelChange(flashcard.id, newLabel);
    }
  };

  return (
    <div className="flashcard">
      <div className="flashcard-content">
        <h3>{flashcard.question}</h3>
        <p>{flashcard.answer}</p>
      </div>
      
      <div className="flashcard-labels">
        {/* Manual label buttons */}
        <button 
          className={`label-button ${flashcard.label === 'easy' ? 'active' : ''}`}
          onClick={() => handleLabelChange('easy')}
          data-label="easy"
        >
          👍 Easy
        </button>
        <button 
          className={`label-button ${flashcard.label === 'hard' ? 'active' : ''}`}
          onClick={() => handleLabelChange('hard')}
          data-label="hard"
        >
          👎 Hard
        </button>
        <button 
          className={`label-button ${flashcard.label === 'incorrect' ? 'active' : ''}`}
          onClick={() => handleLabelChange('incorrect')}
          data-label="incorrect"
        >
          ✋ Incorrect
        </button>
        
        {/* Gesture recognition toggle */}
        <button 
          className="gesture-button"
          onClick={() => setIsGestureActive(!isGestureActive)}
        >
          {isGestureActive ? 'Stop Gesture Control' : 'Use Gestures'}
        </button>
      </div>
      
      {isGestureActive && (
        <GestureRecognition 
          isActive={true}
          onGestureDetected={handleGestureDetected}
        />
      )}
    </div>
  );
} 