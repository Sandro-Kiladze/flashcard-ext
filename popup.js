chrome.storage.local.get(["flashcards"], (result) => {
    const container = document.getElementById("flashcard-container");
    if (result.flashcards) {
      result.flashcards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.textContent = card.text;
        container.appendChild(cardElement);
      });
    }
  });