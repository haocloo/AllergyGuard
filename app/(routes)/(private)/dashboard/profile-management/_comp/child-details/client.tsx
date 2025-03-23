'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format, differenceInYears } from 'date-fns';
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
  ChevronLeft,
  Calendar,
  User2,
  Users2,
  Heart,
  Activity,
  Mail,
  UserCircle2,
  BadgeAlert,
  Pill,
  Syringe,
  ShieldAlert,
  UserCog,
  CalendarClock,
  Baby,
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
import { CaretakerTab } from './caretaker-tab';

interface Props {
  initialChild: Child;
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

// Add at the top with other imports
const bgColors = [
  'from-blue-500/10 via-purple-500/10 to-pink-500/10',
  'from-purple-500/10 via-pink-500/10 to-orange-500/10',
  'from-pink-500/10 via-orange-500/10 to-yellow-500/10',
  'from-orange-500/10 via-yellow-500/10 to-green-500/10',
  'from-yellow-500/10 via-green-500/10 to-teal-500/10',
  'from-green-500/10 via-teal-500/10 to-cyan-500/10',
  'from-teal-500/10 via-cyan-500/10 to-blue-500/10',
  'from-cyan-500/10 via-blue-500/10 to-purple-500/10',
];

export function ChildDetailsClient({ initialChild }: Props) {
  const router = useRouter();

  // Move all the hooks inside the component
  const [editingSection, setEditingSection] = useState<
    'allergies' | 'symptoms' | 'contacts' | null
  >(null);
  const { initializeEditForm, resetForm, formData } = useProfileStore();
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
  const [filteredUsers, setFilteredUsers] = useState<typeof users>([]);
  const [tempCaretakers, setTempCaretakers] = useState<TempCaretaker[]>([]);
  const [editingCaretaker, setEditingCaretaker] = useState<TempCaretaker | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Add the classroom search states here
  const [classroomSearchQuery, setClassroomSearchQuery] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [classroomFormErrors, setClassroomFormErrors] = useState<Record<string, string>>({});

  // Add a new state for dialog steps
  const [personalCaretakerStep, setPersonalCaretakerStep] = useState<'search' | 'details'>(
    'search'
  );

  // Initialize form data when editing section changes
  useEffect(() => {
    if (editingSection) {
      initializeEditForm({
        firstName: initialChild.firstName,
        lastName: initialChild.lastName,
        name: initialChild.name,
        dob: initialChild.dob,
        gender: initialChild.gender,
        photoUrl: initialChild.photoUrl,
        allergies: initialChild.allergies,
        symptoms: initialChild.symptoms,
        emergencyContacts: initialChild.emergencyContacts,
        parentId: initialChild.parentId,
        classroomId: initialChild.classroomId,
        createdBy: initialChild.createdBy,
      });
    }
  }, [editingSection, initialChild, initializeEditForm]);

  // Get consistent background color
  const bgColorIndex = parseInt(initialChild.id.slice(-3), 16) % bgColors.length;
  const bgGradient = bgColors[bgColorIndex];

  const handleSectionSave = async (section: 'allergies' | 'symptoms' | 'contacts' | 'basic') => {
    try {
      // Here you would save the section data to your backend
      const updatedData = {
        ...initialChild,
        ...(section === 'allergies' && { allergies: formData.allergies }),
        ...(section === 'symptoms' && { symptoms: formData.symptoms }),
        ...(section === 'contacts' && { emergencyContacts: formData.emergencyContacts }),
        ...(section === 'basic' && {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dob: formData.dob,
          gender: formData.gender,
        }),
      };

      // Show success message
      toast({
        title: 'Success',
        description: 'Changes saved successfully',
        variant: 'default',
      });

      // Reset form and close dialog after successful save
      resetForm();
      setEditingSection(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    }
  };

  // Update the search handler
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setFilteredUsers([]);
      return;
    }
    // Filter users based on search query
    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(value.toLowerCase()) ||
        user.name.toLowerCase().includes(value.toLowerCase())
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

  const handleSaveCaretaker = async () => {
    try {
      if (caretakerType === 'personal' && selectedUser) {
        const newCaretaker: TempCaretaker = {
          id: `temp_${Date.now()}`,
          type: 'personal',
          name: selectedUser.name,
          email: selectedUser.email,
          role: caretakerForm.role,
          phone: caretakerForm.phone,
          notes: caretakerForm.noteToCaretaker,
          createdAt: new Date().toISOString(),
        };

        setTempCaretakers((prev) => [...prev, newCaretaker]);

        // Reset form and close dialog
        setCaretakerType(null);
        setSelectedUser(null);
        setSearchQuery('');
        setFilteredUsers([]);
        setCaretakerForm({
          type: 'personal',
          name: '',
          email: '',
          phone: '',
          role: '',
        });
        setShowCaretakerDialog(false);
        setPersonalCaretakerStep('search');

        // Show success message
        toast({
          title: 'Success',
          description: 'Personal caretaker added successfully',
          variant: 'default',
        });
      } else if (caretakerType === 'center' && selectedClassroom) {
        // Existing childcare center logic...
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add caretaker',
        variant: 'destructive',
      });
    }
  };

  // Update the dialog close handler
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setCaretakerType(null);
      setSelectedUser(null);
      setSelectedClassroom(null);
      setClassroomSearchQuery('');
      setSearchQuery('');
      setFilteredUsers([]);
      setCaretakerForm({
        type: 'personal',
        name: '',
        email: '',
        phone: '',
        role: '',
      });
      setFormErrors({});
      setClassroomFormErrors({});
      setPersonalCaretakerStep('search'); // Reset to first step
    }
    setShowCaretakerDialog(open);
  };

  // Add these functions
  const handleEditCaretaker = (updatedCaretaker: TempCaretaker) => {
    try {
      // Update in temporary caretakers
      setTempCaretakers((prev) =>
        prev.map((c) => (c.id === updatedCaretaker.id ? updatedCaretaker : c))
      );

      // Reset states
      setEditingCaretaker(null);
      setShowEditDialog(false);

      toast({
        title: 'Success',
        description: 'Caretaker updated successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update caretaker',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCaretaker = (caretakerId: string) => {
    try {
      // Remove from temporary caretakers
      setTempCaretakers((prev) => prev.filter((c) => c.id !== caretakerId));

      toast({
        title: 'Success',
        description: 'Caretaker removed successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove caretaker',
        variant: 'destructive',
      });
    }
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

  // Add this function at the top of the component
  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Baby className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold">{initialChild.name}'s Profile</h1>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Profile Header with Dynamic Background - Made more compact */}
        <div
          className={cn(
            'relative h-48 bg-gradient-to-br transition-colors duration-300', // Reduced height from h-64
            bgGradient,
            'group-hover:saturate-[1.2]'
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-start px-8 gap-6">
            <div
              className={cn(
                'relative aspect-square w-32', // Changed to use aspect-square
                'rounded-full overflow-hidden',
                'bg-background/50 backdrop-blur-sm shadow-xl',
                'transform hover:scale-105 transition-transform duration-300',
                'flex items-center justify-center' // Added flex centering
              )}
            >
              <Avatar className="w-full h-full">
                <AvatarImage
                  src={
                    initialChild.photoUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${initialChild.id}`
                  }
                  className="bg-background object-cover" // Added object-cover
                />
                <AvatarFallback className="text-2xl">
                  {initialChild.firstName?.[0]}
                  {initialChild.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-semibold">{initialChild.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {differenceInYears(new Date(), new Date(initialChild.dob))} years old • Born{' '}
                {format(new Date(initialChild.dob), 'PPP')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information - Made more compact */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-1 rounded-full bg-primary" />
              <User2 className="h-4 w-4 text-primary" />
              <h2 className="text-base font-medium">Basic Information</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {' '}
              {/* Changed to 4 columns */}
              <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                {' '}
                {/* Reduced padding */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <UserCircle2 className="h-3.5 w-3.5" />
                  <label className="text-xs font-medium">First Name</label>
                </div>
                <p className="text-sm font-medium">{initialChild.firstName}</p>
              </div>
              <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <UserCircle2 className="h-3.5 w-3.5" />
                  <label className="text-xs font-medium">Last Name</label>
                </div>
                <p className="text-sm font-medium">{initialChild.lastName}</p>
              </div>
              <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <label className="text-xs font-medium">Date of Birth</label>
                </div>
                <p className="text-sm font-medium">{format(new Date(initialChild.dob), 'PP')}</p>
              </div>
              <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <UserCog className="h-3.5 w-3.5" />
                  <label className="text-xs font-medium">Gender</label>
                </div>
                <p className="text-sm font-medium capitalize">
                  {initialChild.gender || 'Not specified'}
                </p>
              </div>
            </div>
          </section>

          <Tabs defaultValue="health" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="health" className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Health Info
              </TabsTrigger>
              <TabsTrigger value="emergency" className="text-sm flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Emergency
              </TabsTrigger>
              <TabsTrigger value="caretakers" className="text-sm flex items-center gap-2">
                <Users2 className="h-4 w-4" />
                Caretakers
              </TabsTrigger>
            </TabsList>

            {/* Health Information Tab */}
            <TabsContent value="health" className="space-y-6 pt-6">
              {/* Allergies Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 rounded-full bg-destructive" />
                    <BadgeAlert className="h-5 w-5 text-destructive" />
                    <h2 className="text-lg font-medium">Allergies</h2>
                  </div>
                  <Dialog
                    open={editingSection === 'allergies'}
                    onOpenChange={(open) => !open && setEditingSection(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingSection('allergies');
                          initializeEditForm({
                            ...formData,
                            allergies: initialChild.allergies,
                          });
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
                        isEditing
                        initialData={initialChild.allergies}
                        onSave={() => handleSectionSave('allergies')}
                        onCancel={() => setEditingSection(null)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {initialChild.allergies.map((allergy, index) => (
                    <div
                      key={index}
                      className={cn(
                        'border rounded-lg p-4 space-y-3 transition-all duration-300',
                        'hover:shadow-md hover:border-primary/50',
                        allergy.severity === 'High' && 'bg-red-50/50 dark:bg-red-950/50',
                        allergy.severity === 'Medium' && 'bg-yellow-50/50 dark:bg-yellow-950/50',
                        allergy.severity === 'Low' && 'bg-green-50/50 dark:bg-green-950/50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{allergy.allergen}</h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            'border-2',
                            allergy.severity === 'High' && 'border-destructive text-destructive',
                            allergy.severity === 'Medium' && 'border-yellow-500 text-yellow-700',
                            allergy.severity === 'Low' && 'border-green-500 text-green-700'
                          )}
                        >
                          {allergy.severity}
                        </Badge>
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

                      {/* Action Plan with icons */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          <label className="text-sm font-medium">Action Plan</label>
                        </div>
                        <p className="text-sm">{allergy.actionPlan.immediateAction}</p>

                        {/* Medications with icon */}
                        {allergy.actionPlan.medications.length > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4" />
                              <label className="text-sm font-medium">Medications</label>
                            </div>
                            <ul className="mt-1 space-y-1">
                              {allergy.actionPlan.medications.map((med, i) => (
                                <li key={i} className="text-sm flex items-center gap-2">
                                  <Syringe className="h-3 w-3 text-muted-foreground" />
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
                    onOpenChange={(open) => !open && setEditingSection(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSection('symptoms');
                          initializeEditForm({
                            ...formData,
                            symptoms: initialChild.symptoms,
                          });
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
                        isEditing
                        initialData={initialChild.symptoms}
                        onSave={() => handleSectionSave('symptoms')}
                        onCancel={() => setEditingSection(null)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                {initialChild.symptoms && initialChild.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {initialChild.symptoms.map((symptom, index) => (
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
                    onOpenChange={(open) => !open && setEditingSection(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSection('contacts');
                          initializeEditForm({
                            ...formData,
                            emergencyContacts: initialChild.emergencyContacts,
                          });
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
                        isEditing
                        initialData={initialChild.emergencyContacts}
                        onSave={() => handleSectionSave('contacts')}
                        onCancel={() => setEditingSection(null)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {initialChild.emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className={cn(
                        'border rounded-lg p-4 space-y-3 transition-all duration-200',
                        'hover:shadow-md hover:border-primary/50',
                        contact.isMainContact && 'bg-primary/5 border-primary/20'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCircle2 className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">{contact.name}</h3>
                        </div>
                        {contact.isMainContact && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            Main Contact
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Users2 className="h-4 w-4" />
                        {contact.relationship}
                      </p>

                      {/* Updated Phone Number Button */}
                      <button
                        onClick={() => handleCall(contact.phone)}
                        className={cn(
                          'w-full group flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200',
                          'bg-green-500/10 hover:bg-green-500/20 active:bg-green-500/30',
                          'border border-green-500/20 hover:border-green-500/30',
                          'text-green-700 dark:text-green-500'
                        )}
                      >
                        <Phone
                          className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            'group-hover:scale-110 group-active:scale-95'
                          )}
                        />
                        <span className="text-sm font-medium">{contact.phone}</span>
                        <span className="text-xs text-muted-foreground ml-auto">Tap to call</span>
                      </button>

                      <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted/50">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{contact.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </TabsContent>

            {/* Caretakers Tab */}
            <TabsContent value="caretakers" className="space-y-6 pt-4">
              <CaretakerTab initialChild={initialChild} />
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
