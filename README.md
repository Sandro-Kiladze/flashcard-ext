Flashcard Extension
A browser extension that allows users to create flashcards by highlighting text on webpages, saving them and using a webapp to learn from them. You use Hand gestures to validate if the flashcard was easy or difficult.

=============================================================================================================================

How to install:
Step 1: Make folder on Desktop, say Test.
Step 2: Open folder in your code editor.
Step 3: Open terminal.
Step 4: type "git init" to initialzie repository.
Step 5: type "git clone https://github.com/Sandro-Kiladze/flashcard-ext.git "
Step 6: type "cd flashcard-ext"

=============================================================================================================================

How to operate:

Step 1:
Open terminal 1:
1) cd server
2) npm run dev

Step 2:
Open terminal 2:
1) cd webapp
2) npm install vite --save-dev
3) npm run dev

Step 3: 
1) Go to google extensions.
2) Enable developer mode
3) Load unpacked
4) Select /extensions/ folder from the project.
5) Turn it on.
6) (Optional: press update).

Step 4:
1) Mark text in google, say info about Spinosaur.
2) Press blue popup "Flashcard".
3) Write a name for it.
4) Go to webapp local host.
5) Refresh the page and you will see the flashcard.
6) If you have multiple flashcards you can navigate with the Previous and Next buttons.
7) Press "Show Answer" to see the copied text.

Step 5: 
1) Open camera
2) Do a "Thumbs up gesture" if the flashcard was easy
3) Do a "Thumbs down gesture" if the flashcard was hard.