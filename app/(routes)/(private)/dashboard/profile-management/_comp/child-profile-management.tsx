'use client';

import { useState, useEffect } from 'react';
import { useChildProfileStore } from './store';
import { useClassroomStore } from './store';
import {
  create_child,
  update_child,
  delete_child,
  link_child_to_parent,
  get_allergy_response,
} from './actions';
import {
  PlusCircle,
  Pencil,
  Trash2,
  AlertCircle,
  Mail,
  Plus,
  Calendar,
  User2,
  School,
  Search,
} from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { childSchema, allergySchema, emailSchema } from './validation';
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
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Allergy, AllergySeverity, SymptomResponse } from './types';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ChildProfileManagementProps {
  isLoading: boolean;
}

export function ChildProfileManagement({ isLoading }: ChildProfileManagementProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<string | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [childToLink, setChildToLink] = useState<string | null>(null);
  const [symptomDialogOpen, setSymptomDialogOpen] = useState(false);
  const [currentChild, setCurrentChild] = useState<string | null>(null);
  const [currentAllergen, setCurrentAllergen] = useState<string>('');
  const [currentSymptom, setCurrentSymptom] = useState<string>('');
  const [symptomResponse, setSymptomResponse] = useState<SymptomResponse | null>(null);
  const [isSymptomLoading, setIsSymptomLoading] = useState(false);

  // Get state and actions from child store
  const {
    children,
    isDialogOpen,
    isPending,
    mode,
    formData,
    formState,
    selectedChild,
    searchTerm,
    setIsDialogOpen,
    setIsPending,
    setField,
    setFormState,
    addChild,
    updateChild: updateChildInStore,
    deleteChild: deleteChildInStore,
    setSearchTerm,
    openCreateDialog,
    openEditDialog,
    resetForm,
    isAllergyDialogOpen,
    currentAllergyEdit,
    setIsAllergyDialogOpen,
    setCurrentAllergyEdit,
    openAddAllergyDialog,
    openEditAllergyDialog,
    saveAllergy,
    deleteAllergy,
  } = useChildProfileStore();

  // Get classrooms from classroom store
  const classrooms = useClassroomStore((state) => state.classrooms);

  // React Hook Form setup for child
  const childForm = useForm<z.infer<typeof childSchema>>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      name: formData.name,
      dob: formData.dob,
      parentId: formData.parentId,
      classroomId: formData.classroomId,
    },
  });

  // React Hook Form for parent linking
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  // Update form when formData changes
  useEffect(() => {
    childForm.reset({
      name: formData.name,
      dob: formData.dob,
      parentId: formData.parentId,
      classroomId: formData.classroomId,
    });
  }, [formData, childForm]);

  // Handle form submission for child
  const onSubmitChild = async (values: z.infer<typeof childSchema>) => {
    setIsPending(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', values.name);
      formDataObj.append('dob', values.dob);

      if (values.parentId) {
        formDataObj.append('parentId', values.parentId);
      }

      if (values.classroomId) {
        formDataObj.append('classroomId', values.classroomId);
      }

      // Append allergies as JSON
      formDataObj.append('allergies', JSON.stringify(formData.allergies));

      if (mode === 'edit' && selectedChild) {
        formDataObj.append('id', selectedChild.id);
        const result = await update_child(formDataObj);

        if (result.status === 'SUCCESS') {
          updateChildInStore(selectedChild.id, {
            name: values.name,
            dob: values.dob,
            parentId: values.parentId,
            classroomId: values.classroomId,
            allergies: formData.allergies,
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
        const result = await create_child(formDataObj);

        if (result.status === 'SUCCESS' && result.data) {
          addChild(result.data);
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

  // Handle link child to parent form submission
  const onSubmitLink = async (values: z.infer<typeof emailSchema>) => {
    if (!childToLink) return;

    setIsPending(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('childId', childToLink);
      formDataObj.append('email', values.email);

      const result = await link_child_to_parent(formDataObj);

      if (result.status === 'SUCCESS') {
        toast.success(result.message);
        setLinkDialogOpen(false);
        emailForm.reset();
      } else {
        toast.error(result.message || 'Failed to link child to parent');
      }
    } catch (error) {
      console.error('Error linking child to parent:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  };

  // Handle delete child
  const handleDeleteClick = (id: string) => {
    setChildToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!childToDelete) return;

    setIsPending(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('id', childToDelete);

      const result = await delete_child(formDataObj);

      if (result.status === 'SUCCESS') {
        deleteChildInStore(childToDelete);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
      setDeleteDialogOpen(false);
      setChildToDelete(null);
    }
  };

  // Handle link to parent click
  const handleLinkClick = (id: string) => {
    setChildToLink(id);
    setLinkDialogOpen(true);
  };

  // Handle symptom response guide
  const handleSymptomClick = (childId: string, allergen: string) => {
    setCurrentChild(childId);
    setCurrentAllergen(allergen);
    setCurrentSymptom('');
    setSymptomResponse(null);
    setSymptomDialogOpen(true);
  };

  const handleGetSymptomResponse = async () => {
    if (!currentAllergen || !currentSymptom) {
      toast.error('Please enter symptom information');
      return;
    }

    setIsSymptomLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('allergen', currentAllergen);
      formDataObj.append('symptom', currentSymptom);

      const result = await get_allergy_response(formDataObj);

      if (result.status === 'SUCCESS' && result.data) {
        setSymptomResponse(result.data as SymptomResponse);
      } else {
        toast.error(result.message || 'Failed to get symptom response');
      }
    } catch (error) {
      console.error('Error getting symptom response:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSymptomLoading(false);
    }
  };

  // Filter children based on search term
  const filteredChildren = searchTerm
    ? children.filter(
        (child) =>
          child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.allergies.some((a) => a.allergen.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : children;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Child Profiles</h2>
          <Skeleton className="h-10 w-[180px]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[250px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Child Profiles</h2>
          <p className="text-sm text-muted-foreground">
            Manage children profiles, allergies, and health information.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search children..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button onClick={openCreateDialog} size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            <span>Add Child</span>
          </Button>
        </div>
      </div>

      {filteredChildren.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <User2 className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No children profiles found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm
              ? 'No results match your search criteria'
              : 'Get started by adding your first child profile'}
          </p>
          <Button onClick={openCreateDialog} className="mt-4 gap-1">
            <PlusCircle className="h-4 w-4" />
            <span>Add Child</span>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChildren.map((child) => {
            // Find classroom if assigned
            const classroom = classrooms.find((c) => c.id === child.classroomId);

            return (
              <Card key={child.id} className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="truncate">{child.name}</span>
                    {classroom && (
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {classroom.name}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>DOB: {new Date(child.dob).toLocaleDateString()}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm space-y-4">
                    {child.allergies.length > 0 ? (
                      <div>
                        <h4 className="font-medium mb-2">Allergies:</h4>
                        <ul className="space-y-2">
                          {child.allergies.map((allergy, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Badge
                                variant={
                                  allergy.severity === 'High'
                                    ? 'destructive'
                                    : allergy.severity === 'Medium'
                                    ? 'default'
                                    : 'outline'
                                }
                                className="mt-0.5"
                              >
                                {allergy.severity}
                              </Badge>
                              <div>
                                <div className="font-medium">{allergy.allergen}</div>
                                {allergy.notes && (
                                  <div className="text-xs text-muted-foreground">
                                    {allergy.notes}
                                  </div>
                                )}
                                {allergy.severity === 'High' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-destructive hover:text-destructive mt-1"
                                    onClick={() => handleSymptomClick(child.id, allergy.allergen)}
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Symptom Guide
                                  </Button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-muted-foreground italic">No allergies registered</div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-6">
                  <Button variant="outline" size="sm" onClick={() => handleLinkClick(child.id)}>
                    <Mail className="h-4 w-4 mr-1" />
                    Link to Parent
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(child)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(child.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Child Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Add New Child' : 'Edit Child Profile'}</DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Add a new child profile with personal and health information.'
                : "Update the child's profile information."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={childForm.handleSubmit(onSubmitChild)} className="space-y-4">
            {formState.status === 'ERROR' && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {formState.message}
              </div>
            )}

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="allergies">Allergies</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Child Name</Label>
                  <Input id="name" placeholder="e.g., John Doe" {...childForm.register('name')} />
                  {childForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {childForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" {...childForm.register('dob')} />
                  {childForm.formState.errors.dob && (
                    <p className="text-sm text-destructive">
                      {childForm.formState.errors.dob.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classroomId">Classroom (Optional)</Label>
                  <Select
                    value={childForm.watch('classroomId')}
                    onValueChange={(value) => childForm.setValue('classroomId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a classroom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.id}>
                          {classroom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="allergies" className="space-y-4 mt-4">
                {formData.allergies.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg bg-muted/30">
                    <p className="text-muted-foreground mb-4">No allergies added yet</p>
                    <Button
                      onClick={openAddAllergyDialog}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Allergy
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Registered Allergies</h3>
                      <Button
                        onClick={openAddAllergyDialog}
                        variant="outline"
                        size="sm"
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>

                    <div className="border rounded-md divide-y">
                      {formData.allergies.map((allergy, index) => (
                        <div key={index} className="p-3 flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  allergy.severity === 'High'
                                    ? 'destructive'
                                    : allergy.severity === 'Medium'
                                    ? 'default'
                                    : 'outline'
                                }
                              >
                                {allergy.severity}
                              </Badge>
                              <span className="font-medium">{allergy.allergen}</span>
                            </div>
                            {allergy.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{allergy.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditAllergyDialog(index)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => deleteAllergy(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

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
                  <>{mode === 'create' ? 'Create Profile' : 'Update Profile'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Allergy Dialog */}
      <Dialog open={isAllergyDialogOpen} onOpenChange={setIsAllergyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentAllergyEdit.index === -1 ? 'Add New Allergy' : 'Edit Allergy'}
            </DialogTitle>
            <DialogDescription>Record allergy information and severity level.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allergen">Allergen</Label>
              <Input
                id="allergen"
                placeholder="e.g., Peanuts, Dairy"
                value={currentAllergyEdit.allergen}
                onChange={(e) => setCurrentAllergyEdit({ allergen: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={currentAllergyEdit.severity}
                onValueChange={(value) =>
                  setCurrentAllergyEdit({ severity: value as AllergySeverity })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes, reaction details, medication..."
                value={currentAllergyEdit.notes}
                onChange={(e) => setCurrentAllergyEdit({ notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsAllergyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAllergy}>
              {currentAllergyEdit.index === -1 ? 'Add Allergy' : 'Update Allergy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link to Parent Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link Child to Parent</DialogTitle>
            <DialogDescription>
              Enter the parent's email address to link this child to their account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={emailForm.handleSubmit(onSubmitLink)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Parent Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@example.com"
                {...emailForm.register('email')}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setLinkDialogOpen(false);
                  emailForm.reset();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Linking...' : 'Link to Parent'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Symptom Response Guide Dialog */}
      <Dialog open={symptomDialogOpen} onOpenChange={setSymptomDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Allergy Symptom Response Guide</DialogTitle>
            <DialogDescription>
              Enter symptoms to get immediate action steps for {currentAllergen} allergies.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Symptom search */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptom">Describe the symptoms</Label>
                <div className="flex gap-2">
                  <Input
                    id="symptom"
                    placeholder="e.g., hives, swelling, difficulty breathing"
                    value={currentSymptom}
                    onChange={(e) => setCurrentSymptom(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={handleGetSymptomResponse}
                    disabled={isSymptomLoading || !currentSymptom}
                    className="shrink-0"
                  >
                    {isSymptomLoading ? (
                      <span className="animate-spin mr-1">⌛</span>
                    ) : (
                      <Search className="h-4 w-4 mr-1" />
                    )}
                    Search
                  </Button>
                </div>
              </div>

              {/* Response guide */}
              {symptomResponse && (
                <div className="border rounded-md p-4 bg-muted/30 space-y-3">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      Emergency Response Guide
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Follow these steps for {currentAllergen} allergy with{' '}
                      {symptomResponse.symptom} symptoms:
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Immediate Actions:</h4>
                    <ol className="list-decimal list-inside space-y-2">
                      {symptomResponse.actions.map((action, idx) => (
                        <li key={idx} className="text-sm">
                          {action}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-2 text-sm">
                    <p className="font-medium text-destructive">Important Note:</p>
                    <p>In case of severe allergic reaction, call emergency services immediately.</p>
                  </div>
                </div>
              )}
            </div>

            {/* General allergy info */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>General Allergy Emergency Guide</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>Follow these steps for any severe allergic reaction:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>
                        Check for signs of anaphylaxis (severe breathing difficulty, swelling)
                      </li>
                      <li>If prescribed, administer epinephrine auto-injector</li>
                      <li>Call emergency services (911)</li>
                      <li>Keep the child calm and lying down with legs elevated</li>
                      <li>Monitor breathing and consciousness</li>
                      <li>Be prepared to perform CPR if needed</li>
                    </ol>
                    <p className="font-medium pt-2">
                      Note: Always follow medical advice specifically given for the child.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <DialogFooter className="pt-4">
            <Button onClick={() => setSymptomDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the child profile and all associated information. This
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
              {isPending ? 'Deleting...' : 'Delete Profile'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
