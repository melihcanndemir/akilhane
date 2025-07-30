# AI-Powered Automatic Question Generation Feature

## Overview

The AI-powered question generation feature enables automatic creation of high-quality exam questions using Google's Gemini AI model. This feature expands the question pool, provides dynamic content, and offers users a more personalized and engaging learning experience.

## Features

### 1. AI Question Generation
- **Multiple Question Types**: Supports multiple-choice, true/false, calculation, and case study questions
- **Difficulty Levels**: Generate questions at Easy, Medium, or Hard difficulty levels
- **Language Support**: Currently supports Turkish (tr) and English (en)
- **Bulk Generation**: Generate up to 10 questions at once
- **Custom Guidelines**: Provide additional instructions to the AI for specific requirements

### 2. Quality Validation
- **Automatic Quality Scoring**: Each generated question receives a quality score (0-100%)
- **Validation Checks**:
  - Multiple-choice questions must have exactly 4 options with 1 correct answer
  - True/false questions must have exactly 2 options
  - All questions must have explanations and learning objectives
  - Minimum text length requirements for questions and explanations
- **Improvement Suggestions**: AI provides suggestions for improving question quality

### 3. Review and Approval Interface
- **Preview Generated Questions**: Review all AI-generated questions before adding them
- **Selective Approval**: Choose which questions to add to the question bank
- **Edit Capability**: Questions can be edited after generation if needed
- **Batch Operations**: Select all/none functionality for efficient review

### 4. Logging and Monitoring
- **Generation Logs**: All AI generation activities are logged in the `ai_generation_logs` table
- **Tracked Metrics**:
  - User ID (for authenticated users)
  - Generation type, subject, and topic
  - Number of questions generated
  - Quality scores
  - Metadata (difficulty, type, language)

## Technical Implementation

### Architecture

1. **AI Flow** (`src/ai/flows/question-generator.ts`):
   - Defines the question generation logic using Google's Genkit framework
   - Implements prompt engineering for high-quality question generation
   - Includes validation and quality scoring

2. **API Endpoint** (`src/app/api/ai-generate-questions/route.ts`):
   - Handles HTTP requests for question generation
   - Manages authentication and authorization
   - Logs generation activities

3. **UI Components** (in `src/app/question-manager/page.tsx`):
   - AI generation dialog with form inputs
   - Question preview and selection interface
   - Integration with existing question management

### Database Schema

```sql
CREATE TABLE ai_generation_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  generation_type TEXT CHECK (generation_type IN ('question', 'flashcard', 'explanation')),
  subject TEXT NOT NULL,
  topic TEXT,
  count INTEGER NOT NULL DEFAULT 0,
  quality_score DECIMAL(3,2),
  metadata JSONB,
  created_at TEXT NOT NULL
);
```

## Usage Guide

### For Users

1. **Access the Feature**:
   - Navigate to the Question Manager page
   - Click the "AI ile Soru Oluştur" (Generate with AI) button

2. **Configure Generation**:
   - Select subject and topic
   - Choose question type and difficulty
   - Set the number of questions to generate
   - Optionally add custom guidelines

3. **Review and Approve**:
   - Review generated questions in the preview tab
   - Check quality scores and suggestions
   - Select questions to add to the question bank
   - Click "Seçili Soruları Ekle" to add selected questions

### For Developers

1. **Adding New Question Types**:
   - Update the `QuestionGenerationInputSchema` in `question-generator.ts`
   - Add type descriptions in the `typeDescriptions` object
   - Update validation logic in `validateGeneratedQuestions()`

2. **Customizing Prompts**:
   - Modify the `systemPrompt` in `questionGeneratorFlow`
   - Add language-specific instructions
   - Adjust quality criteria

3. **Extending Logging**:
   - Add new fields to the `ai_generation_logs` table
   - Update the logging logic in the API endpoint

## Security Considerations

1. **Authentication**: AI generation is available for both authenticated and anonymous users
2. **Rate Limiting**: Consider implementing rate limits to prevent abuse
3. **Content Filtering**: AI-generated content is validated but should be monitored
4. **Data Privacy**: Generation logs are stored securely and associated with user IDs when available

## Future Enhancements

1. **Advanced Features**:
   - Image-based question generation
   - Adaptive difficulty based on student performance
   - Cross-subject question generation
   - Question variation generation

2. **Quality Improvements**:
   - Machine learning-based quality scoring
   - Plagiarism detection
   - Alignment with curriculum standards
   - Peer review system

3. **Integration**:
   - Export to various formats (PDF, Word, etc.)
   - Integration with learning management systems
   - Bulk import/export capabilities

## Compliance and Best Practices

1. **Copyright**: Ensure AI-generated content doesn't infringe on copyrights
2. **Educational Standards**: Align questions with educational standards and curricula
3. **Accessibility**: Ensure generated questions are accessible to all students
4. **Continuous Monitoring**: Regularly review AI-generated content for quality and appropriateness