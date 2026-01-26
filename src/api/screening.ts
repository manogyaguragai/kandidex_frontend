import apiClient from './client';

// Candidate hiring pipeline status
export type CandidateStatus = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export const CANDIDATE_STATUS_OPTIONS: { value: CandidateStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'screening', label: 'Screening', color: 'cyan' },
  { value: 'interview', label: 'Interview', color: 'purple' },
  { value: 'offer', label: 'Offer', color: 'amber' },
  { value: 'hired', label: 'Hired', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
];

export interface GeneratedQuestion {
  question: string;
  skill_type: string;
  difficulty: string;
}

export interface SkillAssessment {
  exact_matches: string[];
  transferable_skills: string[];
  non_technical_skills: string[];
}

export interface ScreeningCandidate {
  resume_id: string;
  candidate_name: string;
  file_name: string;
  ai_fit_score: number;
  skill_similarity: number;
  candidate_summary: string;
  skill_assessment: SkillAssessment;
  experience_highlights: string;
  education_highlights: string;
  gaps: string[];
  ai_justification: string;
  resume_content_preview: string;
  questions_generated: boolean;
  generated_questions: GeneratedQuestion[];
  status?: CandidateStatus; // Candidate pipeline status
}

export interface ScreeningRun {
  id: string;
  job_details_id: string;
  job_role: string | null;
  job_description: string | null;
  batch_id: string;
  run_start_time: string;
  run_end_time: string;
  time_taken: number;
  created_at: string;
  candidates: ScreeningCandidate[];
}

export interface PaginatedScreeningResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  results: ScreeningRun[];
}

export interface GenerateQuestionsRequest {
  screening_run_id: string;
  resume_id: string;
  num_questions: number;
  soft_skills_flag: boolean;
  hard_skills_flag: boolean;
  soft_skills_focus?: string;
  hard_skills_focus?: string;
  include_coding: boolean;
}

export const screeningApi = {
  getScreeningRuns: async (
    userId: string,
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string
  ) => {
    const response = await apiClient.get<PaginatedScreeningResponse>('/screening_runs/', {
      params: { user_id: userId, page, limit, start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getScreeningRunById: async (userId: string, runId: string): Promise<ScreeningRun | null> => {
    // The backend doesn't have a single-run endpoint, so we fetch and filter
    const response = await apiClient.get<PaginatedScreeningResponse>('/screening_runs/', {
      params: { user_id: userId, page: 1, limit: 100 },
    });
    return response.data.results.find((run) => run.id === runId) || null;
  },

  rankCandidates: async (formData: FormData) => {
    // FormData should contain: user_id, files, job_desc (optional), job_details_id (optional), deep_analysis (bool)
    const response = await apiClient.post('/rank/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes timeout for Deep Analysis
    });
    return response.data;
  },

  // Update candidate status in the hiring pipeline
  updateCandidateStatus: async (
    userId: string,
    candidateId: string,
    status: CandidateStatus
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.put(`/candidates/${candidateId}/status`, {
        user_id: userId,
        status,
      });
      return response.data;
    } catch {
      // Mock response for frontend development if endpoint doesn't exist
      console.warn('Status update endpoint not available, using local state');
      return { success: true, message: 'Status updated locally' };
    }
  },

  // Generate interview questions for a specific candidate
  generateQuestionsForCandidate: async (
    userId: string,
    request: GenerateQuestionsRequest
  ): Promise<GeneratedQuestion[]> => {
    const params = new URLSearchParams({
      num_questions: request.num_questions.toString(),
      soft_skills_flag: request.soft_skills_flag.toString(),
      hard_skills_flag: request.hard_skills_flag.toString(),
      include_coding: request.include_coding.toString(),
    });

    if (request.soft_skills_focus) {
      params.append('soft_skills_focus', request.soft_skills_focus);
    }
    
    if (request.hard_skills_focus) {
      params.append('hard_skills_focus', request.hard_skills_focus);
    }

    const formData = new URLSearchParams();
    formData.append('user_id', userId);
    formData.append('screening_run_id', request.screening_run_id);
    formData.append('resume_id', request.resume_id);

    try {
      const response = await apiClient.post(`/questions/?${params.toString()}`, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      
      // Handle both pure array response or object with questions property
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.questions)) {
        return response.data.questions;
      }
      
      return [];
    } catch (e) {
      console.error('Error generating questions:', e);
      throw e;
    }
  },
};

