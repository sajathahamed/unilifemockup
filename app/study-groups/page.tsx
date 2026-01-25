"use client";

import React, { useState } from 'react';
import { DashboardLayout, Modal } from '@/components';
import { studyGroups, groupChatMessages, courses } from '@/mock-data';
import {
  Search,
  Plus,
  Users,
  Calendar,
  MapPin,
  MessageCircle,
  Send,
  Check,
  UserPlus,
} from 'lucide-react';

export default function StudyGroupsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedGroups, setJoinedGroups] = useState<number[]>(
    studyGroups.filter(g => g.isJoined).map(g => g.id)
  );
  const [newMessage, setNewMessage] = useState('');

  const filteredGroups = studyGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoin = (groupId: number) => {
    if (joinedGroups.includes(groupId)) {
      setJoinedGroups(joinedGroups.filter(id => id !== groupId));
    } else {
      setJoinedGroups([...joinedGroups, groupId]);
    }
  };

  const formatMeetingTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (date.toDateString() === today.toDateString()) dayStr = 'Today';
    if (date.toDateString() === tomorrow.toDateString()) dayStr = 'Tomorrow';

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dayStr} at ${timeStr}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
            <p className="text-gray-500">Collaborate and learn together</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Group
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search study groups..."
              className="input pl-10"
            />
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredGroups.map((group, index) => (
            <div
              key={group.id}
              className="bg-white rounded-xl p-5 border border-gray-100 card-hover animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">
                  {group.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.courseName}</p>
                    </div>
                    {joinedGroups.includes(group.id) && (
                      <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Joined
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-3 line-clamp-2">{group.description}</p>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {group.members}/{group.maxMembers} members
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatMeetingTime(group.nextMeeting)}
                </span>
              </div>

              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {group.meetingLocation}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                {joinedGroups.includes(group.id) ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowChat(true);
                      }}
                      className="flex-1 btn btn-primary"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </button>
                    <button
                      onClick={() => handleJoin(group.id)}
                      className="btn btn-secondary"
                    >
                      Leave
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleJoin(group.id)}
                    className="flex-1 btn btn-primary"
                    disabled={group.members >= group.maxMembers}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {group.members >= group.maxMembers ? 'Full' : 'Join Group'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No groups found</h3>
            <p className="text-sm text-gray-500">Try a different search or create a new group</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Study Group"
        size="md"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input type="text" className="input" placeholder="Enter group name" />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
              <input type="number" className="input" placeholder="15" defaultValue={15} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Day</label>
              <select className="input">
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Location</label>
            <input type="text" className="input" placeholder="e.g., Library Room 3A or Online - Discord" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input min-h-[80px]" placeholder="Describe your study group..." />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                setShowCreateModal(false);
              }}
              className="flex-1 btn btn-primary"
            >
              Create Group
            </button>
          </div>
        </form>
      </Modal>

      {/* Chat Modal */}
      <Modal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        title={selectedGroup?.name || 'Group Chat'}
        size="lg"
      >
        <div className="flex flex-col h-96">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-xl">
            {groupChatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    message.isMe
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white border border-gray-200 rounded-bl-md'
                  }`}
                >
                  {!message.isMe && (
                    <p className="text-xs font-medium text-primary mb-1">{message.sender}</p>
                  )}
                  <p className={`text-sm ${message.isMe ? 'text-white' : 'text-gray-900'}`}>
                    {message.message}
                  </p>
                  <p className={`text-[10px] mt-1 ${message.isMe ? 'text-white/70' : 'text-gray-400'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="input flex-1"
            />
            <button className="btn btn-primary px-4">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
