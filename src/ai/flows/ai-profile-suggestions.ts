'use server';

/**
 * @fileOverview An AI-driven profile suggestion generator for models.
 *
 * - generateProfileSuggestions - A function that generates suggestions for improving a model's profile.
 * - ProfileSuggestionsInput - The input type for the generateProfileSuggestions function.
 * - ProfileSuggestionsOutput - The return type for the generateProfileSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProfileSuggestionsInputSchema = z.object({
  profileDescription: z
    .string()
    .describe('The current profile description of the model.'),
  profileImage: z
    .string()
    .describe(
      "A photo of the model, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  subscriptionPlans: z
    .string()
    .describe('A description of the current subscription plans offered.'),
});
export type ProfileSuggestionsInput = z.infer<typeof ProfileSuggestionsInputSchema>;

const ProfileSuggestionsOutputSchema = z.object({
  descriptionSuggestions: z
    .string()
    .describe('Suggestions for improving the profile description.'),
  imageSuggestions: z.string().describe('Suggestions for improving the profile image.'),
  subscriptionPlanSuggestions: z
    .string()
    .describe('Suggestions for improving the subscription plans.'),
});
export type ProfileSuggestionsOutput = z.infer<typeof ProfileSuggestionsOutputSchema>;

export async function generateProfileSuggestions(
  input: ProfileSuggestionsInput
): Promise<ProfileSuggestionsOutput> {
  return generateProfileSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'profileSuggestionsPrompt',
  input: {schema: ProfileSuggestionsInputSchema},
  output: {schema: ProfileSuggestionsOutputSchema},
  prompt: `You are an AI profile optimization expert for content creators.

  Given the following information about a model's profile, provide specific suggestions to improve their profile description, image, and subscription plans to maximize conversions and attract more subscribers.

  Profile Description: {{{profileDescription}}}
  Profile Image: {{media url=profileImage}}
  Subscription Plans: {{{subscriptionPlans}}}

  Provide the suggestions in a structured format, clearly separating the suggestions for each area (description, image, and subscription plans). Focus on actionable and specific improvements.
`,
});

const generateProfileSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateProfileSuggestionsFlow',
    inputSchema: ProfileSuggestionsInputSchema,
    outputSchema: ProfileSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
