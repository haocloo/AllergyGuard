'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClassroomCard } from './classroom-card';
import { Card } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import { CreateClassroomDialog } from './create-classroom-dialog';
import { useClassroomStore } from './store';
import { getLocalClassrooms } from './client-actions';
import { cn } from '@/lib/cn';
import type { Classroom } from './types';

interface Props {
  initialClassrooms: Classroom[];
}

function AddClassroomButton({ onClick }: { onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
        'flex items-center justify-center',
        'border-2 border-dashed h-[160px]',
        'bg-transparent hover:bg-muted/5'
      )}
    >
      <div className="text-center px-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
          <GraduationCap className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-medium text-primary text-sm">Add New Classroom</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-[160px]">
          Create a new classroom space
        </p>
      </div>
    </Card>
  );
}

export function ClassroomGrid({ initialClassrooms }: Props) {
  const router = useRouter();
  const { classrooms, isCreateDialogOpen, setClassrooms, setCreateDialogOpen } =
    useClassroomStore();

  useEffect(() => {
    async function loadClassrooms() {
      try {
        const storedClassrooms = await getLocalClassrooms();

        // If there's stored data, merge it with initial data
        if (storedClassrooms.length > 0) {
          // Create a Map with id as key to remove duplicates
          const classroomMap = new Map();

          // Add initial classrooms first
          initialClassrooms.forEach((classroom) => {
            classroomMap.set(classroom.id, classroom);
          });

          // Then add stored classrooms (will override duplicates)
          storedClassrooms.forEach((classroom) => {
            classroomMap.set(classroom.id, classroom);
          });

          // Convert Map back to array
          const mergedClassrooms = Array.from(classroomMap.values());
          setClassrooms(mergedClassrooms);
        } else {
          // If no stored data, use initial data and save it to localStorage
          setClassrooms(initialClassrooms);
          localStorage.setItem('classrooms', JSON.stringify(initialClassrooms));
        }
      } catch (error) {
        console.error('Error loading classrooms:', error);
        setClassrooms(initialClassrooms);
      }
    }

    loadClassrooms();
  }, [initialClassrooms, setClassrooms]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.isArray(classrooms) &&
          classrooms.map((classroom) => (
            <div
              key={classroom.id}
              onClick={() => router.push(`/dashboard/classroom-management/${classroom.id}`)}
            >
              <ClassroomCard classroom={classroom} />
            </div>
          ))}
        <AddClassroomButton onClick={() => setCreateDialogOpen(true)} />
      </div>

      <CreateClassroomDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} />
    </>
  );
}
