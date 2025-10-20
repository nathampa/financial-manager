// frontend/src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para refresh token automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se erro 401 e não é retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Logout se refresh falhar
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Tipos
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  type_display: string;
  initial_balance: number;
  current_balance: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  type_display: string;
  icon: string;
  is_system: boolean;
  transactions_count: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  type_display: string;
  date: string;
  account: string;
  category: string;
  account_detail?: {
    id: string;
    name: string;
  };
  category_detail?: {
    id: string;
    name: string;
    icon: string;
  };
  created_at: string;
}

export interface DashboardData {
  total_balance: number;
  month_income: number;
  month_expense: number;
  month_balance: number;
  top_expenses: Array<{
    category__name: string;
    category__icon: string;
    total: number;
    count: number;
  }>;
}