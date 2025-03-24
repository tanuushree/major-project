import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error.response?.data || { error: 'An error occurred' });
  }
);

// Auth service
export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async register(name, email, password) {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  getCurrentUser() {
    const token = localStorage.getItem('token');
    return token ? { token } : null;
  }
};

export const formService = {

  async createForm(formData) {
    try {
      const response = await api.post('/forms', formData);
      return response.data;
    } catch (error) {
      console.error('Create form error:', error);
      throw error;
    }
  },

  async getFormsByProjectId(projectId) {
    try {
      const response = await api.get(`/forms/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Get forms by project ID error:', error);
      throw error;
    }
  },

  async saveForm(formId, fields) {
    try {
      const response = await api.put(`/forms/${formId}`, {
        fields: fields.map(field => ({
          label: field.label,
          type: field.type.toLowerCase(),
          required: field.required,
          is_primary_key: field.is_primary_key,
          form_name: field.type.toLowerCase() === "form reference" ? field.form_name : null
        }))
      });
      return response.data;
    } catch (error) {
      console.error('Save form error:', error);
      throw error;
    }
  },

  async getFormById(formId) {
    try {
      const response = await api.get(`/forms/${formId}`);
      return response.data;
    } catch (error) {
      console.error('Get form error:', error);
      throw error;
    }
  },

  async getFieldsByForm(formId) {
    try {
      const response = await api.get(`/fields/${formId}`);
      return response.data;
    } catch (error) {
      console.error('Get fields error:', error);
      throw error;
    }
  },

  async updateForm(formId, fields) {
    try {
      const response = await api.put(`/forms/${formId}/fields`, {
        fields: fields.map((field, index) => ({
          label: field.label,
          type: field.type,
          required: field.required,
          is_primary_key: field.is_primary_key || false,
          order: index + 1
        }))
      });
      return response.data;
    } catch (error) {
      console.error('Update form error:', error);
      throw error;
    }
  },

  async submitFormResponse(submissionData) {
    try {
      const response = await api.post('/submissions', submissionData);
      return response.data;
    } catch (error) {
      console.error('Submit form error:', error);
      throw error;
    }
  },

  getFormSubmissions: async (formId, format = 'json') => {
    try {
      const response = await api.get(`/submissions/${formId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getFormSubmissions:', error);
      throw error;
    }
  },

  getSubmissionById: async (submissionId) => {
    const response = await api.get(`/submissions/get/${submissionId}`);
    return response.data;
  },
};


// Project service
export const projectService = {
  async getProjects() {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  },

  async createProject(projectData) {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  }
};

export const submissionService = {
  getSubmissionByPrimaryKey: async (formName) => {
    try {
      const response = await api.get(`/submissions/${formName}/pkvalue`);
      return response.data;
    } catch (error) {
      console.error('Error fetching primary key values:', error);
      throw error;
    }
  },

  getFormSubmissions: async (formId, format = 'json') => {
    const response = await api.get(`/submissions/${formId}?format=${format}`);
    return response.data;
  },

  getFieldSubmissions: async () => {
    try {
      const response = await api.post(`/submissions}/field`, {
        fieldName
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching field submissions:', error);
      throw error;
    }
  },
};



export default api;
