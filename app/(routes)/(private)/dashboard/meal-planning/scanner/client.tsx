'use client';

import { useEffect } from 'react';
import { IngredientScanner } from '../_comp/IngredientScanner';
import { useMealPlanningStore, Allergen } from '../_comp/store';

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
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Ingredient Scanner</h1>
      <p className="text-gray-600 mb-8">
        Scan food packaging to identify ingredients and potential allergens. This tool uses OCR to
        detect ingredients and highlights any allergens that might affect your children.
      </p>

      <IngredientScanner />
    </div>
  );
}
