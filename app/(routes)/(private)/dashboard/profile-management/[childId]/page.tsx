import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/layout/breadcrumb';
import { children } from '@/services/dummy-data';
import { ChildDetailsClient } from '../_comp/child-details/client';
import type { Child, Allergy, Symptom, EmergencyContact, Caretaker } from '../_comp/types';
import type { RawChild } from '@/services/dummy-data';

interface Props {
  params: {
    childId: string;
  };
}

export default async function ChildDetailsPage({ params }: Props) {
  const rawChild = children.find((c) => c.id === params.childId) as RawChild | undefined;

  if (!rawChild) {
    notFound();
  }

  // Transform the data to match the expected Child type
  const child: Child = {
    id: rawChild.id,
    name: rawChild.name,
    firstName: rawChild.firstName || rawChild.name.split(' ')[0],
    lastName: rawChild.lastName || rawChild.name.split(' ')[1] || '',
    dob: rawChild.dob,
    gender: (rawChild.gender as 'male' | 'female') || 'male',
    photoUrl: rawChild.photoUrl || undefined,
    parentId: rawChild.parentId,
    classroomId: rawChild.classroomId,
    createdAt: rawChild.createdAt,
    createdBy: rawChild.createdBy,
    allergies: rawChild.allergies.map(
      (allergy): Allergy => ({
        allergen: allergy.allergen,
        notes: allergy.notes || '',
        severity: (allergy.severity as 'Low' | 'Medium' | 'High') || 'Low',
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
      })
    ),
    symptoms:
      rawChild.symptoms?.map(
        (symptom): Symptom => ({
          name: symptom.name,
          severity: symptom.severity as 'Mild' | 'Moderate' | 'Severe',
        })
      ) || [],
    emergencyContacts:
      rawChild.emergencyContacts?.map(
        (contact): EmergencyContact => ({
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone,
          email: contact.email,
          isMainContact: contact.isMainContact,
        })
      ) || [],
    caretakers: (rawChild.caretakers || []).map(
      (caretaker): Caretaker => ({
        id: caretaker.id,
        type: caretaker.type,
        name: caretaker.name,
        email: caretaker.email,
        role: caretaker.role || 'Caretaker',
        phone: caretaker.phone,
        notes: caretaker.notes,
        createdAt: caretaker.createdAt,
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
