'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionGenerationInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate questions'),
  topic: z.string().describe('The specific topic within the subject'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of questions to generate'),
  type: z.enum(['multiple-choice', 'true-false', 'calculation', 'case-study']).describe('The type of questions to generate'),
  count: z.number().min(1).max(10).describe('Number of questions to generate'),
  language: z.enum(['tr', 'en']).default('tr').describe('Language for the questions'),
  existingQuestions: z.array(z.string()).optional().describe('Existing questions to avoid duplicates'),
  guidelines: z.string().optional().describe('Additional guidelines or requirements for question generation'),
});

export type QuestionGenerationInput = z.infer<typeof QuestionGenerationInputSchema>;

const GeneratedQuestionSchema = z.object({
  text: z.string().describe('The question text'),
  options: z.array(z.object({
    text: z.string().describe('Option text'),
    isCorrect: z.boolean().describe('Whether this option is correct'),
  })).describe('Answer options for multiple choice questions'),
  explanation: z.string().describe('Detailed explanation of the correct answer'),
  topic: z.string().describe('The specific topic this question covers'),
  formula: z.string().optional().describe('Mathematical formula if applicable'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('Actual difficulty of the generated question'),
  keywords: z.array(z.string()).describe('Key concepts covered in the question'),
  learningObjective: z.string().describe('What the student should learn from this question'),
});

const QuestionGenerationOutputSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).describe('Generated questions'),
  metadata: z.object({
    totalGenerated: z.number().describe('Total number of questions generated'),
    subject: z.string().describe('Subject of the questions'),
    topic: z.string().describe('Topic of the questions'),
    averageDifficulty: z.string().describe('Average difficulty level'),
    generationTimestamp: z.string().describe('When the questions were generated'),
  }),
  qualityScore: z.number().min(0).max(1).describe('Overall quality score of generated questions'),
  suggestions: z.array(z.string()).describe('Suggestions for improving question quality'),
});

export type QuestionGenerationOutput = z.infer<typeof QuestionGenerationOutputSchema>;

export async function generateQuestions(
  input: QuestionGenerationInput
): Promise<QuestionGenerationOutput> {
  console.log('🚀 Question Generation Request:', input);
  try {
    const response = await questionGeneratorFlow(input);
    console.log('✅ Questions Generated Successfully');
    return response;
  } catch (error) {
    console.error('❌ Question Generation Error:', error);
    throw new Error('Failed to generate questions');
  }
}



const questionGeneratorFlow = ai.defineFlow(
  {
    name: 'questionGenerator',
    inputSchema: QuestionGenerationInputSchema,
    outputSchema: QuestionGenerationOutputSchema,
  },
  async (input) => {
    const typeDescriptions = {
      'multiple-choice': 'multiple choice questions with 4 options where exactly one is correct',
      'true-false': 'true/false questions',
      'calculation': 'calculation-based questions requiring mathematical problem solving',
      'case-study': 'case study questions with real-world scenarios'
    };

    const languageInstructions = input.language === 'tr' 
      ? 'Generate all content in Turkish. Use proper Turkish grammar and terminology.'
      : 'Generate all content in English.';

    const systemPrompt = `You are an expert educational content creator specializing in creating high-quality exam questions.
Your task is to generate ${input.count} ${typeDescriptions[input.type]} for the subject "${input.subject}" on the topic "${input.topic}".

${languageInstructions}

IMPORTANT: You must respond with ONLY valid JSON in the following format:
{
  "questions": [
    {
      "text": "Question text here",
      "options": [
        {"text": "Option A", "isCorrect": true},
        {"text": "Option B", "isCorrect": false},
        {"text": "Option C", "isCorrect": false},
        {"text": "Option D", "isCorrect": false}
      ],
      "explanation": "Detailed explanation here",
      "topic": "Topic name",
      "difficulty": "Easy|Medium|Hard",
      "keywords": ["keyword1", "keyword2"],
      "learningObjective": "Learning objective description"
    }
  ],
  "metadata": {
    "totalGenerated": ${input.count},
    "subject": "${input.subject}",
    "topic": "${input.topic}",
    "averageDifficulty": "${input.difficulty}",
    "generationTimestamp": ""
  },
  "qualityScore": 0.85,
  "suggestions": []
}

Requirements:
1. Questions must be clear, unambiguous, and educationally valuable
2. Difficulty level should match "${input.difficulty}":
   - Easy: Basic recall and understanding
   - Medium: Application and analysis
   - Hard: Synthesis and evaluation
3. Each question must test a specific learning objective
4. Avoid questions that are too similar to existing ones: ${input.existingQuestions?.join(', ') || 'None provided'}
5. Include detailed explanations that help students learn
6. For calculation questions, include the formula used
7. Ensure factual accuracy and pedagogical soundness
8. RESPOND WITH ONLY VALID JSON - NO MARKDOWN, NO EXPLANATIONS OUTSIDE THE JSON

${input.guidelines ? `Additional Guidelines: ${input.guidelines}` : ''}

Quality Criteria:
- Clarity: Questions should be easily understood
- Relevance: Questions must be directly related to the topic
- Discrimination: Questions should differentiate between students who understand and those who don't
- Validity: Questions should measure what they intend to measure

REMEMBER: Return ONLY the JSON object, no other text.`;

    const response = await ai.generate(systemPrompt);

    // Check if response is valid
    if (!response || !response.text) {
      console.error('❌ AI generation returned null or invalid response:', response);
      throw new Error('AI generation failed - invalid response');
    }

    // Clean the response text to remove markdown formatting
    let cleanedText = response.text;
    
    // Remove markdown code blocks if present
    if (cleanedText.includes('```json')) {
      cleanedText = cleanedText.replace(/```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.includes('```')) {
      cleanedText = cleanedText.replace(/```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Trim whitespace
    cleanedText = cleanedText.trim();
    
    console.log('🧹 Cleaned response text:', cleanedText.substring(0, 200) + '...');
    
    // Parse the cleaned text as JSON
    let output;
    try {
      output = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', cleanedText);
      console.error('❌ Parse error details:', parseError);
      console.error('❌ Response length:', cleanedText?.length || 0);
      console.error('❌ Response preview:', cleanedText?.substring(0, 200) + '...');
      throw new Error('AI generation failed - invalid JSON response. The AI returned natural language instead of JSON format.');
    }

    // Validate output structure
    if (!output || !output.metadata || !output.questions) {
      console.error('❌ Invalid output structure:', output);
      throw new Error('AI generation failed - invalid output structure');
    }

    // Add timestamp
    if (output.metadata) {
      (output.metadata as any).generationTimestamp = new Date().toISOString();
    }

    // Validate and ensure quality
    const validatedOutput = validateGeneratedQuestions(output, input);
    
    return validatedOutput;
  }
);

function validateGeneratedQuestions(
  output: QuestionGenerationOutput,
  input: QuestionGenerationInput
): QuestionGenerationOutput {
  // Ensure we have the requested number of questions
  if (output.questions.length < input.count) {
    console.warn(`Generated ${output.questions.length} questions instead of ${input.count}`);
  }

  // Validate each question
  output.questions = output.questions.map(question => {
    // Ensure multiple choice questions have exactly 4 options
    if (input.type === 'multiple-choice' && question.options.length !== 4) {
      console.warn('Multiple choice question does not have exactly 4 options');
      // Pad or trim options
      while (question.options.length < 4) {
        question.options.push({
          text: `Option ${question.options.length + 1}`,
          isCorrect: false
        });
      }
      question.options = question.options.slice(0, 4);
    }

    // Ensure exactly one correct answer for multiple choice
    if (input.type === 'multiple-choice') {
      const correctCount = question.options.filter(opt => opt.isCorrect).length;
      if (correctCount !== 1) {
        console.warn('Multiple choice question does not have exactly one correct answer');
        // Reset all to false and set first as correct
        question.options.forEach(opt => opt.isCorrect = false);
        question.options[0].isCorrect = true;
      }
    }

    // Ensure true/false questions have exactly 2 options
    if (input.type === 'true-false' && question.options.length !== 2) {
      question.options = [
        { text: input.language === 'tr' ? 'Doğru' : 'True', isCorrect: true },
        { text: input.language === 'tr' ? 'Yanlış' : 'False', isCorrect: false }
      ];
    }

    return question;
  });

  // Calculate quality score based on various factors
  let qualityScore = 1.0;
  
  // Deduct for missing questions
  if (output.questions.length < input.count) {
    qualityScore -= (input.count - output.questions.length) * 0.1;
  }

  // Check for empty fields
  output.questions.forEach(q => {
    if (!q.text || q.text.trim().length < 10) qualityScore -= 0.1;
    if (!q.explanation || q.explanation.trim().length < 20) qualityScore -= 0.05;
    if (!q.learningObjective) qualityScore -= 0.05;
  });

  output.qualityScore = Math.max(0, Math.min(1, qualityScore));

  return output;
}