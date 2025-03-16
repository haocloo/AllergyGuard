'use client';

import { useState } from 'react';
import { useClassroomStore } from './store';
import { useChildProfileStore } from './store';
import { create_classroom, update_classroom, delete_classroom } from './actions';
import { PlusCircle, Pencil, Trash2, Copy, Check, Users, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { classroomSchema } from './validation';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ClassroomManagementProps {
  isLoading: boolean;
}

export function ClassroomManagement({ isLoading }: ClassroomManagementProps) {
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState<string | null>(null);

  // Get state and actions from store
  const {
    classrooms,
    isDialogOpen,
    isPending,
    mode,
    formData,
    formState,
    selectedClassroom,
    searchTerm,
    setIsDialogOpen,
    setIsPending,
    setField,
    setFormState,
    addClassroom,
    updateClassroom: updateClassroomInStore,
    deleteClassroom: deleteClassroomInStore,
    setSearchTerm,
    openCreateDialog,
    openEditDialog,
    resetForm,
  } = useClassroomStore();

  // React Hook Form setup
  const form = useForm<z.infer<typeof classroomSchema>>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      name: formData.name,
      accessCode: formData.accessCode,
    },
  });

  // Update form when formData changes
  useState(() => {
    form.reset({
      name: formData.name,
      accessCode: formData.accessCode,
    });
  });

  // Get children from child store to display counts
  const children = useChildProfileStore((state) => state.children);

  // Handle copy access code
  const handleCopyAccessCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied({ ...copied, [id]: true });

    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [id]: false }));
    }, 2000);

    toast.success('Access code copied to clipboard');
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof classroomSchema>) => {
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('accessCode', values.accessCode);

      if (mode === 'edit' && selectedClassroom) {
        formData.append('id', selectedClassroom.id);
        const result = await update_classroom(formData);

        if (result.status === 'SUCCESS') {
          updateClassroomInStore(selectedClassroom.id, {
            name: values.name,
            accessCode: values.accessCode,
          });
          toast.success(result.message);
          setIsDialogOpen(false);
          resetForm();
        } else {
          setFormState({
            status: 'ERROR',
            message: result.message,
            fieldErrors: result.fieldErrors || {},
            timestamp: Date.now(),
            redirect: '',
          });
        }
      } else {
        const result = await create_classroom(formData);

        if (result.status === 'SUCCESS' && result.data) {
          addClassroom(result.data);
          toast.success(result.message);
          setIsDialogOpen(false);
          resetForm();
        } else {
          setFormState({
            status: 'ERROR',
            message: result.message,
            fieldErrors: result.fieldErrors || {},
            timestamp: Date.now(),
            redirect: '',
          });
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  };

  // Handle delete classroom
  const handleDeleteClick = (id: string) => {
    setClassroomToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!classroomToDelete) return;

    setIsPending(true);

    try {
      const formData = new FormData();
      formData.append('id', classroomToDelete);

      const result = await delete_classroom(formData);

      if (result.status === 'SUCCESS') {
        deleteClassroomInStore(classroomToDelete);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting classroom:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
      setDeleteDialogOpen(false);
      setClassroomToDelete(null);
    }
  };

  // Filter classrooms based on search term
  const filteredClassrooms = searchTerm
    ? classrooms.filter(
        (classroom) =>
          classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          classroom.accessCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : classrooms;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Classroom Management</h2>
          <Skeleton className="h-10 w-[180px]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Classroom Management</h2>
          <p className="text-sm text-muted-foreground">
            Create classrooms with access codes to manage multiple children.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search classrooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button onClick={openCreateDialog} size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            <span>Create Classroom</span>
          </Button>
        </div>
      </div>

      {filteredClassrooms.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <School className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No classrooms found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm
              ? 'No results match your search criteria'
              : 'Get started by creating your first classroom'}
          </p>
          <Button onClick={openCreateDialog} className="mt-4 gap-1">
            <PlusCircle className="h-4 w-4" />
            <span>Create Classroom</span>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClassrooms.map((classroom) => {
            // Get children in this classroom
            const classroomChildren = children.filter(
              (child) => child.classroomId === classroom.id
            );

            return (
              <Card key={classroom.id} className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="truncate">{classroom.name}</span>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {classroomChildren.length}{' '}
                      {classroomChildren.length === 1 ? 'child' : 'children'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Access Code:{' '}
                    <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                      {classroom.accessCode}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-1"
                      onClick={() => handleCopyAccessCode(classroom.accessCode, classroom.id)}
                      title="Copy access code"
                    >
                      {copied[classroom.id] ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {classroomChildren.length > 0
                          ? classroomChildren.map((child) => child.name).join(', ')
                          : 'No children assigned'}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-6">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(classroom)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(classroom.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Classroom Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create New Classroom' : 'Edit Classroom'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Create a new classroom with an access code to manage multiple children.'
                : 'Update classroom information and access code.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formState.status === 'ERROR' && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {formState.message}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Classroom Name</Label>
                <Input id="name" placeholder="e.g., Sunshine Class" {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessCode">Access Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="accessCode"
                    placeholder="e.g., ABC123"
                    {...form.register('accessCode')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                      form.setValue('accessCode', randomCode);
                    }}
                  >
                    Generate
                  </Button>
                </div>
                {form.formState.errors.accessCode && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.accessCode.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This code will be used by parents to join this classroom
                </p>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="animate-spin mr-1">⌛</span>
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>{mode === 'create' ? 'Create Classroom' : 'Update Classroom'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the classroom and remove all children associations. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Deleting...' : 'Delete Classroom'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
