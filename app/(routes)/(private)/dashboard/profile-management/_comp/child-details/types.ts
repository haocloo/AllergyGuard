// types.ts - For all shared types
import type { Child, Symptom } from '../../types';
import type { Classroom, Teacher } from '@/services/dummy-data';

export interface ExtendedChild extends Child {
  firstName?: string;
  lastName?: string;
  gender?: string;
  photoUrl?: string;
  symptoms?: Symptom[];
  emergencyContacts?: EmergencyContact[];
  caretakers?: Caretaker[];
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
  status: 'pending' | 'active' | 'inactive';
  createdAt: string;
}

export interface CaretakerFormData {
  type: 'personal' | 'center';
  userId?: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  noteToCaretaker?: string;
}

export interface TempCaretaker extends Caretaker {
  status: 'pending';
}

// ... other types ...
