'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { schema_save_game_result, schema_update_badges } from './validation';
import { GameResult, ChildProfile, Allergy, LeaderboardEntry } from './types';

// Sample data aligned with our profile selector
const SAMPLE_CHILDREN: ChildProfile[] = [
  {
    id: 'profile-milk',
    name: 'Amira',
    age: 8,
    allergies: ['dairy'],
    avatar: '/images/avatars/child-1.png',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'profile-nuts',
    name: 'Zack',
    age: 6,
    allergies: ['nuts'],
    avatar: '/images/avatars/child-2.png',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'profile-seafood',
    name: 'Lina',
    age: 7,
    allergies: ['seafood'],
    avatar: '/images/avatars/child-3.png',
    createdAt: new Date().toISOString(),
  },
];

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
];

// Game results storage (in-memory for demo)
let gameResults: GameResult[] = [];
let childBadges: Record<string, string[]> = {}; // childId -> badgeIds[]

// Fetch children profiles
export async function getChildrenProfiles(): Promise<ChildProfile[]> {
  // In a real app, fetch from your database
  // For demo, return sample data
  return SAMPLE_CHILDREN;
}

// Fetch allergies
export async function getAllergies(): Promise<Allergy[]> {
  // In a real app, fetch from your database
  // For demo, return sample data
  return SAMPLE_ALLERGIES;
}

// Save game results
export async function saveGameResult(data: GameResult): Promise<{ success: boolean }> {
  try {
    // Validate the data
    schema_save_game_result.parse({
      childId: data.childId,
      score: data.score,
      safeItemsSliced: data.safeItemsSliced,
      allergenItemsSliced: data.allergenItemsSliced,
      totalItemsSliced: data.totalItemsSliced,
    });
    
    // In a real app, save to your database
    // For demo, add to in-memory array
    gameResults.push(data);
    
    // Update badges based on game result
    await updateBadgesForGameResult(data);
    
    // Revalidate the page to reflect changes
    revalidatePath('/dashboard/allergy-ninja');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to save game result:', error);
    return { success: false };
  }
}

// Update badges based on game results
async function updateBadgesForGameResult(result: GameResult): Promise<void> {
  const { childId, score, safeItemsSliced } = result;
  
  // Initialize badges array for child if not exists
  if (!childBadges[childId]) {
    childBadges[childId] = [];
  }
  
  // Badge thresholds - match these with initialBadges in store.ts
  if (score >= 100 && !childBadges[childId].includes('badge-1')) {
    childBadges[childId].push('badge-1'); // Allergy Ninja Apprentice
  }
  
  if (safeItemsSliced >= 20 && !childBadges[childId].includes('badge-2')) {
    childBadges[childId].push('badge-2'); // Fruit Master
  }
  
  if (score >= 500 && !childBadges[childId].includes('badge-3')) {
    childBadges[childId].push('badge-3'); // Allergy Ninja Master
  }
}

// Get child badges
export async function getChildBadges(childId: string): Promise<string[]> {
  // In a real app, fetch from your database
  // For demo, return from in-memory object
  return childBadges[childId] || [];
}

// Get leaderboard
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  // In a real app, fetch from your database
  // For demo, generate from in-memory game results
  
  // Map game results to leaderboard entries
  const entries: LeaderboardEntry[] = gameResults.map(result => {
    const profile = SAMPLE_CHILDREN.find(p => p.id === result.childId);
    
    return {
      childId: result.childId,
      childName: profile?.name || 'Unknown Player',
      avatar: profile?.avatar || '',
      score: result.score,
      timestamp: result.timestamp,
    };
  });
  
  // Sort by score (highest first) and limit to top 10
  return entries.sort((a, b) => b.score - a.score).slice(0, 10);
} 