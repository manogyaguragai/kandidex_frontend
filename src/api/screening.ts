import apiClient from './client';

export interface ScreeningRun {
  id: string;
  job_details_id: string;
  job_role: string;
  job_description: string;
  batch_id: string;
  run_start_time: string;
  run_end_time: string;
  time_taken: number;
  created_at: string;
  candidates: any[]; // Define more specifically if needed
}

export interface PaginatedScreeningResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  results: ScreeningRun[];
}

export const screeningApi = {
  getScreeningRuns: async (userId: string, page = 1, limit = 10) => {
    const response = await apiClient.get<PaginatedScreeningResponse>('/screening_runs/', {
      params: { user_id: userId, page, limit },
    });
    return response.data;
  },

  rankCandidates: async (formData: FormData) => {
    // FormData should contain: user_id, files, job_desc (optional), job_details_id (optional), deep_analysis (bool)
    const response = await apiClient.post('/rank/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes timeout for large uploads/analysis
    });
    return response.data;
  },
};
