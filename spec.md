# Flashcard Extension Specification

## Overview
A browser extension that enables users to:
1. Create flashcards by highlighting text on webpages
2. Save flashcards to a local database
3. Review flashcards through a web interface
4. Grade difficulty using hand gesture recognition


## Core Features

### 1. Browser Extension
**Text Selection & Flashcard Creation**
- Listens for text selection events on webpages
- Displays floating "Create Flashcard" button near selected text
- Opens popup form to name/save the flashcard

**Technical Implementation**
- Content script (`content.ts`) injected into active tabs
- Event listeners for `mouseup` and selection changes
- Chrome extension messaging system for communication

### 2. Web Application
**Flashcard Review Interface**
- Displays flashcards in sequence
- Toggle to show/hide answers
- Navigation controls (Previous/Next)
- Progress indicator

**Technical Implementation**
- React components with TypeScript
- State management using React hooks
- Responsive design with Tailwind CSS
- Vite build system

### 3. Gesture Recognition
**Hand Gesture Controls**
- 👍 Thumbs up = Easy
- 👎 Thumbs down = Hard
- ✋ Open palm = Incorrect

**Technical Implementation**
- TensorFlow.js hand pose detection
- Webcam feed via `getUserMedia()`
- Gesture classification algorithm
- Minimum hold duration for confirmation

## API Specifications

### Server Endpoints
POST /flashcards - Create new flashcard
GET /flashcards - Retrieve all flashcards
GET /flashcards/:id - Get specific flashcard
PUT /flashcards/:id - Update flashcard difficulty


### Instalation
git clone https://github.com/Sandro-Kiladze/flashcard-ext.git
cd flashcard-ext

### Running the server

    Start backend server:

cd server
npm install
npm run dev

Launch webapp:

    cd webapp
    npm install
    npm run dev

    Load browser extension:

        Navigate to chrome://extensions

        Enable Developer Mode

        Click "Load unpacked"

        Select the extensions/ directory

Workflow
Creating Flashcards

    Highlight text on any webpage

    Click the blue "Flashcard" button

    Enter a name/title

    Flashcard saves to local database

Reviewing Flashcards

    Open webapp (default: http://localhost:5173)

    Navigate cards with Previous/Next buttons

    Click "Show Answer" to reveal content

    Use hand gestures to grade difficulty

Technical Requirements
Dependencies

    Extension: Chrome Extension API, TypeScript

    Server: Express.js, TypeScript

    Webapp: React, Vite, Tailwind CSS

    Gesture Recognition: TensorFlow.js, HandPose model

Browser Support

    Chrome (primary)

    Firefox (untested)

    Edge (untested)

    Safari (not supported)

Future Enhancements

    Cloud synchronization

    Spaced repetition algorithm

    Multi-language support

    Mobile app integration

    Advanced gesture controls

Known Limitations

    Hand gesture recognition requires good lighting

    Limited to text-based flashcards (no images)

    Local storage only (no cloud backup)


