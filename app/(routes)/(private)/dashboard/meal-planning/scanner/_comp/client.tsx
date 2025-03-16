'use client';

import { useEffect } from 'react';
import { IngredientScanner } from '../../_comp/IngredientScanner';
import { useMealPlanningStore, Allergen } from '../../_comp/store';

interface ScannerClientProps {
  childAllergies: Allergen[];
}

export default function ScannerClient({ childAllergies }: ScannerClientProps) {
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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Ingredient Scanner</h1>
          <p className="text-sm text-muted-foreground">
            Scan food packaging to identify ingredients and potential allergens
          </p>
        </div>
      </div>

      <IngredientScanner />
    </div>
  );
}
