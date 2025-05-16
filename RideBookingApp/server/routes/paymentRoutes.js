import express from 'express';
import {
  processPayment,
  getUserPayments,
  handlePaymentWebhook,
} from '../controllers/paymentController.js';
import { protect, isCustomer } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, isCustomer, processPayment)
  .get(protect, getUserPayments);

router.post('/webhook', handlePaymentWebhook);

export default router;