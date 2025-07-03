import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Type } from 'lucide-react';
import { Note } from '../lib/api';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, title: string, content: string) => Promise<void>;
  note?: Note | null;
}

export default function NoteModal({ isOpen, onClose, onSave, note }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note, isOpen]);

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(content.length);
  }, [content]);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      if (note) {
        await onSave(note.id, title.trim(), content.trim());
      } else {
        await onSave('', title.trim(), content.trim());
      }
      onClose();
    } catch (error) {
      // Error handled in parent component
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {note ? 'Edit Note' : 'Create New Note'}
                </h2>
                <p className="text-sm text-gray-600">
                  {note ? 'Update your note content' : 'Capture your thoughts and ideas'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all duration-200"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 p-6 overflow-y-auto" onKeyDown={handleKeyDown}>
            <div className="space-y-6">
              {/* Title Input */}
              <div>
                <label htmlFor="title" className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <Type className="h-4 w-4 mr-2" />
                  Note Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your note..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                  autoFocus
                  maxLength={100}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {title.length}/100 characters
                </div>
              </div>

              {/* Content Textarea */}
              <div>
                <label htmlFor="content" className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <FileText className="h-4 w-4 mr-2" />
                  Note Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note content here... You can use Ctrl+Enter to save quickly."
                  rows={16}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none leading-relaxed"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>{wordCount} words</span>
                    <span>{charCount} characters</span>
                  </div>
                  <span className="text-gray-400">Ctrl+Enter to save</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="text-sm text-gray-500">
              {note ? (
                <span>Last updated: {new Date(note.updated_at).toLocaleDateString()}</span>
              ) : (
                <span>New note will be saved to your collection</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || isSaving}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Note'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}