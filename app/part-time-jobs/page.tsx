"use client";

import React, { useState } from 'react';
import { DashboardLayout, Modal } from '@/components';
import { partTimeJobs } from '@/mock-data';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Briefcase,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function PartTimeJobsPage() {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);

  const filterOptions = ['Weekend', 'Evening', 'Remote', 'Flexible', 'On-campus', 'Nearby'];

  const toggleFilter = (filter: string) => {
    if (filters.includes(filter)) {
      setFilters(filters.filter(f => f !== filter));
    } else {
      setFilters([...filters, filter]);
    }
  };

  const filteredJobs = partTimeJobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters = filters.length === 0 || 
      filters.some(f => job.schedule.includes(f) || job.location.toLowerCase().includes(f.toLowerCase()));
    return matchesSearch && matchesFilters;
  });

  const handleApply = (jobId: number) => {
    setAppliedJobs([...appliedJobs, jobId]);
    setShowApplyModal(false);
    setSelectedJob(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Part-time Jobs</h1>
          <p className="text-gray-500">Find flexible work opportunities around campus</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="input pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleFilter(option)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.includes(option)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-primary">{partTimeJobs.length}</p>
            <p className="text-sm text-gray-500">Available Jobs</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-secondary">{appliedJobs.length}</p>
            <p className="text-sm text-gray-500">Applied</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-amber-500">Rs.400-750</p>
            <p className="text-sm text-gray-500">Pay Range/hr</p>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <div
              key={job.id}
              className="bg-white rounded-xl p-5 border border-gray-100 card-hover animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-500">{job.company}</p>
                    </div>
                    {appliedJobs.includes(job.id) ? (
                      <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm font-medium rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Applied
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-primary/10 text-primary text-lg font-bold rounded-lg">
                        Rs.{job.pay}/hr
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {job.schedule.join(', ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Apply by {formatDate(job.deadline)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.requirements.slice(0, 3).map((req, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="flex-1 btn btn-secondary"
                >
                  View Details
                </button>
                {!appliedJobs.includes(job.id) && (
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setShowApplyModal(true);
                    }}
                    className="flex-1 btn btn-primary"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      <Modal
        isOpen={!!selectedJob && !showApplyModal}
        onClose={() => setSelectedJob(null)}
        title="Job Details"
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedJob.title}</h3>
                <p className="text-gray-500">{selectedJob.company}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">Rs.{selectedJob.pay}</p>
                <p className="text-xs text-gray-500">per hour</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{selectedJob.location}</p>
                <p className="text-xs text-gray-500">Location</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{selectedJob.type}</p>
                <p className="text-xs text-gray-500">Job Type</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600">{selectedJob.description}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Schedule</h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.schedule.map((s: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
              <ul className="space-y-2">
                {selectedJob.requirements.map((req: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Application Deadline: {formatDate(selectedJob.deadline)}</span>
              </div>
            </div>

            {!appliedJobs.includes(selectedJob.id) && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full btn btn-primary py-3"
              >
                Apply Now
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => {
          setShowApplyModal(false);
          setSelectedJob(null);
        }}
        title="Apply for Position"
        size="md"
      >
        {selectedJob && (
          <form className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900">{selectedJob.title}</h4>
              <p className="text-sm text-gray-500">{selectedJob.company}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" className="input" defaultValue="Alex Johnson" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input" defaultValue="alex.johnson@university.edu" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" className="input" placeholder="+1 (555) 000-0000" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <p className="text-sm text-gray-600">
                  <span className="text-primary font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF only (max 5MB)</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter (Optional)</label>
              <textarea className="input min-h-[100px]" placeholder="Tell us why you're interested..." />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowApplyModal(false);
                  setSelectedJob(null);
                }}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleApply(selectedJob.id);
                }}
                className="flex-1 btn btn-primary"
              >
                Submit Application
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
