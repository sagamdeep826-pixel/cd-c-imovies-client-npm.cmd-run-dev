import express from 'express';
import {
  getTheatres,
  getTheatreById,
  getCities,
  createTheatre,
  updateTheatre,
  deleteTheatre,
} from '../controllers/theatreController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTheatres);
router.get('/cities', getCities);
router.get('/:id', getTheatreById);

// Admin routes
router.post('/', protect, adminOnly, createTheatre);
router.put('/:id', protect, adminOnly, updateTheatre);
router.delete('/:id', protect, adminOnly, deleteTheatre);

export default router;
