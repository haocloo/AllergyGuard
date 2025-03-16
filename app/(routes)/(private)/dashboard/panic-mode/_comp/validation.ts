import { z } from 'zod';

// Schema for analyzing symptoms
export const schema_analyze_symptoms = z.object({
  symptoms: z.string().min(1, 'Symptoms are required'),
  childAge: z.string().optional(),
  childAllergies: z.array(z.string()).optional(),
  language: z.string().default('en'),
});

// Schema for symptom analysis response
export const symptomAnalysisResponseSchema = z.object({
  potentialCauses: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      urgencyLevel: z.enum(['low', 'medium', 'high', 'emergency']),
      recommendedActions: z.array(z.string()),
    })
  ),
});
