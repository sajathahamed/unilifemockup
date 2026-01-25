"use client";

import React, { useState } from 'react';
import { DashboardLayout, Modal } from '@/components';
import { notes, courses } from '@/mock-data';
import {
  Search,
  Filter,
  FileText,
  Upload,
  ThumbsUp,
  Download,
  Calendar,
  User,
  File,
  FileSpreadsheet,
  Presentation,
} from 'lucide-react';

export default function NotesPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedNotes, setLikedNotes] = useState<number[]>([]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'docx':
        return <File className="w-6 h-6 text-blue-500" />;
      case 'xlsx':
        return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
      case 'pptx':
        return <Presentation className="w-6 h-6 text-orange-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesCourse = selectedCourse === 'all' || note.course === selectedCourse;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const handleLike = (id: number) => {
    if (likedNotes.includes(id)) {
      setLikedNotes(likedNotes.filter(noteId => noteId !== id));
    } else {
      setLikedNotes([...likedNotes, id]);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
            <p className="text-gray-500">Browse and share study materials</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Notes
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="input pl-10"
              />
            </div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="input w-full md:w-48"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.code} value={course.code}>
                  {course.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note, index) => (
            <div
              key={note.id}
              className="bg-white rounded-xl p-5 border border-gray-100 card-hover animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {getFileIcon(note.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
                  <p className="text-sm text-gray-500">{note.courseName}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {note.uploader}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(note.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLike(note.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        likedNotes.includes(note.id)
                          ? 'bg-primary/10 text-primary'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {note.upvotes + (likedNotes.includes(note.id) ? 1 : 0)}
                    </button>
                    <span className="text-sm text-gray-500">
                      <Download className="w-4 h-4 inline mr-1" />
                      {note.downloads}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 uppercase">{note.fileSize}</span>
                </div>
              </div>

              <button className="w-full mt-4 btn btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No notes found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Be the first to upload notes for this course'}
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Notes"
        size="md"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" className="input" placeholder="Enter note title" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select className="input">
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.code} value={course.code}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                <span className="text-primary font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, PPT, PPTX (max 10MB)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea className="input min-h-[80px]" placeholder="Add a brief description..." />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                setShowUploadModal(false);
              }}
              className="flex-1 btn btn-primary"
            >
              Upload
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
