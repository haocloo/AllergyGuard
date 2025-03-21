import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/layout/breadcrumb';
import { children } from '@/services/dummy-data';
import { ChildDetailsClient } from '../_comp/child-details/client';
import type { Child, Allergy } from '../_comp/types';

interface Props {
  params: {
    childId: string;
  };
}

export default async function ChildDetailsPage({ params }: Props) {
  const rawChild = children.find((c) => c.id === params.childId);

  if (!rawChild) {
    notFound();
  }

  // Transform the data to match the expected Child type
  const child: Child = {
    id: rawChild.id,
    name: rawChild.name,
    dob: rawChild.dob,
    parentId: rawChild.parentId,
    classroomId: rawChild.classroomId,
    createdAt: rawChild.createdAt,
    createdBy: rawChild.createdBy,
    // Transform allergies to match expected structure
    allergies: rawChild.allergies.map(
      (allergy): Allergy => ({
        allergen: allergy.allergen,
        notes: allergy.notes || '',
        // Add missing properties
        symptoms: [],
        actionPlan: {
          immediateAction: '',
          medications: [],
        },
      })
    ),
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile Management', href: '/dashboard/profile-management' },
    { label: child.name, href: `/dashboard/profile-management/${child.id}` },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5">
        <ChildDetailsClient initialChild={child} />
      </div>
    </div>
  );
}
