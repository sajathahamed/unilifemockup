"use client";

import React, { useState } from 'react';
import { DashboardLayout, Modal } from '@/components';
import { assignments, courses } from '@/mock-data';
import {
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Flag,
} from 'lucide-react';

export default function AssignmentsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'in-progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-danger';
      case 'medium':
        return 'text-amber-500';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesFilter = filter === 'all' || assignment.status === filter;
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: assignments.length,
    completed: assignments.filter(a => a.status === 'completed').length,
    inProgress: assignments.filter(a => a.status === 'in-progress').length,
    notStarted: assignments.filter(a => a.status === 'not-started').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-500">Track and manage your coursework</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Assignment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Assignments</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-secondary">{stats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-amber-500">{stats.inProgress}</p>
            <p className="text-sm text-gray-500">In Progress</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-400">{stats.notStarted}</p>
            <p className="text-sm text-gray-500">Not Started</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assignments..."
                className="input pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'in-progress', 'not-started', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.map((assignment, index) => (
            <div
              key={assignment.id}
              onClick={() => setSelectedAssignment(assignment)}
              className="bg-white rounded-xl p-5 border border-gray-100 card-hover cursor-pointer animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Flag className={`w-5 h-5 ${getPriorityColor(assignment.priority)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{assignment.course}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                      {assignment.status === 'completed' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                      {assignment.status === 'in-progress' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                      {assignment.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {assignment.description}
                  </p>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(assignment.dueDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{assignment.dueTime}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium text-gray-900">{assignment.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full progress-bar ${
                          assignment.progress === 100 ? 'bg-secondary' : 'bg-primary'
                        }`}
                        style={{ width: `${assignment.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredAssignments.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No assignments found</h3>
              <p className="text-sm text-gray-500">
                {searchQuery ? 'Try a different search term' : 'Add your first assignment to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Assignment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Assignment"
        size="lg"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
            <input type="text" className="input" placeholder="Enter assignment title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select className="input">
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.code}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
              <input type="time" className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input min-h-[100px]" placeholder="Enter assignment details..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="flex gap-2">
              <button type="button" className="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-sm font-medium hover:border-gray-300 transition-colors">
                Low
              </button>
              <button type="button" className="flex-1 py-2 px-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-sm font-medium">
                Medium
              </button>
              <button type="button" className="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-sm font-medium hover:border-gray-300 transition-colors">
                High
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                setShowAddModal(false);
              }}
              className="flex-1 btn btn-primary"
            >
              Add Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Assignment Details Modal */}
      <Modal
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        title="Assignment Details"
        size="lg"
      >
        {selectedAssignment && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedAssignment.title}</h3>
                <p className="text-gray-500">{selectedAssignment.course}</p>
              </div>
              <Flag className={`w-5 h-5 ${getPriorityColor(selectedAssignment.priority)}`} />
            </div>

            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedAssignment.status)}`}>
              {selectedAssignment.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
              {selectedAssignment.status === 'in-progress' && <AlertCircle className="w-4 h-4" />}
              {selectedAssignment.status.replace('-', ' ')}
            </div>

            <p className="text-gray-600">{selectedAssignment.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Due Date</span>
                </div>
                <p className="font-medium text-gray-900">{formatDate(selectedAssignment.dueDate)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Due Time</span>
                </div>
                <p className="font-medium text-gray-900">{selectedAssignment.dueTime}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium text-gray-900">{selectedAssignment.progress}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full progress-bar ${
                    selectedAssignment.progress === 100 ? 'bg-secondary' : 'bg-primary'
                  }`}
                  style={{ width: `${selectedAssignment.progress}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button className="flex-1 btn btn-secondary">
                Edit
              </button>
              <button className="flex-1 btn btn-primary">
                {selectedAssignment.status === 'completed' ? 'Reopen' : 'Mark Complete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
