import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploadInput } from '@/components/helpers/image-upload-input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/cn';
import { FieldError, FormState } from '@/components/helpers/form-items';
import { TaskCategory, TaskFormData, CATEGORIES } from '../types';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: TaskFormData) => Promise<void>;
  formData: TaskFormData;
  formState: FormState;
  isPending: boolean;
  onChange: (field: string, value: any) => void;
  showImageUpload?: boolean;
}

export function CreateTaskDialog({
  isOpen,
  onClose,
  onSubmit,
  formData,
  formState,
  isPending,
  onChange,
  showImageUpload = true,
}: CreateTaskDialogProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Task Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Enter task name"
                className={cn('w-full', formState.fieldErrors.name && 'border-destructive')}
              />
              <FieldError formState={formState} name="name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => onChange('category', value as TaskCategory)}
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

            {showImageUpload && (
              <>
                <div className="space-y-2">
                  <Label>Primary Image</Label>
                  <ImageUploadInput
                    value={formData.image.primary}
                    onChange={(value) =>
                      onChange('image', {
                        ...formData.image,
                        primary: value,
                      })
                    }
                    label="Upload primary image (required)"
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
                      onChange('image', {
                        ...formData.image,
                        secondary: value,
                      })
                    }
                    label="Upload secondary image (optional)"
                    isError={!!formState.fieldErrors.secondaryImage}
                    disabled={isPending}
                  />
                  <FieldError formState={formState} name="secondaryImage" />
                </div>
              </>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending} size="lg">
            {isPending ? 'Creating...' : 'Create Task'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
