'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

// ui
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  // Initialize food recipes
  useEffect(() => {
    setFoodRecipes(initialFoodRecipes);
    setFilteredRecipes(initialFoodRecipes);
  }, [initialFoodRecipes, setFoodRecipes]);

  // Filter recipes based on search query
  useEffect(() => {
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

  // Handle filter button click (for demo purposes)
  const handleFilterClick = () => {
    setIsLoading(true);
    
    // Simulate a delay for loading state
    setTimeout(() => {
      // Just toggle the order for demonstration
      setFilteredRecipes([...filteredRecipes].reverse());
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Food List</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse and discover allergy-safe foods</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex items-center gap-3 max-w-2xl">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search foods..." 
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

      {/* Food Cards Section */}
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
          // Food items list with animation
          filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/dashboard/meal-planning/recipes/${recipe.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    {recipe.imageUrl && (
                      <div 
                        className="h-40 bg-cover bg-center" 
                        style={{ backgroundImage: `url(${recipe.imageUrl})` }}
                      />
                    )}
                    <div className="p-4 space-y-2">
                      <h3 className="font-medium text-lg tracking-tight">{recipe.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.allergensFound.map((allergen) => (
                          <Badge key={allergen} variant="outline" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))
        ) : (
          // No results
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No foods found matching your search</p>
          </div>
        )}
      </div>

      {/* Add New Food Button */}
      <div className="fixed bottom-6 right-6 sm:static sm:flex sm:justify-end sm:mt-4">
        <Link href="/dashboard/meal-planning/recipes/new">
          <Button className="rounded-full sm:rounded-md h-12 w-12 sm:h-11 sm:w-auto sm:px-6 shadow-lg">
            <span className="sm:hidden">+</span>
            <span className="hidden sm:block">Add New Recipe</span>
          </Button>
        </Link>
      </div>
    </div>
  );
} 