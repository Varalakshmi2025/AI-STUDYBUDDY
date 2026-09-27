const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false } // prevents unnecessary ObjectId for each flashcard
);

const quizSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 2,
        message: "Quiz must have at least two options",
      },
    },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const materialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true }, // raw text content
    filename: { type: String, trim: true }, // original uploaded file name
    summary: { type: String },
    flashcards: [flashcardSchema],
    quiz: [quizSchema],
    studyPlan: { type: String },
  },
  { timestamps: true }
);

// Optional: add a compound index for faster queries by user and title
materialSchema.index({ user: 1, title: 1 });

module.exports = mongoose.model("Material", materialSchema);
