// Get selected text from URL
const params = new URLSearchParams(window.location.search);
document.getElementById('back').value = params.get('text') || '';

document.getElementById('save').addEventListener('click', async () => {
  const card = {
    front: document.getElementById('front').value,
    back: document.getElementById('back').value,
    hint: document.getElementById('hint').value,
    createdAt: new Date().toISOString()
  };

  try {
    const response = await fetch('http://localhost:3000/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });
    
    if (response.ok) window.close();
  } catch (error) {
    console.error('Save failed:', error);
  }
});

document.getElementById('cancel').addEventListener('click', () => window.close());