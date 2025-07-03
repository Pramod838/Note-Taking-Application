import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, LogOut, User, Sparkles, FileText, Calendar, Clock, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notesApi, Note } from '../lib/api';
import toast from 'react-hot-toast';
import NoteModal from '../components/NoteModal';

export default function DashboardPage() {
  const { user, signOut, isAuthenticated, getJWTToken, refreshSession } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
    loadJWTToken();
  }, []);

  const loadJWTToken = async () => {
    try {
      const token = await getJWTToken();
      setJwtToken(token);
    } catch (error) {
      console.error('Failed to get JWT token:', error);
    }
  };
  
  const loadNotes = async () => {
    try {
      setLoading(true);
      
      // Verify authentication before loading notes
      if (!isAuthenticated) {
        toast.error('Please log in to access your notes');
        return;
      }

      const data = await notesApi.getNotes();
      setNotes(data);
    } catch (error: any) {
      console.error('Failed to load notes:', error);
      
      // Handle JWT-specific errors
      if (error.message.includes('JWT') || error.message.includes('Authentication')) {
        toast.error('Session expired. Please log in again.');
        await signOut();
      } else {
        toast.error(error.message || 'Failed to load notes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (title: string, content: string) => {
    try {
      // Verify authentication before creating note
      if (!isAuthenticated) {
        toast.error('Please log in to create notes');
        return;
      }

      const newNote = await notesApi.createNote(title, content);
      setNotes([newNote, ...notes]);
      toast.success('Note created successfully');
      
      // Refresh JWT token info
      await loadJWTToken();
    } catch (error: any) {
      console.error('Failed to create note:', error);
      
      // Handle JWT-specific errors
      if (error.message.includes('JWT') || error.message.includes('Authentication')) {
        toast.error('Session expired. Please log in again.');
        await signOut();
      } else {
        toast.error(error.message || 'Failed to create note');
      }
    }
  };

  const handleUpdateNote = async (id: string, title: string, content: string) => {
    try {
      // Verify authentication before updating note
      if (!isAuthenticated) {
        toast.error('Please log in to update notes');
        return;
      }

      // Verify note ownership before updating
      const hasOwnership = await notesApi.verifyNoteOwnership(id);
      if (!hasOwnership) {
        toast.error('You can only edit your own notes');
        return;
      }

      const updatedNote = await notesApi.updateNote(id, title, content);
      setNotes(notes.map(note => note.id === id ? updatedNote : note));
      toast.success('Note updated successfully');
      
      // Refresh JWT token info
      await loadJWTToken();
    } catch (error: any) {
      console.error('Failed to update note:', error);
      
      // Handle JWT-specific errors
      if (error.message.includes('JWT') || error.message.includes('Authentication')) {
        toast.error('Session expired. Please log in again.');
        await signOut();
      } else {
        toast.error(error.message || 'Failed to update note');
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      // Verify authentication before deleting note
      if (!isAuthenticated) {
        toast.error('Please log in to delete notes');
        return;
      }

      // Verify note ownership before deleting
      const hasOwnership = await notesApi.verifyNoteOwnership(id);
      if (!hasOwnership) {
        toast.error('You can only delete your own notes');
        return;
      }

      await notesApi.deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
      toast.success('Note deleted successfully');
      
      // Refresh JWT token info
      await loadJWTToken();
    } catch (error: any) {
      console.error('Failed to delete note:', error);
      
      // Handle JWT-specific errors
      if (error.message.includes('JWT') || error.message.includes('Authentication')) {
        toast.error('Session expired. Please log in again.');
        await signOut();
      } else {
        toast.error(error.message || 'Failed to delete note');
      }
    }
  };

  const handleRefreshSession = async () => {
    try {
      await refreshSession();
      await loadJWTToken();
      await loadNotes();
    } catch (error) {
      // Error handled in context
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Error handled in context
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
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
    const initials: string = parts.map((n: string) => n[0] || '').join('').toUpperCase();
    return initials.slice(0, 2) || 'U';
  };
  
  
  

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">NotesApp</h1>
              {isAuthenticated && (
                <div className="flex items-center space-x-2 ml-4">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">JWT Secured</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Session Refresh Button */}
              <button
                onClick={handleRefreshSession}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title="Refresh Session"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              {/* User Info */}
              <div className="flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getUserInitials()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {getGreeting()}, {getUserDisplayName().split(' ')[0] || 'there'}! 👋
                </h2>
                <p className="text-gray-600 mb-4">
                  Welcome to your secure notes dashboard. All operations are JWT-protected!
                </p>
                
                {/* User Stats */}
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  {notes.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Last updated {getTimeAgo(notes[0]?.updated_at)}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">JWT Protected</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {getUserInitials()}
                </div>
              </div>
            </div>

            {/* JWT Token Info */}
            {jwtToken && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Active JWT Session</span>
                </div>
                <p className="text-xs text-green-700">
                  Token: {jwtToken.substring(0, 20)}...{jwtToken.substring(jwtToken.length - 10)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  All note operations are secured with this JWT token
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
            />
          </div>
          <button
            onClick={() => {
              setEditingNote(null);
              setIsModalOpen(true);
            }}
            disabled={!isAuthenticated}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5" />
            <span>New Note</span>
          </button>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse shadow-sm">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="mt-4 h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 max-w-md mx-auto">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {searchTerm ? 'No notes found' : 'Start your secure note-taking journey'}
              </h3>
              <p className="text-gray-600 mb-8">
                {searchTerm 
                  ? `No notes match "${searchTerm}". Try adjusting your search terms.` 
                  : 'Create your first JWT-protected note to capture your thoughts and ideas securely.'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setIsModalOpen(true);
                  }}
                  disabled={!isAuthenticated}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Your First Secure Note</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 group shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                    {note.title}
                  </h3>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => {
                        setEditingNote(note);
                        setIsModalOpen(true);
                      }}
                      disabled={!isAuthenticated}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit note (JWT protected)"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={!isAuthenticated}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete note (JWT protected)"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-4 mb-4 leading-relaxed">
                  {note.content || 'No content'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{getTimeAgo(note.updated_at)}</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Protected</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {notes.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Secure Notes Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{notes.length}</div>
                <div className="text-sm text-gray-600">Total Notes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.round(notes.reduce((acc, note) => acc + note.content.length, 0) / notes.length)}
                </div>
                <div className="text-sm text-gray-600">Avg. Characters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  {notes.filter(note => {
                    const daysDiff = Math.floor((new Date().getTime() - new Date(note.updated_at).getTime()) / (1000 * 60 * 60 * 24));
                    return daysDiff <= 7;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Updated This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
                <div className="text-sm text-gray-600">JWT Secured</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Note Modal */}
      <NoteModal
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setEditingNote(null);
  }}
  onSave={(id, title, content) => {
    if (editingNote) {
      return handleUpdateNote(id, title, content);
    } else {
      return handleCreateNote(title, content);
    }
  }}
  note={editingNote}
/>

    </div>
  );
}