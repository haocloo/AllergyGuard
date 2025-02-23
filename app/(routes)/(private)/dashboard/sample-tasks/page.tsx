import Breadcrumbs from '@/components/layout/breadcrumb';
import { TasksClient } from './_comp/client';
import { get_tasks, getFirestoreTasks } from './_comp/actions';
import type { Task } from './_comp/types';

export default async function TasksPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tasks Management' },
  ];

  // Fetch Drizzle tasks with error handling
  let initialTasks: Task[] = [];
  try {
    initialTasks = await get_tasks();
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
  console.log('initialFirestoreTasks', initialFirestoreTasks);
  return (
    <div className="flex flex-col min-h-screen">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-6 overflow-y-auto pt-1 pb-5">
        <TasksClient initialTasks={initialTasks} initialFirestoreTasks={initialFirestoreTasks} />
      </div>
    </div>
  );
}
