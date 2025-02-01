// src/components/Common/PrivateRoute.js
import React, { useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { auth } = useAuth();

  return auth.token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;