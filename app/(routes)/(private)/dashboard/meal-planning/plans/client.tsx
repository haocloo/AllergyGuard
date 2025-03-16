'use client';

import { useEffect } from 'react';
import { MealPlanManager } from '../_comp/MealPlanManager';
import { useMealPlanningStore, type MealPlan, type Allergen } from '../_comp/store';

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
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Meal Plans</h1>
      <p className="text-gray-600 mb-8">
        Create and manage allergy-safe meal plans for your family. These plans will help you
        organize meals that avoid your children's allergens while providing balanced nutrition.
      </p>

      <MealPlanManager />
    </div>
  );
}
