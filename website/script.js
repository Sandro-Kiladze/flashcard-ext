let currentCardIndex = 0;

document.getElementById('show-answer').addEventListener('click', () => {
  document.querySelector('.back').style.display = 'block';
  document.getElementById('next-card').style.display = 'inline-block';
});

document.getElementById('next-card').addEventListener('click', () => {
  currentCardIndex++;
  loadNextCard();
});

async function loadNextCard() {
  const response = await fetch('http://localhost:3000/cards');
  const cards = await response.json();
  
  if (currentCardIndex < cards.length) {
    document.querySelector('.front').textContent = cards[currentCardIndex].front;
    document.querySelector('.back').textContent = cards[currentCardIndex].back;
    document.querySelector('.back').style.display = 'none';
    document.getElementById('next-card').style.display = 'none';
  } else {
    document.getElementById('flashcard-display').innerHTML = 
      '<p>No more cards to practice today!</p>';
  }
}