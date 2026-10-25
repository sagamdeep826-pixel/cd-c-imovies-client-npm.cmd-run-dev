import express from 'express';
import {
  createBooking,
  cancelBooking,
  getUserBookings,
  getBookingById,
  getAllBookings,
} from '../controllers/bookingController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All booking routes require user authentication

router.post('/', createBooking);
router.get('/my', getUserBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

// Admin route
router.get('/admin/all', adminOnly, getAllBookings);

export default router;
