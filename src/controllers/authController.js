const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateTokens } = require("../utils/tokens");

// POST /api/auth/register
const register = async (req, res,) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new user
    const user = await User.create({ name, email, password, role });
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    res.status(201).json({
      message: "Registered successfully",
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Registration failed", 
      error: error.message 
    });
  }
};

// POST /api/auth/login
const login = async (req, res,) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    res.status(200).json({
      message: "Logged in successfully",
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// POST /api/auth/refresh
// Client must send the refresh token in the x-refresh-token header
const refresh = async (req, res,) => {
  const token = req.headers["x-refresh-token"];
  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const { accessToken, refreshToken } = generateTokens(decoded.userId, decoded.role);

    res.status(200).json({
      message: "Tokens refreshed successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired refresh token", error: error.message });
  }
};

// POST /api/auth/logout
// Stateless — client just discards the tokens
const logout = (req, res,) => {
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { register, login, refresh, logout };
