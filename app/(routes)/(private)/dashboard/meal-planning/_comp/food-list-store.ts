import { create } from 'zustand';
import { toast } from 'sonner';
import { persist } from 'zustand/middleware';

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
  addRecipe: (recipe: Omit<FoodRecipe, 'id'>) => void;
  getRecipeById: (recipeId: string) => FoodRecipe | null;
};

// Create the store
export const useFoodListStore = create<FoodListStore>()(
  persist(
    (set, get) => ({
      // Initialize state
      foodRecipes: [],
      searchQuery: '',
      isLoading: false,
      selectedRecipe: null,
      
      // Set actions
      setFoodRecipes: (recipes) => {
        // Merge recipes rather than replacing them
        const currentRecipes = get().foodRecipes;
        const mergedRecipes = [...currentRecipes];
        
        // Add any new recipes from the provided array
        recipes.forEach(newRecipe => {
          const existingIndex = mergedRecipes.findIndex(r => r.id === newRecipe.id);
          if (existingIndex >= 0) {
            // Update existing recipe
            mergedRecipes[existingIndex] = { ...newRecipe };
          } else {
            // Add new recipe
            mergedRecipes.push({ ...newRecipe });
          }
        });
        
        set({ foodRecipes: mergedRecipes });
      },
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
      
      getRecipeById: (recipeId) => {
        const { foodRecipes } = get();
        return foodRecipes.find((r) => r.id === recipeId) || null;
      },
      
      addFavorite: (recipeId) => {
        // In a real app, this would make an API call to save to user's favorites
        toast.success('Recipe added to favorites');
      },
      
      removeFavorite: (recipeId) => {
        // In a real app, this would make an API call to remove from user's favorites
        toast.success('Recipe removed from favorites');
      },
      
      addRecipe: (recipeData) => {
        const { foodRecipes } = get();
        
        // Create a new recipe with a unique ID
        const newRecipe: FoodRecipe = {
          ...recipeData,
          id: crypto.randomUUID()
        };
        
        // Add to the list of recipes at the beginning for better visibility
        set({ 
          foodRecipes: [newRecipe, ...foodRecipes],
          selectedRecipe: newRecipe 
        });
        
        toast.success('Recipe saved successfully');
      }
    }),
    {
      name: 'food-list-storage', // name of the item in the storage
      partialize: (state) => ({ foodRecipes: state.foodRecipes }), // only persist the foodRecipes
    }
  )
); 