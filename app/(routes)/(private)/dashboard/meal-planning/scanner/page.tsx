import Breadcrumbs from '@/components/layout/breadcrumb';
import { ScannerClient } from './_comp/client';

export default function ScannerPage() {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Meal Planning', href: '/dashboard/meal-planning' },
          { label: 'Ingredient Scanner', href: '/dashboard/meal-planning/scanner' },
        ]}
      />
      <div className="flex flex-col items-center mx-auto mb-4 space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Ingredient Scanner</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Scan ingredients to get nutritional information
        </p>
      </div>
      <ScannerClient />
    </div>
  );
}
