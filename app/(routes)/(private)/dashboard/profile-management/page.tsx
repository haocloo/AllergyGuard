import Breadcrumbs from '@/components/layout/breadcrumb';
import { ProfileManagementClient } from './_comp/client';
import { get_classrooms, get_children } from './_comp/actions';
import type { Classroom, Child } from './_comp/types';

export default async function ProfileManagementPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile Management' },
  ];

  // Fetch classrooms with error handling
  let initialClassrooms: Classroom[] = [];
  try {
    initialClassrooms = await get_classrooms();
  } catch (error) {
    console.error('Error loading classrooms:', error);
  }

  // Fetch children with error handling
  let initialChildren: Child[] = [];
  try {
    initialChildren = await get_children();
  } catch (error) {
    console.error('Error loading children profiles:', error);
  }

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <ProfileManagementClient
          initialClassrooms={initialClassrooms}
          initialChildren={initialChildren}
        />
      </div>
    </div>
  );
}
