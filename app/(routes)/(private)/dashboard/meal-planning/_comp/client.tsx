'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChefHat, BookOpen, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// ui
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// services
import type { FoodRecipe } from './store';
import { useFoodListStore } from './food-list-store';

interface Props {
  initialFoodRecipes: FoodRecipe[];
}

export function FoodListClient({ initialFoodRecipes }: Props) {
  const { foodRecipes, setFoodRecipes, searchQuery, setSearchQuery, isLoading, setIsLoading } = useFoodListStore();
  const [filteredRecipes, setFilteredRecipes] = useState<FoodRecipe[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize food recipes - only run once
  useEffect(() => {
    if (initialized) return;

    // Get current store recipes
    const storeRecipes = useFoodListStore.getState().foodRecipes;
    
    // Create a map of initial recipes by ID for faster lookup
    const initialRecipesMap = new Map(
      initialFoodRecipes.map(recipe => [recipe.id, recipe])
    );
    
    // Create a combined recipe list with no duplicates
    const combinedRecipes = [...initialFoodRecipes];
    
    // Add any recipes from the store that aren't in initial recipes
    storeRecipes.forEach(storeRecipe => {
      if (!initialRecipesMap.has(storeRecipe.id)) {
        combinedRecipes.push(storeRecipe);
      }
    });
    
    // Update the store with all recipes
    setFoodRecipes(combinedRecipes);
    setFilteredRecipes(combinedRecipes);
    setIsLoading(false);
    setInitialized(true);
  }, [initialFoodRecipes, setFoodRecipes, setIsLoading, initialized]);

  // Filter recipes based on search query
  useEffect(() => {
    if (!foodRecipes) return;
    
    if (!searchQuery.trim()) {
      setFilteredRecipes(foodRecipes);
      return;
    }
    
    const filtered = foodRecipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredRecipes(filtered);
  }, [searchQuery, foodRecipes]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter button click
  const handleFilterClick = () => {
    setIsLoading(true);
    
    // Simulate filtering (just reverse the order for demonstration)
    setTimeout(() => {
      setFilteredRecipes([...filteredRecipes].reverse());
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your Recipes</h1>
          <p className="text-sm text-muted-foreground mt-1">Click on any recipe to view details</p>
        </div>
        
        <Link href="/dashboard/meal-planning/recipes/new">
          <Button className="sm:h-10 gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>New Recipe</span>
          </Button>
        </Link>
      </div>

      {/* Search and Filter Section */}
      <div className="flex items-center gap-3 max-w-2xl mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search your recipes..." 
            className="pl-10 h-11 border-gray-200"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleFilterClick}
          disabled={isLoading}
          className="h-11 w-11 border-gray-200"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredRecipes.length > 0 ? (
          // Recipe cards with animation
          filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/dashboard/meal-planning/recipes/${recipe.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  {/* Recipe Image */}
                  <div className="relative h-40">
                    {recipe.imageUrl ? (
                      <Image 
                        src={recipe.imageUrl} 
                        alt={recipe.name} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <ChefHat className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  
                  {/* Recipe Details */}
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg tracking-tight">{recipe.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 h-10 mt-1">{recipe.description}</p>
                    
                    {/* Ingredients Preview */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {recipe.ingredients?.slice(0, 3).map((ing, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {ing.name}
                        </Badge>
                      ))}
                      {recipe.ingredients?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{recipe.ingredients.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    {/* Allergen Warnings */}
                    {recipe.allergensFound && recipe.allergensFound.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-red-500 font-medium">Contains allergens:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {recipe.allergensFound.map((allergen, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-0 px-4 pb-4">
                    <Button variant="secondary" className="w-full">
                      View Recipe
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))
        ) : (
          // No results
          <div className="col-span-full text-center py-12 border border-dashed rounded-lg">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">You haven't saved any recipes yet</p>
            <Link href="/dashboard/meal-planning/recipes/new">
              <Button variant="outline" className="mt-4">
                Create Your First Recipe
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 