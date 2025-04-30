import { useState, useEffect } from 'react';

interface Flashcard {
  front: string;
  back: string;
}

export default function App() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/flashcards')
      .then(res => res.json())
      .then(setCards);
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Flashcards</h1>
      
      {cards.length > 0 ? (
        <>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '20px', 
            borderRadius: '8px',
            minHeight: '200px'
          }}>
            <h2>{cards[currentIndex].front}</h2>
            {showAnswer && <p>{cards[currentIndex].back}</p>}
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              onClick={() => setShowAnswer(!showAnswer)}
              style={{ padding: '10px 20px' }}
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
            
            {cards.length > 1 && (
              <button
                onClick={() => {
                  setCurrentIndex((prev) => (prev + 1) % cards.length);
                  setShowAnswer(false);
                }}
                style={{ padding: '10px 20px' }}
              >
                Next Card
              </button>
            )}
          </div>
          
          <p style={{ marginTop: '20px' }}>
            Card {currentIndex + 1} of {cards.length}
          </p>
        </>
      ) : (
        <p>No flashcards yet. Highlight text on any page and click the extension button!</p>
      )}
    </div>
  );
}