import { useState } from 'react';

// ui
import { Plus, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { EMPTY_FORM_STATE } from '@/components/helpers/form-items';
import { fromErrorToFormState } from '@/components/helpers/form-items';
import { scrollToFirstError } from '@/components/helpers/scroll-to-error';

// pui
import { ImageUploadManager } from '@/lib/image-upload';
import { TaskCard, TaskSkeleton } from './shared/TaskCard';
import { CreateTaskDialog } from './shared/CreateTaskDialog';
import { EditTaskDialog } from './shared/EditTaskDialog';
import { FilterBar } from './shared/FilterBar';

// external
import { v4 as uuidv4 } from 'uuid';

// services
import { useTaskStore } from './store';
import { Task, TaskStatus } from './types';
import { createTask, updateTask, deleteTask, updateTaskStatus } from './actions';

const imageManager = new ImageUploadManager('tasks');

// Empty State Component
function EmptyState() {
  const { setIsDialogOpen } = useTaskStore();

  return (
    <div className="py-5 flex-grow border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/50 flex flex-col items-center justify-center">
      <ClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold text-muted-foreground mb-2">No tasks yet</h3>
      <p className="text-sm text-muted-foreground/70 text-center mb-4 max-w-md">
        Get started by creating your first task. Tasks help you track and manage your work
        efficiently.
      </p>
      <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Create Your First Task
      </Button>
    </div>
  );
}

export function SQLTasks() {
  const {
    tasks,
    sqlFilters,
    isLoading,
    formData,
    formState,
    isDialogOpen,
    isPending,
    setField,
    setFormState,
    setIsDialogOpen,
    setIsPending,
    addTask,
    deleteTask: removeTask,
    updateTask: updateTaskInStore,
    updateTaskStatus: updateTaskStatusStore,
    reset,
    setSqlFilter,
  } = useTaskStore();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter((task) => {
    if (sqlFilters.category && task.category !== sqlFilters.category) return false;
    if (sqlFilters.status && task.status !== sqlFilters.status) return false;
    return true;
  });

  const { toast } = useToast();

  const handleCreateTask = async () => {
    setIsPending(true);
    setFormState(EMPTY_FORM_STATE);

    try {
      // First, upload images if they exist
      const uploadedImages = (await imageManager.handleFormImages({
        primary: formData.image.primary,
        secondary: formData.image.secondary,
      })) as { [key: string]: string };

      const taskData = {
        id: uuidv4(),
        name: formData.name,
        category: formData.category,
        status: 'pending' as TaskStatus,
        primaryImage: uploadedImages.primary,
        secondaryImage: uploadedImages.secondary,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // First create the task without status
      const createTaskData = {
        id: taskData.id,
        name: taskData.name,
        category: taskData.category,
        primaryImage: taskData.primaryImage,
        secondaryImage: taskData.secondaryImage,
        createdAt: taskData.createdAt,
        updatedAt: taskData.updatedAt,
      };

      const result = await createTask(createTaskData);

      if (result.status === 'ERROR') {
        setFormState(result);
        toast({
          title: 'Error',
          description: result.message || 'Failed to create task',
          variant: 'destructive',
        });
        return;
      }

      // Add task to state using the submitted data
      addTask({
        ...taskData,
        createdAt: new Date().toISOString(),
      });

      reset();
      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: result.message,
        variant: 'success',
      });
    } catch (error: any) {
      const formState = fromErrorToFormState(error);
      setFormState(formState);
      scrollToFirstError(formState);
      toast({
        title: 'Error',
        description: formState.message || 'Failed to create task',
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await deleteTask(taskId);

      if (result.status === 'ERROR') {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }

      removeTask(taskId);
      toast({
        title: 'Success',
        description: result.message,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const result = await updateTaskStatus(taskId, newStatus);

      if (result.status === 'ERROR') {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }
      updateTaskStatusStore(taskId, newStatus);

      toast({
        title: 'Success',
        description: result.message,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Statistics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tasks.length > 0 ? `${tasks.length} total tasks` : 'No tasks yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter((t) => t.status === 'pending').length}
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
              {tasks.filter((t) => t.status === 'in_progress').length}
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
              {tasks.filter((t) => t.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Finished tasks</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col xs:flex-row justify-between space-y-2 xs:space-y-0">
        {/* Filters */}
        <FilterBar
          categoryFilter={sqlFilters.category}
          statusFilter={sqlFilters.status}
          onFilterChange={setSqlFilter}
        />
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDeleteTask}
              onStatusUpdate={handleStatusUpdate}
              onEdit={handleEditClick}
            />
          ))}
        </div>
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateTask}
        formData={{ ...formData, status: 'pending' }}
        formState={formState}
        isPending={isPending}
        onChange={setField}
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
            const result = await updateTask(taskId, data);
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
