const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  uploadMaterial,
  getMaterials,
  getMaterial,
  deleteMaterial,
  summarize,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan,
} = require("../controllers/materialController");

// All routes require authentication
router.use(protect);

// File upload (students + admins)
router.post("/upload", upload.single("file"), uploadMaterial);

// CRUD operations
router.get("/", getMaterials);
router.get("/:id", getMaterial);

// Restrict delete to admins only
router.delete("/:id", adminOnly, deleteMaterial);

// AI-powered features (students can use these)
router.post("/:id/summarize", summarize);
router.post("/:id/flashcards", generateFlashcards);
router.post("/:id/quiz", generateQuiz);
router.post("/:id/study-plan", generateStudyPlan);

// Fallback for undefined material routes
router.use((req, res) => {
  res.status(404).json({ message: "Material route not found" });
});

module.exports = router;
