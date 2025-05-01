import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());
let flashcards = [];
app.post('/flashcards', (req, res) => {
    const newFlashcard = {
        front: req.body.front,
        back: req.body.back,
        label: null
    };
    flashcards.push(newFlashcard);
    res.status(201).send();
});
app.get('/flashcards', (req, res) => {
    res.json(flashcards);
});
app.put('/flashcards/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (isNaN(index) || index < 0 || index >= flashcards.length) {
        return res.status(400).json({ error: 'Invalid flashcard index' });
    }
    const updatedFlashcard = {
        front: req.body.front,
        back: req.body.back,
        label: req.body.label
    };
    flashcards[index] = updatedFlashcard;
    res.status(200).send();
});
app.listen(3000, () => console.log('Server running on port 3000'));
