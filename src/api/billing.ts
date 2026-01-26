import apiClient from './client';

export interface CurrentUsageResponse {
  user_id: string;
  tier: string;
  tier_display_name: string;
  price_display: string;
  resumes_screened: number;
  deep_analysis_calls: number;
  questions_generated: number;
  emails_sent: number;
  external_validations: number;
  limits: {
    resumes_per_month: number;
    deep_analysis_per_month: number;
    emails_per_month: number;
    external_validations_per_month: number;
    max_upload_size_mb: number;
    file_retention_days: number;
  };
  cycle: {
    start_date: string;
    end_date: string;
    days_remaining: number;
    usage_percentage: number;
  };
}

export interface LimitCheckResponse {
  allowed: boolean;
  current_usage: number;
  limit: number;
  remaining: number;
  message: string;
}

export const billingApi = {
  getCurrentUsage: async (userId: string) => {
    const response = await apiClient.get<CurrentUsageResponse>('/billing/current_usage', {
      params: { user_id: userId },
    });
    return response.data;
  },

  checkLimit: async (userId: string, action: 'resume' | 'deep_analysis', count = 1) => {
    const response = await apiClient.post<LimitCheckResponse>('/billing/check_limit', {
      user_id: userId,
      action,
      count,
    });
    return response.data;
  },

  getAllTiers: async () => {
    const response = await apiClient.get('/billing/all_tiers');
    return response.data;
  },
};
