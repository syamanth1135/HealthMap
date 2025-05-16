import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
      <AlertTriangle className="h-16 w-16 text-amber-500 mb-6" />
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-lg">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
        >
          Go to Home
        </Link>
        <Link
          to="/book-ride"
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center"
        >
          Book a Ride
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;