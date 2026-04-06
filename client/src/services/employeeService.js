import api from './api';

export const employeeService = {
  // Get all employees with pagination and filters
  getEmployees: async ({ page = 1, perPage = 50, country, jobTitle, search }) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('per_page', perPage);
    if (country) params.append('country', country);
    if (jobTitle) params.append('job_title', jobTitle);
    if (search) params.append('search', search);

    const response = await api.get(`/employees?${params.toString()}`);
    return response.data;
  },

  // Get single employee
  getEmployee: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Create employee
  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', { employee: employeeData });
    return response.data;
  },

  // Update employee
  updateEmployee: async ({ id, ...employeeData }) => {
    const response = await api.patch(`/employees/${id}`, { employee: employeeData });
    return response.data;
  },

  // Delete employee
  deleteEmployee: async (id) => {
    await api.delete(`/employees/${id}`);
    return { id };
  },
};
