import Breadcrumbs from '@/components/layout/breadcrumb';
import { ProfileClient } from './_comp/client';
import { children } from '@/services/dummy-data';
import type { Child, Allergy } from './_comp/types';

export default async function ProfileManagementPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile Management' },
  ];

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Transform children data to match expected Child type
  const transformedChildren: Child[] = children.map((child) => ({
    id: child.id,
    name: child.name,
    dob: child.dob,
    parentId: child.parentId,
    classroomId: child.classroomId,
    createdAt: child.createdAt,
    createdBy: child.createdBy,
    allergies: child.allergies.map(
      (allergy) =>
        ({
          allergen: allergy.allergen,
          notes: allergy.notes || '',
          symptoms: [],
          actionPlan: {
            immediateAction: '',
            medications: [],
          },
        } as Allergy)
    ),
  }));

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <ProfileClient initialChildren={transformedChildren} />
      </div>
    </div>
  );
}
