import express from 'express';
import {
  getMovies,
  getMovieById,
  getFeaturedMovies,
  getGenres,
  getLanguages,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movieController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/genres', getGenres);
router.get('/languages', getLanguages);
router.get('/:id', getMovieById);

// Admin protected routes
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

export default router;
