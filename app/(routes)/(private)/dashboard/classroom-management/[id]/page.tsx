import { Suspense } from 'react';
import { ClassroomDetails } from '../[id]/_components/classroom-details';
import { classrooms } from '@/services/dummy-data';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/layout/breadcrumb';

interface Props {
  params: {
    id: string;
  };
}

export default function ClassroomPage({ params }: Props) {
  const classroom = classrooms.find((c) => c.id === params.id);

  if (!classroom) {
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Classroom Management', href: '/dashboard/classroom-management' },
    { label: classroom.name },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5">
        <div className="max-w-7xl w-full mx-auto space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <ClassroomDetails classroom={classroom} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
