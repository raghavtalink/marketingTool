// src/components/Common/PrivateRoute.js
import React, { useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { auth } = useAuth();
  const token = localStorage.getItem('token');
  
  return auth.token || token ? children : <Navigate to="/login" replace />;
};
export default PrivateRoute;