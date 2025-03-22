import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { users, classrooms } from '@/services/dummy-data';
import {
  AlertCircle,
  PersonStanding,
  Building2,
  ChevronLeft,
  MoreVertical,
  Plus,
  UserRound,
  Phone,
  Pencil,
  Trash,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';
import type { Child } from '../types';
import type { CaretakerFormData, TempCaretaker, SearchUser } from './types';
import { validateCaretakerForm } from './utils';
import type { Classroom } from '@/app/(routes)/(private)/dashboard/classroom-management/_comp/types';
// ... import other necessary components

interface CaretakerTabProps {
  initialChild: Child;
}

interface CaretakerForm {
  type: 'center' | 'individual';
  name: string;
  email: string;
  role: string;
  phone: string;
  notes: string;
}

export function CaretakerTab({ initialChild }: CaretakerTabProps) {
  const [showCaretakerDialog, setShowCaretakerDialog] = useState(false);
  const [caretakerType, setCaretakerType] = useState<'personal' | 'center' | null>(null);
  const [personalCaretakerStep, setPersonalCaretakerStep] = useState<'search' | 'details'>(
    'search'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<typeof users>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [tempCaretakers, setTempCaretakers] = useState<TempCaretaker[]>([]);
  const [editingCaretaker, setEditingCaretaker] = useState<TempCaretaker | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [caretakerForm, setCaretakerForm] = useState<CaretakerFormData>({
    type: 'personal',
    name: '',
    email: '',
    phone: '',
    role: '',
    noteToCaretaker: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Add the classroom search states
  const [classroomSearchQuery, setClassroomSearchQuery] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [classroomFormErrors, setClassroomFormErrors] = useState<Record<string, string>>({});

  // Handlers
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
          noteToCaretaker: '',
        });
        setShowCaretakerDialog(false);
        setPersonalCaretakerStep('search');

        toast({
          title: 'Success',
          description: 'Personal caretaker added successfully',
        });
      } else if (caretakerType === 'center' && selectedClassroom) {
        const newCaretaker: TempCaretaker = {
          id: `temp_${Date.now()}`,
          type: 'center',
          name: selectedClassroom.centerName || selectedClassroom.name,
          email: selectedClassroom.teacher.email || '',
          role: selectedClassroom.name,
          phone: selectedClassroom.teacher.phone,
          notes: caretakerForm.noteToCaretaker,
        };

        setTempCaretakers((prev) => [...prev, newCaretaker]);

        // Reset form and close dialog
        setCaretakerType(null);
        setSelectedClassroom(null);
        setClassroomSearchQuery('');
        setCaretakerForm({
          type: 'center',
          name: '',
          email: '',
          phone: '',
          role: '',
          noteToCaretaker: '',
        });
        setShowCaretakerDialog(false);

        toast({
          title: 'Success',
          description: 'Childcare center added successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add caretaker',
        variant: 'destructive',
      });
    }
  };

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
        noteToCaretaker: '',
      });
      setFormErrors({});
      setClassroomFormErrors({});
      setPersonalCaretakerStep('search');
    }
    setShowCaretakerDialog(open);
  };

  const handleEditCaretaker = (updatedCaretaker: TempCaretaker) => {
    try {
      setTempCaretakers((prev) =>
        prev.map((c) => (c.id === updatedCaretaker.id ? updatedCaretaker : c))
      );
      setEditingCaretaker(null);
      setShowEditDialog(false);

      toast({
        title: 'Success',
        description: 'Caretaker updated successfully',
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
      setTempCaretakers((prev) => prev.filter((c) => c.id !== caretakerId));
      toast({
        title: 'Success',
        description: 'Caretaker removed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove caretaker',
        variant: 'destructive',
      });
    }
  };

  const handleSearchSubmit = () => {
    const classroom = classrooms.find(
      (c) => c.code.toLowerCase() === classroomSearchQuery.toLowerCase()
    );

    if (classroom) {
      setSelectedClassroom(classroom);
      setClassroomFormErrors({});
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

  const handleClassroomSelect = (classroom: Classroom) => {
    if (classroom) {
      setSelectedClassroom(classroom);
      setClassroomFormErrors({});
      setCaretakerForm((prev) => ({
        ...prev,
        type: 'center',
        name: classroom.centerName || classroom.name,
        email: classroom.teacher.email || '',
        role: classroom.name,
        phone: classroom.teacher.phone,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedClassroom) {
      const formData: CaretakerFormData = {
        type: 'center',
        name: selectedClassroom.centerName || selectedClassroom.name,
        email: selectedClassroom.teacher.email || '',
        role: selectedClassroom.name,
        phone: selectedClassroom.teacher.phone,
        noteToCaretaker: caretakerForm.noteToCaretaker,
      };

      // Validate form data
      const validationErrors = validateCaretakerForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        return;
      }

      try {
        // Process the form data
        // ... rest of the submit logic
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to add caretaker',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Caretakers</h2>
        <Dialog open={showCaretakerDialog} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowCaretakerDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Caretaker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Caretaker</DialogTitle>
            </DialogHeader>

            {!caretakerType ? (
              // Initial selection screen with colored buttons
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  variant="outline"
                  className={cn(
                    'h-auto min-h-[8rem] flex flex-col items-center justify-center gap-2 border-2',
                    'hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/50',
                    'transition-colors duration-200 p-4'
                  )}
                  onClick={() => setCaretakerType('personal')}
                >
                  <div className="p-2 rounded-full bg-blue-100">
                    <PersonStanding className="h-8 w-8 text-blue-500" />
                  </div>
                  <span className="font-medium text-center">Personal Caretaker</span>
                  <p className="text-xs text-muted-foreground text-center max-w-[150px] whitespace-normal">
                    Family or individual caretakers
                  </p>
                </Button>
                <Button
                  variant="outline"
                  className={cn(
                    'h-auto min-h-[8rem] flex flex-col items-center justify-center gap-2 border-2',
                    'hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50/50',
                    'transition-colors duration-200 p-4'
                  )}
                  onClick={() => setCaretakerType('center')}
                >
                  <div className="p-2 rounded-full bg-purple-100">
                    <Building2 className="h-8 w-8 text-purple-500" />
                  </div>
                  <span className="font-medium text-center">Childcare Center</span>
                  <p className="text-xs text-muted-foreground text-center max-w-[150px] whitespace-normal">
                    Daycare institutions
                  </p>
                </Button>
              </div>
            ) : caretakerType === 'personal' ? (
              // Personal caretaker form
              <div className="space-y-4">
                {personalCaretakerStep === 'search' ? (
                  // Step 1: Search and Select User
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          Please ensure that the caretaker has registered for an account before
                          adding them.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Search Caretaker</Label>
                        <Input
                          placeholder="Search by name or email"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            const query = e.target.value.toLowerCase();
                            const filtered = users.filter(
                              (user) =>
                                user.name.toLowerCase().includes(query) ||
                                user.email.toLowerCase().includes(query)
                            );
                            setFilteredUsers(filtered);
                          }}
                        />
                      </div>

                      {searchQuery && (
                        <div className="border rounded-lg divide-y">
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                              <div
                                key={user.id}
                                className="p-3 flex items-center gap-3 hover:bg-muted cursor-pointer"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setCaretakerForm((prev) => ({
                                    ...prev,
                                    type: 'personal',
                                    name: user.name,
                                    email: user.email,
                                    phone: user.phone || '',
                                  }));
                                  setPersonalCaretakerStep('details');
                                }}
                              >
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                  />
                                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-sm text-muted-foreground text-center">
                              No caretakers found
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCaretakerType(null);
                          setSelectedUser(null);
                          setSearchQuery('');
                          setFilteredUsers([]);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Step 2: Add Caretaker Details
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPersonalCaretakerStep('search')}
                        className="mb-4"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Search
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser?.email}`}
                        />
                        <AvatarFallback>{selectedUser?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedUser?.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Caretaker Role</Label>
                        <Input
                          value={caretakerForm.role}
                          onChange={(e) =>
                            setCaretakerForm((prev) => ({
                              ...prev,
                              role: e.target.value,
                            }))
                          }
                          placeholder="e.g., Nanny, Babysitter, Grandparent"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          value={caretakerForm.phone}
                          onChange={(e) =>
                            setCaretakerForm((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Note to Caretaker (Optional)</Label>
                        <Textarea
                          value={caretakerForm.noteToCaretaker || ''}
                          onChange={(e) =>
                            setCaretakerForm((prev) => ({
                              ...prev,
                              noteToCaretaker: e.target.value,
                            }))
                          }
                          placeholder="Add any special notes or requests..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
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
                            noteToCaretaker: '',
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveCaretaker}>Add Caretaker</Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Childcare center form
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      Enter the classroom code provided by your childcare center.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {!selectedClassroom ? (
                    // Search for classroom
                    <div className="space-y-2">
                      <Label>Classroom Code</Label>
                      <div className="flex gap-2">
                        <Input
                          value={classroomSearchQuery}
                          onChange={(e) => setClassroomSearchQuery(e.target.value)}
                          placeholder="Enter classroom code"
                          className="flex-1"
                        />
                        <Button onClick={handleSearchSubmit}>Search</Button>
                      </div>
                      {classroomFormErrors.code && (
                        <p className="text-sm text-destructive">{classroomFormErrors.code}</p>
                      )}
                    </div>
                  ) : (
                    // Show selected classroom details
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{selectedClassroom.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedClassroom.code}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedClassroom(null);
                            setClassroomSearchQuery('');
                          }}
                        >
                          Change
                        </Button>
                      </div>

                      <div className="border rounded-lg p-4 space-y-3">
                        <div>
                          <h4 className="text-sm font-medium">Center Details</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedClassroom.centerName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedClassroom.address}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium">Teacher</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={selectedClassroom.teacher.photoUrl}
                                alt={selectedClassroom.teacher.name}
                              />
                              <AvatarFallback>{selectedClassroom.teacher.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {selectedClassroom.teacher.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {selectedClassroom.teacher.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Note to Center (Optional)</Label>
                        <Textarea
                          value={caretakerForm.noteToCaretaker || ''}
                          onChange={(e) =>
                            setCaretakerForm((prev) => ({
                              ...prev,
                              noteToCaretaker: e.target.value,
                            }))
                          }
                          placeholder="Add any special notes or requests..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCaretakerType(null);
                      setSelectedClassroom(null);
                      setClassroomSearchQuery('');
                      setCaretakerForm({
                        type: 'center',
                        name: '',
                        email: '',
                        phone: '',
                        role: '',
                        noteToCaretaker: '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveCaretaker} disabled={!selectedClassroom}>
                    Add Center
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Display Caretakers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...(initialChild.caretakers || []), ...tempCaretakers].map((caretaker) => (
          <div
            key={caretaker.id}
            className={cn(
              'border rounded-lg overflow-hidden transition-colors',
              'hover:border-primary/50 group'
            )}
          >
            {/* Header Section */}
            <div className="bg-muted/30 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {caretaker.type === 'personal' ? (
                  <PersonStanding className="h-4 w-4 text-primary" />
                ) : (
                  <Building2 className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-medium">
                  {caretaker.type === 'personal' ? 'Personal Caretaker' : 'Childcare Center'}
                </span>
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

            <div className="p-4 space-y-4">
              {/* Profile Section */}
              <div className="flex gap-3">
                <Avatar className="h-12 w-12">
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
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {caretaker.name}
                  </h3>
                  <p className="text-sm text-primary">{caretaker.role}</p>
                </div>
              </div>

              {/* Contact Info Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserRound className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{caretaker.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary rounded-full px-3 py-1">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{caretaker.phone}</span>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {caretaker.notes && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Notes:</p>
                  <p className="text-sm">{caretaker.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Caretaker</DialogTitle>
          </DialogHeader>
          {editingCaretaker && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${editingCaretaker.email}`}
                  />
                  <AvatarFallback>{editingCaretaker.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{editingCaretaker.name}</h3>
                  <p className="text-sm text-muted-foreground">{editingCaretaker.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Caretaker Role</Label>
                  <Input
                    value={editingCaretaker.role}
                    onChange={(e) =>
                      setEditingCaretaker((prev) =>
                        prev ? { ...prev, role: e.target.value } : null
                      )
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
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={editingCaretaker.notes || ''}
                    onChange={(e) =>
                      setEditingCaretaker((prev) =>
                        prev ? { ...prev, notes: e.target.value } : null
                      )
                    }
                    placeholder="Add any special notes or requests..."
                  />
                </div>
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
    </section>
  );
}
