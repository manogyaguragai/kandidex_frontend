import apiClient from './client';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string; // The backend returns this
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  tier?: string;
  tier_display_name?: string;
  price_display?: string;
  resumes_screened?: number;
  deep_analysis_calls?: number;
  questions_generated?: number;
  emails_sent?: number;
  external_validations?: number;
  limits?: any;
  cycle?: any;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // The backend uses OAuth2PasswordRequestForm which requires x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    // Adding optional fields as seen in the curl, though often not strictly required if defaults exist
    formData.append('scope', '');
    formData.append('client_id', 'string');
    formData.append('client_secret', 'string');

    // axios automatically sets Content-Type to application/x-www-form-urlencoded when using URLSearchParams,
    // but the apiClient default header (application/json) might interfere. We explicitly override it.
    const response = await apiClient.post<LoginResponse>('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  resetPassword: async (resetData: any): Promise<any> => {
    const response = await apiClient.post('/reset-password', resetData);
    return response.data;
  },

  // Add other auth methods if needed
};
