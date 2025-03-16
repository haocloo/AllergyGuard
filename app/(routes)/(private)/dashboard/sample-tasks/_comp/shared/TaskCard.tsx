import { useState } from 'react';
import { format } from 'date-fns';
import { Loader2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';
import { useToast } from '@/hooks/use-toast';
import { Task, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => Promise<void>;
  onStatusUpdate?: (taskId: string, status: TaskStatus) => Promise<void>;
  onEdit?: (task: Task) => void;
  showImages?: boolean;
}

// Constants for badge variants
export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'in_progress':
      return 'warning';
    case 'completed':
      return 'success';
    default:
      return 'default';
  }
};

export const getCategoryBadgeVariant = (category: string) => {
  switch (category) {
    case 'work':
      return 'default';
    case 'personal':
      return 'secondary';
    case 'shopping':
      return 'outline';
    case 'health':
      return 'destructive';
    default:
      return 'default';
  }
};

export function TaskCard({
  task,
  onDelete,
  onStatusUpdate,
  onEdit,
  showImages = true,
}: TaskCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(task.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    if (!onStatusUpdate) return;
    try {
      setIsUpdating(true);
      await onStatusUpdate(task.id, newStatus);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-300 relative overflow-hidden">
      <div
        className={cn(
          'absolute top-0 left-0 w-1 h-full transition-colors',
          task.status === 'completed' && 'bg-green-500',
          task.status === 'in_progress' && 'bg-yellow-500',
          task.status === 'pending' && 'bg-blue-500'
        )}
      />

      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onStatusUpdate && (
              <>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate('pending')}
                  className={cn(task.status === 'pending' && 'bg-accent')}
                >
                  <Badge variant={getStatusBadgeVariant('pending')} className="mr-2">
                    Pending
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate('in_progress')}
                  className={cn(task.status === 'in_progress' && 'bg-accent')}
                >
                  <Badge variant={getStatusBadgeVariant('in_progress')} className="mr-2">
                    In Progress
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate('completed')}
                  className={cn(task.status === 'completed' && 'bg-accent')}
                >
                  <Badge variant={getStatusBadgeVariant('completed')} className="mr-2">
                    Completed
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="space-y-2 pb-2 sm:pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold line-clamp-1">{task.name}</CardTitle>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
            <span>Created {format(new Date(task.createdAt), 'PPP')}</span>
            <span>•</span>
            <Badge variant={getCategoryBadgeVariant(task.category)} className="capitalize">
              {task.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {showImages && task.primaryImage && task.secondaryImage && (
        <CardContent className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="relative group/image overflow-hidden rounded-md bg-muted aspect-video">
              <img
                src={task.primaryImage}
                alt="Primary"
                className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover/image:opacity-100 transition-opacity" />
            </div>
            <div className="relative group/image overflow-hidden rounded-md bg-muted aspect-video">
              <img
                src={task.secondaryImage}
                alt="Secondary"
                className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover/image:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Loading Skeleton Component
export function TaskSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="h-6 w-1/3 bg-muted rounded"></div>
          <div className="h-5 w-20 bg-muted rounded-full"></div>
        </div>
        <div className="h-4 w-1/4 bg-muted rounded"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="w-full h-32 bg-muted rounded-md"></div>
          <div className="w-full h-32 bg-muted rounded-md"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 bg-muted rounded-full"></div>
          <div className="h-4 w-24 bg-muted rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}
