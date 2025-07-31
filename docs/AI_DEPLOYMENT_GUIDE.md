# AI Question Generation - Deployment Guide

## Overview

This guide explains how to deploy and configure the AI-powered question generation feature in production environments.

## Prerequisites

1. **Google AI API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Enable the Generative Language API

2. **Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Add your Google AI API key

## Configuration

### 1. Environment Variables

```bash
# Required for AI generation
GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here

# Optional: Alternative key name
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### 2. Vercel Deployment

If deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add `GOOGLE_GENAI_API_KEY` with your API key
4. Redeploy your application

### 3. Demo/Fallback Mode

The application includes a fallback mode when no API key is configured:

- Generates mock questions based on templates
- Useful for development and testing
- Automatically activated when:
  - No API key is set
  - In demo mode (`shouldUseDemoData()` returns true)
  - API calls fail

## Features in Production

### With API Key:
- Full AI-powered question generation using Google's Gemini model
- High-quality, contextual questions
- Support for multiple question types
- Quality scoring and validation
- Learning objectives and keywords

### Without API Key (Demo Mode):
- Template-based question generation
- Basic question types support
- Limited to predefined patterns
- Suitable for testing UI/UX

## Security Considerations

1. **API Key Protection**
   - Never commit API keys to version control
   - Use environment variables only
   - Rotate keys periodically

2. **Rate Limiting**
   - Google AI has rate limits
   - Implement client-side throttling
   - Consider caching generated questions

3. **Content Filtering**
   - AI-generated content is validated
   - Quality scoring helps filter poor questions
   - Manual review workflow included

## Monitoring

### Logging

The application logs AI generation activities to `ai_generation_logs` table:

```sql
-- View recent AI generations
SELECT * FROM ai_generation_logs 
ORDER BY created_at DESC 
LIMIT 100;

-- Monitor quality scores
SELECT 
  AVG(quality_score) as avg_quality,
  COUNT(*) as total_generations,
  subject
FROM ai_generation_logs 
GROUP BY subject;
```

### Metrics to Track

1. **Generation Success Rate**
   - Monitor API failures
   - Track fallback usage

2. **Quality Scores**
   - Average quality per subject
   - Identify problematic topics

3. **Usage Patterns**
   - Questions generated per user
   - Popular subjects/topics

## Troubleshooting

### Common Issues

1. **500 Error on Generation**
   - Check if API key is set correctly
   - Verify API key has correct permissions
   - Check server logs for specific errors

2. **Low Quality Scores**
   - Review prompt templates
   - Adjust difficulty mappings
   - Consider topic-specific guidelines

3. **Slow Generation**
   - API response times vary
   - Consider implementing progress indicators
   - Use background jobs for bulk generation

### Debug Mode

Enable debug logging:

```javascript
// In your API route
console.log('🤖 AI Generation Debug:', {
  hasApiKey: !!process.env.GOOGLE_GENAI_API_KEY,
  isDemoMode: shouldUseDemoData(),
  request: body,
});
```

## Best Practices

1. **Prompt Engineering**
   - Keep prompts clear and specific
   - Include examples in guidelines
   - Test with various subjects

2. **Quality Control**
   - Set minimum quality thresholds
   - Implement human review for critical content
   - Track user feedback on generated questions

3. **Performance**
   - Cache frequently requested topics
   - Batch similar requests
   - Implement request queuing for high load

## Cost Management

Google AI API pricing considerations:

1. **Free Tier**
   - Limited requests per minute
   - Suitable for small applications

2. **Paid Tier**
   - Higher rate limits
   - Better for production use

3. **Optimization**
   - Minimize token usage in prompts
   - Cache generated content
   - Implement user quotas if needed

## Future Enhancements

Consider implementing:

1. **Advanced Features**
   - Fine-tuning for specific subjects
   - Multi-modal questions (with images)
   - Adaptive difficulty based on performance

2. **Integration**
   - Export to various LMS platforms
   - Bulk import/export functionality
   - API for third-party access

3. **Analytics**
   - Question effectiveness tracking
   - Student performance correlation
   - A/B testing for question variants