const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let flashcards = [
    // Sample data
    { front: "What is a Trex", back: "big dinosaur" },
    { front: "Dark souls 3", back: "goated" }
];

// Get all flashcards
app.get('/cards', (req, res) => {
    res.json(flashcards);
});

// Add new flashcard
app.post('/cards', (req, res) => {
    flashcards.push(req.body);
    res.status(201).send('Card added');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});