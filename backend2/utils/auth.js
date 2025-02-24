const jwt = require('jsonwebtoken');
const { User } = require('../models');

const getUserFromToken = async (token) => {
  if (!token) return null;
  
  try {
    // Remove 'Bearer ' if present
    const actualToken = token.replace('Bearer ', '');
    
    // Verify the token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET_KEY);
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    return user;
  } catch (err) {
    console.error('Token verification error:', err);
    return null;
  }
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '7d' }
  );
};

const hashPassword = async (password) => {
  // In a real app, you'd use bcrypt or similar
  // For now, we'll just return the password
  return password;
};

const verifyPassword = async (inputPassword, hashedPassword) => {
  // In a real app, you'd use bcrypt.compare or similar
  // For now, we'll just compare directly
  return inputPassword === hashedPassword;
};

module.exports = {
  getUserFromToken,
  generateToken,
  hashPassword,
  verifyPassword
};