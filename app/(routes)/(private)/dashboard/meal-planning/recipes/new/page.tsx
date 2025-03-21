import Breadcrumbs from '@/components/layout/breadcrumb';
import { MealPrepFormClient } from './_components/client';

export default async function NewRecipePage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Meal Planning', href: '/dashboard/meal-planning' },
    { label: 'Food List', href: '/dashboard/meal-planning' },
    { label: 'New Meal Preparation' },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <MealPrepFormClient />
      </div>
    </div>
  );
} 