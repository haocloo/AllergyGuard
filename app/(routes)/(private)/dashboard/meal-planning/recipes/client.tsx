'use client';

import { useEffect } from 'react';
import { RecipeGenerator } from '../_comp/RecipeGenerator';
import { useMealPlanningStore, Allergen } from '../_comp/store';

interface RecipesClientProps {
  childAllergies: Allergen[];
}

export default function RecipesClient({ childAllergies }: RecipesClientProps) {
  const { setChildAllergies } = useMealPlanningStore();

  // Initialize store with child allergies
  useEffect(() => {
    setChildAllergies(childAllergies);
  }, [childAllergies, setChildAllergies]);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Recipe Suggestions</h1>
      <p className="text-gray-600 mb-8">
        Enter the ingredients you have available, and we'll suggest nutritionally balanced,
        allergy-safe meal ideas based on your children's dietary restrictions.
      </p>

      <RecipeGenerator />
    </div>
  );
}
