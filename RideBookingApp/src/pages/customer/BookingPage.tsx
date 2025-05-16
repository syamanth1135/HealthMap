import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { MapPin, Navigation, DollarSign, Clock } from 'lucide-react';
import api from '../../services/api';

interface BookingFormData {
  pickupAddress: string;
  destinationAddress: string;
  paymentMethod: 'cash' | 'card' | 'wallet';
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<BookingFormData>({
    defaultValues: {
      paymentMethod: 'cash',
    }
  });

  const pickupAddress = watch('pickupAddress');
  const destinationAddress = watch('destinationAddress');

  // Simulate distance and fare calculation
  const calculateRideDetails = () => {
    if (pickupAddress && destinationAddress) {
      // In a real app, this would use a maps API for accurate distance
      const randomDistance = Math.floor(Math.random() * 20) + 1; // 1-20 km
      setDistance(randomDistance);
      
      // Base fare + per km rate
      const baseFare = 50;
      const perKmRate = 12;
      const calculatedFare = baseFare + (randomDistance * perKmRate);
      setFare(calculatedFare);
      
      // Estimate time (3 mins per km)
      setEstimatedTime(randomDistance * 3);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    try {
      setLoading(true);
      
      if (!distance || !fare) {
        toast.error('Please get a fare estimate first');
        setLoading(false);
        return;
      }
      
      const rideData = {
        pickup: {
          address: data.pickupAddress,
          // In a real app, would include coordinates
          coordinates: { lat: 0, lng: 0 },
        },
        destination: {
          address: data.destinationAddress,
          // In a real app, would include coordinates
          coordinates: { lat: 0, lng: 0 },
        },
        distance,
        fare,
        paymentMethod: data.paymentMethod,
      };
      
      const response = await api.post('/api/rides', rideData);
      
      toast.success('Ride booked successfully!');
      navigate(`/ride/${response.data._id}`);
    } catch (error) {
      console.error('Error booking ride:', error);
      toast.error('Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Book a Ride</h1>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6">
            <div className="space-y-6">
              {/* Pickup Location */}
              <div>
                <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="pickupAddress"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter pickup address"
                    {...register('pickupAddress', { 
                      required: 'Pickup location is required',
                    })}
                  />
                </div>
                {errors.pickupAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.pickupAddress.message}</p>
                )}
              </div>
              
              {/* Destination */}
              <div>
                <label htmlFor="destinationAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Navigation className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="destinationAddress"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter destination address"
                    {...register('destinationAddress', { 
                      required: 'Destination is required',
                    })}
                  />
                </div>
                {errors.destinationAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.destinationAddress.message}</p>
                )}
              </div>
              
              {/* Get Fare Estimate Button */}
              <div>
                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={calculateRideDetails}
                  disabled={!pickupAddress || !destinationAddress}
                >
                  Get Fare Estimate
                </button>
              </div>
              
              {/* Fare Details */}
              {fare && distance && estimatedTime && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Ride Details</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Navigation className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-600">Distance</span>
                      </div>
                      <span className="font-medium">{distance} km</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-600">Estimated Time</span>
                      </div>
                      <span className="font-medium">{estimatedTime} mins</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-600">Total Fare</span>
                      </div>
                      <span className="text-xl font-bold text-blue-600">₹{fare.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="cash"
                      type="radio"
                      value="cash"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      {...register('paymentMethod')}
                    />
                    <label htmlFor="cash" className="ml-3 block text-sm font-medium text-gray-700">
                      Cash
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="card"
                      type="radio"
                      value="card"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      {...register('paymentMethod')}
                    />
                    <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                      Card
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="wallet"
                      type="radio"
                      value="wallet"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      {...register('paymentMethod')}
                    />
                    <label htmlFor="wallet" className="ml-3 block text-sm font-medium text-gray-700">
                      Wallet
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4">
            <button
              type="submit"
              disabled={loading || !fare}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Book Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;