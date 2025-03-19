'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';

// external
import { cn } from '@/lib/cn';

// ui
import { Eye, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

// services
import type { T_schema_create_file_url } from '@/services/validation';
import { toTitleCase } from '@/services/common';

export type FileValidationResult = {
  isValid: boolean;
  error?: string;
};

export const validateImageFile = (file: File): FileValidationResult => {
  // Allowed image types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  // Maximum file size (2MB)
  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload a JPEG, PNG, GIF, or WebP image.',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Maximum size is 2MB.',
    };
  }

  return { isValid: true };
};
interface ImageUploadInputProps {
  value: T_schema_create_file_url;
  onChange: (value: T_schema_create_file_url) => void;
  label: string;
  isError?: boolean;
  disabled?: boolean;
  onPreview?: () => void;
}

export function ImageUploadInput({
  value,
  onChange,
  label,
  isError,
  disabled,
  onPreview,
}: ImageUploadInputProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (value.preview && value.file) {
        URL.revokeObjectURL(value.preview);
      }
    };
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    const validationResult = validateImageFile(file);
    if (!validationResult.isValid) {
      toast({
        title: 'Invalid file',
        description: validationResult.error,
        variant: 'destructive',
      });
      return;
    }
    const preview = URL.createObjectURL(file);
    onChange({ file, preview });
  };

  return (
    <div className="flex gap-2 items-center w-full">
      <div className="flex-1 flex-wrap flex gap-2 w-full">
        <Button
          disabled={disabled}
          type="button"
          variant={isError ? 'destructive' : 'secondary'}
          className={cn('flex-1 relative', isError && 'border-red-500')}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept="image/*"
          />
          <Upload className="h-4 w-4 mr-2" />
          {value.preview ? 'Change' : label}
        </Button>

        {value.preview && (
          <Button
            disabled={disabled}
            type="button"
            variant="outline"
            className="flex-1 shrink-0"
            size="icon"
            onClick={!!onPreview ? onPreview : () => setIsPreviewOpen(true)}
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
        )}
      </div>

      <ImagePreviewDialog
        url={value.preview}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        label={label}
      />
    </div>
  );
}

// Improved ImagePreviewDialog with larger image
const ImagePreviewDialog = ({
  url,
  isOpen,
  onClose,
  label,
}: {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  label: string;
}) => {
  if (!url) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full">
        <DialogHeader>
          <DialogTitle>{label.split(' ')[0]} Preview</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[calc(90vh-100px)]">
          <Image fill src={url} alt={label} className="object-contain rounded-md" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
