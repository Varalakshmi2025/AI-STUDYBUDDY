const User = require("../models/User");
const Material = require("../models/Material");

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all materials belonging to this user
    await Material.deleteMany({ user: req.params.id });

    res.status(200).json({ message: "User and their materials deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalMaterials] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Material.countDocuments()
    ]);

    res.status(200).json({ totalUsers, totalMaterials });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, getStats };
