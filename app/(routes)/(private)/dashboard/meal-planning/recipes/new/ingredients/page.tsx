import Breadcrumbs from '@/components/layout/breadcrumb';
import { IngredientEntryClient } from './_components/client';

export default async function IngredientEntryPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Meal Planning', href: '/dashboard/meal-planning' },
    { label: 'New Recipe', href: '/dashboard/meal-planning/recipes/new' },
    { label: 'Ingredients' },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <IngredientEntryClient />
      </div>
    </div>
  );
} 