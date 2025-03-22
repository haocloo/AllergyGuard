export interface ClassroomAllergy {
  name: string;
  count: number;
}

export interface ClassroomChild {
  id: string;
  name: string;
  photoUrl: string;
  allergies: string[];
}

export interface ClassroomDetails {
  id: string;
  code: string;
  tutor: {
    name: string;
    photoUrl: string;
    phone: string;
  };
  allergies: ClassroomAllergy[];
  children: ClassroomChild[];
}

export interface Teacher {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  photoUrl?: string;
}

export interface Child {
  id: string;
  name: string;
  photoUrl?: string;
  allergies: string[];
}

export interface AllergenAlert {
  name: string;
  count: number;
  children: string[];
}

export interface Classroom {
  id: string;
  code: string;
  name: string;
  teacher: Teacher;
  children: Child[];
  allergenAlerts: AllergenAlert[];
  createdAt: string;
  centerName?: string;
  address?: string;
}

export interface ClassroomFormData {
  name: string;
  teacher: {
    name: string;
    role: string;
    phone: string;
    photoUrl?: string;
  };
}
