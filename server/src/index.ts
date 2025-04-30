import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let flashcards: Array<{front: string, back: string}> = [];

app.post('/flashcards', (req, res) => {
  flashcards.push(req.body);
  res.status(201).send();
});

app.get('/flashcards', (req, res) => {
  res.json(flashcards);
});

app.listen(3000, () => console.log('Server running on port 3000'));