import Breadcrumbs from '@/components/layout/breadcrumb';
import { GameClient } from './_comp/client';
import { getChildrenProfiles, getAllergies } from './_comp/actions';
import type { ChildProfile, Allergy } from './_comp/types';

export default async function AllergyNinjaPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Allergy Ninja Game' },
  ];

  // Fetch child profiles with error handling
  let childProfiles: ChildProfile[] = [];
  try {
    childProfiles = await getChildrenProfiles();
  } catch (error) {
    console.error('Error loading child profiles:', error);
  }

  // Fetch allergies from database
  let allergies: Allergy[] = [];
  try {
    allergies = await getAllergies();
  } catch (error) {
    console.error('Error loading allergies:', error);
  }

  return (
    <div className="flex flex-col w-full px-5 overflow-y-auto">
      <Breadcrumbs items={breadcrumbItems} />
      <GameClient initialChildProfiles={childProfiles} initialAllergies={allergies} />
    </div>
  );
}
