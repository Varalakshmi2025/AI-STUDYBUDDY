const express = require("express");
const router = express.Router();
const { register, login, refresh, logout } = require("../controllers/authController");

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Fallback for undefined auth routes
router.use((req, res,) => {
  res.status(404).json({ message: "Auth route not found" });
});

module.exports = router;
