'use server';

import { ChildProfile, Allergy } from './types';

// Import data from meal-planning component and dummy-data
import { children } from '@/services/dummy-data';
import { familyMembers } from '../../meal-planning/_comp/mock-data';

// Map familyMembers data to ChildProfile type
const SAMPLE_CHILDREN: ChildProfile[] = familyMembers.map((member) => {
  const childData = children.find((c) => c.id === member.id);

  return {
    id: member.id,
    name: member.name,
    age: childData?.dob
      ? new Date().getFullYear() - new Date(childData.dob).getFullYear()
      : Math.floor(Math.random() * 5) + 5,
    allergies: member.allergies,
    avatar: childData?.photoUrl || `/images/avatars/child-${Math.floor(Math.random() * 3) + 1}.png`,
    createdAt: new Date().toISOString(),
  };
});

// Create allergies data based on the family members allergies
const SAMPLE_ALLERGIES: Allergy[] = [
  {
    id: 'dairy',
    name: 'Milk & Dairy',
    severity: 'severe',
    category: 'dairy',
  },
  {
    id: 'nuts',
    name: 'Nuts & Peanuts',
    severity: 'severe',
    category: 'nuts',
  },
  {
    id: 'seafood',
    name: 'Seafood',
    severity: 'severe',
    category: 'seafood',
  },
  {
    id: 'shellfish',
    name: 'Shellfish',
    severity: 'severe',
    category: 'seafood',
  },
  {
    id: 'shrimp',
    name: 'Shrimp',
    severity: 'moderate',
    category: 'seafood',
  },
];

// Game results storage (in-memory for demo)
let childBadges: Record<string, string[]> = {}; // childId -> badgeIds[]

// Fetch children profiles
export async function getChildrenProfiles(): Promise<ChildProfile[]> {
  // Return our mapped child profiles that use the same user data
  return SAMPLE_CHILDREN;
}

// Fetch allergies
export async function getAllergies(): Promise<Allergy[]> {
  // Return our sample allergies
  return SAMPLE_ALLERGIES;
}

// Save game results


// Get child badges
export async function getChildBadges(childId: string): Promise<string[]> {
  // In a real app, fetch from your database
  // For demo, return from in-memory object
  return childBadges[childId] || [];
}

// Get leaderboard
