// this page is for coding reference only

import Breadcrumbs from '@/components/layout/breadcrumb';
import { TasksClient } from './_comp/client';
import { get_tasks, getFirestoreTasks } from './_comp/actions';
import type { Task } from './_comp/types';
import { redirect } from 'next/navigation';

export default async function TasksPage() {
  if (process.env.NEXT_PUBLIC_APP_URL !== 'http://localhost:3000') {
    redirect('/dashboard');
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tasks Management' },
  ];

  // Fetch Drizzle tasks with error handling
  let initialTasks: Task[] = [];
  try {
    initialTasks = await get_tasks();
    console.log('initialTasks', initialTasks);
  } catch (error) {
    console.error('Error loading tasks:', error);
  }

  // Fetch Firestore admin tasks using the new server action based on Firebase Admin
  let initialFirestoreTasks: Task[] = [];
  try {
    initialFirestoreTasks = await getFirestoreTasks();
  } catch (error) {
    console.error('Error loading Firestore admin tasks:', error);
  }

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <TasksClient initialTasks={initialTasks} initialFirestoreTasks={initialFirestoreTasks} />
      </div>
    </div>
  );
}
