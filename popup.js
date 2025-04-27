document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('flashcard-container');
    const result = await chrome.storage.local.get(['flashcards']);
    if (result.flashcards?.length > 0) {
      container.innerHTML = result.flashcards
        .map(card => `<div class="card">${card.text}</div>`)
        .join('');
    } else {
      container.innerHTML = '<p>No flashcards yet. Highlight text to save!</p>';
    }
  });