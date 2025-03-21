'use client';

import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, Camera, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useProfileStore } from '../../store';

interface Props {
  onNext: () => void;
}

export function BasicInfoForm({ onNext }: Props) {
  const { formData, setField } = useProfileStore();
  const [date, setDate] = useState<Date>();
  const [preview, setPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    if (date) {
      setField('dob', date.toISOString());
    }
    onNext();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreview(url);
      // Here you would typically upload the file to your storage
      // and set the returned URL to your form data
      setField('photoUrl', url);
    }
  };

  const handleRemovePhoto = () => {
    setPreview('');
    setField('photoUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <div className="relative">
          <div
            className={cn(
              'h-32 w-32 rounded-xl overflow-hidden',
              'border-2 flex items-center justify-center',
              preview ? 'border-none' : 'border-dashed'
            )}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Camera className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          {preview && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemovePhoto}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          className="relative overflow-hidden"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Photo
        </Button>
      </div>

      {/* Basic Information Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              value={formData.firstName || ''}
              onChange={(e) => setField('firstName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              value={formData.lastName || ''}
              onChange={(e) => setField('lastName', e.target.value)}
            />
          </div>
        </div>

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
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup
            defaultValue={formData.gender}
            onValueChange={(value) => setField('gender', value)}
            className="grid grid-cols-2 gap-4 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
