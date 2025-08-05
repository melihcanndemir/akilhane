import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

// Check if Google AI API key is available (support multiple key names)
const hasApiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY ||
  process.env.GOOGLE_AI_API_KEY;

// Log API key status for debugging
if (!hasApiKey) {
  console.warn("⚠️ Google AI API key not found. AI features will be disabled.");
  console.warn("Available environment variables:", {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    GOOGLE_GENAI_API_KEY: !!process.env.GOOGLE_GENAI_API_KEY,
    GOOGLE_AI_API_KEY: !!process.env.GOOGLE_AI_API_KEY,
  });
} else {
  console.log("✅ Google AI API key found. AI features enabled.");
}

export const ai = genkit({
  plugins: hasApiKey ? [googleAI()] : [],
  ...(hasApiKey && { model: "googleai/gemini-2.0-flash" }),
});
