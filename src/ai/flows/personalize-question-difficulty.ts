// src/ai/flows/personalize-question-difficulty.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to personalize quiz question difficulty based on a user's past performance.
 *
 * It exports:
 * - `personalizeQuestionDifficulty`: An async function that takes a user ID and subject as input and returns a difficulty level.
 * - `PersonalizeQuestionDifficultyInput`: The input type for the `personalizeQuestionDifficulty` function.
 * - `PersonalizeQuestionDifficultyOutput`: The output type for the `personalizeQuestionDifficulty` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPerformanceHistoryForSubject } from '@/services/performance-service';
import type { QuizResult } from '@/lib/types';


const getPerformanceHistoryTool = ai.defineTool(
  {
    name: 'getPerformanceHistoryForSubject',
    description: "Retrieves a user's past quiz performance for a specific subject. Returns an array of quiz results, each containing score and total questions.",
    inputSchema: z.object({
      subject: z.string().describe('The subject to retrieve performance history for.'),
      userId: z.string().describe('The ID of the user.'),
    }),
    outputSchema: z.array(z.object({
        score: z.number(),
        totalQuestions: z.number(),
        timeSpent: z.number(),
        date: z.string(),
        weakTopics: z.record(z.string(), z.number()),
    })),
  },
  async (input) => getPerformanceHistoryForSubject(input.subject, input.userId)
);


const PersonalizeQuestionDifficultyInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  subject: z.string().describe('The subject for which to personalize question difficulty (e.g., Finansal Tablo Analizi).'),
  performanceData: z.string().describe("A stringified JSON object of the user's performance data from localStorage. The tool will handle this data.")
});
export type PersonalizeQuestionDifficultyInput = z.infer<typeof PersonalizeQuestionDifficultyInputSchema>;

const PersonalizeQuestionDifficultyOutputSchema = z.object({
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The personalized difficulty level for the user in the given subject.'),
});
export type PersonalizeQuestionDifficultyOutput = z.infer<typeof PersonalizeQuestionDifficultyOutputSchema>;

export async function personalizeQuestionDifficulty(
  input: PersonalizeQuestionDifficultyInput
): Promise<PersonalizeQuestionDifficultyOutput> {
  // Store the performance data in our mock "service" so the tool can access it.
  // In a real app, the tool would fetch this from a database.
  const performanceHistory = JSON.parse(input.performanceData);
  (getPerformanceHistoryForSubject as any).__setData(performanceHistory);
  
  return personalizeQuestionDifficultyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeQuestionDifficultyPrompt',
  input: {schema: PersonalizeQuestionDifficultyInputSchema},
  output: {schema: PersonalizeQuestionDifficultyOutputSchema},
  tools: [getPerformanceHistoryTool],
  prompt: `You are an AI that personalizes the difficulty of quiz questions for a student.

You MUST use the 'getPerformanceHistoryForSubject' tool to get the user's past performance for the given subject.

Analyze the user's average score from their most recent tests. Consider the last 3 tests for the analysis if available. The 'score' field is the number of correct answers and 'totalQuestions' is the total number of questions.

Follow these rules strictly:
- If there is no performance history for the subject, you MUST recommend 'Easy'.
- If the average score from the recent tests is below 50%, you MUST recommend 'Easy'.
- If the average score is between 50% and 80% (inclusive), you MUST recommend 'Medium'.
- If the average score is above 80%, you MUST recommend 'Hard'.

Return ONLY the difficulty level.

User ID: {{{userId}}}
Subject: {{{subject}}}`,
});

const personalizeQuestionDifficultyFlow = ai.defineFlow(
  {
    name: 'personalizeQuestionDifficultyFlow',
    inputSchema: PersonalizeQuestionDifficultyInputSchema,
    outputSchema: PersonalizeQuestionDifficultyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

// git
