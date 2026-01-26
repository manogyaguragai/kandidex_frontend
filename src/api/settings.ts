import apiClient from './client';

export interface RankingSettings {
  phase1_ranking_number?: number;
  phase2_ranking_number?: number;
  number_of_questions_to_generate?: number;
}

export const settingsApi = {
  updateRankingSettings: async (userId: string, settings: RankingSettings) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    if (settings.phase1_ranking_number) formData.append('phase1_ranking_number', settings.phase1_ranking_number.toString());
    if (settings.phase2_ranking_number) formData.append('phase2_ranking_number', settings.phase2_ranking_number.toString());
    if (settings.number_of_questions_to_generate) formData.append('number_of_questions_to_generate', settings.number_of_questions_to_generate.toString());

    const response = await apiClient.post('/settings/', formData);
    return response.data;
  },
};
