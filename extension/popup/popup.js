// Get selected text from URL
const params = new URLSearchParams(window.location.search);
document.getElementById('back').value = params.get('text') || '';

// Button handlers
document.getElementById('cancel').addEventListener('click', () => window.close());

document.getElementById('save').addEventListener('click', async () => {
  const flashcard = {
    front: document.getElementById('front').value,
    back: document.getElementById('back').value
  };

  try {
    const response = await fetch('http://localhost:3000/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flashcard)
    });
    
    if (response.ok) window.close();
  } catch (err) {
    console.error('Save failed:', err);
  }
});