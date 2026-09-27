const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Ask Gemini model with a prompt
 * @param {string|Array} prompt - Either a plain string or an array of parts
 * @returns {Promise<string>} - Generated text response
 */
const askGemini = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("❌ Gemini API error:", err.message);
    return "Error: Unable to generate response at the moment.";
  }
};

module.exports = { askGemini };
