# AI Flashcard Generation Setup Guide

## Overview
The AI flashcard generation feature now uses real Google Gemini AI instead of mock data. This provides dynamic, high-quality flashcards based on your specific requirements.

## Prerequisites
- Google AI API key (Gemini)
- Active internet connection
- Node.js environment

## Setup Steps

### 1. Get Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. Configure Environment Variables
Create a `.env.local` file in your project root with:

```bash
# Required for AI flashcard generation
GEMINI_API_KEY=your_actual_api_key_here

# Alternative names (if you prefer)
# GOOGLE_GENAI_API_KEY=your_actual_api_key_here
# GOOGLE_AI_API_KEY=your_actual_api_key_here
```

### 3. Restart Development Server
After adding the environment variable:
```bash
npm run dev
# or
yarn dev
```

## Features

### AI-Generated Flashcards
- **Dynamic Content**: Each generation creates unique flashcards
- **Turkish Language**: Optimized for Turkish educational content
- **Quality Control**: Built-in validation and quality scoring
- **Custom Guidelines**: Add specific requirements for flashcard generation
- **Multiple Difficulties**: Easy, Medium, Hard levels
- **Flexible Count**: Generate 3, 5, 10, or 15 flashcards at once

### Smart Fallbacks
- **JSON Parsing**: Intelligent parsing of AI responses
- **Error Handling**: Graceful fallbacks when AI fails
- **Validation**: Ensures all generated flashcards meet quality standards
- **User Feedback**: Clear error messages and suggestions

## Usage

### In Flashcard Manager
1. Navigate to Flashcard Manager
2. Select "AI Üretimi" tab
3. Choose subject and topic
4. Set difficulty and count
5. Add optional guidelines
6. Click "AI ile Flashcard Üret"
7. Review generated flashcards
8. Save to your collection

### API Integration
```typescript
import { generateFlashcards } from "@/ai/flows/flashcard-generation";

const flashcards = await generateFlashcards({
  subject: "Matematik",
  topic: "Türev",
  difficulty: "Medium",
  count: 5,
  language: "tr",
  guidelines: "Örneklerle birlikte"
});
```

## Troubleshooting

### Common Issues

#### "AI API key not configured"
- Check if `.env.local` file exists
- Verify API key is correctly set
- Restart development server

#### "AI response is empty"
- Check internet connection
- Verify API key is valid
- Check Google AI service status

#### "Failed to parse AI response"
- AI response format issues
- Check console for raw response
- System will use fallback generation

### Debug Mode
Enable debug logging by checking browser console for:
- API key status
- AI response details
- Parsing errors
- Fallback generation info

## Security Notes
- Never commit API keys to version control
- Use environment variables for sensitive data
- Monitor API usage and quotas
- Implement rate limiting in production

## Performance Tips
- Start with smaller counts (3-5) for testing
- Use specific topics for better results
- Add clear guidelines for focused generation
- Cache generated flashcards when possible

## Support
If you encounter issues:
1. Check this documentation
2. Verify environment configuration
3. Test with simple topics first
4. Check browser console for errors
5. Contact development team if problems persist
