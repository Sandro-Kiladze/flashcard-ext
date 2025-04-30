console.log('Background script loaded');
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "CREATE_FLASHCARD") {
        console.log('Creating popup for:', request.text.substring(0, 20) + '...');
        chrome.windows.create({
            url: chrome.runtime.getURL(`popup/popup.html?text=${encodeURIComponent(request.text)}`),
            type: 'popup',
            width: 400,
            height: 500,
            left: Math.max(screen.width - 450, 0)
        }).then(window => {
            console.log('Popup opened with ID:', window.id);
            sendResponse({ success: true });
        }).catch(err => {
            console.error('Popup error:', err);
            sendResponse({ error: err.message });
        });
        return true; // Required for async response
    }
});
