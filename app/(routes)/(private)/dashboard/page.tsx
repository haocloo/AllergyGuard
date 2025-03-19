import { redirect } from 'next/navigation';
import { lucia_get_user } from '@/services/server';
import Breadcrumbs from '@/components/layout/breadcrumb';

export default async function Page() {
  const { user } = await lucia_get_user();

  if (!user?.id) {
    return redirect('/auth');
  }

  if (user.role === 'caretaker') {
    return redirect('/dashboard/student');
  } else if (user.role === 'parent') {
    return redirect('/dashboard/parent');
  } else if (user.role === 'admin') {
    return redirect('/dashboard/admin');
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Platform', href: '/dashboard' }, { label: 'Dashboard' }]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
}
