import { z } from 'zod';
import { schema_select_profile } from './validation';

export type T_schema_select_profile = z.infer<typeof schema_select_profile>;

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  allergies: string[]; // IDs of allergies
  avatar: string;
  createdAt: string;
};

export type Allergy = {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  category: AllergyCategory;
};

export type AllergyCategory = 'dairy' | 'nuts' | 'seafood' | 'grains' | 'fruits' | 'vegetables' | 'others';

export type FoodItem = {
  id: string;
  name: string;
  image: string;
  allergens: string[]; // IDs of allergies
  isMalaysianCuisine?: boolean;
  category: FoodCategory;
};

export type FoodCategory = 'fruit' | 'vegetable' | 'dessert' | 'main' | 'snack' | 'drink';

export type GameResult = {
  childId: string;
  score: number;
  safeItemsSliced: number;
  allergenItemsSliced: number;
  totalItemsSliced: number;
  timestamp: string;
};

export type GameBadge = {
  id: string;
  name: string;
  description: string;
  image: string;
  unlockRequirement: {
    score?: number;
    safeItemsSliced?: number;
  };
};

export type LeaderboardEntry = {
  childId: string;
  childName: string;
  avatar: string;
  score: number;
  timestamp: string;
};

export const FOOD_CATEGORIES = [
  { value: 'fruit' as FoodCategory, label: 'Fruits' },
  { value: 'vegetable' as FoodCategory, label: 'Vegetables' },
  { value: 'dessert' as FoodCategory, label: 'Desserts' },
  { value: 'main' as FoodCategory, label: 'Main Dishes' },
  { value: 'snack' as FoodCategory, label: 'Snacks' },
  { value: 'drink' as FoodCategory, label: 'Drinks' },
] as const; 