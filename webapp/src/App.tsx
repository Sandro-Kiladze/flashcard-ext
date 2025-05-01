import { useState, useEffect } from 'react';
import GestureRecognition from './components/GestureRecognition';
import './styles/gesture.css';

interface Flashcard {
  front: string;
  back: string;
  label: 'easy' | 'hard' | 'incorrect' | null;
}

export default function App() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isGestureActive, setIsGestureActive] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/flashcards')
      .then(res => res.json())
      .then(setCards);
  }, []);

  const goToNextCard = () => {
    setCurrentIndex(prev => (prev + 1) % cards.length);
    setShowAnswer(false);
    setIsGestureActive(false);
  };

  const goToPrevCard = () => {
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
    setShowAnswer(false);
    setIsGestureActive(false);
  };

  const handleLabelChange = (label: Flashcard['label']) => {
    if (!showAnswer) return;

    const updatedCards = [...cards];
    const currentCard = updatedCards[currentIndex];
    
    // If clicking the same label, remove it
    if (currentCard.label === label) {
      updatedCards[currentIndex] = {
        ...currentCard,
        label: null
      };
    } else {
      // Otherwise, set the new label
      updatedCards[currentIndex] = {
        ...currentCard,
        label
      };
    }

    setCards(updatedCards);

    // Save the updated flashcard to the server
    fetch(`http://localhost:3000/flashcards/${currentIndex}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCards[currentIndex])
    }).catch(err => console.error('Error updating flashcard:', err));
  };

  const handleGestureDetected = (gesture: string) => {
    if (!showAnswer) return;

    let label: Flashcard['label'] = null;
    switch (gesture) {
      case 'thumbs_up':
        label = 'easy';
        break;
      case 'thumbs_down':
        label = 'hard';
        break;
      case 'open_palm':
        label = 'incorrect';
        break;
    }

    if (label) {
      handleLabelChange(label);
      goToNextCard();
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Flashcards</h1>
      
      {cards.length > 0 ? (
        <>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '20px', 
            borderRadius: '8px',
            minHeight: '200px',
            marginBottom: '20px'
          }}>
            <h2>{cards[currentIndex].front}</h2>
            {cards[currentIndex].label && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Label: {cards[currentIndex].label}
              </p>
            )}
            {showAnswer && <p>{cards[currentIndex].back}</p>}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <button 
                onClick={() => {
                  setShowAnswer(!showAnswer);
                  setIsGestureActive(!showAnswer);
                }}
                style={{ padding: '10px 20px', marginRight: '10px' }}
              >
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={goToPrevCard}
                disabled={cards.length <= 1}
                style={{ padding: '10px 20px' }}
              >
                Previous
              </button>
              
              <button
                onClick={goToNextCard}
                disabled={cards.length <= 1}
                style={{ padding: '10px 20px' }}
              >
                Next
              </button>
            </div>
          </div>
          
          {showAnswer && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
              <button
                onClick={() => handleLabelChange('easy')}
                style={{ 
                  padding: '10px 20px',
                  backgroundColor: cards[currentIndex].label === 'easy' ? '#4CAF50' : '#f5f5f5',
                  color: cards[currentIndex].label === 'easy' ? 'white' : 'black'
                }}
              >
                Easy
              </button>
              <button
                onClick={() => handleLabelChange('hard')}
                style={{ 
                  padding: '10px 20px',
                  backgroundColor: cards[currentIndex].label === 'hard' ? '#f44336' : '#f5f5f5',
                  color: cards[currentIndex].label === 'hard' ? 'white' : 'black'
                }}
              >
                Hard
              </button>
              <button
                onClick={() => handleLabelChange('incorrect')}
                style={{ 
                  padding: '10px 20px',
                  backgroundColor: cards[currentIndex].label === 'incorrect' ? '#FFC107' : '#f5f5f5',
                  color: cards[currentIndex].label === 'incorrect' ? 'black' : 'black'
                }}
              >
                Incorrect
              </button>
            </div>
          )}
          
          <p style={{ marginTop: '20px', textAlign: 'center' }}>
            Card {currentIndex + 1} of {cards.length}
          </p>

          <GestureRecognition 
            onGestureDetected={handleGestureDetected}
            isActive={isGestureActive}
          />
        </>
      ) : (
        <p>No flashcards yet. Highlight text on any page and click the extension button!</p>
      )}
    </div>
  );
}