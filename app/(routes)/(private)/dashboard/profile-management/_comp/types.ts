// Define types for the profile management feature

export type AllergySeverity = 'Low' | 'Medium' | 'High';

export interface Allergy {
  allergen: string;
  severity: AllergySeverity;
  notes: string;
}

export interface Child {
  id: string;
  name: string;
  dob: string;
  allergies: Allergy[];
  parentId: string;
  classroomId?: string;
  createdAt: string;
  createdBy: string;
}

export interface Classroom {
  id: string;
  accessCode: string;
  name: string;
  children: string[];
  createdAt: string;
  createdBy: string;
}

export interface SymptomResponse {
  symptom: string;
  actions: string[];
  allergen: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'caretaker' | 'parent' | 'admin';
}
