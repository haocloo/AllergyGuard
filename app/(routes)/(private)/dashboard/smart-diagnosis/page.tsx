import Breadcrumbs from '@/components/layout/breadcrumb';
import { SmartDiagnosisClient } from './_comp/client';
import { pediatricAllergies } from '@/services/dummy-data';

export default function SmartDiagnosisPage() {
  // Server side data fetching
  const allDiagnoses = pediatricAllergies;

  return (
    <div className="flex flex-col w-full px-4 overflow-y-auto">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Smart Diagnosis', href: '/dashboard/smart-diagnosis' },
        ]}
      />
      <SmartDiagnosisClient initialDiagnoses={allDiagnoses} />
    </div>
  );
}
