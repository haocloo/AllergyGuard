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
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <GameClient initialChildProfiles={childProfiles} initialAllergies={allergies} />
      </div>
    </div>
  );
} 