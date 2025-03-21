import Breadcrumbs from '@/components/layout/breadcrumb';
import { ProfileClient } from './_comp/client';
import { children } from '@/services/dummy-data';

export default async function ProfileManagementPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile Management' },
  ];

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <ProfileClient initialChildren={children} />
      </div>
    </div>
  );
}
