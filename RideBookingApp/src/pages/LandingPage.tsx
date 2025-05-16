import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Shield, Clock, CreditCard } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1426516/pexels-photo-1426516.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Quick, Safe & Affordable Rides at Your Fingertips
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Book a ride in seconds, reach your destination in minutes. Experience the fastest ride booking service in town.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center"
              >
                Get Started <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                to="/about"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 0L60 10C120 20 240 40 360 50C480 60 600 60 720 50C840 40 960 20 1080 15C1200 10 1320 20 1380 25L1440 30V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose RideQuick?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience a seamless ride booking service with features designed to make your journey comfortable and worry-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center transition-transform hover:transform hover:scale-105">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Booking</h3>
              <p className="text-gray-600">
                Book a ride in seconds with just a few taps. No complicated forms or processes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center transition-transform hover:transform hover:scale-105">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Safe Rides</h3>
              <p className="text-gray-600">
                All our riders are verified and trained to ensure your safety throughout the journey.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center transition-transform hover:transform hover:scale-105">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Tracking</h3>
              <p className="text-gray-600">
                Track your ride in real-time and share your journey details with friends and family.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center transition-transform hover:transform hover:scale-105">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Payments</h3>
              <p className="text-gray-600">
                Multiple payment options including cash, card, and digital wallets for your convenience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Book your ride in 3 simple steps and get moving quickly
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-8 text-center shadow-md flex-1 h-full">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Set Your Location</h3>
              <p className="text-gray-600">
                Choose your pickup and drop-off locations on the map or enter addresses manually.
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-blue-300">
              <ArrowRight size={32} />
            </div>
            <div className="block md:hidden text-blue-300 -rotate-90">
              <ArrowRight size={32} />
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-8 text-center shadow-md flex-1 h-full">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Book Your Ride</h3>
              <p className="text-gray-600">
                Confirm your ride details, choose payment method, and request a pickup.
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-blue-300">
              <ArrowRight size={32} />
            </div>
            <div className="block md:hidden text-blue-300 -rotate-90">
              <ArrowRight size={32} />
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-8 text-center shadow-md flex-1 h-full">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enjoy Your Ride</h3>
              <p className="text-gray-600">
                Track your rider's arrival, enjoy your journey, and pay easily when you arrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-24 bg-blue-600 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Download Our App</h2>
              <p className="text-xl mb-8 text-blue-100 max-w-lg">
                Get the RideQuick app for a better experience. Book rides, track your driver, and manage payments - all from your smartphone.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center hover:bg-gray-900 transition-colors">
                  <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5227 7.39069C17.4042 7.47683 15.1262 8.73156 15.1262 11.4583C15.2496 14.6905 17.9723 15.786 18 15.8066C17.9897 15.8406 17.6773 17.0066 16.7501 18.209C16.0008 19.2872 15.2001 20.3654 13.9262 20.3654C12.6599 20.3654 12.2788 19.6369 10.8686 19.6369C9.54021 19.6369 8.92268 20.3654 7.74692 20.3654C6.47844 20.3654 5.64268 19.3386 4.80691 18.1897C3.7776 16.7595 2.93605 14.4461 2.9204 12.2183C2.90475 10.9955 3.19866 9.79319 3.91312 8.79316C4.84454 7.49252 6.47014 6.63996 8.2089 6.62431C9.42814 6.60866 10.542 7.44556 11.3161 7.44556C12.0556 7.44556 13.4644 6.62431 14.9261 6.62431C15.5961 6.62431 17.1714 6.71045 18.2471 8.08599C18.1661 8.13421 17.6414 8.42234 17.5227 7.39069ZM12.1249 4.31321C12.6985 3.64166 13.5858 3.19914 14.342 3.16349C14.445 4.05397 14.1057 4.9601 13.5475 5.63087C12.9996 6.32028 12.177 6.79139 11.3467 6.70524C11.2258 5.8304 11.6261 4.92426 12.1249 4.31321Z" />
                  </svg>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </button>
                <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center hover:bg-gray-900 transition-colors">
                  <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.26349 0C2.91965 0 2.63281 0.286849 2.63281 0.630681V23.3692C2.63281 23.7131 2.91965 23.9999 3.26349 23.9999H20.7359C21.0797 23.9999 21.3666 23.7131 21.3666 23.3692V0.630681C21.3666 0.286849 21.0797 0 20.7359 0H3.26349ZM11.9997 19.2001C11.2258 19.2001 10.5997 18.5739 10.5997 17.8001C10.5997 17.0262 11.2258 16.4001 11.9997 16.4001C12.7735 16.4001 13.3997 17.0262 13.3997 17.8001C13.3997 18.5739 12.7735 19.2001 11.9997 19.2001ZM6.8132 2.80011H17.1861C17.5299 2.80011 17.8167 3.08696 17.8167 3.43079V15.7692C17.8167 16.113 17.5299 16.3999 17.1861 16.3999H6.8132C6.46937 16.3999 6.18252 16.113 6.18252 15.7692V3.43079C6.18252 3.08696 6.46937 2.80011 6.8132 2.80011Z" />
                  </svg>
                  <div>
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <img
                src="https://images.pexels.com/photos/5076516/pexels-photo-5076516.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Mobile App"
                className="max-w-full h-auto rounded-xl shadow-2xl md:max-w-md"
              />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-500 transform -skew-x-12 translate-x-1/2 z-0"></div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 rounded-2xl p-10 md:p-16 text-center max-w-5xl mx-auto shadow-lg border border-gray-100">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready for Your Next Ride?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of happy customers who use RideQuick every day for their travel needs.
            </p>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg inline-block transition-colors"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;