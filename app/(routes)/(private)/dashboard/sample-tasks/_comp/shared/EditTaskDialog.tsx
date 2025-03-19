import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploadInput } from '@/components/helpers/image-upload-input';
import { ImageUploadManager } from '@/lib/image-upload';
import { cn } from '@/lib/cn';
import { useToast } from '@/hooks/use-toast';
import { Task, TaskCategory, TaskStatus, TaskFormData, CATEGORIES } from '../types';
import {  
  FormState,
  EMPTY_FORM_STATE,
  fromErrorToFormState,
  FieldError,
  scrollToFirstError,
} from '@/components/helpers/form-items';

const imageManager = new ImageUploadManager('tasks');

interface EditTaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, data: any) => Promise<FormState>;
  onUpdateStore: (taskId: string, data: any) => void;
}

export function EditTaskDialog({
  task,
  isOpen,
  onClose,
  onUpdate,
  onUpdateStore,
}: EditTaskDialogProps) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [formState, setFormState] = useState<FormState>(EMPTY_FORM_STATE);
  const [formData, setFormData] = useState<TaskFormData>({
    name: task.name,
    category: task.category as TaskCategory,
    status: task.status as TaskStatus,
    image: {
      primary: {
        file: undefined,
        preview: task.primaryImage,
      },
      secondary: {
        file: undefined,
        preview: task.secondaryImage,
      },
    },
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setFormState(EMPTY_FORM_STATE);

    try {
      // First, upload images if they exist
      const uploadedImages = (await imageManager.handleFormImages({
        primary: formData.image.primary,
        secondary: formData.image.secondary,
      })) as { [key: string]: string };

      const updateData = {
        name: formData.name,
        category: formData.category,
        status: formData.status,
        primaryImage: uploadedImages.primary,
        secondaryImage: uploadedImages.secondary,
      };

      const result = await onUpdate(task.id, updateData);

      if (result.status === 'ERROR') {
        setFormState(result);
        toast({
          title: 'Error',
          description: result.message || 'Failed to update task',
          variant: 'destructive',
        });
        return;
      }

      // Update task in store
      onUpdateStore(task.id, {
        ...task,
        ...updateData,
        createdAt: task.createdAt,
      });

      onClose();
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
        description: formState.message || 'Failed to update task',
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Task Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter task name"
                className={cn('w-full', formState.fieldErrors.name && 'border-destructive')}
              />
              <FieldError formState={formState} name="name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger
                  className={cn('w-full', formState.fieldErrors.category && 'border-destructive')}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="capitalize">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError formState={formState} name="category" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TaskStatus) => handleChange('status', value)}
              >
                <SelectTrigger
                  className={cn('w-full', formState.fieldErrors.status && 'border-destructive')}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FieldError formState={formState} name="status" />
            </div>

            <div className="space-y-2">
              <Label>Primary Image</Label>
              <ImageUploadInput
                value={formData.image.primary}
                onChange={(value) =>
                  handleChange('image', {
                    ...formData.image,
                    primary: value,
                  })
                }
                label="Upload primary image"
                isError={!!formState.fieldErrors.primaryImage}
                disabled={isPending}
              />
              <FieldError formState={formState} name="primaryImage" />
            </div>

            <div className="space-y-2">
              <Label>Secondary Image</Label>
              <ImageUploadInput
                value={formData.image.secondary}
                onChange={(value) =>
                  handleChange('image', {
                    ...formData.image,
                    secondary: value,
                  })
                }
                label="Upload secondary image"
                isError={!!formState.fieldErrors.secondaryImage}
                disabled={isPending}
              />
              <FieldError formState={formState} name="secondaryImage" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending} size="lg">
            {isPending ? 'Updating...' : 'Update Task'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
