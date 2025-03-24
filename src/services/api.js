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
    console.log('🚀 Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data ? { ...config.data, password: '***' } : undefined
    });
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response',
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers
      } : 'No config'
    });
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
    console.log('Starting registration process...', { name, email });
    try {
      console.log('Making registration request to:', `${api.defaults.baseURL}/auth/register`);
      console.log('Request payload:', { name, email, password: '***' });

      const response = await api.post('/auth/register', {
        name,
        email,
        password
      });

      console.log('Registration response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error details:', {
        error: error,
        response: error.response,
        request: error.request,
        config: error.config
      });

      if (error.response) {
        // Server responded with non-2xx status
        console.error('Server error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        throw new Error(error.response.data?.message || error.response.data?.error || 'Registration failed');
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', {
          request: error.request,
          config: error.config
        });
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Error in request setup
        console.error('Request setup error:', error.message);
        throw new Error(`Request failed: ${error.message}`);
      }
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
