// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
});

// Add response interceptor to handle CORS errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 403) {
      console.error('CORS Error:', error);
    }
    return Promise.reject(error);
  }
);

export default api;