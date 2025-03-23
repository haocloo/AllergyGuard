'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChefHat, BookOpen, PlusCircle, X, Check, Users, AlertTriangle } from 'lucide-react';
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
import { familyMembers } from './mock-data';

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
      filtered = filtered.filter(recipe => {
        // Check if recipe is safe for all selected family members
        const isSafeForSelected = selectedUsers.every(userId => {
          // Find the user
          const member = familyMembers.find(m => m.id === userId);
          if (!member) return true;
          
          // If the recipe has no allergens, it's safe for everyone
          if (!recipe.allergensFound || !Array.isArray(recipe.allergensFound) || recipe.allergensFound.length === 0) {
            return true;
          }
          
          // If the member has no allergies, they can eat anything
          if (member.allergies.length === 0) return true;
          
          // Check if any of the member's allergies are in the recipe
          return !member.allergies.some(allergy => 
            recipe.allergensFound?.includes(allergy)
          );
        });
        
        return isSafeForSelected;
      });
    }
    
    // Apply view mode filter
    if (viewMode === 'safe') {
      filtered = filtered.filter(recipe => {
        // If no allergens in recipe, it's safe for everyone
        if (!recipe.allergensFound || !Array.isArray(recipe.allergensFound) || recipe.allergensFound.length === 0) {
          return true;
        }
        
        // If any family member has allergies that match recipe allergens, it's not universally safe
        return !familyMembers.some(member => 
          member.allergies.some(allergy => recipe.allergensFound?.includes(allergy))
        );
      });
    }
    
    // Apply sort option
    if (sortOption === 'rating') {
      // Sort by a simulated rating (could be a real property in production)
      filtered.sort((a, b) => (b.id.charCodeAt(0) % 5) - (a.id.charCodeAt(0) % 5));
    } else if (sortOption === 'popularity') {
      // Sort by a simulated popularity metric
      filtered.sort((a, b) => b.ingredients.length - a.ingredients.length);
    } else if (sortOption === 'allergen-free') {
      // Sort allergen-free recipes first
      filtered.sort((a, b) => {
        const aHasAllergens = a.allergensFound && a.allergensFound.length > 0 ? 1 : 0;
        const bHasAllergens = b.allergensFound && b.allergensFound.length > 0 ? 1 : 0;
        return aHasAllergens - bHasAllergens;
      });
    }
    
    setFilteredRecipes(filtered);
  }, [searchQuery, foodRecipes, selectedUsers, sortOption, viewMode]);

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

  // Helper function to determine recipe safety
  const getRecipeSafetyInfo = (recipe: FoodRecipe) => {
    // Check if we have allergens to display
    const hasAllergens = recipe.allergensFound && 
      Array.isArray(recipe.allergensFound) && 
      recipe.allergensFound.length > 0;
    
    // If no allergens, it's safe for everyone
    if (!hasAllergens) {
      return {
        isSafe: true,
        safeFor: familyMembers,
        notSafeFor: [],
        status: "allergen-free",
        label: "Allergen-free",
        badgeClass: "bg-green-100 text-green-800 border-green-200",
        icon: <Users className="h-3 w-3 mr-1" />
      };
    }
    
    // Find who can safely consume this recipe
    const safeFor = familyMembers.filter(member => {
      // If member has no allergies, they can eat everything
      if (member.allergies.length === 0) return true;
      
      // Check if any of the member's allergies are in the recipe
      return !member.allergies.some(allergy => 
        recipe.allergensFound?.includes(allergy)
      );
    });
    
    const notSafeFor = familyMembers.filter(
      member => !safeFor.some(safe => safe.id === member.id)
    );
    
    // Determine status
    if (safeFor.length === familyMembers.length) {
      return {
        isSafe: true,
        safeFor,
        notSafeFor,
        status: "safe-for-all",
        label: "Safe for family",
        badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Users className="h-3 w-3 mr-1" />
      };
    } else if (safeFor.length > 0) {
      return {
        isSafe: true,
        safeFor,
        notSafeFor,
        status: "safe-for-some",
        label: `Safe for ${safeFor.length}/${familyMembers.length}`,
        badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
        icon: <Users className="h-3 w-3 mr-1" />
      };
    } else {
      return {
        isSafe: false,
        safeFor,
        notSafeFor,
        status: "not-safe",
        label: "Not safe for family",
        badgeClass: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      };
    }
  };

  return (
    <div className="space-y-6 px-2">
      {/* Header Section */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-2xl font-bold text-primary">Your Recipes</h1>
          <p className="text-sm text-muted-foreground">Click on any recipe to view details</p>
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
            className="pl-10 h-11 border-gray-200 focus:border-primary focus:ring-primary"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button
          variant={selectedUsers.length > 0 ? 'default' : 'outline'}
          size="icon"
          onClick={handleFilterClick}
          disabled={isLoading}
          className={`h-11 w-11 border-gray-200 relative transition-all duration-200 ${
            selectedUsers.length > 0 ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          {selectedUsers.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-medium shadow-sm">
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
          filteredRecipes.map((recipe, index) => {
            const safetyInfo = getRecipeSafetyInfo(recipe);

            return (
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

                      {/* Safety Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className={`${safetyInfo.badgeClass} flex items-center`}>
                          {safetyInfo.icon}
                          {safetyInfo.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Recipe Details */}
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg tracking-tight">{recipe.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 h-10 mt-1">
                        {recipe.description}
                      </p>

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

                      {/* Allergen Warnings - with improved display */}
                      {recipe.allergensFound && recipe.allergensFound.length > 0 && (
                        <div className="mt-2">
                          <p
                            className={`text-xs font-medium ${
                              safetyInfo.notSafeFor.length > 0 ? 'text-red-500' : 'text-amber-500'
                            }`}
                          >
                            {safetyInfo.notSafeFor.length > 0
                              ? 'Contains allergens:'
                              : 'Contains (but safe):'}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {recipe.allergensFound.map((allergen, idx) => (
                              <Badge
                                key={idx}
                                variant={
                                  safetyInfo.notSafeFor.length > 0 ? 'destructive' : 'outline'
                                }
                                className={
                                  safetyInfo.notSafeFor.length === 0
                                    ? 'text-amber-600 border-amber-300 bg-amber-50'
                                    : ''
                                }
                              >
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
            );
          })
        ) : (
          // No results
          <div className="col-span-full text-center py-12 border border-dashed rounded-lg">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {selectedUsers.length > 0
                ? 'No allergen-safe recipes found for selected family members'
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
          <SheetHeader className="px-4 py-3 border-b sticky top-0 bg-white z-10 backdrop-blur-sm bg-white/90">
            <div className="flex justify-between items-center w-full">
              <Button variant="ghost" size="icon" onClick={() => setFilterSheetOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
              <SheetTitle className="text-center flex-1">Filter Options</SheetTitle>
              <Button
                variant="ghost"
                className="text-sm font-normal hover:text-red-500 transition-colors"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </div>
          </SheetHeader>

          <div className="overflow-y-auto h-[calc(100%-120px)] pb-20 bg-gray-50">
            {/* Sort By Section */}
            <div className="p-4 border-b bg-white mb-2">
              <h3 className="font-medium mb-3 flex items-center text-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M11 5h10"></path>
                  <path d="M11 9h7"></path>
                  <path d="M11 13h4"></path>
                  <path d="M3 17h18"></path>
                  <path d="M3 21h18"></path>
                  <path d="m9 9-6 6"></path>
                  <path d="M3 9h6"></path>
                </svg>
                Sort By
              </h3>
              <RadioGroup value={sortOption} onValueChange={setSortOption} className="space-y-1">
                <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="recommended" className="flex-1 cursor-pointer">
                      Recommended
                    </Label>
                  </div>
                  <RadioGroupItem value="recommended" id="recommended" />
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="allergen-free" className="flex-1 cursor-pointer">
                      Allergen-Free First
                    </Label>
                  </div>
                  <RadioGroupItem value="allergen-free" id="allergen-free" />
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="popularity" className="flex-1 cursor-pointer">
                      Popularity
                    </Label>
                  </div>
                  <RadioGroupItem value="popularity" id="popularity" />
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rating" className="flex-1 cursor-pointer">
                      Rating
                    </Label>
                  </div>
                  <RadioGroupItem value="rating" id="rating" />
                </div>
              </RadioGroup>
            </div>

            {/* Family Members Section - Select who will be eating */}
            <div className="p-4 border-b bg-white mb-2">
              <h3 className="font-medium mb-3 flex items-center text-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Safe For Family Members
              </h3>

              <div className="space-y-2">
                <div
                  className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer transition-colors ${
                    selectedUsers.length === 0 ? 'bg-primary/10' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedUsers([])}
                >
                  <Label className="flex-1 cursor-pointer font-medium">All (No restrictions)</Label>
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                      selectedUsers.length === 0
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedUsers.length === 0 && <Check className="h-3 w-3" />}
                  </div>
                </div>

                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer transition-colors ${
                      selectedUsers.includes(member.id) ? 'bg-primary/10' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleUserSelection(member.id)}
                  >
                    <div>
                      <Label className="cursor-pointer">{member.name}</Label>
                      {member.allergies.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {member.allergies.map((allergy) => (
                            <Badge
                              key={allergy}
                              variant="outline"
                              className="text-xs py-0 px-1 bg-red-50 text-red-700 border-red-200"
                            >
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                        selectedUsers.includes(member.id)
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedUsers.includes(member.id) && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Options Section */}
            <div className="p-4 border-b bg-white mb-2">
              <h3 className="font-medium mb-3 flex items-center text-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M5 12H3v9h18v-9h-2"></path>
                  <path d="M7 8c0-4.4 3.6-8 8-8s8 3.6 8 8"></path>
                  <path d="M15 2v8h5"></path>
                </svg>
                Recipe Options
              </h3>
              <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
                <Label htmlFor="promo" className="cursor-pointer flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-amber-500"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  Featured Recipes Only
                </Label>
                <Checkbox
                  id="promo"
                  checked={showPromoOnly}
                  onCheckedChange={(checked) => setShowPromoOnly(checked as boolean)}
                />
              </div>
            </div>

            {/* Mode Section */}
            <div className="p-4 border-b bg-white">
              <h3 className="font-medium mb-3 flex items-center text-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
                View Mode
              </h3>
              <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    All Recipes
                  </TabsTrigger>
                  <TabsTrigger
                    value="safe"
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                  >
                    Safe Recipes Only
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Apply Button - Fixed at bottom */}
          <SheetFooter className="p-4 border-t absolute bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <Button className="w-full h-12 text-base font-medium" onClick={applyFilters}>
              Apply Filters {selectedUsers.length > 0 && `(${selectedUsers.length} selected)`}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
} 