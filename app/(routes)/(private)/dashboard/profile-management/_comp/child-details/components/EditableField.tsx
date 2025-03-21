import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  label?: string;
  className?: string;
}

export function EditableField({ value, onSave, label, className }: EditableFieldProps) {
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
