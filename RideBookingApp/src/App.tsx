import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuth from './hooks/useAuth';

// Layout Components
import Layout from './components/layouts/Layout';
import ProtectedRoute from './components/layouts/ProtectedRoute';

// Pages (lazy loaded)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const RiderDashboard = lazy(() => import('./pages/rider/Dashboard'));
const BookingPage = lazy(() => import('./pages/customer/BookingPage'));
const RideDetailsPage = lazy(() => import('./pages/RideDetailsPage'));
const PaymentPage = lazy(() => import('./pages/customer/PaymentPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  const { isAuthenticated, isCustomer, isRider } = useAuth();

  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
            <Route path="register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute isAllowed={isAuthenticated} redirectPath="/login" />}>
              {/* Redirect based on user role */}
              <Route path="dashboard" element={
                isCustomer ? <Navigate to="/customer/dashboard" /> :
                isRider ? <Navigate to="/rider/dashboard" /> :
                <Navigate to="/" />
              } />
              
              {/* Customer Routes */}
              <Route element={<ProtectedRoute isAllowed={isCustomer} redirectPath="/dashboard" />}>
                <Route path="customer/dashboard" element={<CustomerDashboard />} />
                <Route path="book-ride" element={<BookingPage />} />
                <Route path="payment/:rideId" element={<PaymentPage />} />
              </Route>
              
              {/* Rider Routes */}
              <Route element={<ProtectedRoute isAllowed={isRider} redirectPath="/dashboard" />}>
                <Route path="rider/dashboard" element={<RiderDashboard />} />
              </Route>
              
              {/* Common Protected Routes */}
              <Route path="ride/:id" element={<RideDetailsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;