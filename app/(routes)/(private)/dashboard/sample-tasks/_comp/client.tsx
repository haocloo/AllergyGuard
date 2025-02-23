'use client';

import { useEffect } from 'react';

// ui
import { AITask } from './ai-task';

// services
import { Task } from './types';
import { useTaskStore } from './store';
import { EmailDialog } from './email-dialog';
import { TelegramDialog } from './telegram-dialog';
import { DebugLogger } from './debug-logger';
import { FirebaseTasks } from './firebase-tasks';
import { SQLTasks } from './sql-tasks';

interface Props {
  initialTasks: Task[];
  initialFirestoreTasks: Task[];
}

export function TasksClient({ initialTasks, initialFirestoreTasks }: Props) {
  const { setFirestoreTasks, setTasks } = useTaskStore();

  // Initialize firestore admin tasks
  useEffect(() => {
    setFirestoreTasks(initialFirestoreTasks);
    setTasks(initialTasks);
  }, [initialTasks, initialFirestoreTasks, setFirestoreTasks, setTasks]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage your tasks efficiently</p>
        </div>
        <div className="flex items-center gap-2">
          <EmailDialog />
          <TelegramDialog />
          <DebugLogger />
          <AITask />
        </div>
      </div>

      <SQLTasks />

      <FirebaseTasks />
    </div>
  );
}
