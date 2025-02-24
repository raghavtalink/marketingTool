const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');

const authMiddleware = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    return user;
  } catch (err) {
    throw new AuthenticationError('Invalid or expired token');
  }
};

module.exports = authMiddleware;