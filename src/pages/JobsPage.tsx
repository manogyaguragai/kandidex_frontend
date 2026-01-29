import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit, Calendar, Users, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { dashboardApi, Job } from '@/api/dashboard';
import { resumeApi } from '@/api/resume';
import { CandidateStatus, CANDIDATE_STATUS_OPTIONS } from '@/api/screening';

import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Phase colors for the pipeline visualization
const PHASE_COLORS: Record<CandidateStatus, { bg: string; text: string; bar: string; glow: string }> = {
  position_applied: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    bar: 'bg-gradient-to-r from-blue-500 to-blue-400',
    glow: 'shadow-blue-500/30'
  },
  initial_screening: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    bar: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
    glow: 'shadow-cyan-500/30'
  },
  ai_selected: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    bar: 'bg-gradient-to-r from-purple-500 to-purple-400',
    glow: 'shadow-purple-500/30'
  },
  questions_generated: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    bar: 'bg-gradient-to-r from-indigo-500 to-indigo-400',
    glow: 'shadow-indigo-500/30'
  },
  email_sent: {
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    text: 'text-pink-600 dark:text-pink-400',
    bar: 'bg-gradient-to-r from-pink-500 to-pink-400',
    glow: 'shadow-pink-500/30'
  },
  interview_set: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    bar: 'bg-gradient-to-r from-orange-500 to-orange-400',
    glow: 'shadow-orange-500/30'
  },
  hired: {
    bg: 'bg-green-500/10 dark:bg-green-500/20',
    text: 'text-green-600 dark:text-green-400',
    bar: 'bg-gradient-to-r from-green-500 to-emerald-400',
    glow: 'shadow-green-500/30'
  },
  rejected: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-600 dark:text-red-400',
    bar: 'bg-gradient-to-r from-red-500 to-rose-400',
    glow: 'shadow-red-500/30'
  },
};

// Type for candidate counts per phase (using Record to be dynamic based on CandidateStatus)
type PhaseCounts = Record<CandidateStatus, number> & { total: number };

const getInitialPhaseCounts = (): PhaseCounts => {
  return {
    position_applied: 0,
    initial_screening: 0,
    ai_selected: 0,
    questions_generated: 0,
    email_sent: 0,
    interview_set: 0,
    hired: 0,
    rejected: 0,
    total: 0,
  };
};

const JobsPage: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobPhaseCounts, setJobPhaseCounts] = useState<Record<string, PhaseCounts>>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Form state
  const [formData, setFormData] = useState({
    job_role: '',
    job_description: '',
    status: 'active'
  });

  const fetchJobs = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      // Fetch jobs with pagination
      const data = await dashboardApi.getAllJobs(userId, currentPage, ITEMS_PER_PAGE);
      setJobs(data.results);
      setTotalPages(data.total_pages);

      // Fetch candidate counts for each job
      const counts: Record<string, PhaseCounts> = {};

      // We process jobs in parallel
      await Promise.all(data.results.map(async (job) => {
        try {
          // Fetch all resumes for this job (limit 1000 to get a reasonably full picture)
          // We don't filter by phase here to get ALL candidates and count them
          const resumeData = await resumeApi.getResumesByJobId(userId, job.id, undefined, undefined, 1, 1000);

          const phaseCounts = getInitialPhaseCounts();
          phaseCounts.total = resumeData.total; // Use total from API

          if (resumeData.results) {
            resumeData.results.forEach(resume => {
              if (phaseCounts[resume.phase] !== undefined) {
                phaseCounts[resume.phase]++;
              }
            });
          }

          counts[job.id] = phaseCounts;
        } catch (err) {
          console.error(`Failed to fetch counts for job ${job.id}`, err);
          counts[job.id] = getInitialPhaseCounts();
        }
      }));

      setJobPhaseCounts(counts);
    } catch (error) {
      toast.error('Failed to fetch jobs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [userId, currentPage]); // Re-fetch when page changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      if (editingJob) {
        await dashboardApi.updateJob(
          userId,
          editingJob.id,
          formData.job_role,
          formData.job_description,
          formData.status
        );
        toast.success('Job updated successfully');
      } else {
        await dashboardApi.addJob(
          userId,
          formData.job_role,
          formData.job_description,
          formData.status
        );
        toast.success('Job created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchJobs();
    } catch (error) {
      toast.error(editingJob ? 'Failed to update job' : 'Failed to create job');
      console.error(error);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    if (!userId) return;

    try {
      await dashboardApi.deleteJob(userId, jobId);
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setFormData({
      job_role: job.job_role,
      job_description: job.job_description,
      status: job.status
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingJob(null);
    setFormData({ job_role: '', job_description: '', status: 'active' });
  };

  const filteredJobs = jobs.filter(job => 
    job.job_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCandidates = (jobId: string, phase?: CandidateStatus) => {
    // Navigate to job details with optional phase filter (though job details might just show all for now)
    // The user wanted "click title or card to go to details". 
    // We can pass state or query param if JobDetailsPage supports filtering by phase.
    // For now, simple navigation to Job Details.
    // If the user meant "Screening History" (which was the old link), that behavior is changed to Job Details as per request 1.
    // However, if clicking a specific phase bar, maybe we want to filter in JobDetails?
    navigate(`/jobs/${jobId}${phase ? `?phase=${phase}` : ''}`);
  };

  return (

    <div className="space-y-8 min-h-[calc(100vh-12rem)]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Job Openings</h1>
            <p className="text-muted-foreground mt-1">Manage all your active hiring pipelines</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg shadow-md hover:shadow-lg hover:bg-primary/90 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Create New Job
          </button>
        </div>

      {/* Search */}
      <div className="bg-card border border-border/50 p-2 rounded-xl flex items-center gap-3 shadow-sm max-w-xl">
        <Search className="w-5 h-5 text-muted-foreground ml-2" />
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-2 text-foreground"
        />
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
            <div className="space-y-6">
              <AnimatePresence mode='wait'>
              {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, index) => {
                    const counts = jobPhaseCounts[job.id] || getInitialPhaseCounts();

                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card border border-border/50 p-6 rounded-xl hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Job Header */}
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{job.job_role}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${job.status === 'active'
                                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                }`}>
                                {job.status}
                              </span>
                            </div>
                            <p className="text-muted-foreground line-clamp-2 max-w-3xl text-sm mb-3">
                              {job.job_description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(job.created_at).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                {counts.total} candidates
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditModal(job); }}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                              title="Edit Job"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }}
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                              title="Delete Job"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Candidate Pipeline Visualization - Cleaner Look */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" /> Pipeline Overview
                            </span>
                            <span>{counts.total} Total</span>
                          </div>

                          {/* Stacked Bar */}
                          <div className="h-3 rounded-full bg-muted overflow-hidden flex w-full">
                            {counts.total > 0 ? (
                              CANDIDATE_STATUS_OPTIONS.map((option) => {
                                const count = counts[option.value];
                                if (count === 0) return null;
                                const percentage = (count / counts.total) * 100;
                                return (
                                  <div
                                    key={option.value}
                                    style={{ width: `${percentage}%` }}
                                    className={`${PHASE_COLORS[option.value].bar} h-full relative group/segment`}
                                  >
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover/segment:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                      {option.label}: {count}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center"></div>
                            )}
                          </div>

                          {/* Phase Stats - Updated to Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 mt-2">
                            {CANDIDATE_STATUS_OPTIONS.map((option) => {
                              const count = counts[option.value];
                              const isActive = count > 0;
                              return (
                                <div
                                  key={option.value}
                                  onClick={(e) => { e.stopPropagation(); handleViewCandidates(job.id, option.value); }}
                                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer ${isActive
                                    ? `${PHASE_COLORS[option.value].bg} border-transparent hover:brightness-95`
                                    : 'bg-background border-border/40 opacity-60 hover:opacity-100'
                                    }`}
                                >
                                  <span className={`text-[10px] font-medium uppercase truncate w-full ${isActive ? PHASE_COLORS[option.value].text : 'text-muted-foreground'}`}>
                                    {option.label}
                                  </span>
                                  <span className={`text-sm font-bold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                      {count}
                                    </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </motion.div>
                    );
                  })
              ) : (
                    <div className="text-center py-20 bg-card border border-border/50 rounded-2xl border-dashed">
                      <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <h3 className="text-xl font-medium text-foreground">No jobs found</h3>
                  <p className="text-muted-foreground mt-2 mb-6">Create your first job opening to get started.</p>
                  <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Create Job
                  </button>
                </div>
              )}
            </AnimatePresence>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
          </div>
        )}

      {/* Create/Edit Job Modal - Simplified & Elegant */}
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/50 dark:bg-black/50"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl relative"
          >
            {/* Modal Card */}
            <div className="bg-background border border-border rounded-2xl shadow-xl overflow-hidden">

              {/* Header */}
              <div className="relative px-6 pt-6 pb-5 border-b border-gray-100 dark:border-gray-800">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Title Section */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editingJob ? 'Edit Job Opening' : 'Create New Job'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {editingJob ? 'Update job details' : 'Add a new position'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                {/* Job Role Field */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Job Role
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.job_role}
                    onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.job_description}
                    onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all h-28 resize-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Job requirements, responsibilities, tech stack..."
                  />
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'active' })}
                      className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all border cursor-pointer ${formData.status === 'active'
                        ? 'bg-green-50 dark:bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750'
                        }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className={formData.status === 'active' ? 'text-green-500' : 'text-gray-400'}>●</span>
                        Active
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'inactive' })}
                      className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all border cursor-pointer ${formData.status === 'inactive'
                        ? 'bg-gray-100 dark:bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750'
                        }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className={formData.status === 'inactive' ? 'text-gray-500' : 'text-gray-400'}>○</span>
                        Inactive
                      </span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all font-medium flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    {editingJob ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                        Create Job
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            </motion.div>
        </motion.div>
        )}
      </div>

  );
};

export default JobsPage;
