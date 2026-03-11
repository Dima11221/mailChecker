import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
