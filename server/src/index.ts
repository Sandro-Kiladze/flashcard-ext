import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

interface Flashcard {
  front: string;
  back: string;
  label: 'easy' | 'hard' | 'incorrect' | null;
}

let flashcards: Flashcard[] = [];

app.post('/flashcards', (req: Request, res: Response) => {
  const newFlashcard: Flashcard = {
    front: req.body.front,
    back: req.body.back,
    label: null
  };
  flashcards.push(newFlashcard);
  res.status(201).send();
});

app.get('/flashcards', (req: Request, res: Response) => {
  res.json(flashcards);
});

app.put('/flashcards/:index', (req: Request, res: Response) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= flashcards.length) {
    return res.status(400).json({ error: 'Invalid flashcard index' });
  }
  
  const updatedFlashcard: Flashcard = {
    front: req.body.front,
    back: req.body.back,
    label: req.body.label
  };
  
  flashcards[index] = updatedFlashcard;
  res.status(200).send();
});

app.listen(3000, () => console.log('Server running on port 3000'));