'use server';

import { z } from 'zod';
import { generateProfileSuggestions } from '@/ai/flows/ai-profile-suggestions';
import type { ProfileSuggestionsOutput } from '@/ai/flows/ai-profile-suggestions';

const schema = z.object({
  profileDescription: z.string(),
  profileImage: z.string().url(),
  subscriptionPlans: z.string(),
});

export async function getAiSuggestionsAction(
  prevState: ProfileSuggestionsOutput,
  formData: FormData
): Promise<ProfileSuggestionsOutput> {
  try {
    const parsed = schema.parse({
      profileDescription: formData.get('profileDescription'),
      profileImage: formData.get('profileImage'),
      subscriptionPlans: formData.get('subscriptionPlans'),
    });

    // Fetch the image and convert it to a Base64 data URI
    const response = await fetch(parsed.profileImage);
    if (!response.ok) {
        throw new Error('Failed to fetch profile image for AI analysis.');
    }
    const imageBuffer = await response.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${imageBase64}`;

    const suggestions = await generateProfileSuggestions({
      profileDescription: parsed.profileDescription,
      profileImage: dataUri,
      subscriptionPlans: parsed.subscriptionPlans,
    });

    return suggestions;
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    // In a real app, you'd want to return a more user-friendly error state
    return {
        descriptionSuggestions: 'Ocorreu um erro ao gerar sugestões. Tente novamente.',
        imageSuggestions: '',
        subscriptionPlanSuggestions: ''
    };
  }
}
