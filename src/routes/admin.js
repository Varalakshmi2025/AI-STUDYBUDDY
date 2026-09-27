const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getAllUsers,
  deleteUser,
  getStats,
} = require("../controllers/adminController");

// Apply authentication + admin check to all routes in this router
router.use(protect, adminOnly);

// Admin routes
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/stats", getStats);

// Fallback for undefined admin routes
router.use((req, res) => {
  res.status(404).json({ message: "Admin route not found" });
});

module.exports = router;
