import Ride from '../models/rideModel.js';
import User from '../models/userModel.js';

// @desc    Create a new ride
// @route   POST /api/rides
// @access  Private/Customer
export const createRide = async (req, res) => {
  try {
    const {
      pickup,
      destination,
      distance,
      fare,
      paymentMethod,
    } = req.body;

    const ride = await Ride.create({
      customer: req.user._id,
      pickup,
      destination,
      distance,
      fare,
      paymentMethod,
    });

    // Find available riders and assign one (in a real app would use geolocation)
    const availableRider = await User.findOne({ role: 'rider' });
    
    if (availableRider) {
      ride.rider = availableRider._id;
      ride.status = 'accepted';
      await ride.save();
    }

    res.status(201).json(ride);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user rides
// @route   GET /api/rides
// @access  Private
export const getUserRides = async (req, res) => {
  try {
    let rides;
    
    if (req.user.role === 'customer') {
      rides = await Ride.find({ customer: req.user._id })
        .populate('rider', 'name phone profilePicture')
        .sort('-createdAt');
    } else if (req.user.role === 'rider') {
      rides = await Ride.find({ rider: req.user._id })
        .populate('customer', 'name phone')
        .sort('-createdAt');
    }

    res.json(rides);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get ride by ID
// @route   GET /api/rides/:id
// @access  Private
export const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('customer', 'name phone')
      .populate('rider', 'name phone profilePicture');

    if (ride) {
      // Ensure user has permission
      if (
        req.user.role === 'customer' && ride.customer._id.toString() !== req.user._id.toString() ||
        req.user.role === 'rider' && ride.rider && ride.rider._id.toString() !== req.user._id.toString()
      ) {
        res.status(403);
        throw new Error('Not authorized to access this ride');
      }

      res.json(ride);
    } else {
      res.status(404);
      throw new Error('Ride not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update ride status
// @route   PUT /api/rides/:id/status
// @access  Private/Rider
export const updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (ride) {
      if (req.user.role !== 'rider' || ride.rider.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this ride');
      }

      ride.status = status;
      
      // If ride is completed, update payment status
      if (status === 'completed' && ride.paymentMethod === 'cash') {
        ride.paymentStatus = 'completed';
      }

      const updatedRide = await ride.save();
      res.json(updatedRide);
    } else {
      res.status(404);
      throw new Error('Ride not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel a ride
// @route   PUT /api/rides/:id/cancel
// @access  Private/Customer
export const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (ride) {
      // Ensure it's the customer who's cancelling
      if (ride.customer.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to cancel this ride');
      }

      // Only allow cancellation for pending or accepted rides
      if (ride.status !== 'pending' && ride.status !== 'accepted') {
        res.status(400);
        throw new Error('Cannot cancel a ride that is already in progress or completed');
      }

      ride.status = 'cancelled';
      const updatedRide = await ride.save();
      res.json(updatedRide);
    } else {
      res.status(404);
      throw new Error('Ride not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};