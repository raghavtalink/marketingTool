// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to handle auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;