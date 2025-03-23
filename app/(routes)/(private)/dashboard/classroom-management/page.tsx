import { Suspense } from 'react';
import { ClassroomGrid } from './_comp/classroom-grid';
import { classrooms as dummyClassrooms } from '@/services/dummy-data';
import { transformDummyClassroom } from './_comp/utils';
import Breadcrumbs from '@/components/layout/breadcrumb';

export default function ClassroomManagementPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Classroom Management' },
  ];

  // Transform dummy data to match our Classroom type with safety checks
  const initialClassrooms = Array.isArray(dummyClassrooms)
    ? dummyClassrooms
        .filter((classroom) => classroom && typeof classroom === 'object')
        .map((classroom) => transformDummyClassroom(classroom))
    : [];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5">
        <div className="max-w-7xl w-full space-y-4 px-2">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-2xl font-bold text-primary">Classroom Management</h1>
            <p className="text-sm text-muted-foreground">Create and manage your classroom spaces</p>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <ClassroomGrid initialClassrooms={initialClassrooms} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
