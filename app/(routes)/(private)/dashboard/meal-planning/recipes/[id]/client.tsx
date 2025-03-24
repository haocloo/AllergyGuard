'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChefHat, Clock, ArrowLeft, Heart, Share, Printer, AlertTriangle, Award, Users, Check, Info } from 'lucide-react';
import { notFound } from 'next/navigation';

// ui components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// types
import type { FoodRecipe } from '../../_comp/store';
import { useFoodListStore } from '../../_comp/food-list-store';
import { familyMembers } from '../../_comp/mock-data';

interface Props {
  serverRecipe: FoodRecipe | null;
  recipeId: string;
}

export function RecipeDetailClient({ serverRecipe, recipeId }: Props) {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [loading, setLoading] = useState(!serverRecipe);
  const [recipe, setRecipe] = useState<FoodRecipe | null>(serverRecipe);
  
  const { getRecipeById, addFavorite } = useFoodListStore();
  
  // If we don't have a server recipe, check the food list store (client-side)
  useEffect(() => {
    if (!serverRecipe) {
      const clientRecipe = getRecipeById(recipeId);
      
      if (clientRecipe) {
        setRecipe(clientRecipe);
      } else {
        // Recipe not found in either server or client storage
        notFound();
      }
    }
    
    setLoading(false);
  }, [serverRecipe, recipeId, getRecipeById]);
  
  // Show loading state while checking for client-side recipe
  if (loading) {
    return <RecipeDetailSkeleton />;
  }
  
  // Safety check - should never happen due to notFound() above
  if (!recipe) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Recipe Not Found</h2>
        <p className="text-gray-500 mb-4">The recipe you're looking for doesn't exist.</p>
        <Link href="/dashboard/meal-planning">
          <Button>Return to Recipes</Button>
        </Link>
      </div>
    );
  }
  
  // Calculate nutritional info (simplified example)
  const nutritionInfo = {
    calories: 350,
    protein: 12,
    fats: 8,
    carbs: 45,
    servings: 4,
    prepTime: 15,
    cookTime: 25
  };
  
  // Check if we have allergens to display
  const hasAllergens = recipe.allergensFound && 
    Array.isArray(recipe.allergensFound) && 
    recipe.allergensFound.length > 0;
    
  // Determine which family members can safely consume this recipe
  const getSafeFamilyMembers = () => {
    // If no allergens in the recipe, everyone can eat it
    if (!hasAllergens) {
      return familyMembers;
    }
    
    // Otherwise, check each family member's allergies against recipe allergens
    return familyMembers.filter(member => {
      // If the member has no allergies, they can eat everything
      if (member.allergies.length === 0) return true;
      
      // Check if any of the member's allergies are in the recipe's allergens
      return !member.allergies.some(allergy => 
        recipe.allergensFound?.includes(allergy)
      );
    });
  };
  
  const safeFamilyMembers = getSafeFamilyMembers();
  const atRiskFamilyMembers = familyMembers.filter(
    member => !safeFamilyMembers.some(safe => safe.id === member.id)
  );
  
  // Determine the safety status for clearer labeling
  const getSafetyStatus = () => {
    if (!hasAllergens) {
      return {
        variant: "secondary" as const,
        icon: <Users className="h-3 w-3" />,
        text: "Allergen-free for everyone",
        badgeClass: "bg-green-100 text-green-800 hover:bg-green-200"
      };
    } else if (safeFamilyMembers.length === familyMembers.length) {
      return {
        variant: "secondary" as const,
        icon: <Users className="h-3 w-3" />,
        text: "Contains allergens, but safe for all family members",
        badgeClass: "bg-blue-100 text-blue-800 hover:bg-blue-200"
      };
    } else if (safeFamilyMembers.length > 0) {
      return {
        variant: "secondary" as const,
        icon: <Users className="h-3 w-3" />,
        text: `Safe for ${safeFamilyMembers.length}/${familyMembers.length} family members`,
        badgeClass: ""
      };
    } else {
      return {
        variant: "destructive" as const,
        icon: <AlertTriangle className="h-3 w-3" />,
        text: "Not safe for any family members",
        badgeClass: ""
      };
    }
  };
  
  const safetyStatus = getSafetyStatus();
  
  return (
    <div className="py-6 max-w-4xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/meal-planning">
          <Button variant="ghost" className="flex items-center gap-1 px-2 font-normal">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Recipes</span>
          </Button>
        </Link>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => addFavorite(recipe.id)} title="Save as favorite">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Share recipe">
            <Share className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Print recipe">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Recipe Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{recipe.name}</h1>
          <p className="text-gray-600 mb-4">{recipe.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {nutritionInfo.prepTime + nutritionInfo.cookTime} min
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="h-3 w-3" /> {nutritionInfo.servings} servings
            </Badge>
            
            {/* Family Safety Indicator */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                  <Badge 
                    variant={safetyStatus.variant}
                    className={`flex items-center gap-1 ${safetyStatus.badgeClass}`}
                  >
                    {safetyStatus.icon} 
                    {safetyStatus.text}
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <Card className="w-full border-0 shadow-none">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm">Family Safety</CardTitle>
                    {hasAllergens && (
                      <p className="text-xs text-amber-600">
                        This recipe contains allergens, but they may not affect your family members.
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3">
                    {safeFamilyMembers.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-600 mb-1">Safe to consume for:</p>
                        <ul className="space-y-1">
                          {safeFamilyMembers.map(member => (
                            <li key={member.id} className="text-xs flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="w-2 h-2 text-green-600" />
                              </span>
                              <span>{member.name}</span>
                              {member.allergies.length > 0 && (
                                <span className="text-gray-400 text-[10px]">
                                  (allergic to: {member.allergies.join(', ')})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {atRiskFamilyMembers.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-600 mb-1">Not safe for:</p>
                        <ul className="space-y-1">
                          {atRiskFamilyMembers.map(member => (
                            <li key={member.id} className="text-xs flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-2 h-2 text-red-600" />
                              </span>
                              <span>{member.name}</span>
                              <span className="text-gray-400 text-[10px]">
                                (allergic to: {member.allergies.join(', ')})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Show allergen list in popover */}
                    {hasAllergens && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-600 mb-1">Allergens in this recipe:</p>
                        <div className="flex flex-wrap gap-1">
                          {recipe.allergensFound.map((allergen, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {String(allergen)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Allergen Warnings */}
          {hasAllergens && (
            <Card className={`border mb-4 ${atRiskFamilyMembers.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <AlertTriangle className={`h-5 w-5 ${atRiskFamilyMembers.length > 0 ? 'text-red-500' : 'text-amber-500'} mr-2 mt-0.5`} />
                  <div>
                    <h4 className={`font-medium ${atRiskFamilyMembers.length > 0 ? 'text-red-700' : 'text-amber-700'}`}>
                      {atRiskFamilyMembers.length > 0 ? 'Allergen Warning' : 'Allergen Information'}
                    </h4>
                    <p className={`text-sm ${atRiskFamilyMembers.length > 0 ? 'text-red-600' : 'text-amber-600'} mb-2`}>
                      {atRiskFamilyMembers.length > 0 
                        ? `This recipe contains allergens that may affect ${atRiskFamilyMembers.length} member${atRiskFamilyMembers.length > 1 ? 's' : ''} of your family:` 
                        : 'This recipe contains the following allergens, but they don\'t affect your family members:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.allergensFound.map((allergen, idx) => (
                        <Badge 
                          key={idx} 
                          variant={atRiskFamilyMembers.length > 0 ? "destructive" : "secondary"}
                          className={atRiskFamilyMembers.length === 0 ? "text-amber-600 border-amber-300 bg-amber-50" : ""}
                        >
                          {String(allergen)}
                        </Badge>
                      ))}
                    </div>
                    {atRiskFamilyMembers.length > 0 && (
                      <div className="mt-3 text-sm text-red-600">
                        <p className="font-medium">Not safe for:</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {atRiskFamilyMembers.map(member => (
                            <li key={member.id}>
                              {member.name} (allergic to: {member.allergies.join(', ')})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Nutritional Info */}
          <Card className="mt-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Nutritional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold">{nutritionInfo.calories}</p>
                  <p className="text-xs text-gray-500">Calories</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{nutritionInfo.protein}g</p>
                  <p className="text-xs text-gray-500">Protein</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{nutritionInfo.carbs}g</p>
                  <p className="text-xs text-gray-500">Carbs</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{nutritionInfo.fats}g</p>
                  <p className="text-xs text-gray-500">Fats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recipe Image */}
        <div className="rounded-lg overflow-hidden h-[320px] relative">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              width={64}
              height={64}
              className="size-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
              <ChefHat className="h-16 w-16 text-gray-300" />
            </div>
          )}
        </div>
      </div>
      
      {/* Recipe Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ingredients" className="space-y-4 py-4">
          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="h-[300px] pr-4">
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start border-b pb-2">
                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 mr-2 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-medium">{ingredient.name}</span>
                        {ingredient.containsAllergens && ingredient.containsAllergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ingredient.containsAllergens.map((allergen) => (
                              <Badge key={allergen} variant="destructive" className="text-xs">
                                {allergen}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* AI Safety Suggestions */}
          {recipe.suggestions && recipe.suggestions.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-blue-700">Allergy Safety Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recipe.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span className="text-blue-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="instructions" className="py-4">
          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="h-[400px] pr-4">
                <ol className="space-y-6">
                  {recipe.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium mr-3 flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="text-gray-700">{instruction}</div>
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Loading skeleton for the recipe details
function RecipeDetailSkeleton() {
  return (
    <div className="py-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col">
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
        
        <Skeleton className="h-[320px] w-full rounded-lg" />
      </div>
      
      <div>
        <Skeleton className="h-12 w-full mb-4 rounded-md" />
        <Skeleton className="h-[400px] w-full rounded-md" />
      </div>
    </div>
  );
} 