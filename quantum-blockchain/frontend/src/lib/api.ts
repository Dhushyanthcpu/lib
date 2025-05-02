import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies/session
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Redirect to login page if needed
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const auth = {
  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/login', {
        email,
        password,
        device_name: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      });
      
      // Store token
      if (response.data.token && typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/logout');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      throw error;
    }
  },
  
  getUser: async () => {
    try {
      const response = await api.get('/user');
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }
};

// Blockchain API
export const blockchain = {
  getHeight: async () => {
    const response = await api.get('/blockchain/height');
    return response.data;
  },
  
  getBlock: async (height: number) => {
    const response = await api.get(`/blockchain/block/${height}`);
    return response.data;
  },
  
  getTransaction: async (hash: string) => {
    const response = await api.get(`/blockchain/transaction/${hash}`);
    return response.data;
  },
  
  submitTransaction: async (transaction: {
    fromAddress: string;
    toAddress: string;
    amount: number;
    signature: string;
    quantumSecure?: boolean;
  }) => {
    const response = await api.post('/blockchain/transaction', transaction);
    return response.data;
  },
  
  getBalance: async (address: string) => {
    const response = await api.get(`/blockchain/balance/${address}`);
    return response.data;
  },
  
  getDashboardData: async () => {
    const response = await api.get('/blockchain/dashboard');
    return response.data;
  }
};

export default {
  auth,
  blockchain
};

