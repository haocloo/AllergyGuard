import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/layout/breadcrumb';
import { children } from '@/services/dummy-data';
import { ChildDetailsClient } from '../_comp/child-details/client';

interface Props {
  params: {
    childId: string;
  };
}

export default async function ChildDetailsPage({ params }: Props) {
  const child = children.find((c) => c.id === params.childId);

  if (!child) {
    notFound();
  }

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
