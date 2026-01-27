import apiClient from './client';

export interface Job {
  id: string;
  user_id: string;
  job_role: string;
  job_description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedJobResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  results: Job[];
}

export const dashboardApi = {
  getAllJobs: async (userId: string, page = 1, limit = 10, status?: string) => {
    const params: any = { user_id: userId, page, limit };
    if (status) params.status = status;
    const response = await apiClient.get<PaginatedJobResponse>('/dashboard/all_jobs', { params });
    return response.data;
  },

  getJob: async (userId: string, jobId: string) => {
    const response = await apiClient.get<Job>(`/dashboard/job/${jobId}`, {
        params: { user_id: userId }
    });
    return response.data;
  },

  addJob: async (userId: string, jobRole: string, jobDescription: string, status = 'active') => {
    const response = await apiClient.post('/dashboard/add_job', {
      user_id: userId,
      job_role: jobRole,
      job_description: jobDescription,
      status,
    });
    return response.data;
  },

  updateJob: async (userId: string, jobId: string, jobRole: string, jobDescription: string, status: string) => {
    const response = await apiClient.put(`/dashboard/update_job/${jobId}`, {
      user_id: userId,
      job_role: jobRole,
      job_description: jobDescription,
      status,
    });
    return response.data;
  },

  deleteJob: async (userId: string, jobId: string) => {
    const response = await apiClient.delete(`/dashboard/delete_job/${jobId}`, {
      params: { user_id: userId }
    });
    return response.data;
  },
};
