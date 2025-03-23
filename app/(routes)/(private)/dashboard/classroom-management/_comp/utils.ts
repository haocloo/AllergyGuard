import { Classroom } from './types';

// Professional teacher photos from Unsplash
const DEFAULT_TEACHER_PHOTOS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?q=80&w=200&h=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=200&h=200&auto=format&fit=crop',
];

export function generateClassroomCode(): string {
  const prefix = 'CLS';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}-${year}-${random}`;
}

export function transformDummyClassroom(dummyClassroom: any): Classroom {
  if (!dummyClassroom) {
    throw new Error('Invalid classroom data');
  }

  // Get a random default photo if none is provided
  const randomPhoto =
    DEFAULT_TEACHER_PHOTOS[Math.floor(Math.random() * DEFAULT_TEACHER_PHOTOS.length)];

  return {
    id: dummyClassroom.id || `cls-${Date.now()}`,
    code: dummyClassroom.code || generateClassroomCode(),
    name: dummyClassroom.name || 'Untitled Classroom',
    teacher: {
      id: dummyClassroom.teacher?.id || `tchr-${Date.now()}`,
      name: dummyClassroom.teacher?.name || 'Unknown Teacher',
      role: 'Head Teacher',
      phone: dummyClassroom.teacher?.phone || '',
      photoUrl: dummyClassroom.teacher?.photoUrl || randomPhoto,
    },
    children: Array.isArray(dummyClassroom.children)
      ? dummyClassroom.children.map((child: any, index: number) => ({
          id: child?.id || `child-${index}`,
          name: child?.name || `Student ${index + 1}`,
          photoUrl: child?.photoUrl,
          allergies: Array.isArray(child?.allergies) ? child.allergies : [],
        }))
      : [],
    allergenAlerts: Array.isArray(dummyClassroom.allergenAlerts)
      ? dummyClassroom.allergenAlerts
      : [],
    createdAt: dummyClassroom.createdAt || new Date().toISOString(),
  };
}
