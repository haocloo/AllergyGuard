'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChefHat, BookOpen, PlusCircle, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// ui
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

// services
import type { FoodRecipe } from './store';
import { useFoodListStore } from './food-list-store';
import { useMealPlanningStore } from './store';

// Sample family members (in a real app, we would fetch these from the API)
const familyMembers = [
  { id: '1', name: 'John', allergies: ['Peanut', 'Milk'] },
  { id: '2', name: 'Mary', allergies: ['Egg'] },
  { id: '3', name: 'Emma', allergies: ['Wheat', 'Soy'] },
  { id: '4', name: 'Lucas', allergies: [] },
];

interface Props {
  initialFoodRecipes: FoodRecipe[];
}

export function FoodListClient({ initialFoodRecipes }: Props) {
  const { foodRecipes, setFoodRecipes, searchQuery, setSearchQuery, isLoading, setIsLoading } = useFoodListStore();
  const [filteredRecipes, setFilteredRecipes] = useState<FoodRecipe[]>([]);
  const [initialized, setInitialized] = useState(false);
  
  // Filter states
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortOption, setSortOption] = useState('recommended');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showPromoOnly, setShowPromoOnly] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  
  // Get allergies from meal planning store (using sample data for now)
  const { childAllergies } = useMealPlanningStore();

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

  // Filter recipes based on search query and selected users
  useEffect(() => {
    if (!foodRecipes) return;
    
    let filtered = [...foodRecipes];
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply user allergen filter
    if (selectedUsers.length > 0) {
      // Gather all allergies from selected users
      const selectedUserAllergies = selectedUsers.flatMap(userId => {
        const user = familyMembers.find(member => member.id === userId);
        return user ? user.allergies : [];
      });
      
      // Only show recipes that don't contain any of the selected allergens
      if (selectedUserAllergies.length > 0) {
        filtered = filtered.filter(recipe => {
          // Check if any of the recipe's allergens match the user allergies
          const recipeAllergens = recipe.allergensFound || [];
          return !recipeAllergens.some(allergen => 
            selectedUserAllergies.includes(String(allergen))
          );
        });
      }
    }
    
    // Apply sort option
    if (sortOption === 'rating') {
      // Sort by a simulated rating (could be a real property in production)
      filtered.sort((a, b) => (b.id.charCodeAt(0) % 5) - (a.id.charCodeAt(0) % 5));
    } else if (sortOption === 'popularity') {
      // Sort by a simulated popularity metric
      filtered.sort((a, b) => b.ingredients.length - a.ingredients.length);
    }
    
    setFilteredRecipes(filtered);
  }, [searchQuery, foodRecipes, selectedUsers, sortOption]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter button click
  const handleFilterClick = () => {
    setFilterSheetOpen(true);
  };
  
  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  
  // Apply filters and close the sheet
  const applyFilters = () => {
    setFilterSheetOpen(false);
    // Filtering is already handled by the useEffect
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedUsers([]);
    setSortOption('recommended');
    setShowPromoOnly(false);
    setViewMode('all');
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
          className={`h-11 w-11 border-gray-200 ${selectedUsers.length > 0 ? 'border-primary text-primary' : ''}`}
        >
          <Filter className="h-4 w-4" />
          {selectedUsers.length > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-white rounded-full text-[10px] flex items-center justify-center">
              {selectedUsers.length}
            </span>
          )}
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
            <p className="text-muted-foreground">
              {selectedUsers.length > 0 
                ? "No allergen-safe recipes found for selected family members" 
                : "You haven't saved any recipes yet"}
            </p>
            <Link href="/dashboard/meal-planning/recipes/new">
              <Button variant="outline" className="mt-4">
                Create Your First Recipe
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Filter Sheet/Modal */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] sm:h-[70vh] p-0 rounded-t-xl">
          <SheetHeader className="px-4 py-3 border-b sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center w-full">
              <Button variant="ghost" size="icon" onClick={() => setFilterSheetOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
              <SheetTitle className="text-center flex-1">Filter Options</SheetTitle>
              <Button variant="ghost" className="text-sm font-normal" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </SheetHeader>
          
          <div className="overflow-y-auto h-[calc(100%-120px)] pb-20">
            {/* Sort By Section */}
            <div className="p-4 border-b">
              <h3 className="font-medium mb-3">Sort By</h3>
              <RadioGroup value={sortOption} onValueChange={setSortOption}>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="recommended" className="flex-1 cursor-pointer">Recommended</Label>
                  </div>
                  <RadioGroupItem value="recommended" id="recommended" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="popularity" className="flex-1 cursor-pointer">Popularity</Label>
                  </div>
                  <RadioGroupItem value="popularity" id="popularity" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rating" className="flex-1 cursor-pointer">Rating</Label>
                  </div>
                  <RadioGroupItem value="rating" id="rating" />
                </div>
              </RadioGroup>
            </div>
            
            {/* Family Members Section - Select who will be eating */}
            <div className="p-4 border-b">
              <h3 className="font-medium mb-3">Safe For Family Members</h3>
              
              <div className="space-y-2">
                <div 
                  className="flex items-center justify-between py-2 cursor-pointer"
                  onClick={() => setSelectedUsers([])}
                >
                  <Label className="flex-1 cursor-pointer font-medium">All (No restrictions)</Label>
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${selectedUsers.length === 0 ? 'bg-primary border-primary text-primary-foreground' : 'border-gray-300'}`}>
                    {selectedUsers.length === 0 && <Check className="h-3 w-3" />}
                  </div>
                </div>
                
                {familyMembers.map(member => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between py-2 cursor-pointer"
                    onClick={() => toggleUserSelection(member.id)}
                  >
                    <div>
                      <Label className="cursor-pointer">{member.name}</Label>
                      {member.allergies.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {member.allergies.map(allergy => (
                            <Badge key={allergy} variant="outline" className="text-xs py-0 px-1">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${selectedUsers.includes(member.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-gray-300'}`}>
                      {selectedUsers.includes(member.id) && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Promo Options Section */}
            <div className="p-4 border-b">
              <h3 className="font-medium mb-3">Recipe Options</h3>
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="promo" className="cursor-pointer">Featured Recipes Only</Label>
                <Checkbox 
                  id="promo" 
                  checked={showPromoOnly} 
                  onCheckedChange={(checked) => setShowPromoOnly(checked as boolean)} 
                />
              </div>
            </div>
            
            {/* Mode Section */}
            <div className="p-4 border-b">
              <h3 className="font-medium mb-3">View Mode</h3>
              <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="all">All Recipes</TabsTrigger>
                  <TabsTrigger value="safe">Safe Recipes Only</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Apply Button - Fixed at bottom */}
          <SheetFooter className="p-4 border-t absolute bottom-0 left-0 right-0 bg-white">
            <Button className="w-full" onClick={applyFilters}>
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
} 