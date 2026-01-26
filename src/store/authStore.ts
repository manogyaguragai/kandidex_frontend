import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserLimits {
  resumes_per_month: number;
  deep_analysis_per_month: number;
  questions_per_resume: number;
  emails_per_month: number;
  external_validations_per_month: number;
}

export interface UserCycle {
  user_id: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
  usage_percentage: number;
}

export interface User {
  user_id: string; // Changed from userId to match backend
  email?: string;
  initials?: string;
  tier: string;
  tier_display_name: string;
  price_display: string;
  resumes_screened: number;
  deep_analysis_calls: number;
  questions_generated: number;
  emails_sent: number;
  external_validations: number;
  limits: UserLimits;
  cycle: UserCycle;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  updateUsage: (usage: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, token) => {
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('kandidex-auth'); // Clean up
      },

      setUser: (user) => {
        set({ user });
      },

      updateUsage: (usage) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...usage } : null
        }));
      },
    }),
    {
      name: 'kandidex-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
