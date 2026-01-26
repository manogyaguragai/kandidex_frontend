import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit, Briefcase, Calendar, ChevronRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { dashboardApi, Job } from '@/api/dashboard';
import { CandidateStatus, CANDIDATE_STATUS_OPTIONS } from '@/api/screening';
import AppLayout from '@/components/AppLayout';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Phase colors for the pipeline visualization
const PHASE_COLORS: Record<CandidateStatus, { bg: string; text: string; bar: string; glow: string }> = {
  new: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    bar: 'bg-gradient-to-r from-blue-500 to-blue-400',
    glow: 'shadow-blue-500/30'
  },
  screening: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    bar: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
    glow: 'shadow-cyan-500/30'
  },
  interview: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    bar: 'bg-gradient-to-r from-purple-500 to-purple-400',
    glow: 'shadow-purple-500/30'
  },
  offer: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-gradient-to-r from-amber-500 to-amber-400',
    glow: 'shadow-amber-500/30'
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

// Type for candidate counts per phase
interface PhaseCounts {
  new: number;
  screening: number;
  interview: number;
  offer: number;
  hired: number;
  rejected: number;
  total: number;
}

// Mock function to get candidate counts - replace with real API when available
const getMockPhaseCounts = (jobId: string): PhaseCounts => {
  // Generate consistent mock data based on job ID hash
  const hash = jobId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    new: (hash % 12) + 3,
    screening: (hash % 8) + 2,
    interview: (hash % 6) + 1,
    offer: (hash % 4),
    hired: (hash % 3),
    rejected: (hash % 5) + 1,
    total: 0, // Will be calculated
  };
};

const JobsPage: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobPhaseCounts, setJobPhaseCounts] = useState<Record<string, PhaseCounts>>({});

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
      const data = await dashboardApi.getAllJobs(userId, 1, 100);
      setJobs(data.results);

      // Generate phase counts for each job
      const counts: Record<string, PhaseCounts> = {};
      data.results.forEach((job: Job) => {
        const phaseCounts = getMockPhaseCounts(job.id);
        phaseCounts.total = phaseCounts.new + phaseCounts.screening + phaseCounts.interview +
          phaseCounts.offer + phaseCounts.hired + phaseCounts.rejected;
        counts[job.id] = phaseCounts;
      });
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
  }, [userId]);

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
    // Navigate to screening history filtered by job
    navigate(`/screening-history?job=${jobId}${phase ? `&phase=${phase}` : ''}`);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Job Openings</h1>
            <p className="text-muted-foreground mt-1">Manage all your active hiring pipelines</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
          >
            <Plus className="w-5 h-5" />
            Create New Job
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="glass-card p-2 rounded-xl flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-muted-foreground ml-2" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-2 text-foreground"
            />
          </div>

          {/* Phase Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
            >
              All Phases
            </button>
            {CANDIDATE_STATUS_OPTIONS.slice(0, 4).map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${statusFilter === option.value
                  ? `${PHASE_COLORS[option.value].bg} ${PHASE_COLORS[option.value].text} ring-2 ring-current/20`
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${PHASE_COLORS[option.value].bar}`} />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, index) => {
                    const counts = jobPhaseCounts[job.id] || { new: 0, screening: 0, interview: 0, offer: 0, hired: 0, rejected: 0, total: 0 };

                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 rounded-2xl group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Job Header */}
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-foreground">{job.job_role}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${job.status === 'active'
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                                : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                }`}>
                                {job.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-muted-foreground line-clamp-2 max-w-3xl text-sm">
                              {job.job_description}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Created: {new Date(job.created_at).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {counts.total} candidates
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(job)}
                              className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit Job"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(job.id)}
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete Job"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Candidate Pipeline Visualization */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            Hiring Pipeline
                          </h4>

                          {/* Phase Bar Visualization */}
                          <div className="relative h-8 rounded-xl bg-muted/30 overflow-hidden flex">
                            {counts.total > 0 ? (
                              <>
                                {(['new', 'screening', 'interview', 'offer', 'hired', 'rejected'] as CandidateStatus[]).map((phase, idx) => {
                                  const count = counts[phase];
                                  const percentage = (count / counts.total) * 100;
                                  if (percentage === 0) return null;

                                  return (
                                    <motion.div
                                      key={phase}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                                      className={`${PHASE_COLORS[phase].bar} h-full relative group/phase cursor-pointer hover:brightness-110 transition-all`}
                                      onClick={() => handleViewCandidates(job.id, phase)}
                                    >
                                      {percentage > 10 && (
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                                          {count}
                                        </span>
                                      )}
                                      {/* Tooltip */}
                                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-foreground text-background text-xs font-medium opacity-0 group-hover/phase:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {CANDIDATE_STATUS_OPTIONS.find(o => o.value === phase)?.label}: {count}
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </>
                            ) : (
                              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                                No candidates yet
                              </div>
                            )}
                          </div>

                          {/* Phase Chips */}
                          <div className="flex flex-wrap gap-2">
                            {(['new', 'screening', 'interview', 'offer', 'hired', 'rejected'] as CandidateStatus[]).map((phase) => {
                              const count = counts[phase];
                              const colors = PHASE_COLORS[phase];

                              return (
                                <motion.button
                                  key={phase}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleViewCandidates(job.id, phase)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${colors.bg} ${colors.text} border-current/20 hover:shadow-lg ${colors.glow}`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${colors.bar}`} />
                                    {CANDIDATE_STATUS_OPTIONS.find(o => o.value === phase)?.label}
                                    <span className="ml-1 px-1.5 py-0.5 rounded bg-background/50 text-foreground/70 font-bold">
                                      {count}
                                    </span>
                                  </span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* View All Button */}
                        <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                          <button
                            onClick={() => handleViewCandidates(job.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 text-primary rounded-lg transition-all text-sm font-medium border border-primary/10"
                          >
                            View All Candidates
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        </div>
                      </motion.div>
                    );
                  })
              ) : (
                <div className="text-center py-20 glass-card rounded-2xl">
                  <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
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
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-8 rounded-3xl w-full max-w-lg relative"
            >
              <h2 className="text-2xl font-bold mb-6 gradient-text">
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Role</label>
                  <input
                    type="text"
                    required
                    value={formData.job_role}
                    onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    required
                    value={formData.job_description}
                    onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input focus:ring-2 focus:ring-primary/50 outline-none transition-all h-32 resize-none"
                    placeholder="Job requirements, responsibilities, etc..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input focus:ring-2 focus:ring-primary/50 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-medium"
                  >
                    {editingJob ? 'Save Changes' : 'Create Job'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default JobsPage;
