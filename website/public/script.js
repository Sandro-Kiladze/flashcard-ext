let currentDay = 0;
let currentCardIndex = 0;
let flashcards = [];

document.addEventListener('DOMContentLoaded', () => {
    loadFlashcards();
});

async function loadFlashcards() {
    try {
        const response = await fetch('/cards');
        flashcards = await response.json();
        updateDayCounter();
        showCurrentCard();
    } catch (error) {
        console.error('Error loading flashcards:', error);
    }
}

function showCurrentCard() {
    const frontElement = document.getElementById('card-front');
    const backElement = document.getElementById('card-back');
    
    if (flashcards.length > 0 && currentCardIndex < flashcards.length) {
        frontElement.textContent = flashcards[currentCardIndex].front;
        backElement.textContent = flashcards[currentCardIndex].back;
        backElement.style.display = 'none';
    } else {
        frontElement.textContent = 'No more cards to practice today!';
        backElement.textContent = '';
    }
}

document.getElementById('show-answer').addEventListener('click', () => {
    document.getElementById('card-back').style.display = 'block';
});

document.getElementById('next-card').addEventListener('click', () => {
    currentCardIndex++;
    if (currentCardIndex >= flashcards.length) {
        currentDay++;
        currentCardIndex = 0;
        updateDayCounter();
    }
    showCurrentCard();
    document.getElementById('card-back').style.display = 'none';
});

function updateDayCounter() {
    document.querySelector('.day-counter').textContent = `Day ${currentDay}`;
}