import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit, Briefcase, Calendar, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { dashboardApi, Job } from '@/api/dashboard';
import AppLayout from '@/components/AppLayout';
import { toast } from 'react-hot-toast';

const JobsPage: React.FC = () => {
  const { userId } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

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

  return (
    <AppLayout>
      <div className="space-y-8">
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

        {/* Search */}
        <div className="glass-card p-2 rounded-xl flex items-center gap-3">
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
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 rounded-2xl group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-foreground">{job.job_role}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            job.status === 'active' 
                              ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                              : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                          }`}>
                            {job.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-2 line-clamp-2 max-w-3xl">
                          {job.job_description}
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Created: {new Date(job.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            ID: {job.id.slice(-6)}
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
                        <button className="flex items-center gap-1 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium">
                          View Candidates
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
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
