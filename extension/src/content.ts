// Safe Chrome API check and messaging function
function sendExtensionMessage(message: any): Promise<void> {
  return new Promise((resolve, reject) => {
      // Check if Chrome API is available
      if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
          console.warn('Chrome extension API not available - using fallback');
          window.open(`/popup.html?text=${encodeURIComponent(message.text)}`, '_blank', 'width=400,height=500');
          return reject(new Error('Extension context unavailable'));
      }

      // Standard Chrome messaging
      chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
              console.error('Message error:', chrome.runtime.lastError);
              // Fallback to tab opening if message fails
              window.open(
                  chrome.runtime.getURL(`popup/popup.html?text=${encodeURIComponent(message.text)}`),
                  '_blank',
                  'width=400,height=500'
              );
              reject(chrome.runtime.lastError);
          } else {
              resolve(response);
          }
      });
  });
}

function createFlashcardButton(event: MouseEvent) {
  const selection = window.getSelection()?.toString().trim();
  if (!selection || selection.length < 5) return;

  // Remove existing buttons safely
  document.querySelectorAll('.flashcard-btn').forEach(el => {
      try {
          if (document.body.contains(el)) {
              el.remove();
          }
      } catch (err) {
          console.warn('Error removing existing button:', err);
      }
  });

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
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      pointer-events: auto;
  `;

  const safelyRemoveButton = () => {
      try {
          if (btn?.parentNode === document.body) {
              btn.remove();
          }
      } catch (err) {
          console.warn('Error removing button:', err);
      }
  };

  btn.addEventListener('click', async () => {
      safelyRemoveButton();
      
      try {
          await sendExtensionMessage({
              action: "CREATE_FLASHCARD",
              text: selection
          });
      } catch (err) {
          console.error('Failed to create flashcard:', err);
      }
  });

  document.body.appendChild(btn);

  // Auto-remove after timeout
  const removalTimer = setTimeout(safelyRemoveButton, 5000);
  
  // Cleanup on page navigation
  window.addEventListener('beforeunload', safelyRemoveButton);
}

// Initialize with proper event listeners
document.addEventListener('mouseup', (event) => {
  try {
      // Only create buttons on left-click
      if (event.button === 0) { 
          createFlashcardButton(event);
      }
  } catch (err) {
      console.error('Selection error:', err);
  }
});

// Debugging
console.log('Flashcard content script loaded');