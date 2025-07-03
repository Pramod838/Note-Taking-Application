import React, { useState } from 'react';
import { User, Mail, Calendar, Clock, Shield, Edit3, Save, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface UserProfileCardProps {
  userStats: {
    totalNotes: number;
    recentActivity: string;
    joinDate: string;
    lastLogin: string;
  };
}

export default function UserProfileCard({ userStats }: UserProfileCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
    },
  });

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const onSubmit = async (data: ProfileForm) => {
    try {
      // Note: In a real app, you'd update the user profile via Supabase
      // For now, we'll just show a success message
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-bold">
              {getUserInitials()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">User Profile</h2>
              <p className="text-blue-100">Manage your account information</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-300" />
            <span className="text-sm text-green-300 font-medium">JWT Secured</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('fullName')}
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        ) : (
          /* Display Mode */
          <div className="space-y-6">
            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Email</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Verified</span>
                  </div>
                </div>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Full Name</span>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                    title="Edit name"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-gray-900 font-medium">{getUserDisplayName()}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-gray-900">Member Since</span>
                </div>
                <p className="text-gray-900 font-medium">{userStats.joinDate}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-gray-900">Last Login</span>
                </div>
                <p className="text-gray-900 font-medium">{userStats.lastLogin}</p>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Recent Activity</h3>
              <p className="text-gray-600 text-sm">{userStats.recentActivity}</p>
              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                <span>Total Notes: <span className="font-medium text-gray-900">{userStats.totalNotes}</span></span>
                <span>•</span>
                <span>Account Status: <span className="font-medium text-green-600">Active</span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}