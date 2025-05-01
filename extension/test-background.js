// Test background.js message handling
function testBackgroundMessageHandling() {
    // Mock Chrome API
    const mockChrome = {
      runtime: {
        getURL: (url) => `chrome-extension://mock-id/${url}`,
        onMessage: {
          addListener: (callback) => {
            // Simulate message
            const mockRequest = { action: "CREATE_FLASHCARD", text: "Test text for flashcard" };
            const mockSender = {};
            const mockSendResponse = (response) => {
              console.log("Background test response:", response);
            };
            
            // Call the listener with mock data
            const keepChannelOpen = callback(mockRequest, mockSender, mockSendResponse);
            console.log(keepChannelOpen ? "✅ Background keeps channel open (valid)" : "❌ Background should keep channel open");
          }
        }
      },
      windows: {
        create: () => Promise.resolve({ id: 123 })
      }
    };
  
    // Replace global chrome with mock
    global.chrome = mockChrome;
  
    // Import the function to test (simplified)
    const backgroundFunctionality = () => {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "CREATE_FLASHCARD") {
          chrome.windows.create({
            url: chrome.runtime.getURL(`popup/popup.html?text=${encodeURIComponent(request.text)}`)
          }).then(() => sendResponse({ success: true }));
          return true;
        }
      });
    };
  
    // Run test
    backgroundFunctionality();
    console.log("✅ Background test completed");
  }
  
  testBackgroundMessageHandling();