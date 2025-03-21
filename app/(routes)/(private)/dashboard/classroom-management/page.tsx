import Breadcrumbs from '@/components/layout/breadcrumb';
import ClassroomClient from './_comp/client';
import { classrooms } from '@/services/dummy-data';

export default async function ClassroomPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Classroom Management' },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <ClassroomClient initialClassrooms={classrooms} />
      </div>
    </div>
  );
}