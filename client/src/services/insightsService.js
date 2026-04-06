import api from './api';

export const insightsService = {
  // Get salary insights for a country
  getInsights: async ({ country, jobTitle }) => {
    const params = new URLSearchParams();
    params.append('country', country);
    if (jobTitle) params.append('job_title', jobTitle);

    const response = await api.get(`/employees/insights?${params.toString()}`);
    return response.data;
  },
};
