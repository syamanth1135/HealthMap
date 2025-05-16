import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';

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
}

const PaymentPage: React.FC = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await api.get(`/api/rides/${rideId}`);
        setRide(response.data);
        // Set default payment method from ride
        if (response.data.paymentMethod) {
          setPaymentMethod(response.data.paymentMethod);
        }
      } catch (error) {
        console.error('Error fetching ride:', error);
        toast.error('Failed to load ride data');
      } finally {
        setLoading(false);
      }
    };

    if (rideId) {
      fetchRide();
    }
  }, [rideId]);

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };

  const formatExpiry = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2');
  };

  const processPayment = async () => {
    try {
      setPaymentLoading(true);
      
      // Validate card details if card payment
      if (paymentMethod === 'card') {
        const { cardNumber, cardName, expiry, cvv } = cardDetails;
        
        if (!cardNumber || !cardName || !expiry || !cvv) {
          toast.error('Please fill in all card details');
          setPaymentLoading(false);
          return;
        }
        
        // Basic validation
        if (cardNumber.replace(/\s/g, '').length !== 16) {
          toast.error('Please enter a valid 16-digit card number');
          setPaymentLoading(false);
          return;
        }
        
        if (cvv.length < 3) {
          toast.error('Please enter a valid CVV');
          setPaymentLoading(false);
          return;
        }
      }
      
      // In a real app, this would interact with a payment gateway
      // Here we'll simulate a successful payment
      const transactionId = 'txn_' + Math.random().toString(36).substring(2, 12);
      
      // Process payment through our API
      await api.post('/api/payments', {
        rideId,
        paymentMethod,
        transactionId,
      });
      
      toast.success('Payment processed successfully!');
      navigate(`/ride/${rideId}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
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
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <h2 className="text-xl font-semibold text-red-700">Ride Not Found</h2>
          <p className="text-red-600 mt-2">The ride you're looking for doesn't exist or you don't have access.</p>
        </div>
      </div>
    );
  }

  // Don't show payment page if already paid
  if (ride.paymentStatus === 'completed') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-green-50 p-8 rounded-lg text-center">
          <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-green-700">Payment Already Completed</h2>
          <p className="text-green-600 mt-2 mb-6">This ride has already been paid for.</p>
          <button
            onClick={() => navigate(`/ride/${rideId}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Ride Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment</h1>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Ride Summary</h2>
            <span className="text-xl font-bold text-blue-600">₹{ride.fare.toFixed(2)}</span>
          </div>
          
          <div className="space-y-3 mb-6">
            <div>
              <p className="text-sm text-gray-500">From</p>
              <p className="font-medium">{ride.pickup.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">To</p>
              <p className="font-medium">{ride.destination.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Distance</p>
              <p className="font-medium">{ride.distance} km</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <input
                  id="card"
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="card" className="ml-3 flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Credit/Debit Card</span>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="wallet"
                  type="radio"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={() => setPaymentMethod('wallet')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="wallet" className="ml-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Wallet</span>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="cash"
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="cash" className="ml-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Cash</span>
                </label>
              </div>
            </div>
            
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardDetails.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      setCardDetails({...cardDetails, cardNumber: formatted});
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    placeholder="John Doe"
                    value={cardDetails.cardName}
                    onChange={handleCardDetailsChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiry"
                      name="expiry"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardDetails.expiry}
                      onChange={(e) => {
                        const formatted = formatExpiry(e.target.value);
                        setCardDetails({...cardDetails, expiry: formatted});
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="w-1/3">
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      maxLength={4}
                      value={cardDetails.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setCardDetails({...cardDetails, cvv: value});
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {paymentMethod === 'wallet' && (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <svg className="h-12 w-12 text-blue-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-600">Your wallet balance: <span className="font-bold">₹500.00</span></p>
                <p className="text-sm text-gray-500 mt-1">Amount will be deducted from your wallet balance</p>
              </div>
            )}
            
            {paymentMethod === 'cash' && (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <svg className="h-12 w-12 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600">You'll pay ₹{ride.fare.toFixed(2)} in cash to the rider</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4">
          <button
            onClick={processPayment}
            disabled={paymentLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paymentLoading ? 'Processing...' : `Pay ₹${ride.fare.toFixed(2)}`}
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Your payment information is secure and encrypted</p>
      </div>
    </div>
  );
};

export default PaymentPage;