import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, Phone, FileText, ChevronLeft, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

interface Ride {
  _id: string;
  pickup: {
    address: string;
  };
  destination: {
    address: string;
  };
  distance: number;
  fare: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    _id: string;
    name: string;
    phone: string;
  };
  rider?: {
    _id: string;
    name: string;
    phone: string;
    profilePicture: string;
  };
}

const RideDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isCustomer, isRider } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await api.get(`/api/rides/${id}`);
        setRide(response.data);
      } catch (error) {
        console.error('Error fetching ride:', error);
        toast.error('Failed to load ride data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRide();
    }
  }, [id]);

  const cancelRide = async () => {
    try {
      await api.put(`/api/rides/${id}/cancel`);
      toast.success('Ride cancelled successfully');
      setRide(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (error) {
      console.error('Error cancelling ride:', error);
      toast.error('Failed to cancel ride');
    }
  };

  const updateRideStatus = async (status: string) => {
    try {
      await api.put(`/api/rides/${id}/status`, { status });
      toast.success(`Ride status updated to ${status}`);
      setRide(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      console.error('Error updating ride status:', error);
      toast.error('Failed to update ride status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Pending</span>;
      case 'accepted':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Accepted</span>;
      case 'arrived':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">Driver Arrived</span>;
      case 'inProgress':
        return <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">In Progress</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Pending</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Paid</span>;
      case 'failed':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Failed</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getNextAction = () => {
    if (!ride) return null;
    
    if (isCustomer) {
      if (ride.status === 'completed' && ride.paymentStatus === 'pending' && ride.paymentMethod !== 'cash') {
        return (
          <Link
            to={`/payment/${ride._id}`}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Make Payment
          </Link>
        );
      }
      
      if ((ride.status === 'pending' || ride.status === 'accepted') && ride.paymentStatus !== 'completed') {
        return (
          <button
            onClick={cancelRide}
            className="w-full flex justify-center items-center py-2 px-4 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel Ride
          </button>
        );
      }
    }
    
    if (isRider) {
      switch (ride.status) {
        case 'accepted':
          return (
            <button
              onClick={() => updateRideStatus('arrived')}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Mark as Arrived
            </button>
          );
        case 'arrived':
          return (
            <button
              onClick={() => updateRideStatus('inProgress')}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Clock className="mr-2 h-4 w-4" />
              Start Ride
            </button>
          );
        case 'inProgress':
          return (
            <button
              onClick={() => updateRideStatus('completed')}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <FileText className="mr-2 h-4 w-4" />
              Complete Ride
            </button>
          );
        default:
          return null;
      }
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-8 rounded-lg text-center max-w-md mx-auto">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Ride Not Found</h2>
          <p className="text-red-600 mb-6">The ride you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back
      </button>
      
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ride Details</h1>
        {getStatusBadge(ride.status)}
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-gray-500">Ride ID</p>
              <p className="font-medium">#{ride._id.substring(0, 8)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{formatDate(ride.createdAt)}</p>
            </div>
          </div>
          
          <div className="space-y-6 mb-6">
            <div>
              <div className="flex items-start mb-4">
                <div className="mt-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">Pickup</div>
                  <div className="font-medium">{ride.pickup.address}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mt-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                </div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">Destination</div>
                  <div className="font-medium">{ride.destination.address}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Distance</p>
                <p className="font-medium">{ride.distance} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fare</p>
                <p className="font-bold text-lg">₹{ride.fare.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">{ride.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <div className="mt-1">{getPaymentStatusBadge(ride.paymentStatus)}</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-medium mb-4">People</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{ride.customer.name}</p>
                      <p className="text-sm text-gray-500">Customer</p>
                    </div>
                    {isRider && (
                      <a 
                        href={`tel:${ride.customer.phone}`}
                        className="p-2 bg-green-100 rounded-full text-green-600 hover:bg-green-200"
                      >
                        <Phone className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {ride.rider && (
                <div className="flex items-start pt-4 border-t border-gray-100">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      {ride.rider.profilePicture ? (
                        <img 
                          src={ride.rider.profilePicture} 
                          alt={ride.rider.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{ride.rider.name}</p>
                        <p className="text-sm text-gray-500">Rider</p>
                      </div>
                      {isCustomer && ride.status !== 'completed' && ride.status !== 'cancelled' && (
                        <a 
                          href={`tel:${ride.rider.phone}`}
                          className="p-2 bg-green-100 rounded-full text-green-600 hover:bg-green-200"
                        >
                          <Phone className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4">
          {getNextAction()}
        </div>
      </div>
      
      {/* Ride Timeline */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium">Ride Timeline</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="w-0.5 h-full bg-gray-200"></div>
              </div>
              <div>
                <p className="font-medium">Ride Created</p>
                <p className="text-sm text-gray-500">{formatDate(ride.createdAt)}</p>
              </div>
            </div>
            
            {ride.status !== 'pending' && ride.status !== 'cancelled' && (
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="w-0.5 h-full bg-gray-200"></div>
                </div>
                <div>
                  <p className="font-medium">Ride Accepted</p>
                  <p className="text-sm text-gray-500">Rider assigned: {ride.rider?.name}</p>
                </div>
              </div>
            )}
            
            {ride.status === 'arrived' || ride.status === 'inProgress' || ride.status === 'completed' ? (
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <div className="w-0.5 h-full bg-gray-200"></div>
                </div>
                <div>
                  <p className="font-medium">Rider Arrived</p>
                  <p className="text-sm text-gray-500">At pickup location</p>
                </div>
              </div>
            ) : null}
            
            {ride.status === 'inProgress' || ride.status === 'completed' ? (
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <div className="w-0.5 h-full bg-gray-200"></div>
                </div>
                <div>
                  <p className="font-medium">Ride Started</p>
                  <p className="text-sm text-gray-500">On the way to destination</p>
                </div>
              </div>
            ) : null}
            
            {ride.status === 'completed' ? (
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="w-0.5 h-full bg-gray-200 hidden"></div>
                </div>
                <div>
                  <p className="font-medium">Ride Completed</p>
                  <p className="text-sm text-gray-500">Arrived at destination</p>
                </div>
              </div>
            ) : null}
            
            {ride.status === 'cancelled' ? (
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-0.5 h-full bg-gray-200 hidden"></div>
                </div>
                <div>
                  <p className="font-medium">Ride Cancelled</p>
                  <p className="text-sm text-gray-500">The ride was cancelled</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideDetailsPage;