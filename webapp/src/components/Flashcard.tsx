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
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<Flashcard['label']>(flashcard.label || null);

  const handleLabelChange = (newLabel: Flashcard['label']) => {
    // If clicking the same label, remove it
    if (newLabel === currentLabel) {
      setCurrentLabel(null);
      onLabelChange(flashcard.id, null);
    } else {
      // Otherwise, change to the new label
      setCurrentLabel(newLabel);
      onLabelChange(flashcard.id, newLabel);
    }
  };

  const handleGestureDetected = (gesture: string) => {
    const labelMap = {
      'thumbs_up': 'easy',
      'thumbs_down': 'hard',
      'open_palm': 'incorrect'
    } as const;

    const newLabel = labelMap[gesture as keyof typeof labelMap] || null;
    
    // If the new label is the same as current, remove it
    if (newLabel === currentLabel) {
      setCurrentLabel(null);
      onLabelChange(flashcard.id, null);
    } else {
      // Otherwise, change to the new label
      setCurrentLabel(newLabel);
      onLabelChange(flashcard.id, newLabel);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <div className="flashcard">
      <div className="flashcard-content">
        <h3>{flashcard.question}</h3>
        <p className="flashcard-prompt">Click the button below to reveal the answer</p>
        
        <button 
          className="show-answer-button"
          onClick={toggleAnswer}
        >
          {showAnswer ? 'Hide Answer' : 'Show Answer'}
        </button>
        
        {showAnswer && (
          <>
            <div className="flashcard-answer-container">
              <p className="flashcard-answer">{flashcard.answer}</p>
            </div>
            
            {/* Ranking buttons - only shown when answer is visible */}
            <div className="ranking-buttons">
              <button 
                className={`label-button ${currentLabel === 'easy' ? 'active' : ''}`}
                onClick={() => handleLabelChange('easy')}
                data-label="easy"
              >
                <span className="label-icon">👍</span> Easy
              </button>
              <button 
                className={`label-button ${currentLabel === 'hard' ? 'active' : ''}`}
                onClick={() => handleLabelChange('hard')}
                data-label="hard"
              >
                <span className="label-icon">👎</span> Hard
              </button>
              <button 
                className={`label-button ${currentLabel === 'incorrect' ? 'active' : ''}`}
                onClick={() => handleLabelChange('incorrect')}
                data-label="incorrect"
              >
                <span className="label-icon">✋</span> Incorrect
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="flashcard-controls">
        {/* Gesture recognition toggle */}
        <button 
          className={`gesture-button ${isGestureActive ? 'active' : ''}`}
          onClick={() => setIsGestureActive(!isGestureActive)}
        >
          {isGestureActive ? (
            <>
              <span className="gesture-icon">✋</span> Stop Gesture Control
            </>
          ) : (
            <>
              <span className="gesture-icon">👆</span> Use Gestures
            </>
          )}
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