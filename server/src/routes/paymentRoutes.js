import express from 'express';
import { processPayment, getPaymentHistory } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/process', processPayment);
router.get('/history', getPaymentHistory);

export default router;
