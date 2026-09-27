const jwt = require("jsonwebtoken");

/**
 * Generate access and refresh tokens
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokens = (userId, role) => {
  try {
    const accessToken = jwt.sign(
      { userId, role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" } // configurable expiry
    );

    const refreshToken = jwt.sign(
      { userId, role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" } // configurable expiry
    );

    return { accessToken, refreshToken };
  } catch (err) {
    console.error("❌ Error generating tokens:", err.message);
    throw new Error("Token generation failed");
  }
};

/**
 * Verify a token
 * @param {string} token - JWT token
 * @param {string} secret - Secret key
 * @returns {object|null} - Decoded payload or null if invalid
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};

module.exports = { generateTokens, verifyToken };
