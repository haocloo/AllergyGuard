import { Classroom } from './types';

// Client-side storage operations
export async function getLocalClassrooms(): Promise<Classroom[]> {
  try {
    const stored = localStorage.getItem('classrooms');
    if (stored) {
      const classrooms = JSON.parse(stored);
      // Ensure children array is properly initialized
      return classrooms.map((classroom: Classroom) => ({
        ...classroom,
        children: Array.isArray(classroom.children) ? classroom.children : [],
        allergenAlerts: Array.isArray(classroom.allergenAlerts) ? classroom.allergenAlerts : [],
      }));
    }
    // If no localStorage data, return empty array (don't return initialClassrooms here)
    return [];
  } catch (error) {
    console.error('Error getting local classrooms:', error);
    return [];
  }
}

export async function createLocalClassroom(classroom: Classroom): Promise<void> {
  try {
    const existingClassrooms = await getLocalClassrooms();
    // Ensure arrays are initialized
    const newClassroom = {
      ...classroom,
      children: Array.isArray(classroom.children) ? classroom.children : [],
      allergenAlerts: Array.isArray(classroom.allergenAlerts) ? classroom.allergenAlerts : [],
    };
    const updatedClassrooms = [...existingClassrooms, newClassroom];
    localStorage.setItem('classrooms', JSON.stringify(updatedClassrooms));
  } catch (error) {
    console.error('Error creating local classroom:', error);
    throw error;
  }
}
