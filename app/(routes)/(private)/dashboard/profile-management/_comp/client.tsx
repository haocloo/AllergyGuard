'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassroomManagement } from './classroom-management';
import { ChildProfileManagement } from './child-profile-management';
import { useClassroomStore } from './store';
import { useChildProfileStore } from './store';
import type { Classroom, Child } from './types';

interface ProfileManagementClientProps {
  initialClassrooms: Classroom[];
  initialChildren: Child[];
}

export function ProfileManagementClient({
  initialClassrooms,
  initialChildren,
}: ProfileManagementClientProps) {
  const [activeTab, setActiveTab] = useState<string>('classroom');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize stores with initial data
  const setClassrooms = useClassroomStore((state) => state.setClassrooms);
  const setChildren = useChildProfileStore((state) => state.setChildren);

  useEffect(() => {
    // Set initial data in the stores
    setClassrooms(initialClassrooms);
    setChildren(initialChildren);
    setIsLoading(false);
  }, [initialClassrooms, initialChildren, setClassrooms, setChildren]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Profile Management</h1>
      <p className="text-muted-foreground">
        Manage children profiles, classrooms and allergy information.
      </p>

      <Tabs
        defaultValue="classroom"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mt-6"
      >
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="classroom">Classroom Mode</TabsTrigger>
          <TabsTrigger value="children">Child Profiles</TabsTrigger>
        </TabsList>

        <TabsContent value="classroom" className="mt-6">
          <ClassroomManagement isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="children" className="mt-6">
          <ChildProfileManagement isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
