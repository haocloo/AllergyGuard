import Breadcrumbs from '@/components/layout/breadcrumb';
import { FoodListClient } from './_comp/client';
import { getFoodRecipes } from './_comp/actions';
import type { FoodRecipe } from './_comp/store';

export default async function FoodListPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Meal Planning', href: '/dashboard/meal-planning' },
    { label: 'Recipes' },
  ];

  // Fetch food recipes with error handling
  let foodRecipes: FoodRecipe[] = [];
  try {
    foodRecipes = await getFoodRecipes();
  } catch (error) {
    console.error('Error loading food recipes:', error);
  }

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <FoodListClient initialFoodRecipes={foodRecipes} />
      </div>
    </div>
  );
}
