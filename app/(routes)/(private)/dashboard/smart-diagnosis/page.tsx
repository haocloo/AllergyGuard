import Breadcrumbs from '@/components/layout/breadcrumb';
import { SmartDiagnosisClient } from './_comp/client';
import { get_children, get_allergies } from './_comp/action';

export default async function SmartDiagnosisPage() {
  // Server side data fetching
  const [children, allDiagnoses] = await Promise.all([get_children(), get_allergies()]);

  return (
    <div className="flex flex-col w-full px-4 overflow-y-auto">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Smart Diagnosis', href: '/dashboard/smart-diagnosis' },
        ]}
      />
      <SmartDiagnosisClient initialDiagnoses={allDiagnoses} initialChildren={children} />
    </div>
  );
}
