import Breadcrumbs from '@/components/layout/breadcrumb';
import { PanicModeClient } from './_comp/client';
import { getSymptomHistory } from './_comp/actions';
import type { SymptomHistory } from './_comp/types';

export default async function PanicModePage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Emergency Support' },
    { label: 'Panic Mode' },
  ];

  // Fetch symptom history with error handling
  let initialSymptomHistory: SymptomHistory[] = [];
  try {
    initialSymptomHistory = await getSymptomHistory();
  } catch (error) {
    console.error('Error loading symptom history:', error);
  }

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <PanicModeClient initialSymptomHistory={initialSymptomHistory} />
      </div>
    </div>
  );
}
