'use client';

import { useEffect } from 'react';
import { RecipeGenerator } from '../../_comp/RecipeGenerator';
import { useMealPlanningStore, Allergen } from '../../_comp/store';

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
    <div className="space-y-6">
      {/* Header Section - Made responsive for small screens */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Recipe Suggestions</h1>
          <p className="text-sm text-muted-foreground">
            Generate allergy-safe meal ideas based on available ingredients
          </p>
        </div>
      </div>

      <RecipeGenerator />
    </div>
  );
}
