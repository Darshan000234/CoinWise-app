const jwt = require('jsonwebtoken');

const generateToken = (userId,email) => {
  return jwt.sign({ id: userId , Email:email}, process.env.JWT_SECRET, { expiresIn: '1d' });
};

module.exports = { generateToken };