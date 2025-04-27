chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "addFlashcard",
      title: "Add to Flashcards",
      contexts: ["selection"]
    });
  });
  chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "addFlashcard") {
      chrome.runtime.sendMessage({
        action: "createFlashcard",
        text: info.selectionText
      });
    }
  });