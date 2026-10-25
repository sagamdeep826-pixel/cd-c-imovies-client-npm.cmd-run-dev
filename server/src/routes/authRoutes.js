import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.get('/users', protect, adminOnly, getAllUsers);

export default router;
