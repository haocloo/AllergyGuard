'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, Upload, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useClassroomStore } from './store';
import { createLocalClassroom } from './client-actions';
import { generateClassroomCode } from './utils';
import type { Classroom } from './types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ClassroomFormData {
  name: string;
  teacher: {
    name: string;
    role: string;
    phone: string;
    photoUrl?: string;
  };
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function CreateClassroomDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClassroomFormData>({
    name: '',
    teacher: {
      name: '',
      role: '',
      phone: '',
    },
  });

  const { toast } = useToast();
  const { addClassroom } = useClassroomStore();

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'File type not supported. Please upload a JPEG, PNG, or WebP image.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File is too large. Maximum size is 5MB.';
    }
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const error = validateFile(file);
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Convert to base64 for storage
      const base64 = await convertToBase64(file);
      setFormData((prev) => ({
        ...prev,
        teacher: {
          ...prev.teacher,
          photoUrl: base64,
        },
      }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      teacher: {
        name: '',
        role: '',
        phone: '',
        photoUrl: undefined,
      },
    });
    setPreview('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create new classroom object with all required fields
      const newClassroom: Classroom = {
        id: uuidv4(),
        code: generateClassroomCode(),
        name: formData.name,
        centerName: 'Default Center Name', // Add default values
        address: 'Default Address',
        teacher: {
          id: uuidv4(),
          name: formData.teacher.name,
          role: formData.teacher.role,
          phone: formData.teacher.phone,
          photoUrl: formData.teacher.photoUrl,
        },
        children: [], // Initialize empty arrays
        allergenAlerts: [],
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage and update store
      await createLocalClassroom(newClassroom);
      addClassroom(newClassroom);

      toast({
        title: 'Success',
        description: 'Classroom created successfully',
      });

      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create classroom. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarClick = () => {
    // Programmatically trigger the hidden file input
    document.getElementById('photo')?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Create New Classroom
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Classroom Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sunshine Room"
                    className="bg-muted/50"
                    required
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full"
                    disabled={!formData.name.trim()}
                  >
                    Next: Add Teacher
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Teacher Photo Upload */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Avatar
                      className={cn(
                        'h-20 w-20 ring-2 ring-background shadow-lg',
                        'cursor-pointer hover:ring-primary/50 transition-all duration-200',
                        'group'
                      )}
                      onClick={handleAvatarClick}
                    >
                      <AvatarImage src={preview} />
                      <AvatarFallback className="bg-primary/10">
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-[10px] text-muted-foreground group-hover:text-primary">
                            Upload
                          </span>
                        </div>
                      </AvatarFallback>
                    </Avatar>
                    {preview && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent avatar click
                          setPreview('');
                          setFormData((prev) => ({
                            ...prev,
                            teacher: { ...prev.teacher, photoUrl: undefined },
                          }));
                        }}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="photo"
                      onChange={handleFileChange}
                    />
                    <Label
                      htmlFor="photo"
                      className="text-xs text-muted-foreground hover:text-primary cursor-pointer"
                    >
                      Upload caretaker photo
                    </Label>
                  </div>
                </div>

                {/* Teacher Details */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="teacherName">Caretaker's Name</Label>
                    <Input
                      id="teacherName"
                      value={formData.teacher.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          teacher: { ...prev.teacher, name: e.target.value },
                        }))
                      }
                      placeholder="Full name"
                      className="bg-muted/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={formData.teacher.role}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          teacher: { ...prev.teacher, role: e.target.value },
                        }))
                      }
                      placeholder="e.g., Head Teacher"
                      className="bg-muted/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.teacher.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          teacher: { ...prev.teacher, phone: e.target.value },
                        }))
                      }
                      placeholder="Contact number"
                      className="bg-muted/50"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Classroom'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 justify-center">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors duration-300',
                  step === i ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
