import Payment from '../models/paymentModel.js';
import Ride from '../models/rideModel.js';

// @desc    Process payment for a ride
// @route   POST /api/payments
// @access  Private/Customer
export const processPayment = async (req, res) => {
  try {
    const { rideId, paymentMethod, transactionId } = req.body;

    // Check if ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      res.status(404);
      throw new Error('Ride not found');
    }

    // Verify user owns the ride
    if (ride.customer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to make payment for this ride');
    }

    // Create a new payment
    const payment = await Payment.create({
      ride: rideId,
      user: req.user._id,
      amount: ride.fare,
      paymentMethod,
      transactionId,
      status: 'completed', // In a real app, would validate payment gateway response
    });

    // Update ride payment status
    ride.paymentStatus = 'completed';
    ride.paymentMethod = paymentMethod;
    await ride.save();

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user payment history
// @route   GET /api/payments
// @access  Private
export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({
        path: 'ride',
        select: 'pickup destination distance fare status createdAt',
      })
      .sort('-createdAt');

    res.json(payments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mock payment gateway webhook handler
// @desc    Handle payment gateway callback
// @route   POST /api/payments/webhook
// @access  Public
export const handlePaymentWebhook = async (req, res) => {
  try {
    // In a real implementation, would verify webhook signature
    const { paymentId, status, transactionId } = req.body;

    const payment = await Payment.findById(paymentId);

    if (payment) {
      payment.status = status;
      payment.transactionId = transactionId;
      await payment.save();

      // Update ride payment status if payment successful
      if (status === 'completed') {
        await Ride.findByIdAndUpdate(payment.ride, {
          paymentStatus: 'completed',
        });
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } else {
      res.status(404);
      throw new Error('Payment not found');
    }
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(400).json({ message: error.message });
  }
};