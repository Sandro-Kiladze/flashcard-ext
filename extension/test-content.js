const { JSDOM } = require('jsdom');

// Set up a fake DOM environment
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div>Sample text content for testing</div>
    </body>
  </html>
`);

// Assign the mock DOM to global variables
global.document = dom.window.document;
global.window = dom.window;

// Test content.js button creation
function testContentScriptButton() {
  // Mock selection
  const mockSelection = {
    toString: () => "Sample selected text",
    trim: () => "Sample selected text"
  };
  window.getSelection = () => mockSelection;

  // Mock event
  const mockEvent = {
    clientX: 100,
    clientY: 200,
    button: 0
  };

  // Test button creation (simplified version of your actual function)
  const createFlashcardButton = (event) => {
    const selection = window.getSelection()?.toString().trim();
    if (!selection) {
      console.log("❌ No selection found");
      return;
    }

    // Remove existing buttons
    document.querySelectorAll('.flashcard-btn').forEach(btn => btn.remove());

    const btn = document.createElement('div');
    btn.className = 'flashcard-btn';
    btn.textContent = '✚ Flashcard';
    btn.style.position = 'fixed';
    btn.style.left = `${event.clientX}px`;
    btn.style.top = `${event.clientY - 30}px`;
    document.body.appendChild(btn);

    // Verify results
    const buttons = document.querySelectorAll('.flashcard-btn');
    if (buttons.length === 1) {
      console.log("✅ Button created successfully");
      console.log("✅ Button text:", buttons[0].textContent);
      console.log("✅ Button position:", buttons[0].style.left, buttons[0].style.top);
    } else {
      console.log("❌ Button not created correctly");
    }
  };

  // Run test
  createFlashcardButton(mockEvent);
  console.log("✅ Content script test completed");
}

testContentScriptButton();