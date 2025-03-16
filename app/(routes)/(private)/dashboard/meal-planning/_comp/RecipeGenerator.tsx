'use client';

import { useState } from 'react';
import { ChefHat, Plus, X, Loader2, Search } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMealPlanningStore } from './store';
import { AllergenBadge } from './shared/AllergenBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function RecipeGenerator() {
  const { generateRecipes, recipes, isLoading, clearRecipes, childAllergies } =
    useMealPlanningStore();

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');

  // Get allergies from child profiles
  const allergies = childAllergies.map((allergy) => allergy.name);

  // Add ingredient to the list
  const addIngredient = () => {
    if (!currentIngredient.trim()) return;

    setIngredients((prev) => [...prev, currentIngredient.trim()]);
    setCurrentIngredient('');
  };

  // Remove ingredient from the list
  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle input keypress (add on Enter)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  // Generate recipes with current ingredients and allergies
  const handleGenerateRecipes = async () => {
    if (ingredients.length === 0) return;

    await generateRecipes(ingredients, allergies);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <ChefHat className="w-6 h-6 mr-2" />
            Recipe Generator
          </CardTitle>
          <CardDescription>
            Enter the ingredients you have available, and we'll suggest allergy-safe meal ideas
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Ingredient Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Available Ingredients</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add an ingredient..."
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={addIngredient} disabled={!currentIngredient.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Ingredients List */}
            <div className="min-h-[100px] max-h-[150px] overflow-y-auto">
              {ingredients.length === 0 ? (
                <div className="text-center text-gray-500 py-6 border border-dashed rounded-lg">
                  Add ingredients to generate recipes
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center">
                      {ingredient}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-1 p-0 hover:bg-gray-200"
                        onClick={() => removeIngredient(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Allergies Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Allergies to Avoid</label>
              <div className="flex flex-wrap gap-2">
                {allergies.length === 0 ? (
                  <p className="text-gray-500 text-sm">No allergies specified</p>
                ) : (
                  allergies.map((allergy, index) => (
                    <AllergenBadge key={index} allergen={allergy} />
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setIngredients([]);
              clearRecipes();
            }}
            disabled={ingredients.length === 0 && recipes.length === 0}
          >
            Clear All
          </Button>

          <Button
            onClick={handleGenerateRecipes}
            disabled={ingredients.length === 0 || isLoading}
            className="space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Generate Recipes</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Recipes Results */}
      {recipes.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recipe Suggestions</CardTitle>
            <CardDescription>
              Allergy-safe recipes based on your available ingredients
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="recipe-0">
              <TabsList className="mb-4 flex flex-wrap">
                {recipes.map((recipe, index) => (
                  <TabsTrigger key={index} value={`recipe-${index}`}>
                    {recipe.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {recipes.map((recipe, index) => (
                <TabsContent key={index} value={`recipe-${index}`} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{recipe.name}</h3>
                    <p className="text-gray-600">{recipe.description}</p>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="ingredients">
                      <AccordionTrigger>Ingredients</AccordionTrigger>
                      <AccordionContent>
                        <ScrollArea className="h-48 pr-4">
                          <ul className="space-y-2">
                            {recipe.ingredients.map((ingredient, idx) => (
                              <li key={idx} className="flex flex-col">
                                <span>{ingredient.name}</span>
                                {ingredient.containsAllergens &&
                                  ingredient.containsAllergens.length > 0 && (
                                    <div className="flex flex-wrap mt-1">
                                      {ingredient.containsAllergens.map((allergen) => (
                                        <AllergenBadge key={allergen} allergen={allergen} />
                                      ))}
                                    </div>
                                  )}
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="instructions">
                      <AccordionTrigger>Instructions</AccordionTrigger>
                      <AccordionContent>
                        <ScrollArea className="h-48 pr-4">
                          <ol className="list-decimal list-inside space-y-2 pl-2">
                            {recipe.instructions.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </ScrollArea>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="allergens">
                      <AccordionTrigger>Allergen Information</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Allergens Found:</h4>
                            {recipe.allergensFound.length > 0 ? (
                              <div className="flex flex-wrap">
                                {recipe.allergensFound.map((allergen) => (
                                  <AllergenBadge key={allergen} allergen={allergen} />
                                ))}
                              </div>
                            ) : (
                              <p className="text-green-600 text-sm">No common allergens detected</p>
                            )}
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-1">Suggestions:</h4>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
                              {recipe.suggestions.map((suggestion, idx) => (
                                <li key={idx}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
