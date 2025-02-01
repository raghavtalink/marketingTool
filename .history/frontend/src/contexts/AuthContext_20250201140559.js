// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, getCurrentUser } from '../services/auth';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null });

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
        try {
          const userData = await getCurrentUser();
          setAuth((prev) => ({
            ...prev,
            user: userData,
          }));
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          logout();
        }
      } else {
        delete axios.defaults.headers.common['Authorization'];
      }
    };

    fetchUser();
  }, [auth.token]);

  const login = (token, user) => {
    setAuth({ token, user });
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};