import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check if Google AI API key is available
const hasApiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_AI_API_KEY;

export const ai = genkit({
  plugins: hasApiKey ? [googleAI()] : [],
  model: hasApiKey ? 'googleai/gemini-2.0-flash' : undefined,
});
