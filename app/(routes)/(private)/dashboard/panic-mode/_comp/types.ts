import { z } from 'zod';
import { schema_analyze_symptoms } from './validation';

export type T_schema_analyze_symptoms = z.infer<typeof schema_analyze_symptoms>;

export type SymptomRequest = {
  symptoms: string;
  childAge?: string;
  childAllergies?: string[];
  language?: string;
};

export type SymptomResponse = {
  requestId: string;
  timestamp: string;
  symptoms: string;
  possibleCauses: {
    condition: string;
    description: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  }[];
  recommendedActions: {
    action: string;
    urgency: 'immediate' | 'soon' | 'when convenient';
    instructions: string;
  }[];
  allergyRelated: boolean;
  additionalNotes: string;
  sourceReferences: string[];
  createdAt: string;
};

export type SymptomHistory = {
  id: string;
  userId: string;
  symptomResponse: SymptomResponse;
};

export type SymptomAnalysis = {
  id: string;
  symptoms: string;
  language: string;
  childName?: string;
  potentialCauses: PotentialCause[];
  createdAt: string;
  status: SymptomAnalysisStatus;
};

export type SymptomAnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

export type PotentialCause = {
  name: string;
  description: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendedActions: string[];
};

export type ChildAge = '0-1' | '1-3' | '4-7' | '8-12' | '13-17';

export const CHILD_AGES = [
  { value: '0-1' as ChildAge, label: 'Infant (0-1 years)' },
  { value: '1-3' as ChildAge, label: 'Toddler (1-3 years)' },
  { value: '4-7' as ChildAge, label: 'Preschool/Early Elementary (4-7 years)' },
  { value: '8-12' as ChildAge, label: 'Elementary/Middle (8-12 years)' },
  { value: '13-17' as ChildAge, label: 'Teen (13-17 years)' },
] as const;

export const COMMON_ALLERGIES = [
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'tree_nuts', label: 'Tree Nuts' },
  { value: 'milk', label: 'Milk/Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'soy', label: 'Soy' },
  { value: 'fish', label: 'Fish' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'sesame', label: 'Sesame' },
  { value: 'other', label: 'Other' },
];

export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ms', label: 'Malay' },
] as const;

// Urgency level colors for UI display
export const URGENCY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800',
} as const;
