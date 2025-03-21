'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import {
  AlertCircle,
  Pencil,
  Check,
  X,
  Plus,
  PersonStanding,
  Building2,
  Search,
  UserRound,
  Phone,
  MoreVertical,
  Trash,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Child, Symptom, SymptomSeverity } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AllergiesForm } from '../create-profile/steps/allergies';
import { SymptomSeverityForm } from '../create-profile/steps/symptom-severity';
import { EmergencyContactForm } from '../create-profile/steps/emergency-contact';
import { useProfileStore } from '../store';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { users, classrooms } from '@/services/dummy-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Classroom } from '@/services/dummy-data';

interface Props {
  initialChild: Child;
}

// Create an extended child interface for the component's needs
interface ExtendedChild extends Child {
  firstName?: string;
  lastName?: string;
  gender?: string;
  photoUrl?: string;
  symptoms?: Symptom[];
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
    isMainContact: boolean;
  }>;
  caretakers?: Array<any>;
}

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  label?: string;
  className?: string;
}

function EditableField({ value, onSave, label, className }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <div className={cn('group relative', className)}>
      {label && <label className="text-sm font-medium text-muted-foreground">{label}</label>}
      <div className="mt-1 flex items-center gap-2">
        {isEditing ? (
          <>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="max-w-[200px]"
            />
            <Button size="icon" variant="ghost" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <span>{value}</span>
            <Button
              size="icon"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

interface CaretakerFormData {
  type: 'personal' | 'center';
  userId?: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  noteToCaretaker?: string;
}

// Update the validation schema
const caretakerSchema = z.object({
  type: z.enum(['personal', 'center']),
  userId: z.string().optional(),
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.string().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  noteToCaretaker: z.string().optional(),
});

// Add interface for search result type
interface SearchUser {
  id: string;
  name: string;
  email: string;
}

// Add this interface for temporary caretakers
interface TempCaretaker {
  id: string;
  type: 'personal' | 'center';
  name: string;
  email: string;
  role: string;
  phone: string;
  notes?: string;
  status: 'pending';
  createdAt: string;
}

// Add this at the top with other interfaces
interface EditCaretakerDialogProps {
  caretaker: TempCaretaker;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedCaretaker: TempCaretaker) => void;
  onDelete: () => void;
}

// Add this type declaration if not already defined
interface FormStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ChildDetailsClient({ initialChild }: Props) {
  const router = useRouter();

  // Move all the hooks inside the component
  const [editingSection, setEditingSection] = useState<
    'allergies' | 'symptoms' | 'contacts' | null
  >(null);
  const { initializeEditForm, resetForm } = useProfileStore();
  const [showCaretakerDialog, setShowCaretakerDialog] = useState(false);
  const [caretakerType, setCaretakerType] = useState<'personal' | 'center' | null>(null);
  const [searchResults, setSearchResults] = useState<typeof users>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [caretakerForm, setCaretakerForm] = useState<CaretakerFormData>({
    type: 'personal',
    name: '',
    email: '',
    phone: '',
    role: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [tempCaretakers, setTempCaretakers] = useState<TempCaretaker[]>([]);
  const [editingCaretaker, setEditingCaretaker] = useState<TempCaretaker | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Add the classroom search states here
  const [classroomSearchQuery, setClassroomSearchQuery] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [classroomFormErrors, setClassroomFormErrors] = useState<Record<string, string>>({});

  // Create an extended child object with the additional properties needed
  const extendedChild: ExtendedChild = {
    ...initialChild,
    firstName: initialChild.name.split(' ')[0] || '',
    lastName: initialChild.name.split(' ').slice(1).join(' ') || '',
    gender: 'Not specified', // Default value
    photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${initialChild.id}`, // Use avatar as fallback
    symptoms: [], // Empty array with correct type
    emergencyContacts: [], // Default empty array
    caretakers: [], // Default empty array
  };

  // Move the classroom search handler inside the component
  const handleClassroomSearch = (value: string) => {
    setClassroomSearchQuery(value);
    setSelectedClassroom(null);

    const classroom = classrooms.find((c) => c.code.toLowerCase() === value.toLowerCase());

    if (classroom) {
      setSelectedClassroom(classroom);
    }
  };

  const handleSectionSave = async (section: string) => {
    try {
      // Here you would save the section data to your backend
      console.log('Saving section:', section);

      // Reset form and close dialog
      resetForm();
      setEditingSection(null);

      // Show success message
      toast({
        title: 'Success',
        description: 'Changes saved successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    }
  };

  // Simplified search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const validateForm = () => {
    try {
      caretakerSchema.parse(caretakerForm);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSaveCaretaker = () => {
    if (caretakerType === 'center') {
      if (!selectedClassroom) {
        setClassroomFormErrors({
          code: 'Please select a valid classroom first',
        });
        return;
      }
      // Skip regular form validation for centers
    } else {
      if (!validateForm()) return;
    }

    const newCaretaker: TempCaretaker = {
      id: `temp-${Date.now()}`,
      type: caretakerType || 'personal', // Provide fallback
      name: caretakerType === 'center' ? selectedClassroom!.centerName : caretakerForm.name,
      email: caretakerType === 'center' ? selectedClassroom!.teacher.email : caretakerForm.email,
      role: caretakerType === 'center' ? 'Childcare Center' : caretakerForm.role,
      phone: caretakerType === 'center' ? selectedClassroom!.teacher.phone : caretakerForm.phone,
      notes: caretakerForm.noteToCaretaker,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setTempCaretakers((prev) => [...prev, newCaretaker]);

    toast({
      title: 'Success',
      description: `${
        caretakerType === 'center' ? 'Childcare center' : 'Caretaker'
      } added successfully`,
    });

    // Reset all states
    setCaretakerType(null);
    setSelectedUser(null);
    setSelectedClassroom(null);
    setClassroomSearchQuery('');
    setCaretakerForm({
      type: 'personal',
      name: '',
      email: '',
      phone: '',
      role: '',
    });
    setShowCaretakerDialog(false);
  };

  // Update the dialog close handler
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset all states when dialog is closed
      setCaretakerType(null);
      setSelectedUser(null);
      setCaretakerForm({
        type: 'personal',
        name: '',
        email: '',
        phone: '',
        role: '',
      });
      setSearchQuery('');
      setFilteredUsers(users);
    }
    setShowCaretakerDialog(open);
  };

  // Add these functions
  const handleEditCaretaker = (updatedCaretaker: TempCaretaker) => {
    setTempCaretakers((prev) =>
      prev.map((c) => (c.id === updatedCaretaker.id ? updatedCaretaker : c))
    );
    setShowEditDialog(false);
    setEditingCaretaker(null);

    toast({
      title: 'Success',
      description: 'Caretaker updated successfully',
    });
  };

  const handleDeleteCaretaker = (caretakerId: string) => {
    setTempCaretakers((prev) => prev.filter((c) => c.id !== caretakerId));
    setShowEditDialog(false);
    setEditingCaretaker(null);

    toast({
      title: 'Success',
      description: 'Caretaker removed successfully',
    });
  };

  // Update handleSearchSubmit to set the form type
  const handleSearchSubmit = () => {
    const classroom = classrooms.find(
      (c) => c.code.toLowerCase() === classroomSearchQuery.toLowerCase()
    );

    if (classroom) {
      setSelectedClassroom(classroom);
      setClassroomFormErrors({});
      // Set the form type to 'center'
      setCaretakerForm((prev) => ({
        ...prev,
        type: 'center',
      }));
    } else {
      setSelectedClassroom(null);
      setClassroomFormErrors({
        code: 'Invalid classroom code. Please check and try again.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{extendedChild.name}'s Profile</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-48 bg-muted">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="w-full h-full">
            {extendedChild.photoUrl ? (
              <img
                src={extendedChild.photoUrl}
                alt={extendedChild.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${extendedChild.id}`}
                    className="bg-background"
                  />
                  <AvatarFallback>
                    {extendedChild.firstName?.[0]}
                    {extendedChild.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <section className="space-y-4">
            <h2 className="text-lg font-medium">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField
                label="First Name"
                value={extendedChild.firstName || ''}
                onSave={(value) => handleSectionSave('firstName')}
              />
              <EditableField
                label="Last Name"
                value={extendedChild.lastName || ''}
                onSave={(value) => handleSectionSave('lastName')}
              />
              <EditableField
                label="Date of Birth"
                value={format(new Date(extendedChild.dob), 'PPP')}
                onSave={(value) => handleSectionSave('dob')}
              />
              <EditableField
                label="Gender"
                value={extendedChild.gender || 'Not specified'}
                onSave={(value) => handleSectionSave('gender')}
              />
            </div>
          </section>

          <Tabs defaultValue="health" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="health" className="text-xs sm:text-sm px-1 sm:px-4">
                Health Info
              </TabsTrigger>
              <TabsTrigger value="emergency" className="text-xs sm:text-sm px-1 sm:px-4">
                Emergency
              </TabsTrigger>
              <TabsTrigger value="caretakers" className="text-xs sm:text-sm px-1 sm:px-4">
                Caretakers
              </TabsTrigger>
            </TabsList>

            {/* Health Information Tab */}
            <TabsContent value="health" className="space-y-6 pt-4">
              {/* Allergies Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Allergies</h2>
                  <Dialog
                    open={editingSection === 'allergies'}
                    onOpenChange={(open) => {
                      // Only update when dialog is closing to prevent circular updates
                      if (!open) {
                        setEditingSection(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Set form data before setting editing section to prevent multiple rerenders
                          initializeEditForm({
                            firstName: extendedChild.firstName || '',
                            lastName: extendedChild.lastName || '',
                            dob: extendedChild.dob,
                            gender: (extendedChild.gender as 'male' | 'female') || 'female',
                            photoUrl: extendedChild.photoUrl,
                            allergies: extendedChild.allergies,
                            symptoms: extendedChild.symptoms || [],
                            emergencyContacts: extendedChild.emergencyContacts || [],
                          });
                          setEditingSection('allergies');
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Allergies
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Allergies</DialogTitle>
                      </DialogHeader>
                      <AllergiesForm
                        onNext={() => handleSectionSave('allergies')}
                        onBack={() => setEditingSection(null)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-6">
                  {extendedChild.allergies.map((allergy, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{allergy.allergen}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{allergy.notes}</p>

                      {/* Symptoms */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Symptoms</label>
                        <div className="flex flex-wrap gap-2">
                          {allergy.symptoms.map((symptom, i) => (
                            <Badge key={i} variant="outline">
                              {symptom.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Action Plan */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Action Plan</label>
                        <p className="text-sm">{allergy.actionPlan.immediateAction}</p>

                        {/* Medications */}
                        {allergy.actionPlan.medications.length > 0 && (
                          <div className="mt-2">
                            <label className="text-sm font-medium">Medications</label>
                            <ul className="mt-1 space-y-1">
                              {allergy.actionPlan.medications.map((med, i) => (
                                <li key={i} className="text-sm">
                                  {med.name} - {med.dosage}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Symptoms Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Symptoms & Severity</h2>
                  <Dialog
                    open={editingSection === 'symptoms'}
                    onOpenChange={(open) => {
                      // Only update when dialog is closing to prevent circular updates
                      if (!open) {
                        setEditingSection(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Set form data before setting editing section to prevent multiple rerenders
                          initializeEditForm({
                            firstName: extendedChild.firstName || '',
                            lastName: extendedChild.lastName || '',
                            dob: extendedChild.dob,
                            gender: (extendedChild.gender as 'male' | 'female') || 'female',
                            photoUrl: extendedChild.photoUrl,
                            allergies: extendedChild.allergies,
                            symptoms: extendedChild.symptoms || [],
                            emergencyContacts: extendedChild.emergencyContacts || [],
                          });
                          setEditingSection('symptoms');
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Symptoms
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Symptoms</DialogTitle>
                      </DialogHeader>
                      <SymptomSeverityForm
                        onNext={() => handleSectionSave('symptoms')}
                        onBack={() => setEditingSection(null)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                {extendedChild.symptoms && extendedChild.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {extendedChild.symptoms.map((symptom, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={cn(
                          'border-2',
                          symptom.severity === 'Severe' && 'border-destructive text-destructive',
                          symptom.severity === 'Moderate' && 'border-yellow-500 text-yellow-700',
                          symptom.severity === 'Mild' && 'border-green-500 text-green-700'
                        )}
                      >
                        {symptom.name} - {symptom.severity}
                      </Badge>
                    ))}
                  </div>
                )}
              </section>
            </TabsContent>

            {/* Emergency Contacts Tab */}
            <TabsContent value="emergency" className="space-y-6 pt-4">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Emergency Contacts</h2>
                  <Dialog
                    open={editingSection === 'contacts'}
                    onOpenChange={(open) => {
                      // Only update when dialog is closing to prevent circular updates
                      if (!open) {
                        setEditingSection(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Set form data before setting editing section to prevent multiple rerenders
                          initializeEditForm({
                            firstName: extendedChild.firstName || '',
                            lastName: extendedChild.lastName || '',
                            dob: extendedChild.dob,
                            gender: (extendedChild.gender as 'male' | 'female') || 'female',
                            photoUrl: extendedChild.photoUrl,
                            allergies: extendedChild.allergies,
                            symptoms: extendedChild.symptoms || [],
                            emergencyContacts: extendedChild.emergencyContacts || [],
                          });
                          setEditingSection('contacts');
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Contacts
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Emergency Contacts</DialogTitle>
                      </DialogHeader>
                      <EmergencyContactForm
                        onNext={() => handleSectionSave('contacts')}
                        onBack={() => setEditingSection(null)}
                        {...({} as any)} // Type assertion to satisfy the component props
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                {extendedChild.emergencyContacts && extendedChild.emergencyContacts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extendedChild.emergencyContacts.map((contact, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{contact.name}</h3>
                          {contact.isMainContact && <Badge variant="secondary">Main Contact</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        <p className="text-sm">{contact.phone}</p>
                        <p className="text-sm">{contact.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </TabsContent>

            {/* Caretakers Tab */}
            <TabsContent value="caretakers" className="space-y-6 pt-4">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Caretakers</h2>
                  <Dialog open={showCaretakerDialog} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Caretaker
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                      <DialogHeader className="pb-4">
                        <DialogTitle>Add Caretaker</DialogTitle>
                      </DialogHeader>

                      {/* Update the childcare center form section */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">
                              Please obtain the classroom code from your childcare center before
                              proceeding.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Classroom Code</Label>
                          <div className="flex gap-2">
                            <Input
                              value={classroomSearchQuery}
                              onChange={(e) => {
                                setClassroomSearchQuery(e.target.value);
                                setClassroomFormErrors({});
                              }}
                              placeholder="e.g., CC001-K1A"
                              className={classroomFormErrors.code ? 'border-destructive' : ''}
                            />
                            <Button
                              variant="secondary"
                              onClick={handleSearchSubmit}
                              className="flex-shrink-0"
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                          {classroomFormErrors.code && (
                            <p className="text-sm text-destructive">{classroomFormErrors.code}</p>
                          )}
                        </div>

                        {selectedClassroom && (
                          <div className="space-y-3 sm:space-y-4 border rounded-lg p-3 sm:p-4">
                            <div className="space-y-1">
                              <h3 className="font-medium">{selectedClassroom.centerName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {selectedClassroom.address}
                              </p>
                            </div>

                            <div className="border-t pt-3">
                              <h4 className="text-sm font-medium mb-1">Class Information</h4>
                              <p className="text-sm">{selectedClassroom.name}</p>
                            </div>

                            <div className="border-t pt-3">
                              <h4 className="text-sm font-medium mb-2">Teacher Information</h4>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={selectedClassroom.teacher.photoUrl} />
                                  <AvatarFallback>
                                    {selectedClassroom.teacher.name
                                      .split(' ')
                                      .map((n: string) => n[0])
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">
                                    {selectedClassroom.teacher.name}
                                  </p>
                                  <div className="flex flex-col space-y-1 text-sm">
                                    <p className="text-muted-foreground truncate">
                                      {selectedClassroom.teacher.email}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      className="flex items-center gap-2 w-fit h-auto p-0 text-emerald-600 hover:text-emerald-700"
                                      asChild
                                    >
                                      <a
                                        href={`tel:${selectedClassroom.teacher.phone}`}
                                        className="flex items-center gap-2"
                                      >
                                        <div className="bg-emerald-100 p-1 rounded-full">
                                          <Phone className="h-4 w-4" />
                                        </div>
                                        <span>{selectedClassroom.teacher.phone}</span>
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="border-t pt-3">
                              <Label className="text-sm">Note to Childcare Center (Optional)</Label>
                              <Textarea
                                value={caretakerForm.noteToCaretaker || ''}
                                onChange={(e) =>
                                  setCaretakerForm((prev) => ({
                                    ...prev,
                                    noteToCaretaker: e.target.value,
                                  }))
                                }
                                placeholder="Add any special notes or requests..."
                                className="mt-1.5"
                              />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setCaretakerType(null);
                                  setSelectedClassroom(null);
                                  setClassroomSearchQuery('');
                                  setCaretakerForm({
                                    type: 'personal',
                                    name: '',
                                    email: '',
                                    phone: '',
                                    role: '',
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleSaveCaretaker}>Add Childcare Center</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...(extendedChild.caretakers || []), ...tempCaretakers].map((caretaker) => (
                    <div key={caretaker.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${caretaker.email}`}
                              className="bg-background"
                            />
                            <AvatarFallback>
                              {caretaker.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-grow">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-lg">{caretaker.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {caretaker.type === 'personal' ? (
                                  <PersonStanding className="h-4 w-4" />
                                ) : (
                                  <Building2 className="h-4 w-4" />
                                )}
                                <span>
                                  {caretaker.type === 'personal'
                                    ? 'Personal Caretaker'
                                    : 'Childcare Center'}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-primary">{caretaker.role}</p>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingCaretaker(caretaker);
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteCaretaker(caretaker.id)}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex flex-col space-y-1 text-sm mt-2">
                            <p className="text-muted-foreground">{caretaker.email}</p>
                            <Button
                              variant="ghost"
                              className="flex items-center gap-2 w-fit h-auto p-0 text-emerald-600 hover:text-emerald-700"
                              asChild
                            >
                              <a
                                href={`tel:${caretaker.phone}`}
                                className="flex items-center gap-2"
                              >
                                <div className="bg-emerald-100 p-1 rounded-full">
                                  <Phone className="h-4 w-4" />
                                </div>
                                <span>{caretaker.phone}</span>
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>

                      {caretaker.notes && (
                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                          <p className="text-sm font-medium text-primary mb-1">Note:</p>
                          <p className="text-sm text-muted-foreground">{caretaker.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Caretaker</DialogTitle>
          </DialogHeader>
          {editingCaretaker && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Caretaker Role</Label>
                <Input
                  value={editingCaretaker.role}
                  onChange={(e) =>
                    setEditingCaretaker((prev) => (prev ? { ...prev, role: e.target.value } : null))
                  }
                  placeholder="e.g., Nanny, Babysitter, Grandparent"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={editingCaretaker.phone}
                  onChange={(e) =>
                    setEditingCaretaker((prev) =>
                      prev ? { ...prev, phone: e.target.value } : null
                    )
                  }
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label>Note to Caretaker (Optional)</Label>
                <Textarea
                  value={editingCaretaker.notes || ''}
                  onChange={(e) =>
                    setEditingCaretaker((prev) =>
                      prev ? { ...prev, notes: e.target.value } : null
                    )
                  }
                  placeholder="Add a note that will be visible to the caretaker..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingCaretaker(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingCaretaker) {
                      handleEditCaretaker(editingCaretaker);
                    }
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
