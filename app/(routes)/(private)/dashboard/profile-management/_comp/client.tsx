'use client';

import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useProfileStore } from './store';
import { ChildrenGrid } from './children-grid';
import type { Child } from './types';

interface Props {
  initialChildren: Child[];
}

export function ProfileClient({ initialChildren }: Props) {
  const { setChildren } = useProfileStore();
  const router = useRouter();

  // Initialize children data
  useEffect(() => {
    setChildren(initialChildren);
  }, [initialChildren, setChildren]);

  return (
    <div className="relative space-y-6">
      {/* Header Section */}
      <div className="flex flex-col items-start ">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Children Profiles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your children's profiles and allergies
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <ChildrenGrid />
      </div>
    </div>
  );
}
