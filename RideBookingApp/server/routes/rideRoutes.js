import express from 'express';
import {
  createRide,
  getUserRides,
  getRideById,
  updateRideStatus,
  cancelRide,
} from '../controllers/rideController.js';
import { protect, isCustomer, isRider } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, isCustomer, createRide)
  .get(protect, getUserRides);

router.route('/:id')
  .get(protect, getRideById);

router.put('/:id/status', protect, isRider, updateRideStatus);
router.put('/:id/cancel', protect, isCustomer, cancelRide);

export default router;