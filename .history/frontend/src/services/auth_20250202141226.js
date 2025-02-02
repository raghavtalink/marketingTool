// src/services/auth.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://103.40.61.70:30081';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export const register = async (username, email, password) => {
  const response = await axios.post('/auth/register', {
    username,
    email,
    password,
  });
  return response.data;
};

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const login = async (email, password) => {
  const response = await axios.post('/auth/login', { email, password });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    setAuthToken(response.data.access_token);
    return response.data;
  }
  throw new Error('Login failed');
};

export const getCurrentUser = async () => {
  const response = await axios.get('/auth/me');
  return response.data;
};

// Initialize token from localStorage
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}