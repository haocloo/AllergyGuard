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