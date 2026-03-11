import express from 'express';
import { createBook, getBooks, getBookDetails, addEntry, getEntries, deleteBook, deleteEntry, updateBook } from '../controllers/bookController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createBook);
router.get('/', getBooks);
router.get('/:id', getBookDetails);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

router.post('/:id/entries', addEntry);
router.get('/:id/entries', getEntries);
router.delete('/:id/entries/:entryId', deleteEntry);

export default router;
