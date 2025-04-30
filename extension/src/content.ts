function createFlashcardButton(event: MouseEvent) {
    const selection = window.getSelection()?.toString().trim();
    if (!selection || selection.length < 5) return;
  
    // Remove existing buttons
    document.querySelectorAll('.flashcard-btn').forEach(btn => btn.remove());
  
    const btn = document.createElement('div');
    btn.className = 'flashcard-btn';
    btn.textContent = '✚ Flashcard';
    btn.style.cssText = `
      position: fixed;
      left: ${event.clientX}px;
      top: ${event.clientY - 30}px;
      background: #4285f4;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      z-index: 999999;
      font-family: Arial;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
  
    btn.addEventListener('click', () => {
      btn.remove();
      chrome.runtime.sendMessage({
        action: "OPEN_FLASHCARD_POPUP",
        text: selection
      });
    });
  
    document.body.appendChild(btn);
    setTimeout(() => btn.remove(), 5000);
  }
  
  // Initialize
  document.addEventListener('mouseup', (event) => {
    if (event.button === 0) createFlashcardButton(event);
  });