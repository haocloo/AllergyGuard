import { z } from 'zod';
import { schema_create_child } from './validation';

export type T_schema_create_child = z.infer<typeof schema_create_child>;

export type SymptomSeverity = 'Mild' | 'Moderate' | 'Severe';

export interface Symptom {
  name: string;
  severity: SymptomSeverity;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isMainContact: boolean;
}

export interface Caretaker {
  id: string;
  type: 'personal' | 'center';
  name: string;
  email: string;
  role: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

export interface Child {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'male' | 'female';
  photoUrl?: string;
  parentId: string;
  classroomId: string;
  createdAt: string;
  createdBy: string;
  allergies: Allergy[];
  symptoms: Symptom[];
  emergencyContacts: EmergencyContact[];
  caretakers: Caretaker[];
}

export interface AllergySymptom {
  name: string;
  isCustom?: boolean;
}

export interface Allergy {
  allergen: string;
  notes: string;
  severity: 'Low' | 'Medium' | 'High';
  symptoms: AllergySymptom[];
  actionPlan: ActionPlan;
  isCustomAllergen?: boolean;
}

export interface ActionPlan {
  immediateAction: string;
  medications: {
    name: string;
    dosage: string;
  }[];
}

export interface ChildFormData {
  firstName: string;
  lastName: string;
  name: string;
  dob: string;
  gender: 'male' | 'female';
  photoUrl?: string;
  allergies: Allergy[];
  symptoms: Symptom[];
  emergencyContacts: EmergencyContact[];
  parentId?: string;
  classroomId?: string;
  createdBy?: string;
}

// Common options
export const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Soy',
  'Wheat',
  'Fish',
  'Shellfish',
  'Sesame Seeds',
  'Other',
] as const;

export const COMMON_SYMPTOMS = [
  'Rash',
  'Hives',
  'Swelling',
  'Difficulty Breathing',
  'Wheezing',
  'Coughing',
  'Nausea',
  'Vomiting',
  'Dizziness',
  'Anaphylaxis',
  'Other',
] as const;

export const SEVERITY_COLORS = {
  Mild: 'bg-green-100 text-green-700 border-green-200',
  Moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Severe: 'bg-red-100 text-red-700 border-red-200',
} as const;
