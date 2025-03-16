import { create } from 'zustand';
import { toast } from 'sonner';

// Types for meal planning
export type Allergen = {
  name: string;
  severity: 'High' | 'Medium' | 'Low';
};

export type Ingredient = {
  name: string;
  containsAllergens: string[];
};

export type MealPlan = {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  allergensFound: string[];
  suggestions: string[];
  imageUrl?: string;
  createdAt: string;
};

export type FoodRecipe = {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  allergensFound: string[];
  suggestions: string[];
  imageUrl?: string;
};

// Store state type
type MealPlanningStore = {
  // General state
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  // Scanner state
  scannedImage: string | null;
  setScannedImage: (image: string | null) => void;
  scannedIngredients: Ingredient[];
  setScannedIngredients: (ingredients: Ingredient[]) => void;

  // Meal planning state
  mealPlans: MealPlan[];
  setMealPlans: (mealPlans: MealPlan[]) => void;
  selectedMealPlan: MealPlan | null;
  setSelectedMealPlan: (mealPlan: MealPlan | null) => void;

  // Recipe suggestions state
  recipes: FoodRecipe[];
  setRecipes: (recipes: FoodRecipe[]) => void;

  // Child allergies state (for checking compatibility)
  childAllergies: Allergen[];
  setChildAllergies: (allergies: Allergen[]) => void;

  // Scanner methods
  scanImage: (imageData: string) => Promise<void>;
  clearScanResults: () => void;

  // Meal planning methods
  createMealPlan: (mealPlan: Omit<MealPlan, 'id' | 'createdAt'>) => void;
  updateMealPlan: (id: string, mealPlan: Partial<MealPlan>) => void;
  deleteMealPlan: (id: string) => void;

  // Recipe methods
  generateRecipes: (ingredients: string[], allergies: string[]) => Promise<void>;
  clearRecipes: () => void;
};

// Create the store
export const useMealPlanningStore = create<MealPlanningStore>((set, get) => ({
  // Initialize state
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  scannedImage: null,
  setScannedImage: (image) => set({ scannedImage: image }),
  scannedIngredients: [],
  setScannedIngredients: (ingredients) => set({ scannedIngredients: ingredients }),

  mealPlans: [],
  setMealPlans: (mealPlans) => set({ mealPlans }),
  selectedMealPlan: null,
  setSelectedMealPlan: (mealPlan) => set({ selectedMealPlan: mealPlan }),

  recipes: [],
  setRecipes: (recipes) => set({ recipes }),

  childAllergies: [],
  setChildAllergies: (allergies) => set({ childAllergies: allergies }),

  // Scanner methods
  scanImage: async (imageData) => {
    try {
      set({ isLoading: true });

      // Call Gemini API to scan the image
      const response = await fetch('/api/genai/scan-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        throw new Error('Failed to scan image');
      }

      const data = await response.json();

      set({
        scannedIngredients: data.ingredients,
        isLoading: false,
      });

      toast.success('Image scanned successfully');
    } catch (error) {
      console.error('Error scanning image:', error);
      set({ isLoading: false });
      toast.error('Failed to scan image');
    }
  },

  clearScanResults: () => {
    set({
      scannedImage: null,
      scannedIngredients: [],
    });
  },

  // Meal planning methods
  createMealPlan: (mealPlan) => {
    const newMealPlan = {
      ...mealPlan,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      mealPlans: [...state.mealPlans, newMealPlan],
    }));

    toast.success('Meal plan created successfully');
  },

  updateMealPlan: (id, mealPlan) => {
    set((state) => ({
      mealPlans: state.mealPlans.map((plan) => (plan.id === id ? { ...plan, ...mealPlan } : plan)),
    }));

    toast.success('Meal plan updated successfully');
  },

  deleteMealPlan: (id) => {
    set((state) => ({
      mealPlans: state.mealPlans.filter((plan) => plan.id !== id),
    }));

    toast.success('Meal plan deleted successfully');
  },

  // Recipe methods
  generateRecipes: async (ingredients, allergies) => {
    try {
      set({ isLoading: true });

      // Call Gemini API to generate recipes
      const response = await fetch('/api/genai/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, allergies }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipes');
      }

      const data = await response.json();

      set({
        recipes: data.recipes,
        isLoading: false,
      });

      toast.success('Recipes generated successfully');
    } catch (error) {
      console.error('Error generating recipes:', error);
      set({ isLoading: false });
      toast.error('Failed to generate recipes');
    }
  },

  clearRecipes: () => {
    set({ recipes: [] });
  },
}));
