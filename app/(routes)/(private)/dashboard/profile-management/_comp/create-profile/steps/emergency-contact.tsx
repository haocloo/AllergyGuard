'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, UserCircle, Check, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useProfileStore } from '../../store';
import { useRouter } from 'next/navigation';
import { getCurrentUserInfo } from '../../services/user';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/cn';
import type { EmergencyContact } from '../../types';

interface Props {
  isEditing?: boolean;
  initialData?: EmergencyContact[];
  onSave?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function EmergencyContactForm({
  isEditing,
  initialData,
  onSave,
  onCancel,
  onNext,
  onBack,
}: Props) {
  const { formData, setField } = useProfileStore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize with initial data if in edit mode
  useEffect(() => {
    if (isEditing && initialData) {
      setField('emergencyContacts', initialData);
    }
  }, [isEditing, initialData, setField]);

  const handleAddContact = () => {
    setField('emergencyContacts', [
      ...formData.emergencyContacts,
      {
        name: '',
        relationship: '',
        phone: '',
        email: '',
        isMainContact: formData.emergencyContacts.length === 0,
      },
    ]);
  };

  const handleFillWithAccountInfo = async (index: number) => {
    try {
      setIsLoading(true);
      const userInfo = await getCurrentUserInfo();

      const newContacts = [...formData.emergencyContacts];
      newContacts[index] = {
        ...newContacts[index],
        name: userInfo.fullName,
        email: userInfo.email,
        phone: userInfo.phone,
        relationship: userInfo.relationship,
      };

      setField('emergencyContacts', newContacts);

      toast({
        title: 'Success',
        description: 'Contact information filled from your account.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch account information.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveContact = (index: number) => {
    setField(
      'emergencyContacts',
      formData.emergencyContacts.filter((_, i) => i !== index)
    );
  };

  const handleContactChange = (index: number, field: string, value: string | boolean) => {
    const newContacts = [...formData.emergencyContacts];
    newContacts[index] = { ...newContacts[index], [field]: value };

    // If setting a new main contact, update other contacts
    if (field === 'isMainContact' && value === true) {
      newContacts.forEach((contact, i) => {
        if (i !== index) {
          contact.isMainContact = false;
        }
      });
    }

    setField('emergencyContacts', newContacts);
  };

  const handleSubmit = async () => {
    if (isEditing) {
      onSave?.();
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call for creation flow
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: "Child's profile has been created successfully!",
        variant: 'default',
        duration: 3000,
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push('/dashboard/profile-management');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create profile. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label>Emergency Contacts</Label>
        <Button type="button" variant="outline" size="sm" onClick={handleAddContact}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="space-y-6">
        {formData.emergencyContacts.map((contact, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label>Contact {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveContact(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={contact.name}
                  onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input
                  value={contact.relationship}
                  onChange={(e) => handleContactChange(index, 'relationship', e.target.value)}
                  placeholder="e.g. Parent, Guardian"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={contact.phone}
                  onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="pt-2">
              <RadioGroup
                value={contact.isMainContact ? 'main' : 'secondary'}
                onValueChange={(value) =>
                  handleContactChange(index, 'isMainContact', value === 'main')
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="main" id={`main-${index}`} />
                  <Label htmlFor={`main-${index}`}>Set as Main Contact</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFillWithAccountInfo(index)}
                disabled={isLoading}
              >
                <UserCircle className="h-4 w-4 mr-2" />
                Fill with Account Info
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save Changes</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onBack} disabled={isSubmitting || isSuccess}>
              Previous Step
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isSuccess}
              className={cn(
                'min-w-[140px] relative',
                isSuccess && 'bg-green-500 hover:bg-green-500'
              )}
            >
              {isSuccess ? (
                <div className="flex items-center gap-2 animate-fade-in">
                  <Check className="h-4 w-4" />
                  <span className="animate-fade-in">Created Successfully!</span>
                </div>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
