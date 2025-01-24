// src/components/Common/PrivateRoute.js
import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);

  return auth.token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;