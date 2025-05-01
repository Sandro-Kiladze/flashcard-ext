import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());
let flashcards = [];
app.post('/flashcards', (req, res) => {
    flashcards.push(req.body);
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
    flashcards[index] = req.body;
    res.status(200).send();
});
app.listen(3000, () => console.log('Server running on port 3000'));
