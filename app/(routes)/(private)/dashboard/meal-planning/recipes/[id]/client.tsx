'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Heart, Share2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// ui
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFoodListStore } from '../../_comp/food-list-store';
import type { FoodRecipe } from '../../_comp/store';

interface Props {
  recipe: FoodRecipe;
}

export function RecipeDetailClient({ recipe }: Props) {
  const router = useRouter();
  const { addFavorite } = useFoodListStore();
  const [activeTab, setActiveTab] = useState('ingredients');
  
  // Go back to food list
  const handleGoBack = () => {
    router.back();
  };
  
  // Add to favorites
  const handleAddFavorite = () => {
    addFavorite(recipe.id);
  };
  
  // Share recipe (demo only)
  const handleShare = () => {
    // In a real app, this would open a share dialog
    alert('Sharing feature would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleGoBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{recipe.name}</h1>
      </div>

      {/* Recipe Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden"
      >
        {recipe.imageUrl ? (
          <div 
            className="w-full h-full bg-cover bg-center" 
            style={{ backgroundImage: `url(${recipe.imageUrl})` }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No image available</p>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleAddFavorite}>
          <Heart className="h-4 w-4 mr-2" />
          Favorite
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">{recipe.description}</p>

      {/* Allergen Warning */}
      {recipe.allergensFound.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Allergen Warning</p>
              <p className="text-sm text-muted-foreground">
                This recipe contains the following allergens:
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {recipe.allergensFound.map((allergen) => (
                  <Badge key={allergen} variant="outline" className="bg-yellow-100">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Ingredients and Instructions */}
      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ingredients" className="mt-4 space-y-4">
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-2 pb-2 border-b">
                <span className="text-sm">{ingredient.name}</span>
                {ingredient.containsAllergens.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-yellow-100">
                    Contains: {ingredient.containsAllergens.join(', ')}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </TabsContent>
        
        <TabsContent value="instructions" className="mt-4 space-y-4">
          <ol className="space-y-3">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-2 pb-3 border-b">
                <span className="font-medium text-sm">{index + 1}.</span>
                <span className="text-sm">{instruction}</span>
              </li>
            ))}
          </ol>
        </TabsContent>
      </Tabs>

      {/* Suggestions */}
      {recipe.suggestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Suggestions</h3>
          <ul className="list-disc list-inside space-y-1">
            {recipe.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 