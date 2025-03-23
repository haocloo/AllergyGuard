'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, Check } from 'lucide-react';
import Image from 'next/image';

// ui
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/cn';

// dummy data
import { children } from '@/services/dummy-data';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  imageUrl?: string;
}

interface AnalysisResult {
  ingredient: Ingredient;
  isSafe: boolean;
  allergens: string[];
  substitutions?: {
    id: string;
    name: string;
    description: string;
  }[];
}

export function AnalysisClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [recipeData, setRecipeData] = useState<{
    recipeName: string;
    recipeImage?: string;
    ingredients: Ingredient[];
  } | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [expandedIngredients, setExpandedIngredients] = useState<string[]>([]);
  const [selectedSubstitutions, setSelectedSubstitutions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Get recipe data from localStorage
    const storedData = localStorage.getItem('ingredientsData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setRecipeData(data);
      
      // Simulate API call for ingredient analysis
      setTimeout(() => {
        // Mock analysis results
        const results: AnalysisResult[] = data.ingredients.map((ing: Ingredient) => ({
          ingredient: ing,
          isSafe: Math.random() > 0.3, // Randomly mark some as unsafe
          allergens: ing.name.toLowerCase().includes('nut') ? ['Peanut'] : [],
          substitutions: ing.name.toLowerCase().includes('nut') ? [
            { id: '1', name: 'Sunflower Seeds', description: 'Similar nutty flavor and texture' },
            { id: '2', name: 'Pumpkin Seeds', description: 'Rich in protein and healthy fats' },
            { id: '3', name: 'Soy Nuts', description: 'Crunchy texture with high protein content' }
          ] : undefined
        }));
        setAnalysisResults(results);
        setIsLoading(false);
      }, 1500);
    }
  }, []);

  const toggleIngredient = (ingredientId: string) => {
    setExpandedIngredients(prev => 
      prev.includes(ingredientId) 
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const handleSubstitutionChange = (ingredientId: string, substitutionId: string) => {
    setSelectedSubstitutions(prev => {
      const current = prev[ingredientId] || [];
      return {
        ...prev,
        [ingredientId]: current.includes(substitutionId)
          ? current.filter(id => id !== substitutionId)
          : [...current, substitutionId]
      };
    });
  };

  if (isLoading || !recipeData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6 space-y-6">
        {/* Recipe Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{recipeData.recipeName}</h2>
          {recipeData.recipeImage && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img
                src={recipeData.recipeImage}
                alt={recipeData.recipeName}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Analysis Results */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Ingredient Analysis</h3>
          <AnimatePresence initial={false}>
            {analysisResults.map((result) => (
              <motion.div
                key={result.ingredient.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="border rounded-lg overflow-hidden">
                  {/* Ingredient Header */}
                  <div
                    className={cn(
                      "p-4 flex items-center justify-between cursor-pointer",
                      result.isSafe ? "bg-green-50" : "bg-red-50"
                    )}
                    onClick={() => toggleIngredient(result.ingredient.id)}
                  >
                    <div className="flex items-center gap-3">
                      {result.isSafe ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {result.ingredient.name} ({result.ingredient.amount}{result.ingredient.unit})
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition-transform",
                        expandedIngredients.includes(result.ingredient.id) && "transform rotate-180"
                      )}
                    />
                  </div>

                  {/* Substitutions */}
                  {!result.isSafe && expandedIngredients.includes(result.ingredient.id) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 border-t bg-white"
                    >
                      <div className="space-y-3">
                        <p className="text-red-600 text-sm">
                          Warning: Jonas is allergic to {result.allergens.join(', ')}
                        </p>
                        <h4 className="font-medium">Recommended Substitutions:</h4>
                        <div className="space-y-2">
                          {result.substitutions?.map((sub) => (
                            <div key={sub.id} className="flex items-start gap-3">
                              <Checkbox
                                id={`${result.ingredient.id}-${sub.id}`}
                                checked={selectedSubstitutions[result.ingredient.id]?.includes(sub.id)}
                                onCheckedChange={() => handleSubstitutionChange(result.ingredient.id, sub.id)}
                              />
                              <div className="space-y-1">
                                <label
                                  htmlFor={`${result.ingredient.id}-${sub.id}`}
                                  className="font-medium cursor-pointer"
                                >
                                  {sub.name}
                                </label>
                                <p className="text-sm text-gray-500">{sub.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/meal-planning/recipes/new/ingredients')}
            className="w-28"
          >
            Back
          </Button>
          <Button
            onClick={() => {/* Save functionality */}}
            className="w-28"
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}