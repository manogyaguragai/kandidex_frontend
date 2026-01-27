import apiClient from './client';

export type CandidatePhase = 'position_applied' | 'initial_screening' | 'ai_selected' | 'questions_generated' | 'email_sent' | 'interview_set' | 'hired' | 'rejected';

export interface Resume {
  _id: string;
  user_id: string;
  job_details_id: string;
  name: string;
  content: string;
  phase: CandidatePhase;
  created_at: string;
  embedding: number[];
}

export interface PaginatedResumeResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  results: Resume[];
}

export const resumeApi = {
  getResumesByJobId: async (userId: string, jobId: string, phase?: CandidatePhase, search?: string, page = 1, limit = 10) => {
    const params: any = { user_id: userId, job_id: jobId, page, limit };
    if (phase) params.phase = phase;
    if (search) params.search = search;
    const response = await apiClient.get<PaginatedResumeResponse>('/resume/resumes_by_job_id', { params });
    return response.data;
  },

  getResumePhases: async (userId: string) => {
    const response = await apiClient.get<string[]>('/resume/get_resume_phases', {
      params: { user_id: userId }
    });
    return response.data;
  },

  addResumesToJob: async (userId: string, jobId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post('/resume/add_resumes_to_job', formData, {
      params: { job_id: jobId, user_id: userId },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  changeResumePhase: async (userId: string, resumeId: string, phase: CandidatePhase) => {
    const response = await apiClient.put('/resume/change_resume_phase', null, {
      params: { resume_id: resumeId, phase, user_id: userId }
    });
    return response.data;
  }
};
