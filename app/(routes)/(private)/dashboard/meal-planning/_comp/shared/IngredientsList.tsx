'use client';

import { Ingredient } from '../store';
import { AllergenBadge } from './AllergenBadge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type IngredientsListProps = {
  ingredients: Ingredient[];
  maxHeight?: string;
};

export function IngredientsList({ ingredients, maxHeight = '300px' }: IngredientsListProps) {
  if (!ingredients.length) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-4 flex items-center justify-center text-gray-500">
          No ingredients found
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <ScrollArea className={`pr-4 ${maxHeight ? `max-h-[${maxHeight}]` : ''}`}>
          <ul className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="flex flex-col">
                <span className="font-medium">{ingredient.name}</span>

                {ingredient.containsAllergens && ingredient.containsAllergens.length > 0 && (
                  <div className="flex flex-wrap mt-1">
                    <span className="text-xs text-gray-500 mr-2 mt-1">Contains:</span>
                    {ingredient.containsAllergens.map((allergen) => (
                      <AllergenBadge key={allergen} allergen={allergen} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
