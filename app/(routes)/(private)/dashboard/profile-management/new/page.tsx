import Breadcrumbs from '@/components/layout/breadcrumb';
import { CreateProfileClient } from '../_comp/create-profile/client';

export default async function CreateProfilePage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile Management', href: '/dashboard/profile-management' },
    { label: 'New Profile' },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <CreateProfileClient />
      </div>
    </div>
  );
}
