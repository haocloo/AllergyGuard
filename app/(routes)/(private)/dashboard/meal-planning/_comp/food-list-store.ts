import { create } from 'zustand';
import { toast } from 'sonner';

// Import types from the main store
import type { FoodRecipe } from './store';

// Food List Store type
type FoodListStore = {
  // State
  foodRecipes: FoodRecipe[];
  searchQuery: string;
  isLoading: boolean;
  selectedRecipe: FoodRecipe | null;
  
  // Actions
  setFoodRecipes: (recipes: FoodRecipe[]) => void;
  setSearchQuery: (query: string) => void;
  setIsLoading: (loading: boolean) => void;
  setSelectedRecipe: (recipe: FoodRecipe | null) => void;
  
  // Methods
  viewRecipeDetails: (recipeId: string) => void;
  addFavorite: (recipeId: string) => void;
  removeFavorite: (recipeId: string) => void;
};

// Create the store
export const useFoodListStore = create<FoodListStore>((set, get) => ({
  // Initialize state
  foodRecipes: [],
  searchQuery: '',
  isLoading: false,
  selectedRecipe: null,
  
  // Set actions
  setFoodRecipes: (recipes) => set({ foodRecipes: recipes }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),
  
  // Methods
  viewRecipeDetails: (recipeId) => {
    const { foodRecipes } = get();
    const recipe = foodRecipes.find((r) => r.id === recipeId);
    
    if (recipe) {
      set({ selectedRecipe: recipe });
    }
  },
  
  addFavorite: (recipeId) => {
    // In a real app, this would make an API call to save to user's favorites
    toast.success('Recipe added to favorites');
  },
  
  removeFavorite: (recipeId) => {
    // In a real app, this would make an API call to remove from user's favorites
    toast.success('Recipe removed from favorites');
  },
})); 