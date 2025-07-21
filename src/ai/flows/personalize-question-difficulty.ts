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

const PersonalizeQuestionDifficultyInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  subject: z.string().describe('The subject for which to personalize question difficulty (e.g., Finansal Tablo Analizi).'),
});
export type PersonalizeQuestionDifficultyInput = z.infer<typeof PersonalizeQuestionDifficultyInputSchema>;

const PersonalizeQuestionDifficultyOutputSchema = z.object({
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The personalized difficulty level for the user in the given subject.'),
});
export type PersonalizeQuestionDifficultyOutput = z.infer<typeof PersonalizeQuestionDifficultyOutputSchema>;

export async function personalizeQuestionDifficulty(
  input: PersonalizeQuestionDifficultyInput
): Promise<PersonalizeQuestionDifficultyOutput> {
  return personalizeQuestionDifficultyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeQuestionDifficultyPrompt',
  input: {schema: PersonalizeQuestionDifficultyInputSchema},
  output: {schema: PersonalizeQuestionDifficultyOutputSchema},
  prompt: `You are an AI that personalizes the difficulty of quiz questions for users based on their past performance in a given subject.

You will receive the user's ID and the subject.
Based on this information, you should analyze the user's historical performance in the subject and determine an appropriate difficulty level (Easy, Medium, or Hard).

Consider the user's success rate, the types of questions they struggle with, and the time they spend on each question.
Aim to provide a difficulty level that challenges the user without overwhelming them, allowing them to focus on their areas of weakness.

Return the difficulty level as a string.

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
