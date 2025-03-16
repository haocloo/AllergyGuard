'use client';

import { useEffect } from 'react';
import { MealPlanManager } from '../../_comp/MealPlanManager';
import { useMealPlanningStore, type MealPlan, type Allergen } from '../../_comp/store';

interface PlansClientProps {
  mealPlans: MealPlan[];
  childAllergies: Allergen[];
}

export default function PlansClient({ mealPlans, childAllergies }: PlansClientProps) {
  const { setMealPlans, setChildAllergies } = useMealPlanningStore();

  // Initialize store with meal plans and allergies
  useEffect(() => {
    setMealPlans(mealPlans);
    setChildAllergies(childAllergies);
  }, [mealPlans, childAllergies, setMealPlans, setChildAllergies]);

  return (
    <div className="space-y-6">
      {/* Header Section - Made responsive for small screens */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Meal Plans</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage allergy-safe meal plans for your family
          </p>
        </div>
      </div>

      <MealPlanManager />
    </div>
  );
}
