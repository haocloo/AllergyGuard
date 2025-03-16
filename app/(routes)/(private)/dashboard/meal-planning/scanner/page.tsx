import Breadcrumbs from '@/components/layout/breadcrumb';
import ScannerClient from './_comp/client';
import { getChildAllergies } from '../_comp/actions';

export default async function IngredientScannerPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Meal Planning', href: '/meal-planning/plans' },
    { label: 'Ingredient Scanner' },
  ];

  // Fetch child allergies for the current user
  const childAllergies = await getChildAllergies();

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <ScannerClient childAllergies={childAllergies} />
      </div>
    </div>
  );
}
