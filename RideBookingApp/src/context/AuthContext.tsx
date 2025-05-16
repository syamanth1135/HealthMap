import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isRider: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isCustomer: false,
  isRider: false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // Check if token is expired
      try {
        const decodedToken = jwtDecode(parsedUser.token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          // Token expired, log out user
          logout();
        } else {
          setUser(parsedUser);
          // Set authorization header for all future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/users/login', { email, password });
      const userData = response.data;
      
      // Save user data to local storage
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Set authorization header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      setUser(userData);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/users', userData);
      const newUser = response.data;
      
      // Save user data to local storage
      localStorage.setItem('userData', JSON.stringify(newUser));
      
      // Set authorization header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${newUser.token}`;
      
      setUser(newUser);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove user data from local storage
    localStorage.removeItem('userData');
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
    
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'customer',
        isRider: user?.role === 'rider',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;