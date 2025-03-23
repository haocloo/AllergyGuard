import Breadcrumbs from '@/components/layout/breadcrumb';
import { ProfileClient } from './_comp/client';
import { children } from '@/services/dummy-data';
import type { Child } from './_comp/types';
import type { RawChild } from '@/services/dummy-data';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function ProfileManagementPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile Management' },
  ];

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Transform children data to match expected Child type
  const transformedChildren: Child[] = (children as RawChild[]).map((child) => ({
    id: child.id,
    name: child.name,
    firstName: child.firstName || child.name.split(' ')[0],
    lastName: child.lastName || child.name.split(' ')[1] || '',
    dob: child.dob,
    gender: (child.gender as 'male' | 'female') || 'male',
    photoUrl: child.photoUrl,
    parentId: child.parentId,
    classroomId: child.classroomId,
    createdAt: child.createdAt,
    createdBy: child.createdBy,
    allergies: child.allergies.map((allergy) => ({
      allergen: allergy.allergen,
      notes: allergy.notes || '',
      severity: allergy.severity || 'Low',
      symptoms:
        allergy.symptoms?.map((symptom) => ({
          name: symptom.name,
        })) || [],
      actionPlan: {
        immediateAction: allergy.actionPlan?.immediateAction || '',
        medications:
          allergy.actionPlan?.medications?.map((med) => ({
            name: med.name,
            dosage: med.dosage,
          })) || [],
      },
      isCustomAllergen: allergy.isCustomAllergen,
    })),
    symptoms:
      child.symptoms?.map((symptom) => ({
        name: symptom.name,
        severity: symptom.severity as 'Mild' | 'Moderate' | 'Severe',
      })) || [],
    emergencyContacts:
      child.emergencyContacts?.map((contact) => ({
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        email: contact.email,
        isMainContact: contact.isMainContact,
      })) || [],
    caretakers:
      child.caretakers?.map((caretaker) => ({
        id: caretaker.id,
        type: caretaker.type,
        name: caretaker.name,
        email: caretaker.email,
        role: caretaker.role || 'Caretaker',
        phone: caretaker.phone,
        notes: caretaker.notes,
        createdAt: caretaker.createdAt,
      })) || [],
  }));

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <ProfileClient initialChildren={transformedChildren} />
        <Link
          href="/dashboard/profile-management/new"
          className="z-1000 fixed bottom-20 right-4 size-12 rounded-full shadow-2xl bg-primary text-white flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add Child Profile</span>
        </Link>
      </div>
    </div>
  );
}
