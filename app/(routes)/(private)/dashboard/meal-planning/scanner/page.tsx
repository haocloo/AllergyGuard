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
    
      <ScannerClient />
    </div>
  );
}
