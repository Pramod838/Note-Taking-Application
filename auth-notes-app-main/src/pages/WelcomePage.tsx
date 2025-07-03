import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Clock, Shield, Sparkles, ArrowRight, FileText, Plus, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notesApi } from '../lib/api';
import toast from 'react-hot-toast';

export default function WelcomePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    totalNotes: 0,
    recentActivity: '',
    joinDate: '',
    lastLogin: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    loadUserStats();
  }, [user, isAuthenticated, navigate]);

  const loadUserStats = async () => {
    try {
      const notes = await notesApi.getNotes();
      const userInfo = await notesApi.getCurrentUser();
      
      setUserStats({
        totalNotes: notes.length,
        recentActivity: notes.length > 0 ? `Last note updated ${getTimeAgo(notes[0].updated_at)}` : 'No recent activity',
        joinDate: new Date(userInfo.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        lastLogin: userInfo.lastSignIn ? new Date(userInfo.lastSignIn).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'First time login',
      });
    } catch (error: any) {
      console.error('Failed to load user stats:', error);
      toast.error('Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `on ${new Date(dateString).toLocaleDateString()}`;
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserInitials = (): string => {
    const name: string = getUserDisplayName() || '';
    const parts: string[] = name.trim().split(' ').filter(Boolean);
    const initials: string = parts.map((n: string) => n?.[0] || '').join('').toUpperCase();
    return initials.slice(0, 2) || 'U';
  };
  

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Main Welcome Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-bold">
                      {getUserInitials()}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold mb-1">
                        {getGreeting()}, {getUserDisplayName().split(' ')[0]}! 🎉
                      </h1>
                      <p className="text-blue-100 text-lg">
                        Welcome to your secure notes workspace
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Sparkles className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-blue-200" />
                    <div className="text-2xl font-bold">{userStats.totalNotes}</div>
                    <div className="text-sm text-blue-200">Notes</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-green-200" />
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm text-green-200">Secure</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Activity className="h-6 w-6 mx-auto mb-2 text-purple-200" />
                    <div className="text-2xl font-bold">JWT</div>
                    <div className="text-sm text-purple-200">Protected</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-yellow-200" />
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-yellow-200">Available</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              {/* User Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="h-6 w-6 mr-3 text-blue-600" />
                  Your Account Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Email Address</h3>
                        <p className="text-sm text-gray-600">Your account identifier</p>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Verified</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Full Name</h3>
                        <p className="text-sm text-gray-600">Your display name</p>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Initials: <span className="font-medium">{getUserInitials()}</span>
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-emerald-500 rounded-lg">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Member Since</h3>
                        <p className="text-sm text-gray-600">Account creation date</p>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-gray-900">{userStats.joinDate}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Welcome to the community! 🎉
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Last Login</h3>
                        <p className="text-sm text-gray-600">Recent activity</p>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-gray-900">{userStats.lastLogin}</p>
                    <p className="text-sm text-gray-500 mt-1">{userStats.recentActivity}</p>
                  </div>
                </div>
              </div>

              {/* Features Overview */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Sparkles className="h-6 w-6 mr-3 text-purple-600" />
                  What You Can Do
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="p-3 bg-blue-100 rounded-xl w-fit mb-4">
                      <Plus className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Notes</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Write and organize your thoughts with our intuitive note editor. All notes are automatically saved and secured.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="p-3 bg-purple-100 rounded-xl w-fit mb-4">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">JWT Security</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Your data is protected with industry-standard JWT authentication. Only you can access your notes.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="p-3 bg-emerald-100 rounded-xl w-fit mb-4">
                      <Activity className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Sync</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Your notes are synchronized in real-time across all your devices with automatic backup.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={handleContinueToDashboard}
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg font-semibold"
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <p className="text-gray-500 text-sm mt-4">
                  Ready to start creating and managing your secure notes
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Security Features</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>JWT Token Authentication</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Row Level Security (RLS)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Encrypted Data Storage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Automatic Session Management</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Note Features</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Rich Text Editing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Real-time Search</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Auto-save Functionality</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Responsive Design</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}