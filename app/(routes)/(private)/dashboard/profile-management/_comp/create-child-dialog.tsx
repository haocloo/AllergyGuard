'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/cn';
import { CalendarIcon, Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProfileStore } from './store';
import { useToast } from '@/hooks/use-toast';
import type { Child, Allergy } from './types';

export function CreateChildDialog() {
  const { isCreateDialogOpen, setIsCreateDialogOpen, addChild, formData, setField, reset } =
    useProfileStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();

  const handleClose = () => {
    if (!isSubmitting) {
      setIsCreateDialogOpen(false);
      reset();
    }
  };

  const handleAddAllergy = () => {
    const newAllergy: Allergy = {
      allergen: '',
      notes: '',
      severity: 'Low',
      symptoms: [],
      actionPlan: {
        immediateAction: '',
        medications: [],
      },
    };
    setField('allergies', [...formData.allergies, newAllergy]);
  };

  const handleRemoveAllergy = (index: number) => {
    setField(
      'allergies',
      formData.allergies.filter((_, i) => i !== index)
    );
  };

  const handleAllergyChange = (index: number, field: keyof Allergy, value: string) => {
    const newAllergies = [...formData.allergies];
    newAllergies[index] = {
      ...newAllergies[index],
      [field]: value,
    };
    setField('allergies', newAllergies);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newChild: Child = {
        id: uuidv4(),
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        gender: formData.gender,
        photoUrl: formData.photoUrl,
        allergies: formData.allergies,
        symptoms: formData.symptoms,
        emergencyContacts: formData.emergencyContacts,
        parentId: formData.parentId || uuidv4(), // Fallback for development
        classroomId: formData.classroomId || uuidv4(), // Fallback for development
        createdAt: new Date().toISOString(),
        createdBy: formData.createdBy || uuidv4(), // Fallback for development
        caretakers: [], // Initialize with empty array
      };

      addChild(newChild);
      setIsCreateDialogOpen(false);
      reset();
      toast({
        title: 'Success',
        description: 'Child profile created successfully',
      });
    } catch (error) {
      console.error('Failed to create child:', error);
      toast({
        title: 'Error',
        description: 'Failed to create child profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Child Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Enter child's name"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Allergies */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Allergies</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddAllergy}>
                <Plus className="h-4 w-4 mr-2" />
                Add Allergy
              </Button>
            </div>
            <div className="space-y-4">
              {formData.allergies.map((allergy, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Input
                      value={allergy.allergen}
                      onChange={(e) => handleAllergyChange(index, 'allergen', e.target.value)}
                      placeholder="Allergen name"
                    />
                  </div>
                  <div className="w-32">
                    <Select
                      value={allergy.severity}
                      onValueChange={(value) => handleAllergyChange(index, 'severity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAllergy(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
