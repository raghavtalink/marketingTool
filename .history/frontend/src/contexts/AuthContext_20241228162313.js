// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { login as loginService, getCurrentUser } from '../services/auth';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
        try {
          const userData = await getCurrentUser();
          setAuth((prev) => ({
            ...prev,
            user: userData,
    if (auth.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [auth.token]);

  const login = async (email, password) => {
    const response = await loginService(email, password);
    if (response.access_token) {
      localStorage.setItem('token', response.access_token);
      setAuth({
        token: response.access_token,
        user: null, // Optionally fetch and set user data here
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({
      token: null,
      user: null,
    });
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};