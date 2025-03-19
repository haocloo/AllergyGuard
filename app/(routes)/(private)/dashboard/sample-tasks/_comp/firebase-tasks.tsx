'use client';

import { useState } from 'react';

// ui
import { Plus, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EMPTY_FORM_STATE } from '@/components/helpers/form-items';
import { fromErrorToFormState } from '@/components/helpers/form-items';
import { Task, TaskFormData, TaskStatus } from './types';

// pui
import { ImageUploadManager } from '@/lib/image-upload';
import { FilterBar } from './shared/FilterBar';
import { TaskCard } from './shared/TaskCard';
import { CreateTaskDialog } from './shared/CreateTaskDialog';
import { EditTaskDialog } from './shared/EditTaskDialog';

// external
import { v4 as uuidv4 } from 'uuid';

// services
import { useToast } from '@/hooks/use-toast';
import { useTaskStore } from './store';
import {
  updateFirestoreTask,
  deleteFirestoreTask,
  createFirestoreTask,
  updateFirestoreTaskStatus,
} from './actions';
import { scrollToFirstError } from '@/components/helpers/form-items';

const imageManager = new ImageUploadManager('tasks');

export function FirebaseTasks() {
  const {
    firestoreTasks,
    firestoreFilters,
    addFirestoreTask,
    updateFirestoreTask: updateTaskInStore,
    deleteFirestoreTask: deleteTaskFromStore,
    setFirestoreFilter,
  } = useTaskStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [formState, setFormState] = useState(EMPTY_FORM_STATE);
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    category: 'work',
    status: 'pending',
    image: {
      primary: { file: undefined, preview: '' },
      secondary: { file: undefined, preview: '' },
    },
  });

  // Filter tasks based on selected filters
  const filteredTasks = firestoreTasks.filter((task) => {
    if (firestoreFilters.category && task.category !== firestoreFilters.category) return false;
    if (firestoreFilters.status && task.status !== firestoreFilters.status) return false;
    return true;
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      if (field === 'image') {
        return {
          ...prev,
          image: {
            ...prev.image,
            ...value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'work',
      status: 'pending',
      image: {
        primary: { file: undefined, preview: '' },
        secondary: { file: undefined, preview: '' },
      },
    });
    setFormState(EMPTY_FORM_STATE);
  };

  const handleCreateTask = async () => {
    setIsPending(true);
    setFormState(EMPTY_FORM_STATE);

    try {
      const uploadedImages = (await imageManager.handleFormImages({
        primary: formData.image.primary,
        secondary: formData.image.secondary,
      })) as { [key: string]: string };

      const taskData = {
        id: uuidv4(),
        name: formData.name,
        category: formData.category,
        primaryImage: uploadedImages.primary,
        secondaryImage: uploadedImages.secondary,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await createFirestoreTask(taskData);

      if (result.status === 'ERROR') {
        setFormState(result);
        toast({
          title: 'Error',
          description: result.message || 'Failed to create task',
          variant: 'destructive',
        });
        return;
      }

      addFirestoreTask({
        ...taskData,
        status: 'pending',
        createdAt: taskData.createdAt.toISOString(),
      });

      resetForm();
      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: result.message || 'Task created successfully',
        variant: 'success',
      });
    } catch (error: any) {
      const formState = fromErrorToFormState(error);
      setFormState(formState);
      scrollToFirstError(formState);
      toast({
        title: 'Error',
        description: formState.message,
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const result = await updateFirestoreTaskStatus(taskId, newStatus);
      if (result.status === 'SUCCESS') {
        updateTaskInStore(taskId, { status: newStatus });
        toast({
          title: 'Success',
          description: result.message,
          variant: 'success',
        });
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update task status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while updating the task status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await deleteFirestoreTask(taskId);
      if (result.status === 'SUCCESS') {
        deleteTaskFromStore(taskId);
        toast({
          title: 'Success',
          description: result.message,
          variant: 'success',
        });
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to delete task',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the task',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Task Statistics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{firestoreTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {firestoreTasks.length > 0 ? `${firestoreTasks.length} total tasks` : 'No tasks yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {firestoreTasks.filter((t) => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Tasks to start</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {firestoreTasks.filter((t) => t.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">Tasks in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {firestoreTasks.filter((t) => t.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Finished tasks</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col xs:flex-row justify-between space-y-2 xs:space-y-0">
        {/* Filters */}
        <FilterBar
          categoryFilter={firestoreFilters.category}
          statusFilter={firestoreFilters.status}
          onFilterChange={setFirestoreFilter}
        />
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="py-5 flex-grow border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/50 flex flex-col items-center justify-center">
          <ClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Firebase tasks yet
          </h3>
          <p className="text-sm text-muted-foreground/70 text-center mb-4 max-w-md">
            Get started by creating your first Firebase task.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDeleteTask}
              onStatusUpdate={handleStatusUpdate}
              onEdit={handleEditClick}
              showImages={true}
            />
          ))}
        </div>
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          resetForm();
        }}
        onSubmit={handleCreateTask}
        formData={formData}
        formState={formState}
        isPending={isPending}
        onChange={handleChange}
        showImageUpload={true}
      />

      {/* Edit Task Dialog */}
      {selectedTask && (
        <EditTaskDialog
          task={selectedTask}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedTask(null);
          }}
          onUpdate={async (taskId: string, data: any) => {
            const result = await updateFirestoreTask(taskId, data);
            if (result.status === 'SUCCESS') {
              updateTaskInStore(taskId, data);
            }
            return result;
          }}
          onUpdateStore={updateTaskInStore}
        />
      )}
    </div>
  );
}
