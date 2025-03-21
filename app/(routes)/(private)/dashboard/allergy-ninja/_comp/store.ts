import { create } from 'zustand';
import { ChildProfile, Allergy, GameResult, GameBadge, LeaderboardEntry, FoodItem } from './types';

interface GameStore {
  // Data
  childProfiles: ChildProfile[];
  allergies: Allergy[];
  gameResults: GameResult[];
  badges: GameBadge[];
  leaderboard: LeaderboardEntry[];
  foodItems: FoodItem[];
  
  // Actions
  setChildProfiles: (profiles: ChildProfile[]) => void;
  setAllergies: (allergies: Allergy[]) => void;
  addGameResult: (result: GameResult) => void;
  setBadges: (badges: GameBadge[]) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  setFoodItems: (items: FoodItem[]) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  childProfiles: [],
  allergies: [],
  gameResults: [],
  badges: [],
  leaderboard: [],
  foodItems: [],
  
  // Actions
  setChildProfiles: (profiles) => set({ childProfiles: profiles }),
  setAllergies: (allergies) => set({ allergies }),
  addGameResult: (result) => set((state) => ({ 
    gameResults: [...state.gameResults, result] 
  })),
  setBadges: (badges) => set({ badges }),
  setLeaderboard: (entries) => set({ leaderboard: entries }),
  setFoodItems: (items) => set({ foodItems: items }),
}));

// Sample badges data for initial state
export const initialBadges: GameBadge[] = [
  {
    id: 'badge-1',
    name: 'Allergy Ninja Apprentice',
    description: 'Score 100 points in a single game',
    image: '/images/badges/ninja-apprentice.png',
    unlockRequirement: {
      score: 100,
    },
  },
  {
    id: 'badge-2',
    name: 'Fruit Master',
    description: 'Successfully slice 20 safe fruits',
    image: '/images/badges/fruit-master.png',
    unlockRequirement: {
      safeItemsSliced: 20,
    },
  },
  {
    id: 'badge-3',
    name: 'Allergy Ninja Master',
    description: 'Score 500 points in a single game',
    image: '/images/badges/ninja-master.png',
    unlockRequirement: {
      score: 500,
    },
  },
];

// Sample Malaysian food items with and without common allergens
export const initialFoodItems: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Nasi Lemak',
    image: '/images/foods/nasi-lemak.png',
    allergens: ['nuts'], // Contains peanuts
    isMalaysianCuisine: true,
    category: 'main',
  },
  {
    id: 'food-2',
    name: 'Roti Canai',
    image: '/images/foods/roti-canai.png',
    allergens: ['grains', 'dairy'], // Contains wheat and sometimes ghee
    isMalaysianCuisine: true,
    category: 'main',
  },
  {
    id: 'food-3',
    name: 'Apple',
    image: '/images/foods/apple.png',
    allergens: [],
    category: 'fruit',
  },
  {
    id: 'food-4',
    name: 'Banana',
    image: '/images/foods/banana.png',
    allergens: [],
    category: 'fruit',
  },
  {
    id: 'food-5',
    name: 'Satay',
    image: '/images/foods/satay.png',
    allergens: ['nuts'], // Peanut sauce
    isMalaysianCuisine: true,
    category: 'main',
  },
  {
    id: 'food-6',
    name: 'Laksa',
    image: '/images/foods/laksa.png',
    allergens: ['seafood', 'grains'], // Contains shrimp and noodles
    isMalaysianCuisine: true,
    category: 'main',
  },
  {
    id: 'food-7',
    name: 'Carrot',
    image: '/images/foods/carrot.png',
    allergens: [],
    category: 'vegetable',
  },
  {
    id: 'food-8',
    name: 'Donut',
    image: '/images/foods/donut.png',
    allergens: ['grains', 'dairy'],
    category: 'dessert',
  },
  // Add more dairy/milk items
  {
    id: 'food-9',
    name: 'Milk',
    image: '/images/foods/milk.png',
    allergens: ['dairy'],
    category: 'drink',
  },
  {
    id: 'food-10',
    name: 'Cheese',
    image: '/images/foods/cheese.png',
    allergens: ['dairy'],
    category: 'snack',
  },
  {
    id: 'food-11',
    name: 'Ice Cream',
    image: '/images/foods/ice-cream.png',
    allergens: ['dairy'],
    category: 'dessert',
  },
  {
    id: 'food-12',
    name: 'Yogurt',
    image: '/images/foods/yogurt.png',
    allergens: ['dairy'],
    category: 'snack',
  },
  {
    id: 'food-13',
    name: 'Butter',
    image: '/images/foods/butter.png',
    allergens: ['dairy'],
    category: 'snack',
  },
  {
    id: 'food-14',
    name: 'Chocolate Milk',
    image: '/images/foods/chocolate-milk.png',
    allergens: ['dairy'],
    category: 'drink',
  },
  {
    id: 'food-15',
    name: 'Whipped Cream',
    image: '/images/foods/whipped-cream.png',
    allergens: ['dairy'],
    category: 'dessert',
  },
  {
    id: 'food-16',
    name: 'Milkshake',
    image: '/images/foods/milkshake.png',
    allergens: ['dairy'],
    category: 'drink',
  },
  // Add more non-dairy foods
  {
    id: 'food-17',
    name: 'Broccoli',
    image: '/images/foods/broccoli.png',
    allergens: [],
    category: 'vegetable',
  },
  {
    id: 'food-18',
    name: 'Orange',
    image: '/images/foods/orange.png',
    allergens: [],
    category: 'fruit',
  },
  {
    id: 'food-19',
    name: 'Rice',
    image: '/images/foods/rice.png',
    allergens: [],
    isMalaysianCuisine: true,
    category: 'main',
  },
  {
    id: 'food-20',
    name: 'Water',
    image: '/images/foods/water.png',
    allergens: [],
    category: 'drink',
  }
]; 