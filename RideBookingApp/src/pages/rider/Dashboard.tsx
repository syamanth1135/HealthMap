import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, CheckCircle, X, PhoneCall } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

interface Ride {
  _id: string;
  pickup: {
    address: string;
  };
  destination: {
    address: string;
  };
  fare: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeRides, setActiveRides] = useState<Ride[]>([]);
  const [pastRides, setPastRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await api.get('/api/rides');
        const allRides = response.data;
        
        // Split rides into active and past
        const active = allRides.filter(
          (ride: Ride) => 
            ride.status !== 'completed' && 
            ride.status !== 'cancelled'
        );
        
        const past = allRides.filter(
          (ride: Ride) => 
            ride.status === 'completed' || 
            ride.status === 'cancelled'
        );
        
        setActiveRides(active);
        setPastRides(past);
      } catch (error) {
        console.error('Error fetching rides:', error);
        toast.error('Failed to load ride data');
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const updateRideStatus = async (rideId: string, status: string) => {
    try {
      await api.put(`/api/rides/${rideId}/status`, { status });
      toast.success(`Ride status updated to ${status}`);
      
      // Update rides lists
      setActiveRides(activeRides.map(ride => 
        ride._id === rideId 
          ? { ...ride, status } 
          : ride
      ));
      
      // If completed, move to past rides
      if (status === 'completed') {
        const completedRide = activeRides.find(ride => ride._id === rideId);
        if (completedRide) {
          const updatedRide = { ...completedRide, status };
          setPastRides([updatedRide, ...pastRides]);
          setActiveRides(activeRides.filter(ride => ride._id !== rideId));
        }
      }
    } catch (error) {
      console.error('Error updating ride status:', error);
      toast.error('Failed to update ride status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
      case 'accepted':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Accepted</span>;
      case 'arrived':
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">Arrived</span>;
      case 'inProgress':
        return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">In Progress</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
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

  const getNextStatusButton = (ride: Ride) => {
    switch (ride.status) {
      case 'accepted':
        return (
          <button
            onClick={() => updateRideStatus(ride._id, 'arrived')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Mark as Arrived
          </button>
        );
      case 'arrived':
        return (
          <button
            onClick={() => updateRideStatus(ride._id, 'inProgress')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Start Ride
          </button>
        );
      case 'inProgress':
        return (
          <button
            onClick={() => updateRideStatus(ride._id, 'completed')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Complete Ride
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome, {user?.name}</h1>
      
      {/* Summary Card */}
      <div className="bg-blue-600 text-white rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold mb-1">Rider Dashboard</h2>
            <p>Manage your rides and track your earnings</p>
          </div>
          <div className="flex flex-col md:items-end">
            <span className="text-sm text-blue-100">Today's Earnings</span>
            <span className="text-2xl font-bold">
              ₹{pastRides.filter(ride => 
                new Date(ride.createdAt).toDateString() === new Date().toDateString() && 
                ride.status === 'completed'
              ).reduce((total, ride) => total + ride.fare, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Active Rides */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Rides</h2>
        
        {activeRides.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <Clock className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active rides</h3>
            <p className="text-gray-500">
              You don't have any active rides at the moment. Check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeRides.map((ride) => (
              <div key={ride._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        {getStatusBadge(ride.status)}
                        <span className="ml-2 text-sm text-gray-500">{formatDate(ride.createdAt)}</span>
                      </div>
                      <h3 className="text-lg font-semibold">Ride #{ride._id.substring(0, 8)}</h3>
                    </div>
                    <div className="text-xl font-bold text-blue-600">₹{ride.fare.toFixed(2)}</div>
                  </div>
                  
                  <div className="space-y-4 mb-4">
                    <div className="flex items-start">
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
                  
                  <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">{ride.customer.name.charAt(0)}</span>
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="font-medium">{ride.customer.name}</div>
                      <div className="text-sm text-gray-500">{ride.customer.phone}</div>
                    </div>
                    <a 
                      href={`tel:${ride.customer.phone}`}
                      className="p-2 bg-green-100 rounded-full text-green-600 hover:bg-green-200"
                    >
                      <PhoneCall className="h-5 w-5" />
                    </a>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <Link
                    to={`/ride/${ride._id}`}
                    className="text-blue-600 font-medium hover:text-blue-800"
                  >
                    View Details
                  </Link>
                  
                  {getNextStatusButton(ride)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Ride History */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Rides</h2>
        
        {pastRides.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No completed rides</h3>
            <p className="text-gray-500">
              You haven't completed any rides yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {pastRides.slice(0, 5).map((ride) => (
                <li key={ride._id} className="hover:bg-gray-50">
                  <Link to={`/ride/${ride._id}`} className="block">
                    <div className="px-6 py-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          {getStatusBadge(ride.status)}
                          <span className="ml-2 text-sm text-gray-500">{formatDate(ride.createdAt)}</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">₹{ride.fare.toFixed(2)}</div>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="truncate max-w-xs">{ride.pickup.address} → {ride.destination.address}</span>
                      </div>
                      
                      <div className="flex items-center text-sm mt-1 text-gray-500">
                        <span>Customer: {ride.customer.name}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            
            {pastRides.length > 5 && (
              <div className="bg-gray-50 px-6 py-3 text-center">
                <Link to="/rides" className="text-blue-600 font-medium hover:text-blue-800">
                  View All Rides
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Quick Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Rides</p>
                <p className="text-2xl font-bold text-gray-900">{activeRides.length + pastRides.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed Rides</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pastRides.filter(ride => ride.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{pastRides
                    .filter(ride => ride.status === 'completed')
                    .reduce((total, ride) => total + ride.fare, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-yellow-600"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;