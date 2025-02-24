const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET_KEY,
    { 
      algorithm: 'HS256',
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES + 'm'
    }
  );
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
};