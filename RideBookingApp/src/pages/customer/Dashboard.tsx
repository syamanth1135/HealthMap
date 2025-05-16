import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, AlertCircle, CheckCircle, Calendar, MoreHorizontal, ChevronRight } from 'lucide-react';
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
  rider?: {
    name: string;
    phone: string;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await api.get('/api/rides');
        setRides(response.data);
        
        // Check if there's an active ride (not completed or cancelled)
        const active = response.data.find(
          (ride: Ride) => 
            ride.status !== 'completed' && 
            ride.status !== 'cancelled'
        );
        setActiveRide(active || null);
      } catch (error) {
        console.error('Error fetching rides:', error);
        toast.error('Failed to load ride data');
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const cancelRide = async (rideId: string) => {
    try {
      await api.put(`/api/rides/${rideId}/cancel`);
      toast.success('Ride cancelled successfully');
      
      // Update rides list
      setRides(rides.map(ride => 
        ride._id === rideId 
          ? { ...ride, status: 'cancelled' } 
          : ride
      ));
      
      // Update active ride
      if (activeRide && activeRide._id === rideId) {
        setActiveRide(null);
      }
    } catch (error) {
      console.error('Error cancelling ride:', error);
      toast.error('Failed to cancel ride');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
      case 'accepted':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Accepted</span>;
      case 'arrived':
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">Driver Arrived</span>;
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
      
      {/* Quick actions */}
      <div className="bg-blue-600 text-white rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Need a ride?</h2>
        <p className="mb-6">Book a ride instantly and get to your destination safely.</p>
        <Link
          to="/book-ride"
          className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold transition-colors hover:bg-blue-50"
        >
          Book Now
          <ChevronRight className="ml-2" size={18} />
        </Link>
      </div>
      
      {/* Active Ride Card */}
      {activeRide && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Ride</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center mb-2">
                    {getStatusBadge(activeRide.status)}
                    <span className="ml-2 text-sm text-gray-500">{formatDate(activeRide.createdAt)}</span>
                  </div>
                  <h3 className="text-lg font-semibold">Ride #{activeRide._id.substring(0, 8)}</h3>
                </div>
                <div className="text-xl font-bold text-blue-600">₹{activeRide.fare.toFixed(2)}</div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm text-gray-500">Pickup</div>
                    <div className="font-medium">{activeRide.pickup.address}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm text-gray-500">Destination</div>
                    <div className="font-medium">{activeRide.destination.address}</div>
                  </div>
                </div>
                
                {activeRide.rider && (
                  <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">{activeRide.rider.name.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">{activeRide.rider.name}</div>
                      <div className="text-sm text-gray-500">{activeRide.rider.phone}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-between">
              <Link
                to={`/ride/${activeRide._id}`}
                className="text-blue-600 font-medium hover:text-blue-800"
              >
                View Details
              </Link>
              
              {(activeRide.status === 'pending' || activeRide.status === 'accepted') && (
                <button
                  onClick={() => cancelRide(activeRide._id)}
                  className="text-red-600 font-medium hover:text-red-800"
                >
                  Cancel Ride
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Ride History */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Rides</h2>
        
        {rides.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rides yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't taken any rides yet. Book your first ride now!
            </p>
            <Link
              to="/book-ride"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Book a Ride
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {rides.slice(0, 5).map((ride) => (
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
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            
            {rides.length > 5 && (
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
                <p className="text-2xl font-bold text-gray-900">{rides.length}</p>
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
                  {rides.filter(ride => ride.status === 'completed').length}
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
                <p className="text-sm text-gray-500">Cancelled Rides</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rides.filter(ride => ride.status === 'cancelled').length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;