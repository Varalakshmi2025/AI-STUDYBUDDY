const fs = require("fs");
const Material = require("../models/Material");
const { askGemini } = require("../utils/gemini");

// Helper: read uploaded file text safely
const readFileText = (filePath) => {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    throw new Error("Failed to read uploaded file");
  }
};

// POST /api/materials/upload
const uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title } = req.body;
    const content = readFileText(req.file.path);

    const material = await Material.create({
      user: req.user.userId,
      title: title || req.file.originalname,
      content,
      filename: req.file.originalname,
    });

    // Clean up file from disk after reading
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("File cleanup failed:", err.message);
    });

    res.status(201).json({ message: "Material uploaded successfully", material });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// GET /api/materials
const getMaterials = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user.userId };
    const materials = await Material.find(filter)
      .select("-content -flashcards -quiz -studyPlan")
      .sort({ createdAt: -1 });

    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch materials", error: error.message });
  }
};

// GET /api/materials/:id
const getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: "Material not found" });

    if (req.user.role !== "admin" && material.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch material", error: error.message });
  }
};

// DELETE /api/materials/:id
const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: "Material not found" });

    if (req.user.role !== "admin" && material.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await material.deleteOne();
    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete material", error: error.message });
  }
};

// POST /api/materials/:id/summarize
const summarize = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: "Material not found" });

    const prompt = `Summarize the following study material clearly and concisely in bullet points:\n\n${material.content}`;
    const summary = await askGemini(prompt);

    material.summary = summary;
    await material.save();

    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ message: "Failed to summarize material", error: error.message });
  }
};

// POST /api/materials/:id/flashcards
const generateFlashcards = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: "Material not found" });

    const count = req.body.count || 5;

    const prompt = `
Create ${count} flashcards from the study material below.
Return ONLY valid JSON in this format:
[{"question": "...", "answer": "..."}]

Study material:
${material.content}
`;

    const raw = await askGemini(prompt);
    const clean = raw.replace(/```json|```/g, "").trim();

    let flashcards;
    try {
      flashcards = JSON.parse(clean);
    } catch {
      return res.status(500).json({ message: "Failed to parse flashcards output" });
    }

    material.flashcards = flashcards;
    await material.save();

    res.status(200).json({ flashcards });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate flashcards", error: error.message });
  }
};

// POST /api/materials/:id/quiz
const generateQuiz = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: "Material not found" });

    const count = req.body.count || 5;

    const prompt = `
Create ${count} multiple choice quiz questions from the study material below.
Return ONLY valid JSON in this format:
[{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A"}]

Study material:
${material.content}
`;

    const raw = await askGemini(prompt);
    const clean = raw.replace(/```json|```/g, "").trim();

    let quiz;
    try {
      quiz = JSON.parse(clean);
    } catch {
      return res.status(500).json({ message: "Failed to parse quiz output" });
    }

    material.quiz = quiz;
    await material.save();

    res.status(200).json({ quiz });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate quiz", error: error.message });
  }
};

// POST /api/materials/:id/study-plan
const generateStudyPlan = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: "Material not found" });

    const { goal, hoursPerDay, days } = req.body;

    const prompt = `
You are a study planner. Based on the study material below, create a personalized ${days || 7}-day study plan.
Student's goal: ${goal || "Understand and retain the material"}
Available study time: ${hoursPerDay || 2} hours per day.

Return a clear day-by-day schedule with topics and activities.

Study material:
${material.content}
`;

    const studyPlan = await askGemini(prompt);

    material.studyPlan = studyPlan;
    await material.save();

    res.status(200).json({ studyPlan });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate study plan", error: error.message });
  }
};

module.exports = {
  uploadMaterial,
  getMaterials,
  getMaterial,
  deleteMaterial,
  summarize,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan,
};
