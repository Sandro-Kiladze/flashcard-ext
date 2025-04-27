document.addEventListener("mouseup", async () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      // Save to Chrome's local storage
      const result = await chrome.storage.local.get(['flashcards']);
      const flashcards = result.flashcards || [];
      flashcards.push({ text: selectedText, date: new Date().toISOString() });
      await chrome.storage.local.set({ flashcards });
      //confirmation
      console.log("Saved:", selectedText);
    }
  });