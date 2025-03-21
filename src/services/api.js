import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error.response?.data || { error: 'An error occurred' });
  }
);

// Authentication services
export const authService = {
  register: async (name, email, password) => {
    try {
      console.log('Attempting registration for:', email);
      const response = await api.post('/auth/register', { name, email, password });
      console.log('Registration response:', response);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data || { error: 'Registration failed' };
    }
  },
  
  login: async (email, password) => {
    try {
      console.log('Login request payload:', { email, password: '***' });
      const response = await api.post('/auth/login', { 
        email, 
        password 
      });
      console.log('Login response data:', response.data);
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return response.data;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw { error: error.message };
      } else {
        throw { error: 'Login failed' };
      }
    }
  },
  
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to process request' };
    }
  },
  
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        password: newPassword 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Password reset failed' };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default api; 