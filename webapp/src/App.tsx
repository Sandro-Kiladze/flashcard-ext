import { useState, useEffect } from 'react'
import './App.css'

interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: string;
}

export default function App() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetch('/api/cards')
      .then(res => res.json())
      .then(setCards);
  }, []);

  return (
    <div className="flashcard-app">
      <h1>Flashcard Learner</h1>
      
      {cards.length > 0 ? (
        <>
          <div className="card">
            <h3>{cards[currentIndex].front}</h3>
            {showAnswer && <p>{cards[currentIndex].back}</p>}
          </div>
          <div className="controls">
            <button onClick={() => setShowAnswer(!showAnswer)}>
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
            <button onClick={() => {
              setCurrentIndex((prev) => (prev + 1) % cards.length);
              setShowAnswer(false);
            }}>
              Next Card
            </button>
          </div>
        </>
      ) : (
        <p>No flashcards yet. Highlight text on any page and click the extension button to add some!</p>
      )}
    </div>
  );
}