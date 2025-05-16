import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Camera, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  password?: string;
  confirmPassword?: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    setValue,
    watch,
    formState: { errors } 
  } = useForm<ProfileFormData>();

  const password = watch('password', '');

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('phone', user.phone);
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      
      // Check if passwords match if changing password
      if (data.password && data.password !== data.confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }
      
      // Remove confirmPassword from data sent to API
      const { confirmPassword, ...updateData } = data;
      
      // Only include password if it was provided
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await api.put('/api/users/profile', updateData);
      toast.success('Profile updated successfully');
      
      // If password was updated, logout user
      if (data.password) {
        setTimeout(() => {
          toast.success('Please login again with your new password');
          logout();
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Profile</h1>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-blue-600 text-white">
          <h2 className="text-xl font-semibold">Account Information</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6">
            {/* Profile Picture */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-blue-600" />
                  )}
                </div>
                <label htmlFor="profilePicture" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer">
                  <Camera className="h-4 w-4" />
                  <input 
                    type="file" 
                    id="profilePicture"
                    className="hidden"
                    // In a real app, would handle upload here
                  />
                </label>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your full name"
                    {...register('name', { 
                      required: 'Full name is required',
                    })}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your email address"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your phone number"
                    {...register('phone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Please enter a valid 10-digit phone number'
                      }
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
              
              {/* Role Info */}
              <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Account Type</p>
                  <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                </div>
              </div>
              
              {/* Change Password Toggle */}
              <div>
                <button
                  type="button"
                  className="text-blue-600 font-medium text-sm hover:text-blue-800"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                >
                  {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
                </button>
              </div>
              
              {/* Password Fields (Conditional) */}
              {showPasswordFields && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new password"
                        {...register('password', { 
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm new password"
                      {...register('confirmPassword', { 
                        validate: value => 
                          !password || value === password || 'The passwords do not match'
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Delete Account */}
      <div className="mt-8 text-center">
        <button
          type="button"
          className="text-red-600 font-medium hover:text-red-800"
        >
          Delete Account
        </button>
        <p className="text-gray-500 text-sm mt-1">
          This action cannot be undone. All your data will be permanently deleted.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;